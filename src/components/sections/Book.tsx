"use client";

import { useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

import { SplitReveal } from "@/components/motion/SplitReveal";
import { BookingForm } from "@/components/forms/BookingForm";

const details = [
  { label: "Hours", value: "Mon – Sat · 9:00 – 19:00" },
  { label: "Studio", value: "1200 Desert Bloom Ave, Scottsdale, AZ" },
  { label: "Phone", value: "(480) 555-0142" },
];

export function Book() {
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
          const q = gsap.utils.selector(root);
          const fade = q("[data-book-fade]");

          if (reduce) {
            gsap.set(fade, { autoAlpha: 1, y: 0 });
            return;
          }

          // Image parallax.
          gsap.fromTo(
            q("[data-book-img]"),
            { yPercent: -8 },
            {
              yPercent: 8,
              ease: "none",
              scrollTrigger: {
                trigger: q("[data-book-img-wrap]")[0],
                start: "top bottom",
                end: "bottom top",
                scrub: true,
              },
            },
          );

          // Details and form fade up once.
          gsap.fromTo(
            fade,
            { autoAlpha: 0, y: 24 },
            {
              autoAlpha: 1,
              y: 0,
              duration: 1,
              ease: "expo.out",
              stagger: 0.05,
              scrollTrigger: { trigger: q("[data-book-grid]")[0], start: "top 80%", once: true },
            },
          );
        },
      );
      return () => mm.revert();
    },
    { scope: ref },
  );

  return (
    <section
      ref={ref}
      id="book"
      data-theme="dark"
      className="section-y relative"
    >
      <div className="wrap">
        <div className="max-w-3xl">
          <p className="t-eyebrow mb-6 text-gold">Book now</p>
          <SplitReveal className="font-display t-h2">
            Your first visit begins with a <em>conversation.</em>
          </SplitReveal>
          <p className="mt-6 max-w-xl text-lg text-ink/75">
            Choose a treatment and a time that suits you. We&apos;ll confirm by email right away and
            send a reminder the day before.
          </p>
        </div>

        <div data-book-grid className="mt-16 grid gap-14 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <div
              data-book-img-wrap
              className="relative aspect-[16/9] overflow-hidden rounded-lg lg:aspect-[3/4]"
            >
              <div data-book-img className="absolute -inset-y-[10%] inset-x-0">
                <Image
                  src="/media/booking-reception.webp"
                  alt="Travertine reception desk with an olive branch and an appointment book"
                  fill
                  sizes="(max-width: 1023px) 100vw, 40vw"
                  quality={80}
                  className="object-cover"
                />
              </div>
            </div>

            <dl className="mt-10 grid gap-5 sm:grid-cols-3 lg:grid-cols-1">
              {details.map((d) => (
                <div key={d.label} data-book-fade data-reveal>
                  <dt className="t-eyebrow mb-1.5 text-gold">{d.label}</dt>
                  <dd className="text-ink/85">{d.value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div data-book-fade data-reveal className="lg:col-span-7">
            <BookingForm variant="inline" />
          </div>
        </div>
      </div>
    </section>
  );
}
