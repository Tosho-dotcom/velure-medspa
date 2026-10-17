import { Hero } from "@/components/sections/Hero";
import { Philosophy } from "@/components/sections/Philosophy";
import { Treatments } from "@/components/sections/Treatments";
import { Ritual } from "@/components/sections/Ritual";
import { Book } from "@/components/sections/Book";
import { Contact } from "@/components/sections/Contact";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "MedicalBusiness",
  name: "Velure Med Spa",
  description:
    "Physician-led med spa in Scottsdale, Arizona. Velure is a fictional brand created as a demonstration project by Thaus.",
  telephone: "(480) 555-0142",
  priceRange: "$$$",
  address: {
    "@type": "PostalAddress",
    streetAddress: "1200 Desert Bloom Ave",
    addressLocality: "Scottsdale",
    addressRegion: "AZ",
    addressCountry: "US",
  },
  openingHours: "Mo-Sa 09:00-19:00",
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Hero />
      <Philosophy />
      <Treatments />
      <Ritual />
      <Book />
      <Contact />
    </>
  );
}
