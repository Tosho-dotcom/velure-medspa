"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

import { cn } from "@/lib/utils";
import { heroGate } from "@/lib/motion";
import { NAV_OFFSET, navLinks } from "@/lib/nav-links";
import { Wordmark } from "@/components/ui/wordmark";
import { PillButton } from "@/components/ui/pill-button";
import { useSmoothScroll } from "@/components/motion/SmoothScroll";
import { THEME_EVENT, type PageTheme } from "@/components/motion/ThemeObserver";
import { useBooking } from "@/components/booking/BookingProvider";
import { MobileMenu } from "@/components/layout/MobileMenu";

export function Nav() {
  const { scrollTo } = useSmoothScroll();
  const booking = useBooking();

  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [theme, setTheme] = useState<PageTheme>("light");
  const [menuOpen, setMenuOpen] = useState(false);
  const barRef = useRef<HTMLElement>(null);
  const lastY = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      const vh = window.innerHeight;
      setScrolled(y > vh * 0.85);
      if (y > vh * 1.2 && y > lastY.current + 4) setHidden(true);
      else if (y < lastY.current - 4) setHidden(false);
      lastY.current = y;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onTheme = (e: Event) => setTheme((e as CustomEvent<PageTheme>).detail);
    window.addEventListener(THEME_EVENT, onTheme);
    return () => window.removeEventListener(THEME_EVENT, onTheme);
  }, []);

  // Nav fades in last, after the hero intro.
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
          const el = barRef.current;
          if (!el) return;
          if (reduce) {
            gsap.set(el, { autoAlpha: 1 });
            return;
          }
          // Nav fades in last: when the hero intro has finished (6s safety net).
          let shown = false;
          const show = () => {
            if (shown) return;
            shown = true;
            gsap.fromTo(el, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.6, ease: "power2.out" });
          };
          const off = heroGate.on(show);
          const safety = window.setTimeout(show, 6000);
          return () => {
            off();
            window.clearTimeout(safety);
          };
        },
      );
      return () => mm.revert();
    },
    { scope: barRef },
  );

  const go = (target: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    setMenuOpen(false);
    scrollTo(target, { offset: NAV_OFFSET });
  };

  const overHero = !scrolled;
  const dark = theme === "dark";

  // Local --fg/--bg so the Book now pill always contrasts with the bar behind it.
  const vars =
    menuOpen || overHero
      ? "[--bg:var(--espresso-deep)] [--fg:var(--ivory-on-dark)]"
      : dark
        ? "[--bg:var(--espresso-deep)] [--fg:var(--ivory-on-dark)]"
        : "";

  const tone = menuOpen
    ? "bg-transparent text-ivory-on-dark"
    : overHero
      ? "bg-transparent text-ivory"
      : dark
        ? "bg-espresso-deep/80 text-ivory-on-dark border-b border-ivory-on-dark/10 backdrop-blur-[14px]"
        : "bg-ivory/80 text-espresso border-b border-stone backdrop-blur-[14px]";

  return (
    <>
      <header
        ref={barRef}
        data-reveal
        className={cn(
          "fixed inset-x-0 top-0 z-[80] h-[var(--nav-h)] transition-[transform,opacity,background-color,color,border-color] duration-[450ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none",
          tone,
          vars,
          hidden && !menuOpen && "-translate-y-full",
          booking.isOpen && "pointer-events-none opacity-0!",
        )}
      >
        <nav
          aria-label="Primary"
          className="wrap flex h-full items-center justify-between"
        >
          <a
            href="#top"
            onClick={(e) => {
              e.preventDefault();
              setMenuOpen(false);
              scrollTo(0);
            }}
          >
            <Wordmark />
            <span className="sr-only">, back to top</span>
          </a>

          <ul className="hidden items-center gap-10 lg:flex">
            {navLinks.map((l) => (
              <li key={l.target}>
                <a
                  href={l.target}
                  onClick={go(l.target)}
                  className="link-underline text-[0.9375rem] tracking-wide"
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-4">
            <PillButton
              onClick={() => booking.open()}
              className="hidden h-11 lg:inline-flex"
            >
              <span>Book now</span>
            </PillButton>

            <button
              type="button"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              onClick={() => setMenuOpen((v) => !v)}
              className="relative size-11 lg:hidden"
            >
              <span
                className={cn(
                  "absolute left-1/2 top-1/2 block h-px w-7 -translate-x-1/2 bg-current transition-transform duration-500 motion-reduce:transition-none",
                  menuOpen ? "rotate-45" : "-translate-y-[4px]",
                )}
              />
              <span
                className={cn(
                  "absolute left-1/2 top-1/2 block h-px w-7 -translate-x-1/2 bg-current transition-transform duration-500 motion-reduce:transition-none",
                  menuOpen ? "-rotate-45" : "translate-y-[4px]",
                )}
              />
            </button>
          </div>
        </nav>
      </header>

      <MobileMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        onNavigate={(target) => {
          setMenuOpen(false);
          scrollTo(target, { offset: NAV_OFFSET });
        }}
        onBook={() => {
          setMenuOpen(false);
          booking.open();
        }}
      />
    </>
  );
}
