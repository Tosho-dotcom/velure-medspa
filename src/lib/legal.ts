/**
 * Who runs this site, in one place. The legal pages read from here, so a client
 * deployment changes these values (and the parts of each page marked
 * "DEMO" / "CLIENT") instead of hunting through the copy.
 * See docs/legal-client-deployments.md.
 */
export const legalEntity = {
  /** The controller: decides why and how personal data is processed. */
  name: "Thaus LLC",
  description:
    "a limited liability company registered in Wyoming, United States, that designs, builds and operates this website",
  website: "https://thaus.co",
  email: "hello@thaus.co",
  governingLaw: "the State of Wyoming, United States",
} as const;

export const site = {
  name: "Velure Med Spa",
  /** Velure is not a real business. Keep this true on every page. */
  isDemo: true,
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://velure-medspa.vercel.app",
} as const;

export const LEGAL_UPDATED = "October 19, 2026";

export const legalPages = [
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms of Use" },
  { href: "/cookies", label: "Cookies & Storage" },
  { href: "/disclaimer", label: "Medical & AI Disclaimer" },
] as const;
