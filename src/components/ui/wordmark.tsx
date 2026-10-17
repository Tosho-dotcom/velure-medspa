import { cn } from "@/lib/utils";

/** Text wordmark: Fraunces 400, tight tracking, small tracked MED SPA line. */
export function Wordmark({
  className,
  showSub = true,
}: {
  className?: string;
  showSub?: boolean;
}) {
  return (
    <span className={cn("inline-flex flex-col leading-none", className)}>
      <span className="font-display text-[1.75rem] font-normal tracking-[-0.02em]">Velure</span>
      {showSub && (
        <span className="mt-1 text-[11px] font-medium uppercase tracking-[0.32em] opacity-70">
          Med Spa
        </span>
      )}
    </span>
  );
}
