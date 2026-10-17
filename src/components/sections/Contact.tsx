"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

import { SplitReveal } from "@/components/motion/SplitReveal";
import { ContactForm } from "@/components/forms/ContactForm";
import { NewsletterForm } from "@/components/forms/NewsletterForm";

export function Contact() {
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

          if (reduce) {
            gsap.set(q("[data-contact-fade], [data-contact-card]"), { autoAlpha: 1, y: 0 });
            return;
          }

          gsap.fromTo(
            q("[data-contact-fade]"),
            { autoAlpha: 0, y: 24 },
            {
              autoAlpha: 1,
              y: 0,
              duration: 1,
              ease: "expo.out",
              stagger: 0.06,
              scrollTrigger: { trigger: q("[data-contact-grid]")[0], start: "top 82%", once: true },
            },
          );
          gsap.fromTo(
            q("[data-contact-card]"),
            { autoAlpha: 0, y: 40 },
            {
              autoAlpha: 1,
              y: 0,
              duration: 1.1,
              ease: "expo.out",
              delay: 0.2,
              scrollTrigger: { trigger: q("[data-contact-grid]")[0], start: "top 82%", once: true },
            },
          );
        },
      );
      return () => mm.revert();
    },
    { scope: ref },
  );

  return (
    <section ref={ref} id="contact" data-theme="light" className="section-y relative">
      <div data-contact-grid className="wrap grid gap-16 lg:grid-cols-2 lg:gap-24">
        {/* Contact form (second on mobile) */}
        <div className="order-2 lg:order-1">
          <p className="t-eyebrow mb-6 text-ink/70">Contact</p>
          <SplitReveal className="font-display t-h2">
            Questions, <em>welcome.</em>
          </SplitReveal>
          <p data-contact-fade data-reveal className="mb-10 mt-6 max-w-md text-ink/70">
            Not sure which treatment is right for you? Send us a note — a member of our team will
            reply within one business day.
          </p>
          <div data-contact-fade data-reveal>
            <ContactForm />
          </div>
        </div>

        {/* Newsletter + visit details (first on mobile) */}
        <div className="order-1 flex flex-col gap-10 lg:order-2 lg:pt-24">
          <div
            data-contact-card
            data-reveal
            className="rounded-lg bg-sand p-8 shadow-[var(--shadow-soft)] sm:p-10"
          >
            <p className="t-eyebrow mb-5 text-ink/70">The Velure Letter</p>
            <h3 className="font-display t-h3 !text-[clamp(1.75rem,3vw,2.5rem)]">
              Skin notes, <em>occasionally.</em>
            </h3>
            <p className="mb-8 mt-4 text-ink/70">
              Seasonal treatments, honest skincare advice and first access to new openings. No
              noise.
            </p>
            <NewsletterForm />
          </div>

          <dl data-contact-fade data-reveal className="grid gap-6 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
            <div>
              <dt className="t-eyebrow mb-1.5 text-gold">Studio</dt>
              <dd className="text-ink/70">
                1200 Desert Bloom Ave
                <br />
                Scottsdale, AZ
              </dd>
            </div>
            <div>
              <dt className="t-eyebrow mb-1.5 text-gold">Hours</dt>
              <dd className="text-ink/70">
                Mon – Sat
                <br />
                9:00 – 19:00
              </dd>
            </div>
            <div>
              <dt className="t-eyebrow mb-1.5 text-gold">Phone</dt>
              <dd className="text-ink/70">(480) 555-0142</dd>
            </div>
          </dl>
        </div>
      </div>
    </section>
  );
}
