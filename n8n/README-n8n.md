# Velure — n8n backend

Seven importable workflows: four for the website (booking, contact, subscribe, unsubscribe),
two scheduled follow-ups (reminder, review request) and a weekly newsletter. All of them read
and write a dedicated Notion CRM.

> The JSON files contain placeholders only. Replace `REPLACE_ME` credential IDs, the
> `REPLACE_WITH_A_LONG_RANDOM_SECRET` secret, the `NOTION_*_DB_ID` database IDs, the
> `owner@example.com` address and the `your-n8n-instance.example.com` domain with your own values
> inside n8n. Never commit real values.

## Notion databases

A private Notion page, *Velure Med Spa — CRM*, holds three databases:

| Database | ID placeholder | Used by |
|---|---|---|
| Velure Bookings | `NOTION_BOOKINGS_DB_ID` | Booking, Reminder, Review request |
| Velure Leads | `NOTION_LEADS_DB_ID` | Contact |
| Velure Newsletter | `NOTION_NEWSLETTER_DB_ID` | Subscribe, Unsubscribe, Weekly letter |

**Required:** open the CRM page in Notion → `•••` → **Connections** → add the integration your
n8n instance uses. Without it, every Notion call returns 404.

## Import (for each JSON file)

1. n8n → **Workflows → Import from File** → choose the JSON file.
2. On every **Notion** node, select your Notion credential.
3. On every **Send Email** node, select your SMTP credential.
4. Open each Notion node once so n8n reloads the property list, and check the mappings
   (especially `Appointment`, a date with time in the `America/Phoenix` timezone).
5. Check **Webhook → Options → Allowed Origins**: `http://localhost:3000` and the production
   site URL. When adding a custom domain, add it both with and without `www`.
6. **Unsubscribe secret (required).** In *Velure — Subscribe* (node **Build Welcome**),
   *Velure — Unsubscribe* (node **Prepare**) and *Velure — Weekly Letter* (node **Build Emails**),
   replace `REPLACE_WITH_A_LONG_RANDOM_SECRET` with the **same** long random value (40+ characters
   from a password manager). With the placeholder left in place, anyone who reads this repository
   could forge unsubscribe tokens.
7. **Origin check.** The *Validate…* nodes in booking, contact and subscribe accept only requests
   from `http://localhost:3000` and `https://velure-medspa*.vercel.app`. Add a custom domain to the
   `ORIGIN_OK` regex in those three nodes, as well as to Allowed Origins on the webhook.
8. **Activate** the workflow.

Production webhook endpoints (also used in `.env.local`):

- `POST https://your-n8n-instance.example.com/webhook/velure-booking`
- `POST https://your-n8n-instance.example.com/webhook/velure-contact`
- `POST https://your-n8n-instance.example.com/webhook/velure-subscribe`
- `GET  https://your-n8n-instance.example.com/webhook/velure-unsubscribe?email=...&token=...`

## What each workflow does

**Velure — Booking**
Webhook → validate and normalise (honeypot, Phoenix time, closed on Sundays, 09:00–18:00 slots)
→ check the slot in Notion (`Slot key` + `Status = Confirmed`). A taken slot returns **409**.
Otherwise it creates the booking, returns **200** with `bookingId`, then emails a confirmation
to the client and a notification to the owner.

**Velure — Contact**
Webhook → validate → create a lead (Status *New*) → **200** → notify the owner (reply-to set to
the client) → auto-reply to the client.

**Velure — Subscribe**
Webhook → validate → look up the email. An existing address is set back to *Active* and the
response says `duplicate: true`. A new address is created → **200** → wait 2 minutes → welcome
email with a signed unsubscribe link.

**Velure — Unsubscribe**
GET link from an email → verify the token → set Status to *Unsubscribed* with the date → show a
small branded HTML confirmation. Unknown addresses get the same success message, so the
workflow never reveals who is on the list.

## Velure — Weekly Letter

Every **Thursday at 08:00 (Phoenix)** Claude writes a short letter, "The Velure Letter", and it
is sent to every subscriber with `Status = Active`.

**Flow:** schedule → *Pick Topic* → *Write Letter (Claude)* → *Build Letter* →
*Get Active Subscribers* → *Build Emails* → *Send Letter*.

- **Topic** is chosen by week of the year from eight topics in rotation, never the same twice
  in a row. The list lives in *Pick Topic*.
- **Claude** is called directly through the Anthropic API (about 1,500 output tokens, roughly
  one cent per letter). The system prompt — brand voice, 180–260 words, no invented prices or
  claims, no individual medical advice — sits in *Pick Topic* and is easy to edit.
