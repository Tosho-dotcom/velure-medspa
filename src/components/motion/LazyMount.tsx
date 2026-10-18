"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * Renders `children` only once the wrapper is near the viewport. Keeps heavy,
 * below-the-fold client code (forms, calendar, validation) out of the initial
 * JavaScript. Give the wrapper a min-height so nothing shifts when it mounts.
 */
export function LazyMount({
  children,
  className,
  rootMargin = "900px 0px",
}: {
  children: ReactNode;
  className?: string;
  rootMargin?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShow(true);
          io.disconnect();
        }
      },
      { rootMargin },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [rootMargin]);

  // Late content can move triggers below it; re-measure once it is in.
  useEffect(() => {
    if (!show) return;
    const id = requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => cancelAnimationFrame(id);
  }, [show]);

  return (
    <div ref={ref} className={className}>
      {show ? children : null}
    </div>
  );
}
