"use client";

import { useRef, type ElementType, type ReactNode } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

import { afterFontsIn } from "@/lib/motion";

/**
 * Headline that mask-reveals line by line, once, when it enters the viewport.
 * Waits for fonts so SplitText measures final glyphs (no layout shift).
 */
export function SplitReveal({
  as: Tag = "h2",
  className,
  start = "top 85%",
  children,
}: {
  as?: ElementType;
  className?: string;
  start?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLElement>(null);

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
          const el = ref.current;
          if (!el) return;
          if (reduce) {
            gsap.set(el, { autoAlpha: 1 });
            return;
          }
          return afterFontsIn(el, () => {
              const split = SplitText.create(el, { type: "lines", mask: "lines" });
              gsap.set(el, { autoAlpha: 1 });
              gsap.fromTo(
                split.lines,
                { yPercent: 105 },
                {
                  yPercent: 0,
                  duration: 1.2,
                  ease: "expo.out",
                  stagger: 0.1,
                  scrollTrigger: { trigger: el, start, once: true },
                },
              );
              ScrollTrigger.refresh();
          });
        },
      );
      return () => mm.revert();
    },
    { scope: ref },
  );

  return (
    <Tag ref={ref} data-reveal className={className}>
      {children}
    </Tag>
  );
}
