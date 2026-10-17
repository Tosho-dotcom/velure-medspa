"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { BookingPanel } from "@/components/booking/BookingPanel";

type BookingApi = {
  /** Open the booking panel, optionally with a treatment preselected. */
  open: (treatmentId?: string) => void;
  close: () => void;
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

  const open = useCallback((id?: string) => {
    setTreatmentId(id);
    setIsOpen(true);
  }, []);
  const close = useCallback(() => setIsOpen(false), []);

  const api = useMemo(() => ({ open, close }), [open, close]);

  return (
    <BookingContext.Provider value={api}>
      {children}
      <BookingPanel open={isOpen} treatmentId={treatmentId} onOpenChange={setIsOpen} />
    </BookingContext.Provider>
  );
}
