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

type BookingApi = {
  /** Open the booking panel, optionally with a treatment preselected. */
  open: (treatmentId?: string) => void;
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

  const open = useCallback((id?: string) => {
    setTreatmentId(id);
    setWasOpened(true);
    setIsOpen(true);
  }, []);
  const close = useCallback(() => setIsOpen(false), []);

  const api = useMemo(() => ({ open, close, isOpen }), [open, close, isOpen]);

  return (
    <BookingContext.Provider value={api}>
      {children}
      {wasOpened && (
        <BookingPanel open={isOpen} treatmentId={treatmentId} onOpenChange={setIsOpen} />
      )}
    </BookingContext.Provider>
  );
}
