import type { Metadata } from "next";

import { LegalPage, type LegalSection } from "@/components/legal/LegalPage";
import { legalEntity } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Cookies & Storage | Velure Med Spa (demo)",
  description:
    "The Velure Med Spa demo uses no tracking cookies. What it stores in your browser, and why.",
};

const storage = [
  {
    key: "velure_intro",
    purpose: "Remembers that the opening animation was shown, so it plays once per visit.",
    type: "sessionStorage",
    until: "You close the tab",
  },
  {
    key: "velure_booking_draft",
    purpose: "Keeps an unfinished booking form if you close the panel by accident.",
    type: "sessionStorage",
    until: "Booking sent or tab closed",
  },
  {
    key: "velure_chat_session",
    purpose: "Random ID that links your chat messages into one conversation.",
    type: "sessionStorage",
    until: "You close the tab",
  },
  {
    key: "velure_chat_messages",
    purpose: "Shows your chat conversation again if you reload the page.",
    type: "sessionStorage",
    until: "You close the tab",
  },
];

const sections: LegalSection[] = [
  {
    id: "no-tracking",
    title: "No tracking cookies",
    body: (
      <>
        <p>
          This site does not set cookies for advertising, tracking or profiling, and does not use
          third-party trackers or social media pixels. That is why you do not see a cookie banner:
          everything below is strictly necessary for features you use, which EU rules allow
          without consent.
        </p>
        <p>
          Fonts, images and video are hosted with the site, so loading a page does not contact
          Google Fonts or other external media services.
        </p>
      </>
    ),
  },
  {
    id: "browser-storage",
    title: "What we store in your browser",
    body: (
      <>
        <p>
          The site uses <strong>sessionStorage</strong>, a short-lived store that belongs to one
          browser tab and is deleted when you close it. It never leaves your device unless you
          send a form or a chat message.
        </p>
        <div className="legal-table">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Purpose</th>
                <th>Type</th>
                <th>Kept until</th>
              </tr>
            </thead>
            <tbody>
              {storage.map((s) => (
                <tr key={s.key}>
                  <td>
                    <code>{s.key}</code>
                  </td>
                  <td>{s.purpose}</td>
                  <td>{s.type}</td>
                  <td>{s.until}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </>
    ),
  },
  {
    id: "analytics",
    title: "Page statistics",
    body: (
      <p>
        We use Vercel Web Analytics to count page views and a single anonymous event when a
        booking is sent. It works without cookies and does not identify you or follow you across
        sites; visitors are counted using a short-lived hash that is reset daily. Details are in
        the <a href="/privacy">Privacy Policy</a>.
      </p>
    ),
  },
  {
    id: "control",
    title: "How to clear it",
    body: (
      <p>
        Close the tab, or clear this site&apos;s data in your browser settings. The site works
        without stored data; you will only see the opening animation again and lose an unsent
        booking draft or the visible chat history.
      </p>
    ),
  },
  {
    id: "contact",
    title: "Questions",
    body: (
      <p>
        Contact <a href={`mailto:${legalEntity.email}`}>{legalEntity.email}</a>.
      </p>
    ),
  },
];

export default function CookiesPage() {
  return (
    <LegalPage
      path="/cookies"
      title={
        <>
          Cookies &amp; <em>Storage</em>
        </>
      }
      intro={<p>What this site keeps in your browser, and why there is no cookie banner.</p>}
      summary={[
        "No tracking or advertising cookies.",
        "A few short-lived items in your browser tab, deleted when you close it.",
        "Cookieless, anonymous page statistics.",
      ]}
      sections={sections}
    />
  );
}
