import gsap from "gsap";

/** Run `cb` once webfonts are ready (SplitText must measure final glyphs). */
export function afterFonts(cb: () => void): () => void {
  let cancelled = false;
  const run = () => {
    if (!cancelled) cb();
  };
  if (typeof document !== "undefined" && document.fonts?.ready) {
    document.fonts.ready.then(run);
  } else {
    run();
  }
  return () => {
    cancelled = true;
  };
}

/**
 * Like afterFonts, but anything GSAP creates inside `cb` is owned by a context
 * that is reverted by the returned cleanup (async work escapes matchMedia's own).
 */
export function afterFontsIn(scope: Element | null | undefined, cb: () => void): () => void {
  const ctx = gsap.context(() => {}, scope ?? undefined);
  const cancel = afterFonts(() => {
    ctx.add(cb);
  });
  return () => {
    cancel();
    ctx.revert();
  };
}

declare global {
  interface Window {
    __velureGates?: Record<string, boolean>;
  }
}

/**
 * A one-shot "this has happened" signal that works regardless of whether the
 * listener or the emitter mounts first (preloader → hero → nav sequencing).
 */
function makeGate(name: string) {
  const event = `velure:${name}`;
  return {
    /** Mark the gate open. */
    open() {
      (window.__velureGates ??= {})[name] = true;
      window.dispatchEvent(new Event(event));
    },
    /** Call `cb` when the gate opens (immediately if it already has). */
    on(cb: () => void): () => void {
      if (window.__velureGates?.[name]) {
        cb();
        return () => {};
      }
      window.addEventListener(event, cb, { once: true });
      return () => window.removeEventListener(event, cb);
    },
  };
}

export const introGate = makeGate("intro-done");
export const heroGate = makeGate("hero-done");
