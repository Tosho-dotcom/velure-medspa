import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

import { CHAT_MAX_LENGTH, SESSION_ID_RE, parseBookingAction } from "@/lib/chat";

/**
 * Server-side proxy for the website chat. The browser never sees the n8n URL
 * or secret: this route checks origin, rate-limits, and forwards
 * { sessionId, message } to the "Velure Chat Assistant" webhook with the
 * X-Velure-Secret header. The reply is passed back as { reply, action? }.
 */

// A reply can need two tool calls (availability + booking link) and three model calls.
const UPSTREAM_TIMEOUT_MS = 55_000;
// Let the platform run this route long enough for UPSTREAM_TIMEOUT_MS.
export const maxDuration = 60;

const MSG_INVALID = "Sorry, I couldn't read that message. Please try again.";
const MSG_RATE_LIMIT =
  "You're sending messages a little fast. Please wait a moment, or use the contact form below.";
const MSG_UNAVAILABLE =
  "Sorry, the assistant is unavailable right now. Please use the contact form below or call (480) 555-0142.";

// Same rule as the n8n workflows: localhost, the production URL and Vercel preview URLs.
const ORIGIN_RE = /^(http:\/\/localhost:3000|https:\/\/velure-medspa[a-z0-9-]*\.vercel\.app)$/;

function isAllowedOrigin(origin: string | null): boolean {
  if (!origin) return false;
  if (ORIGIN_RE.test(origin)) return true;
  // A custom domain: set NEXT_PUBLIC_SITE_URL, and list extra origins (e.g. the www variant)
  // comma-separated in CHAT_ALLOWED_ORIGINS.
  const extra = [process.env.NEXT_PUBLIC_SITE_URL, ...(process.env.CHAT_ALLOWED_ORIGINS ?? "").split(",")]
    .map((o) => o?.trim().replace(/\/$/, ""))
    .filter(Boolean);
  return extra.includes(origin);
}

type Limiters = { ipMinute: Ratelimit; ipDay: Ratelimit; sessionDay: Ratelimit };
let limiters: Limiters | null | undefined;

function getLimiters(): Limiters | null {
  if (limiters !== undefined) return limiters;

  const url = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;
  if (!url || !token) {
    console.error("[chat] Upstash env vars missing; rate limiting is disabled (n8n caps still apply).");
    limiters = null;
    return limiters;
  }

  const redis = new Redis({ url, token });
  limiters = {
    ipMinute: new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10, "60 s"),
      prefix: "velure:chat:ip:min",
    }),
    ipDay: new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(60, "24 h"),
      prefix: "velure:chat:ip:day",
    }),
    sessionDay: new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(30, "24 h"),
      prefix: "velure:chat:session:day",
    }),
  };
  return limiters;
}

function reply(text: string, status: number) {
  return Response.json({ reply: text }, { status, headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  if (!isAllowedOrigin(request.headers.get("origin"))) {
    return reply("Forbidden.", 403);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return reply(MSG_INVALID, 400);
  }

  const { sessionId, message } = (body ?? {}) as { sessionId?: unknown; message?: unknown };
  if (typeof sessionId !== "string" || !SESSION_ID_RE.test(sessionId)) {
    return reply(MSG_INVALID, 400);
  }
  if (typeof message !== "string") return reply(MSG_INVALID, 400);
  const text = message.trim();
  if (text.length < 1 || text.length > CHAT_MAX_LENGTH) {
    return reply(`Please keep your message between 1 and ${CHAT_MAX_LENGTH} characters.`, 400);
  }

  const webhookUrl = process.env.N8N_CHAT_WEBHOOK_URL;
  const secret = process.env.N8N_CHAT_SECRET;
  if (!webhookUrl || !secret) {
    console.error("[chat] N8N_CHAT_WEBHOOK_URL / N8N_CHAT_SECRET not configured.");
    return reply(MSG_UNAVAILABLE, 502);
  }

  const rl = getLimiters();
  if (rl) {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    try {
      const results = await Promise.all([
        rl.ipMinute.limit(ip),
        rl.ipDay.limit(ip),
        rl.sessionDay.limit(sessionId),
      ]);
      if (results.some((r) => !r.success)) return reply(MSG_RATE_LIMIT, 429);
    } catch (err) {
      // Fail open: a Redis outage shouldn't take the assistant down.
      console.error("[chat] rate limit check failed", err);
    }
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), UPSTREAM_TIMEOUT_MS);
  try {
    const upstream = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Velure-Secret": secret },
      body: JSON.stringify({ sessionId, message: text }),
      signal: controller.signal,
      cache: "no-store",
    });

    let data: unknown = null;
    try {
      data = await upstream.json();
    } catch {
      // non-JSON upstream body; handled below
    }
    const d = (data ?? {}) as { reply?: unknown; action?: unknown };

    if (typeof d.reply === "string" && d.reply.length > 0) {
      const action = upstream.ok ? parseBookingAction(d.action) : null;
      return Response.json(
        action ? { reply: d.reply, action } : { reply: d.reply },
        { status: upstream.status, headers: { "Cache-Control": "no-store" } },
      );
    }
    console.error("[chat] upstream returned no reply, status", upstream.status);
    return reply(MSG_UNAVAILABLE, 502);
  } catch (err) {
    console.error("[chat] upstream request failed", err instanceof Error ? err.name : "unknown");
    return reply(MSG_UNAVAILABLE, 502);
  } finally {
    clearTimeout(timer);
  }
}
