"use client";

import {
  createContext,
  useCallback,
  useEffect,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import dynamic from "next/dynamic";

const loadPanel = () => import("@/components/booking/BookingPanel").then((m) => m.BookingPanel);
const BookingPanel = dynamic(loadPanel, { ssr: false });

/** Date (YYYY-MM-DD) and time (HH:mm) to fill in, e.g. from the chat assistant. */
export type BookingPrefill = { date?: string | null; time?: string | null };

type BookingApi = {
  /** Open the booking panel, optionally with a treatment (and a date/time) preselected. */
  open: (treatmentId?: string, prefill?: BookingPrefill) => void;
  close: () => void;
  /** True while the panel is open (the nav hides itself behind it). */
  isOpen: boolean;
};

const BookingContext = createContext<BookingApi | null>(null);

export function useBooking(): BookingApi {
  const ctx = useContext(BookingContext);
  if (!ctx) throw new Error("useBooking must be used inside <BookingProvider>");
  return ctx;
}

export function BookingProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [treatmentId, setTreatmentId] = useState<string | undefined>();
  const [prefill, setPrefill] = useState<BookingPrefill | undefined>();
  // The panel code is only mounted after the first open.
  const [wasOpened, setWasOpened] = useState(false);

  // Warm the chunk once the browser is idle so the first open feels instant.
  useEffect(() => {
    const w = window as Window & { requestIdleCallback?: (cb: () => void) => number };
    const id = w.requestIdleCallback ? w.requestIdleCallback(() => void loadPanel()) : window.setTimeout(() => void loadPanel(), 3000);
    return () => {
      if (!w.requestIdleCallback) window.clearTimeout(id);
    };
  }, []);

  const open = useCallback((id?: string, pre?: BookingPrefill) => {
    setTreatmentId(id);
    setPrefill(pre);
    setWasOpened(true);
    setIsOpen(true);
  }, []);
  const close = useCallback(() => setIsOpen(false), []);

  const api = useMemo(() => ({ open, close, isOpen }), [open, close, isOpen]);

  return (
    <BookingContext.Provider value={api}>
      {children}
      {wasOpened && (
        <BookingPanel
          open={isOpen}
          treatmentId={treatmentId}
          prefill={prefill}
          onOpenChange={setIsOpen}
        />
      )}
    </BookingContext.Provider>
  );
}
