# Legal pages: from demo to a real client

The legal pages on this site (`/privacy`, `/terms`, `/cookies`, `/disclaimer`) are written for the
**demo**: Velure is fictional and Thaus LLC is the controller. When this system is delivered to a
real clinic, the roles change and so does the text. This checklist is a working guide, not legal
advice. Have the final texts reviewed by a lawyer in the client's jurisdiction before launch.

## 1. Who is who

| | Demo (this repo) | Client deployment |
|---|---|---|
| Controller / business | Thaus LLC | The clinic |
| Processor / service provider | Vercel, Hostinger, Notion, Anthropic, Google | **Thaus** (if it runs the automation) + those providers as sub-processors |
| Contract needed | none | Service agreement + **DPA** (EU) and/or **BAA** (US, if PHI) between clinic and Thaus |

## 2. What to change in the code

- `src/lib/legal.ts`: `legalEntity` becomes the clinic (legal name, address, registration number,
  email, governing law). Set `site.isDemo` to `false`.
- `src/app/privacy/page.tsx`
  - "Who we are": the clinic as controller; name Thaus as the processor that builds and runs the
    system.
  - Data table: match the clinic's real forms (e.g. date of birth, SMS reminders).
  - Provider table: list only the providers actually used, with their real regions.
  - Retention: use the clinic's policy (medical record rules can require longer periods for
    treatment data, which should not live in the website CRM at all).
  - Health data: a real clinic cannot simply say "do not send health information". Treatment
    choice alone can reveal health information. Decide the legal basis with the lawyer (see 3 and 4).
- `src/app/terms/page.tsx`: remove "No real services"; add booking, cancellation and no-show
  terms, deposits and payment terms if any, and the clinic's complaint procedure.
- `src/app/disclaimer/page.tsx`: remove "A fictional clinic"; treatment descriptions, risks and
  results statements must be approved by the clinic's medical director.
- `src/app/cookies/page.tsx`: update the storage table if anything is added. **Adding Google
  Analytics, Meta Pixel or similar requires a consent banner in the EU** and a "Do Not Sell or
  Share" mechanism in several US states.
- Footer: remove "Velure is a fictional brand"; add company details (see 3).
- Emails (n8n *Build Emails* nodes): replace the demo footer with the clinic's legal name, address
  and an unsubscribe link where required.

## 3. EU client (example: a clinic in Croatia)

- **DPA (Art. 28 GDPR)** between clinic and Thaus, with the list of sub-processors and the right
  to object to new ones.
- **Special category data (Art. 9).** Booking an aesthetic medical treatment is likely health
  data. Typical bases: explicit consent (separate, unticked checkbox) or provision of health care
  under Art. 9(2)(h). Choose with the lawyer and reflect it in the booking form.
- **DPIA** is likely required (health data + new technology such as an AI chat).
- **Record of processing activities (Art. 30)** for the clinic; Thaus keeps its own as processor.
- **Data location.** Prefer EU regions: Vercel functions in an EU region, n8n on an EU server,
  email via an EU provider. For US tools (Notion, Anthropic, Google), rely on the Data Privacy
  Framework or SCCs, and keep health details out of them where possible.
- **AI chat.** Disclose that it is an AI system (EU AI Act transparency duties for chatbots), keep
  the medical boundaries in the system prompt, and do not send conversation content that reveals
  health data to providers without a valid basis.
- **Company details on the site** (Croatian e-commerce law): legal name, address, OIB, court
  register and number, contact email; for a health institution, the competent authority.
- **Consumer law:** clear prices, cancellation terms for paid bookings or deposits.
- **Accessibility:** the European Accessibility Act applies to many consumer e-commerce and
  booking services (microenterprises are exempt). Target WCAG 2.1 AA anyway.
- **Supervisory authority** in Croatia: AZOP (azop.hr).

## 4. US client (example: a med spa in Arizona)

- **HIPAA.** If the clinic is a covered entity (for example it bills health insurance
  electronically) and the site collects protected health information, every vendor that touches
  that data needs a **Business Associate Agreement**, Thaus included. Standard plans of several
  tools used here do not offer a BAA. Either use HIPAA-eligible plans or keep PHI out of the
  website and automation (minimal booking data, no free-text health notes).
- **Consumer health data laws** apply even without HIPAA: Washington's My Health My Data Act
  (requires a separate consumer health data privacy policy linked from the homepage), Nevada and
  Connecticut rules, and others. Check where the clinic's visitors live.
- **State privacy laws** (CCPA/CPRA and others) apply above revenue or volume thresholds. Small
  clinics are often below them, but the privacy policy should still describe data and rights.
- **SMS reminders:** TCPA requires prior express consent, opt-out (STOP) and records of consent.
- **Newsletter:** CAN-SPAM requires a physical postal address and a working unsubscribe link.
- **Advertising claims:** FTC rules and state medical board rules on treatment claims,
  testimonials and before/after photos (written consent from each person shown).
- **Accessibility:** ADA website lawsuits are common; target WCAG 2.1 AA.

## 5. Contracts to have before launch

1. Service agreement (scope, price, maintenance, response times, who owns code and content).
2. DPA (EU) and/or BAA (US, when PHI is involved).
3. List of sub-processors, shared with the client and kept up to date.
4. Handover document: accounts, credentials, DNS records, where each piece of data lives, how to
   export and delete it.
