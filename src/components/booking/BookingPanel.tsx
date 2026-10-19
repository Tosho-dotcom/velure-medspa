"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { XIcon } from "lucide-react";

import { Sheet, SheetClose, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { BookingForm } from "@/components/forms/BookingForm";
import { useSmoothScroll } from "@/components/motion/SmoothScroll";
import type { BookingPrefill } from "@/components/booking/BookingProvider";

/** Staggers the panel contents in once the Sheet has mounted them. */
function PanelBody({
  treatmentId,
  prefill,
  onClose,
}: {
  treatmentId?: string;
  prefill?: BookingPrefill;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(
        {
          motion: "(prefers-reduced-motion: no-preference)",
          reduce: "(prefers-reduced-motion: reduce)",
        },
        (ctx) => {
          const { reduce } = ctx.conditions as { reduce: boolean };
          const items = gsap.utils.toArray<HTMLElement>("[data-panel-in]");
          if (reduce) {
            gsap.set(items, { autoAlpha: 1, y: 0 });
            return;
          }
          gsap.fromTo(
            items,
            { autoAlpha: 0, y: 18 },
            { autoAlpha: 1, y: 0, duration: 0.8, ease: "expo.out", stagger: 0.04, delay: 0.2 },
          );
        },
      );
      return () => mm.revert();
    },
    { scope: ref },
  );

  return (
    <div
      ref={ref}
      data-lenis-prevent
      className="flex-1 overflow-y-auto overscroll-contain px-6 pt-8 sm:px-8"
    >
      <div data-panel-in className="mb-10 pr-10">
        <p className="t-eyebrow text-gold-light">Book now</p>
        <SheetTitle className="font-display mt-4 text-[clamp(2.25rem,5vw,3.25rem)] font-light leading-[1.02] tracking-[-0.02em] text-ivory-on-dark">
          Reserve your <em>visit</em>
        </SheetTitle>
        <SheetDescription className="mt-4 text-base text-ivory-on-dark/70">
          Takes under a minute. You&apos;ll receive a confirmation by email right away.
        </SheetDescription>
      </div>
      <div data-panel-in>
        <BookingForm
          variant="panel"
          treatmentId={treatmentId}
          prefill={prefill}
          autoFocus
          onClose={onClose}
        />
      </div>
    </div>
  );
}

export function BookingPanel({
  open,
  treatmentId,
  prefill,
  onOpenChange,
}: {
  open: boolean;
  treatmentId?: string;
  prefill?: BookingPrefill;
  onOpenChange: (open: boolean) => void;
}) {
  const { stop, start } = useSmoothScroll();

  // Lenis is paused while the panel is open.
  useEffect(() => {
    if (open) stop();
    else start();
    return () => start();
  }, [open, stop, start]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        showCloseButton={false}
        initialFocus={false}
        overlayClassName="bg-espresso-deep/40 backdrop-blur-[6px] duration-[400ms]"
        className={[
          "gap-0 border-l-0 bg-espresso-deep text-ivory-on-dark [--bg:var(--espresso-deep)] [--fg:var(--ivory-on-dark)]",
          "data-[side=right]:w-full data-[side=right]:sm:max-w-[560px]",
          "duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]",
          "data-[side=right]:data-starting-style:translate-x-full data-[side=right]:data-ending-style:translate-x-full",
        ].join(" ")}
      >
        <SheetClose
          aria-label="Close booking panel"
          className="absolute right-4 top-4 z-20 inline-flex size-10 items-center justify-center rounded-full border border-ivory-on-dark/25 text-ivory-on-dark transition-colors hover:border-gold-light hover:text-gold-light"
        >
          <XIcon className="size-4" strokeWidth={1.25} />
        </SheetClose>
        <PanelBody
          treatmentId={treatmentId}
          prefill={prefill}
          onClose={() => onOpenChange(false)}
        />
      </SheetContent>
    </Sheet>
  );
}
