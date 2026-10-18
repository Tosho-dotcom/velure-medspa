# Velure Med Spa — build kit (Thaus Project #001)

Sve što treba za izradu stranice lokalno u VS Code-u preko Claude Codea, plus backend za n8n.

## Sadržaj paketa

```
velure-build-kit/
├─ CLAUDE.md                     pravila projekta koja Claude Code čita automatski
├─ CLAUDE_CODE_PROMPT.md         promptovi po fazama (0–7), lijepiš jedan po jedan
├─ specs/
│  ├─ velure_site_spec.json      brend, tokeni, sekcije, copy, animacije, a11y, SEO
│  └─ velure_booking_spec.json   booking panel: polja, pravila, stanja, API ugovor
├─ n8n/
│  ├─ README-n8n.md              import, Notion baze, weekly letter prompt, test
│  ├─ velure_booking_workflow.json
│  ├─ velure_contact_workflow.json
│  ├─ velure_subscribe_workflow.json
│  ├─ velure_unsubscribe_workflow.json
│  ├─ velure_reminder_workflow.json     faza 2: podsjetnik prije termina
│  ├─ velure_review_workflow.json       faza 2: zahtjev za recenziju
│  └─ velure_weekly_letter_workflow.json  tjedni newsletter (Claude)
└─ scripts/
   └─ download-assets.ps1        skida video i slike iz Higgsfielda u public/media
```

## Redoslijed rada

1. **Raspakiraj** sadržaj `velure-build-kit` izravno u svoj lokalni projektni folder, tako da su `CLAUDE.md` i `specs/` u rootu.
2. **Mediji:** u VS Code terminalu (u rootu foldera) pokreni:
   `powershell -ExecutionPolicy Bypass -File .\scripts\download-assets.ps1`
   Skripta skida 2 videa i 10 slika u `public\media`.
3. **n8n:** prati `n8n/README-n8n.md`. Najprije spoji Notion stranicu *Velure Med Spa — CRM* s n8n integracijom, zatim importaj 4 workflowa, odaberi credentiale i aktiviraj ih. Booking testiraj PowerShell naredbom iz tog dokumenta. Napomena: drugi, namjerno ponovljeni poziv PowerShell prikazuje kao grešku 409, što je očekivano ponašanje.
4. **Claude Code:** otvori folder u VS Code-u, pokreni Claude Code i zalijepi **Phase 0** iz `CLAUDE_CODE_PROMPT.md`. Nakon svake faze provjeri `npm run dev`, pa nastavi sa sljedećom.
5. **Deploy:** Phase 7 (GitHub → Vercel). Nakon deploya upiši stvarni Vercel URL u Allowed Origins sva četiri webhooka.

## Mediji (Higgsfield, generirano za Velure)

| Datoteka | Namjena |
|---|---|
| hero-desktop.mp4 / hero-mobile.mp4 | Hero loop, 10 s, 1080p, bez zvuka (16:9 i 9:16) |
| hero-*-poster.webp | Poster i LCP slika za hero |
| menu-reveal.webp | Panel koji se otvara u sekciji The Menu |
| treatment-01 … 06 | Hover/accordion slike tretmana |
| booking-reception.webp | Slika uz booking sekciju |

Videi su generirani sa start i end frameom na istoj slici, pa bi loop trebao biti bez reza. Prije ugradnje ga ipak pogledaj u petlji. Ako je datoteka veća od ~6 MB, komprimiraj je ffmpeg naredbom s dna skripte (ili HandBrakeom).

## End-to-end checklist (nakon deploya)

- [ ] Hero video se učitava (desktop 16:9, mobitel 9:16), poster se vidi odmah.
- [ ] Preloader se prikazuje samo pri prvom posjetu u sesiji.
- [ ] The Menu: panel se otvara glatko, bez skoka na početku i kraju pina.
- [ ] Klik na tretman otvara panel s tim tretmanom već odabranim.
- [ ] Booking: uspjeh → Notion red + mail klijentu + mail tebi.
- [ ] Booking istog slota drugi put → poruka "That time was just taken".
- [ ] Contact: Notion lead + auto-reply + obavijest tebi.
- [ ] Newsletter: pretplata → Notion + welcome mail (nakon 2 min); ponovna pretplata → poruka "already subscribed".
- [ ] Unsubscribe link iz maila radi.
- [ ] Faza 2: podsjetnik stiže za termin unutar 24 h i uključuje `Reminder sent` (vidi `n8n/README-n8n.md`).
- [ ] Faza 2: rezervacija sa `Status = Completed` dobiva review mail i uključuje `Review requested`.
- [ ] Reduced motion (Windows: Settings → Accessibility → Visual effects → Animation effects OFF) → stranica radi bez pinova.
- [ ] Lighthouse mobile ≥ 90.

## Napomena o brendu

Velure je fiktivni brend, a stranica prima stvarne unose. Zato footer, consent u booking formi i svi mailovi navode da je riječ o demo projektu studija Thaus. To štiti tebe i posjetitelje, a u portfoliju djeluje profesionalno.

## Deploy (Vercel)

- Live: https://velure-medspa.vercel.app (Vercel project `velure-medspa`, GitHub repo `Tosho-dotcom/velure-medspa`, deploys on every push to `main`).
- Env vars (Production and Preview): `NEXT_PUBLIC_N8N_BOOKING_WEBHOOK`, `NEXT_PUBLIC_N8N_CONTACT_WEBHOOK`, `NEXT_PUBLIC_N8N_SUBSCRIBE_WEBHOOK`. Optional: `NEXT_PUBLIC_SITE_URL` once a custom domain exists.
- n8n webhooks already allow this origin (Allowed Origins plus the `ORIGIN_OK` check in the validate nodes). When a custom domain is added, update both, with and without `www`.
- `vercel link` writes `.vercel/` and a `VERCEL_OIDC_TOKEN` into `.env.local`; both are git-ignored.
