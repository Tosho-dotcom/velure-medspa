"use client";

import {
  Fragment,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { ArrowRightIcon, ArrowUpIcon, MessageCircleIcon, XIcon } from "lucide-react";

import { useBooking } from "@/components/booking/BookingProvider";
import { useSmoothScroll } from "@/components/motion/SmoothScroll";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import {
  CHAT_MAX_LENGTH,
  bookingActionLabel,
  parseBookingAction,
  type BookingAction,
} from "@/lib/chat";
import { cn } from "@/lib/utils";
import { hardNavigate } from "@/lib/navigate";

type Role = "user" | "assistant";
type ChatMessage = { id: string; role: Role; text: string; action?: BookingAction | null };

const GREETING: ChatMessage = {
  id: "greeting",
  role: "assistant",
  text: "Hello. I can help with treatments, prices and free appointment times, and open the booking panel for you. What would you like to know?",
};

const QUICK_QUESTIONS = [
  "Help me choose a treatment",
  "What's free this week?",
  "Prices and durations",
  "Hours and location",
];

const FALLBACK_REPLY =
  "Sorry, something went wrong. Please try again, or use the contact form below.";
const COUNTER_FROM = 400;
const MAX_INPUT_HEIGHT = 104;
const NAV_OFFSET = -84;

const SESSION_KEY = "velure_chat_session";
const MESSAGES_KEY = "velure_chat_messages";

function readStorage(key: string): string | null {
  try {
    return sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStorage(key: string, value: string) {
  try {
    sessionStorage.setItem(key, value);
  } catch {
    // storage unavailable (private mode, quota); the chat still works in memory
  }
}

const newId = () => crypto.randomUUID();

function getSessionId(): string {
  const existing = readStorage(SESSION_KEY);
  if (existing) return existing;
  const id = newId();
  writeStorage(SESSION_KEY, id);
  return id;
}

function loadMessages(): ChatMessage[] {
  const raw = readStorage(MESSAGES_KEY);
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (m): m is ChatMessage =>
          !!m &&
          typeof m.id === "string" &&
          typeof m.text === "string" &&
          (m.role === "user" || m.role === "assistant"),
      )
      .map((m) => ({ ...m, action: parseBookingAction(m.action) }));
  } catch {
    return [];
  }
}

// URLs, emails and the Velure phone number become links; everything else stays plain text.
const LINK_RE =
  /(https?:\/\/[^\s<>"']+|[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)+|\(480\) 555-0142)/g;
const TRAILING_PUNCT_RE = /[.,;:!?)\]]+$/;

function linkify(line: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let last = 0;
  for (const match of line.matchAll(LINK_RE)) {
    const start = match.index ?? 0;
    let token = match[0];
    const isPhone = token.startsWith("(");
    const trailing = isPhone ? "" : (token.match(TRAILING_PUNCT_RE)?.[0] ?? "");
    if (trailing) token = token.slice(0, -trailing.length);
    if (start > last) nodes.push(line.slice(last, start));

    const isUrl = token.startsWith("http");
    const href = isPhone ? "tel:+14805550142" : isUrl ? token : `mailto:${token}`;
    nodes.push(
      <a
        key={start}
        href={href}
        {...(isUrl ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        className="break-words underline decoration-current/40 underline-offset-2 hover:decoration-current"
      >
        {token}
      </a>,
    );
    last = start + token.length;
  }
  if (last < line.length) nodes.push(line.slice(last));
  return nodes;
}

function MessageText({ text }: { text: string }) {
  return (
    <>
      {text.split("\n").map((line, i) => (
        <Fragment key={i}>
          {i > 0 && <br />}
          {linkify(line)}
        </Fragment>
      ))}
    </>
  );
}

export function ChatWidget() {
  const booking = useBooking();
  const { stop, start, scrollTo } = useSmoothScroll();
  const isMobile = useMediaQuery("(max-width: 639px)");

  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [waiting, setWaiting] = useState(false);
  // The launcher waits until the hero is (mostly) scrolled past: the hero owns the
  // bottom-right corner (scroll cue) and should read clean on first view.
  const [pastHero, setPastHero] = useState(false);

  const sessionIdRef = useRef("");
  const sendingRef = useRef(false);
  const hydratedRef = useRef(false);
  const wasOpenRef = useRef(false);
  const launcherRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Restore the conversation after mount (sessionStorage is client-only).
  useEffect(() => {
    sessionIdRef.current = getSessionId();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrating from sessionStorage
    setMessages(loadMessages());
    hydratedRef.current = true;
  }, []);

  useEffect(() => {
    if (!hydratedRef.current) return;
    writeStorage(MESSAGES_KEY, JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    const hero = document.getElementById("top");
    if (!hero) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- no hero on this page
      setPastHero(true);
      return;
    }
    const io = new IntersectionObserver(([entry]) => setPastHero(entry.intersectionRatio < 0.35), {
      threshold: [0, 0.35, 1],
    });
    io.observe(hero);
    return () => io.disconnect();
  }, []);

  // The booking panel takes over: close the chat while it is open.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- closing in response to the panel opening
    if (booking.isOpen) setOpen(false);
  }, [booking.isOpen]);

  // Mobile: full-screen sheet, page scroll paused underneath.
  useEffect(() => {
    if (!open || !isMobile) return;
    const root = document.documentElement;
    root.setAttribute("data-chat-open", "");
    stop();
    return () => {
      root.removeAttribute("data-chat-open");
      start();
    };
  }, [open, isMobile, stop, start]);

  // Mobile: keep the sheet exactly above the on-screen keyboard.
  useEffect(() => {
    if (!open || !isMobile) return;
    const vv = window.visualViewport;
    const panel = panelRef.current;
    if (!vv || !panel) return;
    const sync = () => {
      panel.style.height = `${vv.height}px`;
      panel.style.top = `${vv.offsetTop}px`;
      const el = scrollRef.current;
      if (el && document.activeElement === inputRef.current) el.scrollTop = el.scrollHeight;
    };
    sync();
    vv.addEventListener("resize", sync);
    vv.addEventListener("scroll", sync);
    return () => {
      vv.removeEventListener("resize", sync);
      vv.removeEventListener("scroll", sync);
      panel.style.height = "";
      panel.style.top = "";
    };
  }, [open, isMobile]);

  // Focus: input when opened, launcher when closed by the visitor.
  useEffect(() => {
    if (open) {
      wasOpenRef.current = true;
      inputRef.current?.focus({ preventScroll: true });
    } else if (wasOpenRef.current) {
      wasOpenRef.current = false;
      if (!booking.isOpen) launcherRef.current?.focus({ preventScroll: true });
    }
  }, [open, booking.isOpen]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // Auto-scroll to the newest message.
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, waiting, open]);

  // Grow the textarea up to ~4 lines.
  useLayoutEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, MAX_INPUT_HEIGHT)}px`;
  }, [input, open]);

  const send = useCallback(async (raw: string) => {
    const text = raw.trim().slice(0, CHAT_MAX_LENGTH);
    if (!text || sendingRef.current) return;
    sendingRef.current = true;
    setWaiting(true);
    setInput("");
    setMessages((prev) => [...prev, { id: newId(), role: "user", text }]);

    let replyText = FALLBACK_REPLY;
    let action: BookingAction | null = null;
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: sessionIdRef.current, message: text }),
      });
      const data = (await res.json().catch(() => null)) as { reply?: unknown; action?: unknown } | null;
      if (typeof data?.reply === "string" && data.reply.trim()) replyText = data.reply;
      action = parseBookingAction(data?.action);
    } catch {
      // network failure: fall through to the generic message
    }

    setMessages((prev) => [...prev, { id: newId(), role: "assistant", text: replyText, action }]);
    sendingRef.current = false;
    setWaiting(false);
  }, []);

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      void send(input);
    }
  };

  const openBooking = (action: BookingAction) => {
    setOpen(false);
    booking.open(action.treatmentId, { date: action.date, time: action.time });
  };

  const goToContact = () => {
    setOpen(false);
    if (document.getElementById("contact")) scrollTo("#contact", { offset: NAV_OFFSET });
    else hardNavigate("/#contact");
  };

  const hasUserMessage = messages.some((m) => m.role === "user");
  const canSend = !waiting && input.trim().length > 0;
  const showLauncher = (pastHero || open) && !booking.isOpen;

  return (
    <>
      {open && (
        <div
          ref={panelRef}
          role="dialog"
          aria-modal={isMobile}
          aria-label="Velure assistant"
          className={cn(
            "fixed inset-0 z-[90] flex flex-col bg-ivory text-espresso",
            "sm:inset-auto sm:bottom-[calc(1.5rem+56px+0.75rem)] sm:right-[var(--gutter)] sm:h-[min(600px,calc(100dvh-8.5rem))] sm:w-[392px]",
            "sm:overflow-hidden sm:rounded-[24px] sm:border sm:border-stone sm:shadow-[var(--shadow-soft)]",
            "animate-in fade-in-0 slide-in-from-bottom-3 duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:animate-none",
          )}
        >
          <header className="flex shrink-0 items-start justify-between gap-4 border-b border-stone px-6 pb-4 pt-5">
            <div>
              <p className="t-eyebrow text-gold">Velure Med Spa</p>
              <p className="font-display mt-1.5 text-[1.625rem] font-light leading-tight tracking-[-0.01em]">
                Questions, <em>welcome.</em>
              </p>
            </div>
            <button
              type="button"
              aria-label="Close chat"
              onClick={() => setOpen(false)}
              className="mt-1 inline-flex size-10 shrink-0 items-center justify-center rounded-full border border-stone text-espresso transition-colors hover:border-gold hover:text-gold"
            >
              <XIcon className="size-4" strokeWidth={1.25} aria-hidden="true" />
            </button>
          </header>

          <div
            ref={scrollRef}
            role="log"
            aria-live="polite"
            data-lenis-prevent
            className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain px-5 py-5"
          >
            {[GREETING, ...messages].map((m) => (
              <div
                key={m.id}
                className={cn("flex flex-col", m.role === "user" ? "items-end" : "items-start")}
              >
                <div
                  className={cn(
                    "max-w-[86%] px-4 py-2.5 text-[0.9375rem] leading-[1.55]",
                    m.role === "user"
                      ? "rounded-[14px] rounded-br-[4px] bg-espresso text-ivory"
                      : "rounded-[14px] rounded-bl-[4px] bg-sand text-espresso",
                  )}
                >
                  <MessageText text={m.text} />
                </div>
                {m.action && (
                  <button
                    type="button"
                    onClick={() => openBooking(m.action!)}
                    className="group mt-2 inline-flex min-h-11 max-w-[86%] items-center gap-2.5 rounded-full border border-espresso px-5 py-2 text-left text-sm text-espresso transition-colors hover:bg-espresso hover:text-ivory"
                  >
                    <span>{bookingActionLabel(m.action)}</span>
                    <ArrowRightIcon
                      className="size-4 shrink-0 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none"
                      strokeWidth={1.25}
                      aria-hidden="true"
                    />
                  </button>
                )}
              </div>
            ))}

            {!hasUserMessage && (
              <div className="flex flex-wrap gap-2 pt-1">
                {QUICK_QUESTIONS.map((q) => (
                  <button
                    key={q}
                    type="button"
                    disabled={waiting}
                    onClick={() => void send(q)}
                    className="rounded-full border border-stone px-3.5 py-1.5 text-left text-[0.8125rem] text-espresso transition-colors hover:border-gold hover:text-gold disabled:opacity-50"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            {waiting && (
              <div className="flex justify-start" role="status" aria-label="Assistant is typing">
                <div className="flex items-center gap-1.5 rounded-[14px] rounded-bl-[4px] bg-sand px-4 py-3.5">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="size-1.5 animate-pulse rounded-full bg-taupe motion-reduce:animate-none"
                      style={{ animationDelay: `${i * 0.2}s` }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="shrink-0 border-t border-stone px-5 pb-4 pt-3">
            <div className="flex items-end gap-2">
              <label htmlFor="velure-chat-input" className="sr-only">
                Message
              </label>
              <textarea
                id="velure-chat-input"
                ref={inputRef}
                value={input}
                rows={1}
                maxLength={CHAT_MAX_LENGTH}
                placeholder="Ask about treatments or times…"
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                onFocus={() => {
                  if (!isMobile) return;
                  // wait for the keyboard to resize the viewport
                  setTimeout(() => {
                    const el = scrollRef.current;
                    if (el) el.scrollTop = el.scrollHeight;
                  }, 300);
                }}
                className="min-h-11 flex-1 resize-none rounded-[14px] border border-stone bg-transparent px-4 py-2.5 text-base leading-6 text-espresso placeholder:text-taupe/70 focus:border-gold focus:outline-none sm:text-[0.9375rem]"
              />
              <button
                type="button"
                aria-label="Send message"
                disabled={!canSend}
                onClick={() => void send(input)}
                className="inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-espresso text-ivory transition-colors hover:bg-gold disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:bg-espresso"
              >
                <ArrowUpIcon className="size-4" strokeWidth={1.5} aria-hidden="true" />
              </button>
            </div>
            <div className="mt-2.5 flex items-start justify-between gap-3 text-[0.6875rem] leading-4 text-taupe">
              <p>
                AI assistant, may make mistakes. Not medical advice. Velure is a demo by Thaus;
                conversations are saved.{" "}
                <a
                  href="/privacy"
                  target="_blank"
                  className="underline underline-offset-2 hover:text-espresso"
                >
                  Privacy
                </a>
                {" · "}
                <a
                  href="#contact"
                  onClick={(e) => {
                    e.preventDefault();
                    goToContact();
                  }}
                  className="underline underline-offset-2 hover:text-espresso"
                >
                  Contact form
                </a>
              </p>
              {input.length > COUNTER_FROM && (
                <span className="shrink-0 tabular-nums">
                  {input.length}/{CHAT_MAX_LENGTH}
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      <button
        ref={launcherRef}
        type="button"
        aria-label={open ? "Close chat" : "Open chat with Velure"}
        aria-expanded={open}
        tabIndex={showLauncher ? 0 : -1}
        aria-hidden={!showLauncher}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "fixed bottom-6 right-[var(--gutter)] z-40 inline-flex size-14 items-center justify-center rounded-full",
          "border border-gold-light/40 bg-espresso text-ivory shadow-[var(--shadow-soft)]",
          "transition-[opacity,transform,background-color] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-gold motion-reduce:transition-none",
          open && "max-sm:hidden",
          showLauncher ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0",
        )}
      >
        {open ? (
          <XIcon className="size-5" strokeWidth={1.25} aria-hidden="true" />
        ) : (
          <MessageCircleIcon className="size-5" strokeWidth={1.25} aria-hidden="true" />
        )}
      </button>
    </>
  );
}
