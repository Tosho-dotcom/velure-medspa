"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

import { SplitReveal } from "@/components/motion/SplitReveal";

const steps = [
  {
    n: "01",
    title: "Consult",
    text: "Book online in under a minute. Your appointment is confirmed instantly, and we prepare a plan before you arrive.",
  },
  {
    n: "02",
    title: "Treat",
    text: "An unhurried appointment in a private suite, led by our medical team.",
  },
  {
    n: "03",
    title: "Aftercare",
    text: "Personal reminders, aftercare notes and a follow-up — so results last.",
  },
];

export function Ritual() {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(
        {
          motion: "(prefers-reduced-motion: no-preference)",
          reduce: "(prefers-reduced-motion: reduce)",
          desktop: "(min-width: 1024px)",
          mobile: "(max-width: 1023px)",
        },
        (ctx) => {
          const { reduce, desktop } = ctx.conditions as { reduce: boolean; desktop: boolean };
          const root = ref.current!;
          const q = gsap.utils.selector(root);
          const line = q("[data-ritual-line]");
          const items = q("[data-step]");

          if (reduce) {
            gsap.set(line, { scaleX: 1, scaleY: 1 });
            gsap.set(items, { autoAlpha: 1, y: 0 });
            return;
          }

          // One hairline draws across (desktop) or down (mobile) as you scroll;
          // each step fades up when the line reaches its column.
          const axis = desktop ? { scaleX: 0 } : { scaleY: 0 };
          const full = desktop ? { scaleX: 1 } : { scaleY: 1 };

          const tl = gsap.timeline({
            defaults: { ease: "none" },
            scrollTrigger: {
              trigger: q("[data-steps]")[0],
              start: "top 70%",
              end: "bottom 60%",
              scrub: true,
            },
          });
          tl.fromTo(line, axis, { ...full, duration: 1 }, 0);
          [0, 0.4, 0.8].forEach((at, i) => {
            tl.fromTo(
              items[i],
              { autoAlpha: 0, y: 28 },
              { autoAlpha: 1, y: 0, duration: 0.25, ease: "power2.out" },
              at,
            );
          });
        },
      );
      return () => mm.revert();
    },
    { scope: ref },
  );

  return (
    <section ref={ref} id="ritual" data-theme="sand" className="section-y relative">
      <div className="wrap">
        <p className="t-eyebrow mb-6 text-ink/70">How it works</p>
        <SplitReveal className="font-display t-h2 max-w-3xl">
          The Velure <em>Ritual</em>
        </SplitReveal>

        <div data-steps className="relative mt-16 sm:mt-24">
          {/* Desktop: horizontal hairline above the columns. Mobile: vertical, at the left edge. */}
          <span
            data-ritual-line
            aria-hidden="true"
            className="absolute bottom-0 left-0 top-0 w-px origin-top bg-gold/60 lg:inset-x-0 lg:bottom-auto lg:h-px lg:w-auto lg:origin-left"
          />
          <ol className="grid gap-14 pl-8 lg:grid-cols-3 lg:gap-12 lg:pl-0 lg:pt-12">
            {steps.map((s) => (
              <li key={s.n} data-step data-reveal>
                <span className="font-display block text-[5rem] font-light leading-none text-gold">
                  {s.n}
                </span>
                <h3 className="font-display t-h3 mt-6">{s.title}</h3>
                <p className="mt-3 max-w-sm text-ink/70">{s.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
