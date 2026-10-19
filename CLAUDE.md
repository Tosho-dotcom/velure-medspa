# Velure Med Spa — project rules for Claude Code

Thaus Project #001. A minimal, luxury, single-page med spa site with a live booking panel, contact form and newsletter, all backed by n8n webhooks. Built in public — keep commits small and meaningful.

## Source of truth
- `specs/velure_site_spec.json` — brand, tokens, sections, copy, motion, a11y, performance.
- `specs/velure_booking_spec.json` — booking form fields, rules, states, request/response contract.
- `specs/velure_chat_spec.json` — chat assistant: /api/chat contract, widget UI, availability webhook.
- `n8n/` — backend workflows (do not edit from the frontend side; the contract is in the booking spec).
- Copy is final English copy. Do not invent new claims, prices or testimonials.

## Stack (do not swap)
Next.js App Router + TypeScript strict · Tailwind v4 (tokens as CSS variables) · shadcn/ui · GSAP (ScrollTrigger, SplitText) via @gsap/react · Lenis · react-hook-form + zod · lucide-react · next/font (Fraunces, Inter). No Framer Motion.

## Conventions
- `src/` layout as in `file_structure_suggestion` of the site spec.
- Server components by default; `"use client"` only for motion, forms, panel, nav state.
- All GSAP code inside `useGSAP(() => {...}, { scope })` so cleanup is automatic. Register plugins once in `components/motion/SmoothScroll.tsx`.
- Every animation must have a reduced-motion path (`gsap.matchMedia()` with `(prefers-reduced-motion: no-preference)` and `(prefers-reduced-motion: reduce)`).
- Use `gsap.matchMedia()` breakpoints `(min-width: 1024px)` / `(max-width: 1023px)` for desktop/mobile choreography differences.
- Colors only via tokens (`bg-ivory`, `text-espresso`, etc.). No raw hex in components.
- Images only via `next/image`. Videos: muted, loop, playsInline, poster, one source chosen on mount.
- Forms: one zod schema per form in `src/lib/*-schema.ts`, shared types, `postJSON` helper in `src/lib/submit.ts` with 15s timeout.
- Webhook URLs only from `process.env.NEXT_PUBLIC_N8N_*`. Never hardcode. Exception: the chat webhook and its secret are server-only (`N8N_CHAT_WEBHOOK_URL`, `N8N_CHAT_SECRET`) and are used only in `src/app/api/chat/route.ts`.
- Accessibility: visible labels, aria-live for form status, focus trap in panel, ESC closes, keyboard-reachable treatment rows.

## Definition of done per section
1. Matches spec copy and layout on 375px, 768px, 1280px, 1920px.
2. Motion matches the spec timing; no layout shift; 60fps on scroll (check Performance panel).
3. Reduced-motion path verified.
4. `npm run build` passes with zero TypeScript and ESLint errors.

## Do not
- Do not copy content, imagery or code from dhunwellness.com — it is a rhythm reference only.
- Do not add analytics/tracking beyond Vercel Analytics.
- Do not remove the "fictional brand / demo by Thaus" disclosure in the footer and booking consent.
