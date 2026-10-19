import type { Metadata } from "next";

import { LegalPage, type LegalSection } from "@/components/legal/LegalPage";
import { legalEntity } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Privacy Policy | Velure Med Spa (demo)",
  description:
    "How the Velure Med Spa demo website collects, uses and protects personal data, and the rights you have under EU and US privacy laws.",
};

const mail = (
  <a href={`mailto:${legalEntity.email}`}>{legalEntity.email}</a>
);

const sections: LegalSection[] = [
  {
    id: "who-we-are",
    title: "Who we are",
    body: (
      <>
        <p>
          Velure Med Spa is a <strong>fictional brand</strong>. This website is a working
          demonstration of a booking and automation system, built and operated by{" "}
          <strong>{legalEntity.name}</strong>, {legalEntity.description} (
          <a href={legalEntity.website} target="_blank" rel="noopener noreferrer">
            thaus.co
          </a>
          ). There is no clinic, no medical team and no real appointment behind this site.
        </p>
        <p>
          The forms, the chat assistant and the emails are real, so any information you send us
          is real personal data. {legalEntity.name} is responsible for it as the{" "}
          <strong>controller</strong> (in EU and UK terms) and as the <strong>business</strong>{" "}
          (in US state privacy law terms).
        </p>
        <p>Contact for anything in this policy: {mail}.</p>
      </>
    ),
  },
  {
    id: "what-we-collect",
    title: "What we collect",
    body: (
      <>
        <p>We only collect what you choose to send, plus the minimum a website needs to run.</p>
        <div className="legal-table">
          <table>
            <thead>
              <tr>
                <th>Where</th>
                <th>Data</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Booking panel</td>
                <td>
                  Treatment, date and time, first name, last name, email, phone, first-visit
                  checkbox, optional notes, your consent, time of submission and how long the form
                  was open (used to stop spam bots).
                </td>
              </tr>
              <tr>
                <td>Contact form</td>
                <td>Name, email, optional phone, your message.</td>
              </tr>
              <tr>
                <td>The Velure Letter (newsletter)</td>
                <td>Email address, subscription status and dates.</td>
              </tr>
              <tr>
                <td>Chat assistant</td>
                <td>
                  Your messages, the assistant&apos;s replies, a random session ID, which tools the
                  assistant used, and, only if you ask the team to reply, the name, email, phone
                  and question you give it.
                </td>
              </tr>
              <tr>
                <td>Technical data</td>
                <td>
                  IP address, browser type and request details, processed by our hosting provider
                  to deliver the site and keep it secure. A count of chat messages per session ID,
                  used to limit abuse. Anonymous, aggregated page statistics (see <a href="/cookies">Cookies &amp; Storage</a>
                  ).
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="legal-note">
          <strong>Please do not send health information.</strong> Do not describe medical
          conditions, medications, pregnancy or other health details in the booking notes, the
          contact form or the chat. This is a demo, not a clinic. If you do send such details, we
          use them only to reply to you and delete them on request.
        </div>
      </>
    ),
  },
  {
    id: "how-we-use",
    title: "How we use it and why",
    body: (
      <>
        <ul>
          <li>
            <strong>To handle your booking request</strong>: store it, check the time slot, send
            you a confirmation, a reminder before the appointment time and a review request
            afterwards. These emails show how the system works; no appointment takes place.
          </li>
          <li>
            <strong>To answer your message</strong> from the contact form or the chat assistant.
          </li>
          <li>
            <strong>To send The Velure Letter</strong> if you subscribed. Every letter has an
            unsubscribe link.
          </li>
          <li>
            <strong>To run the chat assistant</strong>: your messages are sent to an AI model to
            generate replies, and conversations are logged so we can check quality and fix errors.
          </li>
          <li>
            <strong>To keep the site secure</strong>: spam checks, rate limits and error logs.
          </li>
        </ul>
        <p>
          We do not sell your data, we do not use it for advertising, and we do not make
          decisions about you that have legal or similarly significant effects based solely on
          automated processing.
        </p>
        <h3>Legal bases (EU and UK GDPR)</h3>
        <ul>
          <li>
            Booking, contact and chat requests: steps taken at your request and our legitimate
            interest in responding to you and in demonstrating the system (Art. 6(1)(b) and (f)).
          </li>
          <li>Newsletter: your consent, which you can withdraw at any time (Art. 6(1)(a)).</li>
          <li>Security, spam prevention and logs: our legitimate interests (Art. 6(1)(f)).</li>
          <li>
            Health details you choose to include despite our request not to: your explicit
            consent, given by sending them, which you can withdraw by asking us to delete them
            (Art. 9(2)(a)).
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "who-processes",
    title: "Who helps us process it",
    body: (
      <>
        <p>
          We use the following service providers. They process data on our behalf and only for
          the purposes above.
        </p>
        <div className="legal-table">
          <table>
            <thead>
              <tr>
                <th>Provider</th>
                <th>What for</th>
                <th>Location</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Vercel Inc.</td>
                <td>Website hosting, server functions, cookieless page statistics</td>
                <td>USA, global edge network</td>
              </tr>
              <tr>
                <td>Hostinger</td>
                <td>Virtual server running our automation software (n8n, self-hosted)</td>
                <td>Hostinger data centre</td>
              </tr>
              <tr>
                <td>Notion Labs, Inc.</td>
                <td>Database for bookings, enquiries, subscribers and chat logs</td>
                <td>USA</td>
              </tr>
              <tr>
                <td>Anthropic PBC</td>
                <td>AI model that writes the chat assistant&apos;s replies (your messages are sent to it; it does not search other data about you)</td>
                <td>USA</td>
              </tr>
              <tr>
                <td>Google LLC</td>
                <td>Email delivery (Gmail) for confirmations, replies and the newsletter</td>
                <td>USA and other countries</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          Fonts, images and video are served from our own hosting, so your browser does not
          contact Google Fonts or other media services when you visit.
        </p>
      </>
    ),
  },
  {
    id: "transfers",
    title: "International transfers",
    body: (
      <p>
        Several providers are based in the United States. Where data from the EU, EEA or UK is
        transferred there, we rely on the EU-U.S. Data Privacy Framework (and its UK extension)
        where the provider is certified, or on the European Commission&apos;s Standard
        Contractual Clauses, together with the provider&apos;s security measures. You can ask us
        for more information about these safeguards at {mail}.
      </p>
    ),
  },
  {
    id: "retention",
    title: "How long we keep it",
    body: (
      <ul>
        <li>Booking requests, contact messages and chat logs: up to 12 months, then deleted.</li>
        <li>
          Chat conversation memory used to keep a conversation coherent: the last 10 exchanges,
          held in server memory only and cleared regularly.
        </li>
        <li>
          Newsletter: until you unsubscribe. After that we keep only your email address and the
          unsubscribe date, so we do not email you again by mistake.
        </li>
        <li>Chat message counters per session ID: reset daily.</li>
        <li>Hosting and error logs: as long as the provider&apos;s standard log retention.</li>
        <li>Notification emails in our mailbox: up to 12 months.</li>
      </ul>
    ),
  },
  {
    id: "eu-rights",
    title: "Your rights in the EU, EEA and UK",
    body: (
      <>
        <p>You have the right to:</p>
        <ul>
          <li>access the data we hold about you and get a copy;</li>
          <li>have it corrected or deleted;</li>
          <li>restrict or object to its processing, including processing based on legitimate interests;</li>
          <li>receive it in a portable format;</li>
          <li>withdraw consent at any time, without affecting earlier processing;</li>
          <li>
            lodge a complaint with a data protection authority, in particular in your country of
            residence (in Croatia: Agencija za zaštitu osobnih podataka, azop.hr).
          </li>
        </ul>
        <p>
          Email {mail} and we will reply within one month. We may ask you to confirm that the
          request comes from you, usually by replying from the same email address.
        </p>
      </>
    ),
  },
  {
    id: "us-rights",
    title: "Your rights in the United States",
    body: (
      <>
        <p>
          Depending on your state (for example California, Colorado, Connecticut, Virginia,
          Texas, Oregon and others), you may have the right to know what personal information we
          collect, to access it, to correct it and to delete it. We honour these requests for
          every US visitor, whether or not your state law applies to us.
        </p>
        <ul>
          <li>
            <strong>Categories collected</strong> in the last 12 months: identifiers (name,
            email, phone, IP address), commercial information (booking requests), internet
            activity (limited technical data) and, only if you volunteer it, health information.
            Sources: you and your browser. Purposes: as described in section 3.
          </li>
          <li>
            <strong>No sale or sharing.</strong> We do not sell personal information and do not
            share it for cross-context behavioural advertising, so there is nothing to opt out
            of. We treat Global Privacy Control signals as a valid opt-out anyway.
          </li>
          <li>
            <strong>Sensitive information.</strong> We do not ask for it and use anything you
            volunteer only to respond to you.
          </li>
          <li>
            <strong>Consumer health data</strong> (for example under Washington&apos;s My Health
            My Data Act or Nevada law): we collect it only if you choose to send it, use it only
            to respond to your request, never sell it, and delete it on request.
          </li>
          <li>
            <strong>HIPAA.</strong> Velure is not a healthcare provider and {legalEntity.name} is
            not a HIPAA covered entity. This demo is not designed to receive protected health
            information.
          </li>
          <li>
            <strong>No discrimination</strong> for exercising your rights. You may use an
            authorised agent; we may ask them for proof of authority.
          </li>
        </ul>
        <p>To make a request, email {mail}. We reply within 45 days.</p>
      </>
    ),
  },
  {
    id: "security",
    title: "Security",
    body: (
      <p>
        Data travels over encrypted connections (HTTPS). Access to our tools is limited to
        {` ${legalEntity.name}`} and protected with strong passwords and two-factor
        authentication where available. The chat endpoint is protected by a secret key and rate
        limits. No system is completely secure; if a breach affects your data, we will inform you
        and the relevant authorities as the law requires.
      </p>
    ),
  },
  {
    id: "children",
    title: "Children",
    body: (
      <p>
        This site is not intended for anyone under 18. We do not knowingly collect data from
        children. If you believe a child has sent us data, contact us and we will delete it.
      </p>
    ),
  },
  {
    id: "changes",
    title: "Changes to this policy",
    body: (
      <p>
        We will update this page if the way we handle data changes, and change the date at the
        top. For significant changes affecting newsletter subscribers, we will also tell them by
        email.
      </p>
    ),
  },
  {
    id: "contact",
    title: "Contact",
    body: (
      <p>
        {legalEntity.name} · {mail} ·{" "}
        <a href={legalEntity.website} target="_blank" rel="noopener noreferrer">
          thaus.co
        </a>
      </p>
    ),
  },
];

export default function PrivacyPage() {
  return (
    <LegalPage
      path="/privacy"
      title={
        <>
          Privacy <em>Policy</em>
        </>
      }
      intro={
        <p>
          How this demo website handles personal data, explained plainly. It applies to visitors
          from anywhere, with specific sections for the EU, EEA and UK, and for the United States.
        </p>
      }
      summary={[
        "Velure is a fictional demo brand. Thaus LLC runs this site and is responsible for your data.",
        "We only collect what you send through the forms, the chat or the newsletter.",
        "No selling, no advertising, no tracking cookies.",
        "Please do not send health information.",
        <>
          Ask for a copy or deletion of your data anytime at{" "}
          <a href={`mailto:${legalEntity.email}`} className="underline underline-offset-2">
            {legalEntity.email}
          </a>
          .
        </>,
      ]}
      sections={sections}
    />
  );
}
