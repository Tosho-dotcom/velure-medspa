"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { SplitText } from "gsap/SplitText";

import { afterFontsIn, introGate } from "@/lib/motion";

const SESSION_KEY = "velure_intro";

/**
 * Shown once per browser session. The inline script in layout.tsx adds
 * html.intro (before first paint) when it should show, so there is no flash
 * either way; this component only runs the choreography and clears the flag.
 */
export function Preloader() {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const root = document.documentElement;
      const panel = ref.current;
      const finish = () => {
        root.classList.remove("intro");
        try {
          sessionStorage.setItem(SESSION_KEY, "1");
        } catch {
          /* ignore */
        }
      };

      if (!panel || !root.classList.contains("intro")) {
        introGate.open();
        return;
      }

      const mm = gsap.matchMedia();
      let cancelFonts = () => {};
      let safety = 0;

      mm.add(
        {
          motion: "(prefers-reduced-motion: no-preference)",
          reduce: "(prefers-reduced-motion: reduce)",
        },
        (ctx) => {
          const { reduce } = ctx.conditions as { reduce: boolean };
          if (reduce) {
            finish();
            introGate.open();
            return;
          }

          const run = () => {
            const word = panel.querySelector<HTMLElement>("[data-pre-word]")!;
            const sub = panel.querySelector<HTMLElement>("[data-pre-sub]")!;
            const split = SplitText.create(word, { type: "chars", mask: "chars" });

            gsap.set(word, { autoAlpha: 1 });
            gsap.set(sub, { autoAlpha: 0 });

            const tl = gsap.timeline({ onComplete: finish });
            tl.fromTo(
              split.chars,
              { yPercent: 110 },
              { yPercent: 0, duration: 0.6, ease: "expo.out", stagger: 0.035 },
            )
              .to(sub, { autoAlpha: 1, duration: 0.3 }, "-=0.3")
              .to({}, { duration: 0.1 })
              .add(() => introGate.open())
              .fromTo(
                panel,
                { clipPath: "inset(0 0 0% 0)" },
                { clipPath: "inset(0 0 100% 0)", duration: 0.7, ease: "power4.inOut" },
              );
          };

          cancelFonts = afterFontsIn(panel, run);
          // If fonts never resolve, never trap the visitor behind the panel.
          safety = window.setTimeout(() => {
            if (root.classList.contains("intro")) {
              finish();
              introGate.open();
            }
          }, 5000);
        },
      );

      return () => {
        cancelFonts();
        window.clearTimeout(safety);
        mm.revert();
      };
    },
    { scope: ref },
  );

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="preloader fixed inset-0 z-[100] hidden flex-col items-center justify-center bg-ivory text-espresso"
    >
      <span
        data-pre-word
        data-reveal
        className="font-display text-[clamp(3.5rem,10vw,7rem)] font-light leading-none tracking-[-0.03em]"
      >
        Velure
      </span>
      <span data-pre-sub className="t-eyebrow mt-5 text-taupe">
        Radiance, refined.
      </span>
    </div>
  );
}
