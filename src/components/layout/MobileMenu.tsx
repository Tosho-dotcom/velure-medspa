"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

import { PillButton } from "@/components/ui/pill-button";
import { useSmoothScroll } from "@/components/motion/SmoothScroll";
import { navLinks } from "@/lib/nav-links";

export function MobileMenu({
  open,
  onClose,
  onNavigate,
  onBook,
}: {
  open: boolean;
  onClose: () => void;
  onNavigate: (target: string) => void;
  onBook: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const first = useRef(true);
  const { stop, start } = useSmoothScroll();

  // Body scroll locked while open (lenis.stop), ESC closes.
  useEffect(() => {
    if (!open) return;
    stop();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      start();
    };
  }, [open, onClose, stop, start]);

  useGSAP(
    () => {
      const root = ref.current;
      if (!root) return;
      if (first.current) {
        first.current = false;
        gsap.set(root, { autoAlpha: 0 });
        return;
      }

      const mm = gsap.matchMedia();
      mm.add(
        {
          motion: "(prefers-reduced-motion: no-preference)",
          reduce: "(prefers-reduced-motion: reduce)",
        },
        (ctx) => {
          const { reduce } = ctx.conditions as { reduce: boolean };
          const links = root.querySelectorAll("[data-menu-link]");
          const extras = root.querySelectorAll("[data-menu-extra]");

          if (reduce) {
            gsap.to(root, { autoAlpha: open ? 1 : 0, duration: 0.2 });
            gsap.set([links, extras], { yPercent: 0, autoAlpha: 1 });
            return;
          }

          if (open) {
            const tl = gsap.timeline();
            tl.set(root, { autoAlpha: 1 })
              .fromTo(
                root,
                { clipPath: "inset(0 0 100% 0)" },
                { clipPath: "inset(0 0 0% 0)", duration: 0.8, ease: "power4.inOut" },
              )
              .fromTo(
                links,
                { yPercent: 100, autoAlpha: 0 },
                { yPercent: 0, autoAlpha: 1, duration: 0.9, ease: "expo.out", stagger: 0.07 },
                0.35,
              )
              .fromTo(
                extras,
                { autoAlpha: 0, y: 16 },
                { autoAlpha: 1, y: 0, duration: 0.7, ease: "expo.out", stagger: 0.08 },
                0.6,
              );
          } else {
            gsap.to(root, {
              clipPath: "inset(0 0 100% 0)",
              duration: 0.6,
              ease: "power3.inOut",
              onComplete: () => {
                gsap.set(root, { autoAlpha: 0 });
              },
            });
          }
        },
      );
      return () => mm.revert();
    },
    { scope: ref, dependencies: [open] },
  );

  return (
    <div
      id="mobile-menu"
      ref={ref}
      role="dialog"
      aria-modal="true"
      aria-label="Menu"
      aria-hidden={!open}
      inert={!open}
      className="fixed inset-0 [--bg:var(--espresso-deep)] [--fg:var(--ivory-on-dark)] z-[70] flex flex-col bg-espresso-deep px-[var(--gutter)] pb-8 pt-[calc(var(--nav-h)+2rem)] text-ivory-on-dark lg:hidden"
    >
      <ul className="flex flex-1 flex-col justify-center gap-3">
        {navLinks.map((l) => (
          <li key={l.target} className="overflow-hidden">
            <a
              data-menu-link
              href={l.target}
              onClick={(e) => {
                e.preventDefault();
                onNavigate(l.target);
              }}
              className="font-display block py-1 text-[2.75rem] font-light leading-[1.1] tracking-[-0.02em]"
            >
              {l.label}
            </a>
          </li>
        ))}
      </ul>

      <div data-menu-extra>
        <PillButton onClick={onBook} className="w-full">
          <span>Book now</span>
        </PillButton>
      </div>
      <p data-menu-extra className="mt-6 text-sm leading-relaxed text-ivory-on-dark/70">
        1200 Desert Bloom Ave, Scottsdale, AZ
        <br />
        Mon – Sat · 9:00 – 19:00
      </p>
    </div>
  );
}
