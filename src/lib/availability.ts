import { SLOTS } from "@/lib/slots";

/**
 * Taken start times for one date, from the n8n "Velure — Availability" webhook
 * (GET ?date=YYYY-MM-DD → { ok, date, bookable, taken: ["10:30", ...] }).
 * Returns null when the endpoint is not configured or unreachable; the form
 * then falls back to the 409 check on submit.
 */
export async function fetchTakenTimes(
  date: string,
  { signal, timeoutMs = 8000 }: { signal?: AbortSignal; timeoutMs?: number } = {},
): Promise<string[] | null> {
  const url = process.env.NEXT_PUBLIC_N8N_AVAILABILITY_WEBHOOK;
  if (!url) return null;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const onAbort = () => controller.abort();
  signal?.addEventListener("abort", onAbort);

  try {
    const res = await fetch(`${url}?date=${encodeURIComponent(date)}`, {
      signal: controller.signal,
      cache: "no-store",
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { ok?: boolean; taken?: unknown };
    if (!data?.ok || !Array.isArray(data.taken)) return null;
    return data.taken.filter(
      (t): t is string => typeof t === "string" && (SLOTS as readonly string[]).includes(t),
    );
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener("abort", onAbort);
  }
}
