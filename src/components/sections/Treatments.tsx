"use client";

import { useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

import { TreatmentList } from "@/components/sections/TreatmentList";

const WINDOW_DESKTOP = "inset(32% 36% 32% 36% round 24px)";
const WINDOW_MOBILE = "inset(26% 18% 26% 18% round 18px)";
const FULL = "inset(0% 0% 0% 0% round 0px)";

export function Treatments() {
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
          const stage = q("[data-stage]")[0];
          const clip = q("[data-clip]");
          const img = q("[data-clip-img]");
          const dim = q("[data-dim]");
          const eyebrow = q("[data-stage-eyebrow]");
          const lines = q("[data-menu-line]");
          const intro = q("[data-menu-intro]");

          if (reduce) {
            // No pin, no scrub: show the final composition.
            gsap.set(clip, { clipPath: FULL });
            gsap.set(img, { scale: 1 });
            gsap.set(dim, { opacity: 0.45 });
            gsap.set(eyebrow, { autoAlpha: 0 });
            gsap.set(lines, { yPercent: 0 });
            gsap.set(intro, { autoAlpha: 1 });
            return;
          }

          const start = desktop ? WINDOW_DESKTOP : WINDOW_MOBILE;

          const tl = gsap.timeline({
            defaults: { ease: "none" },
            scrollTrigger: {
              trigger: stage,
              start: "top top",
              end: desktop ? "+=160%" : "+=110%",
              pin: true,
              scrub: 0.8,
              anticipatePin: 1,
              refreshPriority: 1, // measured before triggers that sit below the pin
            },
          });

          tl.fromTo(clip, { clipPath: start }, { clipPath: FULL, duration: 0.65 }, 0)
            .fromTo(img, { scale: 1.35 }, { scale: 1, duration: 0.65 }, 0)
            .to(eyebrow, { autoAlpha: 0, duration: 0.2 }, 0.05)
            .to(dim, { opacity: 0.45, duration: 0.35 }, 0.35)
            .fromTo(lines, { yPercent: 100 }, { yPercent: 0, duration: 0.3, stagger: 0.06 }, 0.55)
            .fromTo(intro, { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.15 }, 0.7)
            .set({}, {}, 1); // hold to the end of the pin
        },
      );
      return () => mm.revert();
    },
    { scope: ref },
  );

  return (
    <section ref={ref} id="treatments" data-theme="light" aria-label="The Menu — treatments">
      {/* Part A — pinned reveal stage */}
      <div data-stage className="relative h-svh overflow-hidden">
        <p
          data-stage-eyebrow
          className="t-eyebrow absolute left-1/2 top-[16%] -translate-x-1/2 text-ink/70"
        >
          The Menu
        </p>

        <div
          data-clip
          className="absolute inset-0 will-change-[clip-path]"
          style={{ clipPath: WINDOW_DESKTOP }}
        >
          <div data-clip-img className="absolute inset-0 will-change-transform">
            <Image
              src="/media/menu-reveal.webp"
              alt="Travertine basin with still water and linen in warm morning light"
              fill
              sizes="100vw"
              quality={80}
              className="object-cover"
            />
          </div>
          <div data-dim aria-hidden="true" className="absolute inset-0 bg-espresso-deep opacity-0" />
        </div>

        <div className="wrap absolute inset-x-0 bottom-0 z-10 pb-[12vh] text-ivory">
          <p data-menu-intro className="t-eyebrow mb-5 text-gold-light">
            The Menu
          </p>
          <h2 className="font-display t-h2 text-ivory">
            <span className="block overflow-hidden pb-[0.08em]">
              <span data-menu-line className="block">
                Treatments,
              </span>
            </span>
            <span className="block overflow-hidden pb-[0.08em]">
              <span data-menu-line className="block">
                <em>considered.</em>
              </span>
            </span>
          </h2>
          <p data-menu-intro className="mt-6 max-w-md text-lg text-ivory/85">
            Six signature treatments. Each begins with a consultation and ends with a plan made for
            you.
          </p>
        </div>
      </div>

      {/* Part B — treatment list */}
      <TreatmentList />
    </section>
  );
}
