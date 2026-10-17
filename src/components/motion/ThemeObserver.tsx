"use client";

import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export type PageTheme = "light" | "sand" | "dark";
export const THEME_EVENT = "velure:theme";

const THEMES: Record<PageTheme, { bg: string; fg: string }> = {
  light: { bg: "var(--ivory)", fg: "var(--espresso)" },
  sand: { bg: "var(--sand)", fg: "var(--espresso)" },
  dark: { bg: "var(--espresso-deep)", fg: "var(--ivory-on-dark)" },
};

function resolve(value: string): string {
  // GSAP tweens real colors, so resolve the token to its computed value.
  const name = value.slice(4, -1);
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

/**
 * Sections declare data-theme="light|sand|dark". One ScrollTrigger per section
 * tweens --bg / --fg on <body>, producing ivory → espresso → ivory transitions.
 * Render this AFTER the page content so pins are measured first.
 */
export function ThemeObserver() {
  useGSAP(() => {
    const mm = gsap.matchMedia();

    mm.add(
      {
        motion: "(prefers-reduced-motion: no-preference)",
        reduce: "(prefers-reduced-motion: reduce)",
      },
      (ctx) => {
        const { reduce } = ctx.conditions as { reduce: boolean };
        const body = document.body;
        const root = document.documentElement;

        const apply = (theme: PageTheme) => {
          root.dataset.theme = theme;
          window.dispatchEvent(new CustomEvent(THEME_EVENT, { detail: theme }));
          const t = THEMES[theme];
          gsap.to(body, {
            "--bg": resolve(t.bg),
            "--fg": resolve(t.fg),
            duration: reduce ? 0 : 0.8,
            ease: "power2.inOut",
            overwrite: true,
          });
        };

        const sections = gsap.utils.toArray<HTMLElement>("[data-theme]");
        sections.forEach((el) => {
          const theme = (el.dataset.theme as PageTheme) ?? "light";
          ScrollTrigger.create({
            trigger: el,
            start: "top 55%",
            end: "bottom 55%",
            onEnter: () => apply(theme),
            onEnterBack: () => apply(theme),
          });
        });

        return () => {
          gsap.set(body, { clearProps: "--bg,--fg" });
          delete root.dataset.theme;
        };
      },
    );

    return () => mm.revert();
  }, []);

  return null;
}
