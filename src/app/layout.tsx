import type { Metadata, Viewport } from "next";
import { Fraunces, Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";

import "./globals.css";
import { SmoothScroll } from "@/components/motion/SmoothScroll";
import { ThemeObserver } from "@/components/motion/ThemeObserver";
import { BookingProvider } from "@/components/booking/BookingProvider";
import { Preloader } from "@/components/layout/Preloader";
import { Nav } from "@/components/layout/Nav";
import { Footer } from "@/components/layout/Footer";

const fraunces = Fraunces({
  subsets: ["latin"],
  axes: ["opsz", "SOFT"],
  style: ["normal", "italic"],
  variable: "--font-fraunces",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const title = "Velure Med Spa — Radiance, refined. | Scottsdale, AZ";
const description =
  "Velure is a physician-led med spa in Scottsdale offering signature facials, injectables, microneedling, laser and body contouring. Book online in under a minute.";

export const metadata: Metadata = {
  title,
  description,
  openGraph: {
    title,
    description,
    type: "website",
    locale: "en_US",
    siteName: "Velure Med Spa",
  },
  twitter: { card: "summary_large_image", title, description },
};

export const viewport: Viewport = {
  themeColor: "#faf6f1",
};

/**
 * Runs before first paint: marks JS availability (so content stays visible
 * without it) and decides whether the once-per-session preloader shows.
 */
const bootScript = `(function(){var d=document.documentElement;d.classList.add('js');try{var r=window.matchMedia('(prefers-reduced-motion: reduce)').matches;if(!r&&!sessionStorage.getItem('velure_intro'))d.classList.add('intro')}catch(e){}})();`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${fraunces.variable} ${inter.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: bootScript }} />
        <noscript>
          <style>{`[data-reveal],[data-hairline],[data-hairline-y]{opacity:1!important;visibility:visible!important;transform:none!important}`}</style>
        </noscript>
      </head>
      <body>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:rounded-full focus:bg-espresso focus:px-5 focus:py-3 focus:text-ivory"
        >
          Skip to content
        </a>
        <SmoothScroll>
          <BookingProvider>
            <Preloader />
            <Nav />
            <main id="main">{children}</main>
            <Footer />
            <ThemeObserver />
          </BookingProvider>
        </SmoothScroll>
        <div className="grain" aria-hidden="true" />
        <Analytics />
      </body>
    </html>
  );
}
