"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { PauseIcon, PlayIcon } from "lucide-react";

import { heroGate, introGate } from "@/lib/motion";
import { NAV_OFFSET } from "@/lib/nav-links";
import { useIsClient, useMediaQuery } from "@/hooks/useMediaQuery";
import { PillButton } from "@/components/ui/pill-button";
import { useSmoothScroll } from "@/components/motion/SmoothScroll";
import { useBooking } from "@/components/booking/BookingProvider";

type Variant = "desktop" | "mobile";

const sources: Record<Variant, { video: string; poster: string }> = {
  desktop: { video: "/media/hero-desktop.mp4", poster: "/media/hero-desktop-poster.webp" },
  mobile: { video: "/media/hero-mobile.mp4", poster: "/media/hero-mobile-poster.webp" },
};

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { scrollTo } = useSmoothScroll();
  const booking = useBooking();

  // One video only: chosen on the client from the viewport aspect ratio.
  const isClient = useIsClient();
  const isPortrait = useMediaQuery("(max-aspect-ratio: 4/5)");
  const reduceMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const variant: Variant | null = isClient ? (isPortrait ? "mobile" : "desktop") : null;

  // The visitor's choice wins; otherwise reduced motion starts paused.
  const [userPaused, setUserPaused] = useState<boolean | null>(null);
  const wantsPlayback = !(userPaused ?? reduceMotion);
  const [playing, setPlaying] = useState(false);
  const [readyFor, setReadyFor] = useState<Variant | null>(null);
  const ready = readyFor === variant;

  // React does not reliably reflect `muted` as an attribute, so browsers can
  // block the autoplay attribute, and Chrome pauses background video to save
  // power. Start playback explicitly and resume whenever the hero is visible.
  useEffect(() => {
    const v = videoRef.current;
    if (!v || !variant) return;
    v.muted = true;
    if (!wantsPlayback) {
      v.pause();
      return;
    }
    const play = () => void v.play().catch(() => {});
    play();
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && v.paused) play();
      },
      { threshold: 0.25 },
    );
    io.observe(v);
    const onVisible = () => document.visibilityState === "visible" && v.paused && play();
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [variant, wantsPlayback]);

  const togglePlayback = () => {
    const v = videoRef.current;
    if (!v) return;
    setUserPaused(!v.paused);
  };

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
          const { reduce } = ctx.conditions as { reduce: boolean };
          const root = ref.current!;
          const q = gsap.utils.selector(root);
          const lines = q("[data-hero-line]");
          const fades = q("[data-hero-fade]");
          const scale = q("[data-hero-scale]");
          const media = q("[data-hero-media]");
          const shade = q("[data-hero-shade]");
          const content = q("[data-hero-content]");

          if (reduce) {
            gsap.set([lines, fades], { autoAlpha: 1, yPercent: 0, y: 0 });
            heroGate.open();
            return;
          }

          // Exit: media drifts and scales, shade deepens, content lifts away.
          gsap
            .timeline({
              defaults: { ease: "none" },
              scrollTrigger: {
                trigger: root,
                start: "top top",
                end: "bottom top",
                scrub: 0.6,
              },
            })
            .to(media, { scale: 1.08, yPercent: 12 }, 0)
            .to(shade, { opacity: 0.35 }, 0)
            .to(content, { y: -90, autoAlpha: 0, duration: 0.6 }, 0)
            .set({}, {}, 1);

          // Intro: waits for the preloader (if any), then plays once.
          const withPreloader = document.documentElement.classList.contains("intro");
          const off = introGate.on(() => {
            const delay = withPreloader ? 0.6 : 0.1;
            gsap.fromTo(
              scale,
              { scale: 1.12 },
              { scale: 1, duration: 1.6, ease: "expo.out" },
            );
            gsap
              .timeline({ delay, onComplete: () => heroGate.open() })
              .fromTo(
                lines,
                { yPercent: 105, autoAlpha: 1 },
                { yPercent: 0, duration: 1.2, ease: "expo.out", stagger: 0.12 },
              )
              .fromTo(
                fades,
                { autoAlpha: 0, y: 16 },
                { autoAlpha: 1, y: 0, duration: 0.9, ease: "expo.out", stagger: 0.08 },
                0.15,
              );
          });
          return off;
        },
      );
      return () => mm.revert();
    },
    { scope: ref },
  );

  const src = variant ? sources[variant] : null;

  return (
    <section
      ref={ref}
      id="top"
      className="relative isolate [--bg:var(--espresso-deep)] [--fg:var(--ivory-on-dark)] h-svh min-h-[560px] overflow-hidden bg-espresso-deep text-ivory"
      aria-label="Velure Med Spa"
    >
      {/* Media (scrubbed on exit) → scale (intro) → poster + video */}
      <div data-hero-media className="absolute inset-0 will-change-transform">
        <div data-hero-scale className="absolute inset-0">
          <Image
            src={sources.desktop.poster}
            alt=""
            fill
            priority
            sizes="100vw"
            quality={80}
            className="object-cover [@media(max-aspect-ratio:4/5)]:hidden"
          />
          <Image
            src={sources.mobile.poster}
            alt=""
            fill
            sizes="100vw"
            quality={80}
            className="hidden object-cover [@media(max-aspect-ratio:4/5)]:block"
          />
          {src && (
            <video
              key={variant}
              ref={videoRef}
              aria-hidden="true"
              muted
              loop
              playsInline
              autoPlay={!reduceMotion}
              preload="metadata"
              poster={src.poster}
              onLoadedMetadata={() => ScrollTrigger.refresh()}
              onCanPlay={() => setReadyFor(variant)}
              onPlay={() => setPlaying(true)}
              onPause={() => setPlaying(false)}
              className={`absolute inset-0 size-full object-cover transition-opacity duration-700 ${
                ready ? "opacity-100" : "opacity-0"
              }`}
            >
              <source src={src.video} type="video/mp4" />
            </video>
          )}
        </div>
      </div>

      {/* Overlay gradient + extra scroll shade */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-linear-to-b from-espresso-deep/10 via-espresso-deep/5 via-45% to-espresso-deep/55"
      />
      <div
        data-hero-shade
        aria-hidden="true"
        className="absolute inset-0 bg-espresso-deep opacity-0"
      />

      {/* Content: bottom-left on desktop, centered-bottom on mobile */}
      <div
        data-hero-content
        className="wrap relative z-10 flex h-full flex-col items-center justify-end pb-[10vh] text-center lg:items-start lg:text-left"
      >
        <p data-hero-fade data-reveal className="t-eyebrow mb-6 text-ivory/85">
          Med Spa · Scottsdale, Arizona
        </p>

        <h1 className="font-display t-hero max-w-[11ch] text-ivory">
          <span className="block overflow-hidden pb-[0.08em]">
            <span data-hero-line data-reveal className="block">
              Radiance,
            </span>
          </span>
          <span className="block overflow-hidden pb-[0.08em]">
            <span data-hero-line data-reveal className="block">
              <em>refined.</em>
            </span>
          </span>
        </h1>

        <p data-hero-fade data-reveal className="mt-7 max-w-md text-lg leading-relaxed text-ivory/85">
          Clinical expertise, unhurried care. Treatments shaped around your skin — and your
          schedule.
        </p>

        <div data-hero-fade data-reveal className="mt-9 flex flex-col gap-3 sm:flex-row">
          <PillButton onClick={() => booking.open()}>
            <span>Book a consultation</span>
          </PillButton>
          <PillButton
            variant="secondary"
            href="#treatments"
            style={{ "--btn-inv": "var(--espresso-deep)" } as React.CSSProperties}
            onClick={(e) => {
              e.preventDefault();
              scrollTo("#treatments", { offset: NAV_OFFSET });
            }}
          >
            <span>Explore treatments</span>
          </PillButton>
        </div>
      </div>

      {/* Pause toggle (autoplaying motion > 5s needs a control) */}
      <button
        type="button"
        onClick={togglePlayback}
        aria-label={playing ? "Pause background video" : "Play background video"}
        className="absolute bottom-6 left-[var(--gutter)] z-20 inline-flex size-10 items-center justify-center rounded-full border border-ivory/40 text-ivory transition-colors hover:border-gold-light hover:text-gold-light"
      >
        {playing ? (
          <PauseIcon className="size-4" strokeWidth={1.25} />
        ) : (
          <PlayIcon className="size-4" strokeWidth={1.25} />
        )}
      </button>

      {/* Scroll cue */}
      <div
        aria-hidden="true"
        className="absolute bottom-6 right-[var(--gutter)] z-20 hidden flex-col items-center gap-3 text-ivory/80 sm:flex"
      >
        <span className="t-eyebrow [writing-mode:vertical-rl]">Scroll</span>
        <span className="relative block h-12 w-px overflow-hidden bg-ivory/25">
          <span className="scroll-cue-seg absolute inset-x-0 top-0 block h-4 bg-gold-light" />
        </span>
      </div>
    </section>
  );
}
