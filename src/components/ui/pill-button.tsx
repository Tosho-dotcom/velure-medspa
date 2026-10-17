import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type Common = {
  variant?: "primary" | "secondary";
  className?: string;
  children: ReactNode;
};

type AsButton = Common & ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined };
type AsLink = Common & AnchorHTMLAttributes<HTMLAnchorElement> & { href: string };

/** Pill button with a fill-wipe hover (styles in globals.css `.btn`). */
export function PillButton(props: AsButton | AsLink) {
  const { variant = "primary", className, children, ...rest } = props;
  const classes = cn(
    "btn inline-flex h-[52px] items-center justify-center gap-2.5 px-7",
    variant === "primary" ? "btn-primary" : "btn-secondary",
    className,
  );

  if ("href" in rest && rest.href !== undefined) {
    return (
      <a className={classes} {...(rest as AnchorHTMLAttributes<HTMLAnchorElement>)}>
        {children}
      </a>
    );
  }
  return (
    <button type="button" className={classes} {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)}>
      {children}
    </button>
  );
}
