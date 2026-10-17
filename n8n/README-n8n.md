# Velure — n8n backend

Četiri workflowa spremna za import i jedan koji dupliciraš s thaus.co. Svi pišu u **nove Velure Notion baze** (već kreirane, vidi dolje), odvojene od Thausa.

## Notion baze (kreirane)

Stranica **Velure Med Spa — CRM** (privatna, u tvom Notion workspaceu):

| Baza | Database ID | Puni je workflow |
|---|---|---|
| Velure Bookings | `NOTION_BOOKINGS_DB_ID` | Velure — Booking |
| Velure Leads | `NOTION_LEADS_DB_ID` | Velure — Contact |
| Velure Newsletter | `NOTION_NEWSLETTER_DB_ID` | Velure — Subscribe / Unsubscribe / Weekly Letter |

**Obavezan korak:** u Notionu otvori stranicu *Velure Med Spa — CRM* → `•••` → **Connections** → dodaj istu integraciju koju koristi n8n za Thaus. Bez toga n8n dobiva 404 na sve tri baze.

## Import (za svaki od 4 JSON-a)

1. n8n → **Workflows → Import from File** → odaberi JSON.
2. Na svakom **Notion** nodeu odaberi postojeći Notion credential.
3. Na svakom **Send Email** nodeu odaberi postojeći Gmail SMTP credential.
4. Otvori svaki Notion node jednom: n8n ponovno učita listu propertyja. Provjeri da su polja mapirana (posebno `Appointment` datum s vremenom, timezone `America/Phoenix`).
5. Provjeri **Webhook → Options → Allowed Origins**. Upisano je `http://localhost:3000,https://velure-medspa.vercel.app`. Nakon deploya zamijeni drugu adresu stvarnim Vercel URL-om. Ako dodaš vlastitu domenu, upiši je i s `www` i bez njega (lekcija s thaus.co).
6. **Activate** workflow.

Adrese (production webhook URL-ovi, upisani i u `.env.local`):

- `POST https://your-n8n-instance.example.com/webhook/velure-booking`
- `POST https://your-n8n-instance.example.com/webhook/velure-contact`
- `POST https://your-n8n-instance.example.com/webhook/velure-subscribe`
- `GET  https://your-n8n-instance.example.com/webhook/velure-unsubscribe?email=...`

## Što koji workflow radi

**Velure — Booking**
Webhook → validacija i normalizacija (honeypot, Phoenix vrijeme, nedjelja zatvoreno, slotovi 09:00–18:00) → provjera slota u Notionu (`Slot key` + `Status = Confirmed`). Ako je slot zauzet, vraća **409**. Inače kreira zapis u *Velure Bookings*, vraća **200** s `bookingId`, pa šalje dva maila: potvrdu klijentu (Velure stil) i obavijest tebi.

**Velure — Contact**
Webhook → validacija → zapis u *Velure Leads* (Status New) → **200** → obavijest tebi (reply-to = klijent) → auto-reply klijentu (welcome/potvrda primitka).

**Velure — Subscribe**
Webhook → validacija → traži email u *Velure Newsletter*. Ako postoji, postavlja Status na Active i vraća `duplicate: true`. Ako ne postoji, kreira pretplatnika → **200** → čeka 2 min → welcome mail s unsubscribe linkom.

**Velure — Unsubscribe**
GET link iz maila → postavlja Status na Unsubscribed i upisuje datum → prikazuje malu Velure HTML potvrdu. Nepoznata adresa također dobiva poruku o uspjehu, da se ne otkriva tko je na listi.

## Velure — Weekly Letter (dupliciraj thaus workflow)

Struktura je ista kao Thaus tjedni AI newsletter: Schedule → Claude → format → Notion pretplatnici → slanje. Najbrže je duplicirati postojeći workflow:

1. Thaus weekly newsletter → `•••` → **Duplicate** → preimenuj u *Velure — Weekly Letter*.
2. Schedule: npr. četvrtak 08:00, timezone `America/Phoenix`.
3. Notion "get subscribers": baza `NOTION_NEWSLETTER_DB_ID`, filter `Status = Active`. Napomena: Velure baza ima `Date subscribed` bez razmaka na kraju (Thaus baza ima razmak u nazivu tog polja).
4. U Claude nodeu zamijeni system prompt ovim:

```
You write "The Velure Letter", a short weekly email from Velure Med Spa (Scottsdale, Arizona).
Voice: calm, precise, warm, never salesy, no exclamation marks, no emojis. Clinical credibility with a soft hand.
Pick ONE topic at random from this list and write about it (do not mention that it was chosen at random):
- seasonal skin in the Arizona desert (dryness, sun, hydration)
- how a facial differs from a medical-grade treatment
- what to expect at a first consultation
- daily SPF habits that actually stick
- collagen: what it is and what helps it
- aftercare basics after microneedling or laser
- myths about injectables and natural results
- building a simple evening routine
Rules: 180–260 words. Structure: a title (max 8 words), one short intro paragraph, three short points each with a bold lead-in, one closing line inviting readers to book a consultation at Velure.
Never give individual medical advice; recommend a consultation for personal questions. Do not invent prices, discounts or statistics.
Return JSON: {"subject": "...", "title": "...", "intro": "...", "points": [{"lead": "...", "text": "..."}], "closing": "..."}
```

5. U Code nodeu koji formatira HTML koristi isti "shell" kao u Velure workflowima (Booking → *Build Emails*, prvih ~25 linija). Na dno dodaj unsubscribe link `https://your-n8n-instance.example.com/webhook/velure-unsubscribe?email=...` i rečenicu o demo projektu.

## Faza 2 (EP 14–15, kasnije)

Baza *Velure Bookings* već ima polja `Reminder sent` i `Review requested`. Workflowi za podsjetnik dan prije termina i za review request nakon termina dodaju se na istu bazu, bez promjena na webu.

## Brzi test (nakon importa, prije web forme)

PowerShell:

```powershell
$body = @{ treatmentId="signature-glow-facial"; date="2026-10-22"; time="10:30"; firstName="Test"; lastName="Client"; email="TVOJ_EMAIL"; phone="+1 480 555 0100"; firstVisit=$true; notes=""; consent=$true; company="" } | ConvertTo-Json
Invoke-RestMethod -Method Post -Uri "https://your-n8n-instance.example.com/webhook/velure-booking" -ContentType "application/json" -Body $body
```

Očekuješ `ok: True` i `bookingId`, novi red u Notionu i dva maila. Ponovi isti poziv: drugi put mora vratiti **409** (slot zauzet). Datum mora biti od sutra do +60 dana i ne smije biti nedjelja.
