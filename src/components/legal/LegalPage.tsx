import type { ReactNode } from "react";

import { LEGAL_UPDATED, legalPages } from "@/lib/legal";

export type LegalSection = { id: string; title: string; body: ReactNode };

/**
 * Shared layout for the legal pages: title, a short plain-language summary,
 * a table of contents and numbered sections. Server component, no motion.
 */
export function LegalPage({
  path,
  title,
  intro,
  summary,
  sections,
}: {
  path: string;
  title: ReactNode;
  intro: ReactNode;
  summary: ReactNode[];
  sections: LegalSection[];
}) {
  return (
    <section data-theme="light" className="pb-24 pt-[calc(var(--nav-h)+4rem)] sm:pb-32">
      <div className="wrap">
        <header className="max-w-3xl">
          <p className="t-eyebrow text-gold">Legal · Last updated {LEGAL_UPDATED}</p>
          <h1 className="font-display t-h2 mt-5">{title}</h1>
          <div className="mt-6 max-w-2xl text-ink/80">{intro}</div>
        </header>

        <div className="mt-14 grid gap-12 lg:grid-cols-12 lg:gap-16">
          <aside className="min-w-0 lg:col-span-4">
            <div className="lg:sticky lg:top-[calc(var(--nav-h)+2rem)]">
              <div className="rounded-[14px] bg-sand p-6">
                <p className="t-eyebrow text-taupe">In short</p>
                <ul className="mt-4 space-y-3 text-[0.9375rem] leading-relaxed">
                  {summary.map((s, i) => (
                    <li key={i} className="flex gap-3">
                      <span aria-hidden="true" className="mt-[0.7em] h-px w-3 shrink-0 bg-gold" />
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <nav aria-label="On this page" className="mt-8 hidden lg:block">
                <p className="t-eyebrow text-taupe">On this page</p>
                <ol className="mt-4 space-y-2 text-sm">
                  {sections.map((s, i) => (
                    <li key={s.id}>
                      <a href={`#${s.id}`} className="flex gap-3 text-ink/75 hover:text-ink">
                        <span className="w-5 shrink-0 tabular-nums text-gold">{i + 1}.</span>
                        <span>{s.title}</span>
                      </a>
                    </li>
                  ))}
                </ol>
              </nav>
            </div>
          </aside>

          <div className="legal-prose min-w-0 lg:col-span-8">
            {sections.map((s, i) => (
              <section key={s.id} id={s.id} aria-labelledby={`${s.id}-h`}>
                <h2 id={`${s.id}-h`}>
                  <span className="mr-3 text-gold">{i + 1}.</span>
                  {s.title}
                </h2>
                {s.body}
              </section>
            ))}

            <nav aria-label="Legal" className="mt-16 border-t border-stone pt-8">
              <p className="t-eyebrow text-taupe">Other legal pages</p>
              <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm">
                {legalPages
                  .filter((p) => p.href !== path)
                  .map((p) => (
                    <li key={p.href}>
                      <a href={p.href} className="link-underline">
                        {p.label}
                      </a>
                    </li>
                  ))}
                <li>
                  {/* Full reload on purpose: the home page needs fresh scroll state (src/lib/navigate.ts). */}
                  {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
                  <a href="/" className="link-underline">
                    Back to Velure
                  </a>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </div>
    </section>
  );
}
