import { SLOTS, formatDateLabel, formatTimeLabel } from "@/lib/slots";
import { bookingTreatmentOptions, treatments } from "@/lib/treatments";

/**
 * Contract between n8n ("Velure Chat Assistant"), the /api/chat route and the
 * widget. n8n replies with { reply, action? }; the action is only present when
 * the assistant's suggest_booking tool call passed validation.
 */
export type BookingAction = {
  type: "book";
  treatmentId: string;
  date: string | null;
  time: string | null;
};

export type ChatResponse = { reply: string; action?: BookingAction | null };

export const CHAT_MAX_LENGTH = 500;
export const SESSION_ID_RE = /^[A-Za-z0-9_-]{8,64}$/;

const treatmentIds = new Set(bookingTreatmentOptions.map((t) => t.id));

/** Whitelist an action coming from the network. Anything unexpected becomes null. */
export function parseBookingAction(value: unknown): BookingAction | null {
  if (!value || typeof value !== "object") return null;
  const v = value as Record<string, unknown>;
  if (v.type !== "book" || typeof v.treatmentId !== "string" || !treatmentIds.has(v.treatmentId)) {
    return null;
  }
  const date =
    typeof v.date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v.date) ? v.date : null;
  const time =
    date && typeof v.time === "string" && (SLOTS as readonly string[]).includes(v.time)
      ? v.time
      : null;
  return { type: "book", treatmentId: v.treatmentId, date, time };
}

/** Button label, e.g. "Book Laser Rejuvenation · Tue, Oct 27 · 11:00 AM". */
export function bookingActionLabel(action: BookingAction): string {
  const name =
    action.treatmentId === "consultation"
      ? "a consultation"
      : (treatments.find((t) => t.id === action.treatmentId)?.name ?? "now");
  const parts = [`Book ${name}`];
  if (action.date) parts.push(formatDateLabel(action.date));
  if (action.date && action.time) parts.push(formatTimeLabel(action.time));
  return parts.join(" · ");
}
