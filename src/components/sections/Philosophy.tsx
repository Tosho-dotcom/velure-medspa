"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

import { afterFontsIn } from "@/lib/motion";

const pillars = [
  {
    title: "Medical precision",
    text: "Every treatment is planned and delivered by a licensed medical team.",
  },
  {
    title: "Personal plans",
    text: "No menus of upsells. One plan, built for your skin and your goals.",
  },
  {
    title: "Unhurried care",
    text: "Private suites, generous appointment times, and nothing rushed.",
  },
];

export function Philosophy() {
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
          const root = ref.current!;
          const statement = root.querySelector<HTMLElement>("[data-statement]")!;
          const lines = root.querySelectorAll("[data-pillar-line]");
          const bodies = root.querySelectorAll("[data-pillar-body]");

          if (reduce) {
            gsap.set([statement, lines, bodies], { autoAlpha: 1, scaleX: 1, y: 0 });
            return;
          }

          // Pillars: hairline draws, then text fades up. Once.
          ScrollTrigger.batch(root.querySelectorAll("[data-pillar]"), {
            start: "top 88%",
            once: true,
            onEnter: (batch) => {
              const l = batch.map((el) => el.querySelector("[data-pillar-line]"));
              const b = batch.map((el) => el.querySelector("[data-pillar-body]"));
              gsap
                .timeline()
                .to(l, { scaleX: 1, duration: 0.9, ease: "expo.out", stagger: 0.12 })
                .fromTo(
                  b,
                  { autoAlpha: 0, y: 20 },
                  { autoAlpha: 1, y: 0, duration: 0.9, ease: "expo.out", stagger: 0.12 },
                  0.25,
                );
            },
          });

          // Statement: word-by-word scrub from 14% to full opacity.
          return afterFontsIn(root, () => {
              const split = SplitText.create(statement, { type: "words", aria: "none" });
              gsap.set(statement, { autoAlpha: 1 });
              gsap.fromTo(
                split.words,
                { opacity: 0.14 },
                {
                  opacity: 1,
                  ease: "none",
                  stagger: 0.04,
                  scrollTrigger: {
                    trigger: statement,
                    start: "top 78%",
                    end: "bottom 45%",
                    scrub: true,
                  },
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
    <section
      ref={ref}
      id="philosophy"
      data-theme="light"
      className="section-y relative"
    >
      <div className="wrap">
        <div className="grid gap-8 lg:grid-cols-12 lg:gap-10">
          <p className="t-eyebrow text-ink/70 lg:col-span-3">Our philosophy</p>
          <p
            data-statement
            data-reveal
            className="font-display t-statement lg:col-span-9"
          >
            Great skin is not an event. It is a quiet ritual — precise, personal, and practised over
            time.
          </p>
        </div>

        <ul className="mt-20 grid gap-12 sm:mt-28 md:grid-cols-3 md:gap-0">
          {pillars.map((p, i) => (
            <li
              key={p.title}
              data-pillar
              className={`relative pt-8 md:pt-10 ${i > 0 ? "md:border-l md:border-stone md:pl-10" : "md:pr-10"} ${
                i === 1 ? "md:pr-10" : ""
              }`}
            >
              <span
                data-pillar-line
                data-hairline
                aria-hidden="true"
                className="absolute inset-x-0 top-0 h-px origin-left bg-stone"
              />
              <div data-pillar-body data-reveal>
                <h3 className="font-display t-h3">{p.title}</h3>
                <p className="mt-3 max-w-xs text-ink/70">{p.text}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
