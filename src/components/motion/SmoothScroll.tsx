"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  type ReactNode,
} from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import Lenis from "lenis";
import { afterFonts } from "@/lib/motion";

// The single place plugins are registered.
gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText);

type ScrollToTarget = string | number | HTMLElement;

type SmoothScrollApi = {
  scrollTo: (target: ScrollToTarget, opts?: { offset?: number; immediate?: boolean }) => void;
  stop: () => void;
  start: () => void;
};

const SmoothScrollContext = createContext<SmoothScrollApi | null>(null);

export function useSmoothScroll(): SmoothScrollApi {
  const ctx = useContext(SmoothScrollContext);
  if (!ctx) throw new Error("useSmoothScroll must be used inside <SmoothScroll>");
  return ctx;
}

const easeInOutExpo = (t: number) =>
  t === 0 ? 0 : t === 1 ? 1 : t < 0.5
    ? Math.pow(2, 20 * t - 10) / 2
    : (2 - Math.pow(2, -20 * t + 10)) / 2;

export function SmoothScroll({ children }: { children: ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);

  useGSAP(() => {
    const mm = gsap.matchMedia();

    mm.add(
      {
        motion: "(prefers-reduced-motion: no-preference)",
        reduce: "(prefers-reduced-motion: reduce)",
      },
      (ctx) => {
        const { reduce } = ctx.conditions as { reduce: boolean };

        if (reduce) {
          // Native scroll, no pins or scrubs.
          lenisRef.current = null;
          return;
        }

        const lenis = new Lenis({
          lerp: 0.085,
          wheelMultiplier: 0.9,
          smoothWheel: true,
          syncTouch: false,
          autoRaf: false,
        });
        lenisRef.current = lenis;

        lenis.on("scroll", ScrollTrigger.update);
        const tick = (time: number) => lenis.raf(time * 1000);
        gsap.ticker.add(tick);
        gsap.ticker.lagSmoothing(0);

        return () => {
          gsap.ticker.remove(tick);
          lenis.destroy();
          lenisRef.current = null;
        };
      },
    );

    // Layout settles after fonts and images: re-measure all triggers.
    const cancelFonts = afterFonts(() => ScrollTrigger.refresh());
    const onLoad = () => ScrollTrigger.refresh();
    window.addEventListener("load", onLoad);

    return () => {
      cancelFonts();
      window.removeEventListener("load", onLoad);
      mm.revert();
    };
  }, []);

  const scrollTo = useCallback<SmoothScrollApi["scrollTo"]>((target, opts = {}) => {
    const offset = opts.offset ?? 0;
    const lenis = lenisRef.current;
    if (lenis) {
      lenis.scrollTo(target, {
        offset,
        duration: 1.6,
        easing: easeInOutExpo,
        immediate: opts.immediate,
      });
      return;
    }
    // Reduced motion / no Lenis: jump natively.
    if (typeof target === "number") {
      window.scrollTo({ top: target + offset });
    } else {
      const el = typeof target === "string" ? document.querySelector<HTMLElement>(target) : target;
      if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY + offset });
    }
  }, []);

  const stop = useCallback(() => lenisRef.current?.stop(), []);
  const start = useCallback(() => lenisRef.current?.start(), []);

  const api = useMemo(() => ({ scrollTo, stop, start }), [scrollTo, stop, start]);

  return <SmoothScrollContext.Provider value={api}>{children}</SmoothScrollContext.Provider>;
}
