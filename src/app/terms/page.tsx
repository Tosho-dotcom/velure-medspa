import type { Metadata } from "next";

import { LegalPage, type LegalSection } from "@/components/legal/LegalPage";
import { legalEntity } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Terms of Use | Velure Med Spa (demo)",
  description:
    "Terms for using the Velure Med Spa demo website, its booking panel and its AI chat assistant.",
};

const sections: LegalSection[] = [
  {
    id: "about",
    title: "About this site",
    body: (
      <>
        <p>
          This website is operated by <strong>{legalEntity.name}</strong> (&quot;we&quot;,
          &quot;us&quot;). It presents <strong>Velure Med Spa, a fictional brand</strong>, to
          demonstrate a complete business system: website, booking, emails, CRM and an AI chat
          assistant. Names, addresses, phone numbers, prices, treatments and testimonials on this
          site are illustrative.
        </p>
        <p>By using the site you agree to these terms. If you do not agree, please do not use it.</p>
      </>
    ),
  },
  {
    id: "no-services",
    title: "No real services or appointments",
    body: (
      <>
        <ul>
          <li>No treatment, consultation or other service is offered or provided.</li>
          <li>
            A booking made here creates a demo record and sends demo emails. It is not a
            reservation, creates no contract, and nobody will expect you at the address shown.
          </li>
          <li>Nothing on this site is an offer to sell anything or a request for payment.</li>
        </ul>
        <p>
          If you are interested in a system like this for your own business, contact{" "}
          <a href={legalEntity.website} target="_blank" rel="noopener noreferrer">
            Thaus
          </a>
          .
        </p>
      </>
    ),
  },
  {
    id: "medical",
    title: "Not medical advice",
    body: (
      <p>
        Content on this site, including replies from the chat assistant, is general and
        illustrative. It is not medical advice and does not replace a consultation with a
        qualified healthcare professional. Read the full{" "}
        <a href="/disclaimer">Medical &amp; AI Disclaimer</a>.
      </p>
    ),
  },
  {
    id: "ai",
    title: "The AI chat assistant",
    body: (
      <ul>
        <li>The assistant is an AI system, not a person. It can be wrong or incomplete.</li>
        <li>
          Do not rely on its replies for health, legal, financial or other important decisions.
        </li>
        <li>
          Do not send health information, passwords, payment details or anyone else&apos;s
          personal data.
        </li>
        <li>
          Conversations are logged and processed as described in the{" "}
          <a href="/privacy">Privacy Policy</a>.
        </li>
        <li>We may limit, pause or change the assistant at any time.</li>
      </ul>
    ),
  },
  {
    id: "acceptable-use",
    title: "Acceptable use",
    body: (
      <>
        <p>You agree not to:</p>
        <ul>
          <li>send spam, automated or bulk submissions to the forms or the chat;</li>
          <li>
            try to bypass rate limits, extract the assistant&apos;s instructions, or make it
            produce harmful, unlawful or misleading content;
          </li>
          <li>probe, scan or attack the site, its servers or connected services;</li>
          <li>submit someone else&apos;s personal data without their permission;</li>
          <li>use the site for anything unlawful.</li>
        </ul>
        <p>We may block access and delete submissions that break these rules.</p>
      </>
    ),
  },
  {
    id: "ip",
    title: "Intellectual property",
    body: (
      <>
        <p>
          The design, code, text, the Velure brand and the images and video on this site belong
          to {legalEntity.name} or its licensors. Some images and video were created with AI
          tools. You may view and share links to the site, but you may not copy, resell or reuse
          its content or design without our written permission.
        </p>
        <p>Third-party names and trademarks belong to their owners.</p>
      </>
    ),
  },
  {
    id: "links",
    title: "Links to other sites",
    body: (
      <p>
        Links to other websites are provided for convenience. We are not responsible for their
        content or privacy practices.
      </p>
    ),
  },
  {
    id: "disclaimer",
    title: "Disclaimer of warranties",
    body: (
      <p>
        The site is a demonstration provided &quot;as is&quot; and &quot;as available&quot;. We do
        not guarantee that it will be uninterrupted, error-free or that information on it is
        accurate or complete.
      </p>
    ),
  },
  {
    id: "liability",
    title: "Limitation of liability",
    body: (
      <p>
        To the extent permitted by law, {legalEntity.name} is not liable for indirect,
        incidental or consequential damages arising from your use of the site, or for decisions
        made in reliance on its content or on the chat assistant. Nothing in these terms limits
        liability that cannot be limited by law, such as liability for intent or gross
        negligence, or your mandatory rights as a consumer under the law of your country of
        residence.
      </p>
    ),
  },
  {
    id: "law",
    title: "Governing law",
    body: (
      <p>
        These terms are governed by the laws of {legalEntity.governingLaw}, without regard to
        conflict-of-law rules. If you are a consumer in the EU, EEA or UK, you also keep the
        protection of the mandatory laws of your country of residence and may bring claims
        before its courts.
      </p>
    ),
  },
  {
    id: "changes",
    title: "Changes and contact",
    body: (
      <p>
        We may update these terms and will change the date at the top when we do. Questions:{" "}
        <a href={`mailto:${legalEntity.email}`}>{legalEntity.email}</a>.
      </p>
    ),
  },
];

export default function TermsPage() {
  return (
    <LegalPage
      path="/terms"
      title={
        <>
          Terms of <em>Use</em>
        </>
      }
      intro={<p>The rules for using this demo website, its booking panel and its chat assistant.</p>}
      summary={[
        "Velure is fictional. Bookings here are demo records, not reservations.",
        "Nothing on this site is medical advice.",
        "The chat assistant is AI and can make mistakes.",
        "Please use the forms and chat fairly: no spam, no abuse.",
      ]}
      sections={sections}
    />
  );
}