- **Output validation in code** (*Build Letter*): the letter must have a title, an intro,
  exactly three headed points and a close, between 120 and 330 words. Exclamation marks and
  emoji are stripped. If anything is wrong, the workflow **fails and sends nothing** (see
  Executions), so subscribers never receive a broken letter.
- **Every unsubscribe link** is signed with the same secret as Subscribe and Unsubscribe.
- If sending to one recipient fails, the others still receive the letter.

### One-time setup
1. **Anthropic key:** create a **Header Auth** credential with header name `x-api-key` and your
   API key as the value, and select it on *Write Letter (Claude)*.
2. **Secret:** set the same value as in Subscribe and Unsubscribe in *Build Emails*.
3. Select the **Notion** and **SMTP** credentials and **Activate**.

### Test before the first real send
Run **Execute workflow** through *Run now (sends a preview to you only)*. That path sends the
letter **only to the owner** (subject starts with "[Preview]"), never to subscribers. Read it,
test the unsubscribe link, then leave the schedule active.

> Gmail SMTP allows roughly 500 emails per day. A larger list needs a dedicated sending service.

## Follow-ups: reminder and review request

Both run against *Velure Bookings* (fields `Reminder sent` and `Review requested`). The website
does not change.

| Workflow | Runs | What it does |
|---|---|---|
| `velure_reminder_workflow.json` | hourly | Finds `Status = Confirmed` bookings without a reminder, sends one to every appointment **1–24 hours** away and sets `Reminder sent`. |
| `velure_review_workflow.json` | daily at 19:30 (Phoenix) | Finds `Status = Completed` bookings without a review request, sends one and sets `Review requested`. |

### Rules

- **Bookings made less than 25 hours ahead get no reminder.** The client has just received the
  confirmation; a second email straight after it is noise. Constant: `MIN_LEAD_HOURS` in
  *Prepare Reminders*.
- **No reminder** for appointments less than an hour away or in the past.
- **`Completed` is set manually in Notion** after the visit. It is deliberately not automated,
  otherwise a no-show would be marked *Completed* and receive a thank-you email.
- **Review requests only go out for visits in the last 14 days** (`MAX_AGE_DAYS`).
- If an email fails, the workflow stops **before** setting the flag, so the next run retries.
- **Review link:** `REVIEW_URL` in *Prepare Review Requests* points to the contact section until
  the business has a real review page.

### Testing

**Reminder:** temporarily set `MIN_LEAD_HOURS = 0`, set a test booking (`Status = Confirmed`,
`Reminder sent` off) to an appointment within the next 24 hours, run *Run now (manual test)* and
expect the reminder email plus the flag. Run again: nothing must be sent. Restore
`MIN_LEAD_HOURS = 25`.

**Review request:** set a test booking to `Status = Completed` with yesterday's date, run the
manual trigger and expect the email plus the flag. Run again: nothing must be sent.

## Quick test (after import, before the web form)

The webhooks silently drop (with `200 ok` and no record) any request without an `Origin`
header or without `elapsedMs` (how long the form was open, in ms; at least 2,500 for booking
and contact, 1,000 for subscribe). A test therefore has to send both.

```powershell
$body = @{ treatmentId="signature-glow-facial"; date="2026-10-22"; time="10:30"; firstName="Test"; lastName="Client"; email="you@example.com"; phone="+1 480 555 0100"; firstVisit=$true; notes=""; consent=$true; company=""; elapsedMs=5000 } | ConvertTo-Json
Invoke-RestMethod -Method Post -Uri "https://your-n8n-instance.example.com/webhook/velure-booking" -ContentType "application/json" -Headers @{ Origin = "http://localhost:3000" } -Body $body
```

Expect `ok: True` with a `bookingId`, a new Notion record and two emails. Repeat the same call:
it must return **409** (slot taken). The date must be between tomorrow and +60 days and not a
Sunday.

Protection check: the same call **without** the Origin header (or with `elapsedMs=100`) must
return `ok: True` **without** a `bookingId` and must not create a record.

Unsubscribe: the link in the welcome email carries `&token=…`. The same link with a changed
email or token must show "Link not recognised".

## Chat assistant and live availability

Four more workflows power the website chat (bubble bottom-right) and the live "taken" times in
the booking form. Contract and UI: `specs/velure_chat_spec.json`.

| File | Workflow | Trigger |
|---|---|---|
| `velure_availability_workflow.json` | Velure — Availability | chat tool + `GET /webhook/velure-availability?date=YYYY-MM-DD` |
| `velure_chat_booking_link_workflow.json` | Velure Chat — Booking Link | chat tool (`suggest_booking`) |
| `velure_chat_contact_request_workflow.json` | Velure Chat — Contact Request | chat tool (`save_contact_request`) |
| `velure_chat_workflow.json` | Velure Chat Assistant | `POST /webhook/velure-chat` (Header Auth) |

