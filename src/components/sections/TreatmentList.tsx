"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowRightIcon, PlusIcon } from "lucide-react";

import { treatments } from "@/lib/treatments";
import { cn } from "@/lib/utils";
import { useBooking } from "@/components/booking/BookingProvider";

const PREVIEW_W = 260;
const PREVIEW_H = 325;
const HIDDEN = "inset(100% 0% 0% 0%)";
const SHOWN = "inset(0% 0% 0% 0%)";

export function TreatmentList() {
  const ref = useRef<HTMLDivElement>(null);
  const booking = useBooking();

  const [desktop, setDesktop] = useState(false);
  const [expanded, setExpanded] = useState<number | null>(null);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const sync = () => setDesktop(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  // Row entrances (once) + cursor-follow preview (desktop, fine pointer only).
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(
        {
          motion: "(prefers-reduced-motion: no-preference)",
          reduce: "(prefers-reduced-motion: reduce)",
          fine: "(hover: hover) and (pointer: fine) and (min-width: 1024px)",
        },
        (ctx) => {
          const { reduce, fine } = ctx.conditions as { reduce: boolean; fine: boolean };
          const root = ref.current!;
          const rows = gsap.utils.toArray<HTMLElement>("[data-row]", root);

          if (reduce) {
            gsap.set(root.querySelectorAll("[data-hairline]"), { scaleX: 1 });
            gsap.set(root.querySelectorAll("[data-row-content]"), { autoAlpha: 1, y: 0 });
          } else {
            ScrollTrigger.batch(rows, {
              start: "top 88%",
              once: true,
              onEnter: (batch) => {
                const lines = batch.map((el) => el.querySelector("[data-hairline]"));
                const content = batch.map((el) => el.querySelector("[data-row-content]"));
                gsap
                  .timeline()
                  .to(lines, { scaleX: 1, duration: 0.9, ease: "expo.out", stagger: 0.08 })
                  .fromTo(
                    content,
                    { autoAlpha: 0, y: 28 },
                    { autoAlpha: 1, y: 0, duration: 0.9, ease: "expo.out", stagger: 0.08 },
                    0.2,
                  );
              },
            });
          }

          // Side preview: a still frame beside the list. Hovering (or focusing) a
          // row reveals that treatment's photo over the previous one.
          const frame = root.querySelector<HTMLElement>("[data-preview]");
          if (!frame || !fine) return;
          const imgs = gsap.utils.toArray<HTMLElement>("[data-preview-img]", frame);
          if (!imgs.length) return;

          const owner = gsap.context(() => {}, root);
          let current = 0;
          let z = 10;

          const show = (index: number) => {
            if (index === current || !imgs[index]) return;
            current = index;
            owner.add(() => {
              const el = imgs[index];
              if (reduce) {
                gsap.set(imgs, { clipPath: HIDDEN });
                gsap.set(el, { clipPath: SHOWN, zIndex: ++z });
                return;
              }
              const inner = el.querySelector("[data-preview-inner]");
              gsap.set(el, { zIndex: ++z, clipPath: HIDDEN });
              gsap.to(el, { clipPath: SHOWN, duration: 0.8, ease: "power3.out" });
              gsap.fromTo(inner, { scale: 1.1 }, { scale: 1, duration: 1.1, ease: "power3.out" });
            });
          };

          const onOver = (e: Event) => {
            const row = (e.target as HTMLElement).closest<HTMLElement>("[data-row]");
            if (row) show(Number(row.dataset.index));
          };

          root.addEventListener("pointerover", onOver);
          root.addEventListener("focusin", onOver);
          return () => {
            root.removeEventListener("pointerover", onOver);
            root.removeEventListener("focusin", onOver);
            owner.revert();
          };
        },
      );
      return () => mm.revert();
    },
    { scope: ref },
  );

  // Mobile accordion: animate panel height with GSAP.
  useGSAP(
    () => {
      const root = ref.current!;
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: reduce)", () => {
        root.querySelectorAll<HTMLElement>("[data-acc]").forEach((el, i) => {
          gsap.set(el, { height: expanded === i ? "auto" : 0 });
        });
      });
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        root.querySelectorAll<HTMLElement>("[data-acc]").forEach((el, i) => {
          gsap.to(el, {
            height: expanded === i ? "auto" : 0,
            duration: 0.5,
            ease: "power3.inOut",
            onComplete: () => {
              if (expanded === i) ScrollTrigger.refresh();
            },
          });
        });
      });
      return () => mm.revert();
    },
    { scope: ref, dependencies: [expanded] },
  );

  const onRow = (index: number, id: string) => {
    if (desktop) booking.open(id);
    else setExpanded((cur) => (cur === index ? null : index));
  };

  return (
    <div ref={ref} className="section-y relative pt-[clamp(4rem,10vh,8rem)]">
      <div className="wrap xl:grid xl:grid-cols-[minmax(0,1fr)_260px] xl:items-start xl:gap-12">
        <div>
        <ul className="border-b border-stone">
          {treatments.map((t, i) => (
            <li key={t.id} data-row data-index={i} className="relative">
              <span
                data-hairline
                aria-hidden="true"
                className="absolute inset-x-0 top-0 h-px origin-left bg-stone"
              />
              <div data-row-content data-reveal>
                <button
                  type="button"
                  onClick={() => onRow(i, t.id)}
                  aria-expanded={desktop ? undefined : expanded === i}
                  aria-controls={desktop ? undefined : `acc-${t.id}`}
                  className="group grid w-full cursor-pointer grid-cols-[2.5rem_1fr_auto] items-center gap-x-4 py-7 text-left lg:grid-cols-[4rem_minmax(0,1.1fr)_minmax(0,1.4fr)_6rem_9rem_2.5rem] lg:gap-x-8 lg:py-9 xl:grid-cols-[3rem_minmax(0,1.2fr)_minmax(0,1.4fr)_4.5rem_7rem_2rem] xl:gap-x-5"
                >
                  <span className="font-display text-base text-ink/70 transition-colors duration-300 group-hover:text-gold">
                    {t.n}
                  </span>
                  <span className="font-display t-h3 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none group-hover:translate-x-[14px]">
                    {t.name}
                  </span>
                  <span className="hidden text-[0.9375rem] leading-snug text-ink/70 lg:block">
                    {t.description}
                  </span>
                  <span className="hidden text-sm text-ink/70 lg:block">{t.duration}</span>
                  <span className="hidden text-sm lg:block">{t.price}</span>
                  <span className="justify-self-end">
                    <ArrowRightIcon
                      aria-hidden="true"
                      strokeWidth={1.25}
                      className="hidden size-6 -rotate-45 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none group-hover:rotate-0 lg:block"
                    />
                    <PlusIcon
                      aria-hidden="true"
                      strokeWidth={1.25}
                      className={cn(
                        "size-6 transition-transform duration-500 motion-reduce:transition-none lg:hidden",
                        expanded === i && "rotate-45",
                      )}
                    />
                  </span>
                  <span className="sr-only lg:hidden">
                    {expanded === i ? "Collapse" : "Expand"} {t.name}
                  </span>
                </button>

                {/* Mobile accordion body */}
                <div
                  id={`acc-${t.id}`}
                  data-acc
                  style={{ height: 0 }}
                  className="overflow-hidden lg:hidden"
                  aria-hidden={expanded !== i}
                  inert={expanded !== i}
                >
                  <div className="pb-8 pl-[3.25rem]">
                    <div className="relative mb-5 aspect-[4/5] w-full max-w-sm overflow-hidden rounded-md">
                      <Image
                        src={t.image}
                        alt={t.alt}
                        fill
                        sizes="(max-width: 1023px) 80vw, 0px"
                        quality={80}
                        className="object-cover"
                      />
                    </div>
                    <p className="text-ink/70">{t.description}</p>
                    <p className="mt-4 flex gap-5 text-sm">
                      <span className="text-ink/70">{t.duration}</span>
                      <span>{t.price}</span>
                    </p>
                    <button
                      type="button"
                      onClick={() => booking.open(t.id)}
                      className="link-underline mt-5 text-[0.9375rem] font-medium"
                    >
                      Book this treatment
                    </button>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <p className="mt-8 text-sm text-ink/70">
          Final pricing is confirmed at consultation. Prices in USD.
        </p>
        </div>

        {/* Still preview frame beside the list (xl+). Swaps on row hover/focus. */}
        <aside aria-hidden="true" className="sticky top-[calc(50svh-170px)] hidden xl:block">
          <div
            data-preview
            className="relative overflow-hidden rounded-md bg-sand"
            style={{ width: PREVIEW_W, height: PREVIEW_H }}
          >
            {treatments.map((t, i) => (
              <div
                key={t.id}
                data-preview-img
                className="absolute inset-0"
                style={{ clipPath: i === 0 ? SHOWN : HIDDEN, zIndex: i === 0 ? 10 : 0 }}
              >
                <div data-preview-inner className="absolute inset-0">
                  <Image
                    src={t.image}
                    alt=""
                    fill
                    sizes={`${PREVIEW_W}px`}
                    quality={80}
                    className="object-cover"
                  />
                </div>
              </div>
            ))}
          </div>
        </aside>
      </div>

    </div>
  );
}
