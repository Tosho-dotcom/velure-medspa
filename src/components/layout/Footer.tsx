"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

import { afterFontsIn } from "@/lib/motion";

const columns = [
  { title: "Visit", lines: ["1200 Desert Bloom Ave", "Scottsdale, AZ"] },
  { title: "Hours", lines: ["Mon – Sat", "9:00 – 19:00"] },
  { title: "Contact", lines: ["(480) 555-0142", "Instagram"] },
];

export function Footer() {
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
          const word = root.querySelector<HTMLElement>("[data-footer-word]")!;
          const cols = root.querySelectorAll("[data-footer-col]");

          if (reduce) {
            gsap.set([word, cols], { autoAlpha: 1 });
            return;
          }

          const cancel = afterFontsIn(root, () => {
            const split = SplitText.create(word, { type: "chars", mask: "chars" });
            gsap.set(word, { autoAlpha: 1 });
            gsap.set(split.chars, { yPercent: 100 });
            gsap.set(cols, { autoAlpha: 0, y: 24 });

            ScrollTrigger.create({
              trigger: root,
              start: "top 80%",
              once: true,
              onEnter: () => {
                gsap.to(split.chars, {
                  yPercent: 0,
                  duration: 1.2,
                  ease: "expo.out",
                  stagger: 0.04,
                });
                gsap.to(cols, {
                  autoAlpha: 1,
                  y: 0,
                  duration: 0.9,
                  ease: "expo.out",
                  stagger: 0.1,
                  delay: 0.2,
                });
              },
            });
            ScrollTrigger.refresh();
          });
          return cancel;
        },
      );
      return () => mm.revert();
    },
    { scope: ref },
  );

  return (
    <footer
      ref={ref}
      id="footer"
      data-theme="dark"
      className="relative overflow-hidden"
    >
      <div className="wrap pt-24 sm:pt-32">
        <div className="grid grid-cols-2 gap-10 border-b border-ink/15 pb-14 sm:grid-cols-3">
          {columns.map((c) => (
            <div key={c.title} data-footer-col data-reveal>
              <h2 className="t-eyebrow mb-4 text-gold">{c.title}</h2>
              <p className="leading-relaxed text-ink/85">
                {c.lines.map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              </p>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-3 py-8 text-sm text-ink/70 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © 2026 Velure Med Spa. Velure is a fictional brand created as a demonstration project.
          </p>
          <p>
            Designed &amp; built by{" "}
            <a
              href="https://thaus.co"
              target="_blank"
              rel="noopener noreferrer"
              className="link-underline"
            >
              Thaus
            </a>
          </p>
        </div>
      </div>

      {/* Huge wordmark, shown in full */}
      <div className="wrap" aria-hidden="true">
        <div className="overflow-hidden pb-[2vw]">
          <p
            data-footer-word
            data-reveal
            className="font-display select-none whitespace-nowrap text-center text-[18vw] font-light leading-[1] tracking-[-0.04em] text-ink/90"
          >
            Velure
          </p>
        </div>
      </div>
    </footer>
  );
}