### Notion
Under *Velure Med Spa — CRM* there is a page **Velure AI Assistant** with:

| Item | ID placeholder | Notes |
|---|---|---|
| Knowledge Base (page) | `NOTION_KB_PAGE_ID` | Facts only. Callouts are ignored. Booking ids must match `src/lib/treatments.ts`. |
| System Prompt (page) | `NOTION_PROMPT_PAGE_ID` | Only the code block is used. Keep `{{KNOWLEDGE_BASE}}`; no other curly braces. Reference copy: `velure_chat_system_prompt.txt`. |
| Velure Chat Logs (database) | `NOTION_CHAT_LOGS_DB_ID` | One row per reply: message, reply, action, tools, session. |

*Velure Leads* has an extra `Source` option, **Chat assistant**. Because the page sits inside the
CRM page, the existing n8n Notion connection already covers it.

### Import order
1. Import **Availability**, **Booking Link** and **Contact Request** first (the chat workflow
   calls them). Select the Notion credential (and SMTP in Contact Request), replace the `NOTION_*`
   IDs and `owner@example.com`, then save and **publish (activate) each one**. A sub-workflow that
   is not published fails with "Workflow is not active and cannot be executed".
2. Check that **Velure — Availability** answers on its webhook (it also serves the booking form).
3. Create a **Header Auth** credential *Velure Chat Secret*: name `X-Velure-Secret`, value a long
   random string (40+ characters). The same value goes into Vercel as `N8N_CHAT_SECRET`.
4. Import **Velure Chat Assistant**: select *Velure Chat Secret* on the webhook, the Notion and
   Anthropic credentials, replace the `NOTION_*` IDs, and on the three tool nodes
   (`check_availability`, `suggest_booking`, `save_contact_request`) pick the matching workflow in
   the dropdown. Switch the field to **By ID** once to confirm a real workflow ID is set. Keep the
   tool node names unchanged; the System Prompt refers to them.
5. Save and publish it. **After any later change, publish again**: the live webhook runs the
   published version, not the saved draft.

### Vercel environment variables
`N8N_CHAT_WEBHOOK_URL`, `N8N_CHAT_SECRET`, `NEXT_PUBLIC_N8N_AVAILABILITY_WEBHOOK`, and optionally
`UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` (rate limits) and `CHAT_ALLOWED_ORIGINS`
(custom domain, with and without `www`). Redeploy after adding them: `NEXT_PUBLIC_*` values are
built into the page.

### How it behaves
- **Availability** answers only from *Velure Bookings*: a slot is taken when a booking with
  `Status = Confirmed` has that `Slot key`. Same rules as booking: Phoenix time, Monday to
  Saturday, 09:00–18:00, tomorrow to +60 days. The public webhook returns only taken times,
  never names or emails.
- **The Book button** is created only from a successful `suggest_booking` call (node *Format
  Reply*), never from text the model writes. The assistant cannot book, change or cancel.
- **The current Scottsdale date** is appended to the system message on every call, outside the
  10-minute cache, so "this Friday" resolves correctly.
- **Limits:** 400 messages per day in total and 40 per conversation in n8n, plus per-IP and
  per-session limits in `/api/chat` when Upstash is configured.

### Troubleshooting
| Symptom | Cause | Fix |
|---|---|---|
| Site shows "The assistant is unavailable right now" for every message | The chat workflow failed before replying, most often *Build System Prompt*: the System Prompt page has no code block | Put the whole prompt inside ONE Notion code block (type `/code`), not as plain paragraphs |
| Assistant says it cannot check times or show a Book button | A tool call fails | Open the execution, click the tool node: "Workflow is not active" means the sub-workflow is not published or the tool node has no workflow selected |
| "Sorry, I could not put an answer together" | Empty agent output | Fixed in *Format Reply* (reads content blocks); make sure the published version has it |
| Assistant keeps "correcting" earlier answers | Old replies in the conversation memory | Test in a new browser tab (new session) |
| Prompt edits in Notion do not show | 10-minute cache | Wait, or deactivate and reactivate the workflow |

### Quick test
```powershell
Invoke-RestMethod "https://your-n8n-instance.example.com/webhook/velure-availability?date=2026-10-27" -Headers @{ Origin = "http://localhost:3000" }

$body = @{ sessionId = "test-session-0001"; message = "What's free next Tuesday for a facial?" } | ConvertTo-Json
Invoke-RestMethod -Method Post -Uri "https://your-n8n-instance.example.com/webhook/velure-chat" -ContentType "application/json" -Headers @{ "X-Velure-Secret" = "<secret>" } -Body $body
```
Expect `{ ok, date, bookable, taken }` from the first call, and `{ reply, action }` with an
action of type `book` from the second. A new row appears in *Velure Chat Logs*.
