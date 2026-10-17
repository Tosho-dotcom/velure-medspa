import { format } from "date-fns";

export const TIMEZONE = "America/Phoenix";

export const SLOTS = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "12:30",
  "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30",
  "17:00", "17:30", "18:00",
] as const;

export const MAX_DAYS_AHEAD = 60;

/** YYYY-MM-DD for "now" in Phoenix (Arizona has no DST). */
export function todayInPhoenix(now = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

/** Add whole days to a YYYY-MM-DD key (pure calendar math, no timezone drift). */
export function addDays(key: string, days: number): string {
  const [y, m, d] = key.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + days));
  return dt.toISOString().slice(0, 10);
}

export function bookableRange(now = new Date()): { min: string; max: string } {
  const today = todayInPhoenix(now);
  return { min: addDays(today, 1), max: addDays(today, MAX_DAYS_AHEAD) };
}

export function isSunday(key: string): boolean {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay() === 0;
}

export function isBookableDate(key: string, now = new Date()): boolean {
  const { min, max } = bookableRange(now);
  return key >= min && key <= max && !isSunday(key);
}

/** Calendar dates are local Date objects; key them by their local Y-M-D. */
export function dateToKey(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

export function keyToDate(key: string): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d, 12);
}

export function formatDateLabel(key: string): string {
  return format(keyToDate(key), "EEE, MMM d");
}

export function formatTimeLabel(time: string): string {
  const [h, m] = time.split(":").map(Number);
  const suffix = h >= 12 ? "PM" : "AM";
  const hour = h % 12 === 0 ? 12 : h % 12;
  return `${hour}:${String(m).padStart(2, "0")} ${suffix}`;
}
