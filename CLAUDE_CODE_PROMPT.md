# Claude Code — build prompts (paste one phase at a time)

Run these in order from the project root in VS Code. Each phase ends with a commit. Wait until a phase builds cleanly before pasting the next one. (Bilješka: svaka faza = dobar kadar za snimanje epizode.)

---

## Phase 0 — Scaffold (EP 09)

Read `CLAUDE.md`, `specs/velure_site_spec.json` and `specs/velure_booking_spec.json` fully before writing any code.

Then:
1. Scaffold a Next.js App Router project in the current folder (TypeScript, Tailwind, ESLint, `src/` dir, import alias `@/*`). Keep the existing `specs/`, `n8n/`, `scripts/`, `CLAUDE.md` and `public/media/` untouched.
2. Install: `gsap @gsap/react lenis react-hook-form zod @hookform/resolvers lucide-react date-fns @vercel/analytics`.
3. Init shadcn/ui and add: `sheet select popover calendar checkbox input textarea label sonner`.
4. Implement design tokens from `design_tokens` as CSS variables in `globals.css` and expose them as Tailwind v4 theme colors (ivory, sand, stone, taupe, espresso, espresso-deep, gold, gold-light, blush, ivory-on-dark), plus font variables for Fraunces and Inter via `next/font/google`.
5. Create `.env.local.example` with the three `NEXT_PUBLIC_N8N_*` variables from the spec, and `.env.local` with the same values.
6. Create `src/lib/treatments.ts` from the spec (id, n, name, description, duration, price, image, alt).
7. `app/page.tsx` renders empty, labelled section placeholders in the right order with the right ids and data-theme values.
8. Verify `npm run build`. Commit: `chore: scaffold velure (next, tailwind, shadcn, gsap, lenis)`.

## Phase 1 — Motion foundation + Nav + Preloader (EP 10)

Implement `SmoothScroll` provider (Lenis driven by gsap.ticker, ScrollTrigger sync, context exposing `scrollTo/stop/start`), `ThemeObserver` (section data-theme → body CSS vars, nav theme), `Preloader` (once per session) and `Nav` + `MobileMenu` exactly as in `navigation` and `motion.preloader`. Include reduced-motion paths. Commit: `feat: smooth scroll, theme transitions, nav, preloader`.

## Phase 2 — Hero + Philosophy (EP 10)

Build `Hero` with the video logic from `assets.rules`, overlay, copy, CTAs, scroll cue, pause toggle, `hero_intro` and `hero_exit_scrub`. Build `Philosophy` with the word-by-word scrub and pillars. Commit: `feat: hero video + philosophy`.

## Phase 3 — The Menu (EP 10/11, signature moment)

Build `Treatments` (pinned clip-path reveal exactly per `motion.menu_reveal`, desktop and mobile variants) and `TreatmentList` (rows, cursor-follow preview with gsap.quickTo, preloaded images, mobile accordion). Clicking any row opens the booking panel with that treatment preselected (panel stub is fine for now). Tune scrub/pin until it feels slow and expensive — no jitter, no jump at pin start/end. Commit: `feat: the menu reveal + treatment list`.

## Phase 4 — Booking (EP 11)

Build `BookingForm` exactly per `specs/velure_booking_spec.json` (fields, zod schema, Phoenix-time date rules, slot chips, sticky summary, all states incl. 409 slot_taken), `BookingPanel` (shadcn Sheet + motion.booking_panel) and the inline `#book` section. Panel opens from: nav "Book now", hero CTA, treatment rows, mobile menu. Persist draft in sessionStorage. Commit: `feat: booking panel + form wired to n8n`.

## Phase 5 — Ritual, Contact, Newsletter, Footer (EP 11)

Build `Ritual` (scrubbed line), `Contact` (ContactForm + NewsletterForm with success/duplicate/error states) and `Footer` (large wordmark reveal, disclosure line, Thaus credit). Commit: `feat: ritual, contact, newsletter, footer`.

## Phase 6 — Polish & QA

1. SEO metadata, `opengraph-image.tsx`, JSON-LD from `seo`.
2. Accessibility pass from `accessibility` (keyboard through the whole page, focus trap, aria-live).
3. Performance pass from `performance` (poster preload, image sizes, no CLS from SplitText, ScrollTrigger.refresh after fonts).
4. Test at 375 / 768 / 1280 / 1920 and with reduced motion enabled.
5. `npm run build` clean. Commit: `chore: seo, a11y, performance polish`.

## Phase 7 — Deploy (EP 17)

Create a new GitHub repo `velure-medspa` (private for now), push, import to Vercel, add the three env variables in Vercel → Settings → Environment Variables, deploy. Then add the final Vercel URL to the `allowedOrigins` of all four n8n webhooks and run the end-to-end checklist in `README.md`.
