export type Treatment = {
  id: string;
  n: string;
  name: string;
  description: string;
  duration: string;
  price: string;
  image: string;
  alt: string;
};

export const treatments: Treatment[] = [
  {
    id: "signature-glow-facial",
    n: "01",
    name: "Signature Glow Facial",
    description:
      "A deeply hydrating, multi-step facial that cleanses, exfoliates and infuses — for skin that looks rested, not treated.",
    duration: "60 min",
    price: "from $195",
    image: "/media/treatment-01-facial.webp",
    alt: "Hydrating serum applied with a fan brush during a facial",
  },
  {
    id: "wrinkle-relaxers",
    n: "02",
    name: "Wrinkle Relaxers",
    description:
      "Precise neuromodulator treatment that softens expression lines while keeping your face entirely your own.",
    duration: "30 min",
    price: "from $14 / unit",
    image: "/media/treatment-02-injectables.webp",
    alt: "Gloved hands holding a glass syringe beside amber vials on travertine",
  },
  {
    id: "dermal-fillers",
    n: "03",
    name: "Dermal Fillers",
    description:
      "Restores volume and definition to lips, cheeks and jawline with a subtle, balanced hand.",
    duration: "45 min",
    price: "from $650",
    image: "/media/treatment-03-fillers.webp",
    alt: "Close-up of natural lips and jawline in warm light",
  },
  {
    id: "collagen-microneedling",
    n: "04",
    name: "Collagen Microneedling",
    description:
      "Controlled micro-channels stimulate your own collagen for smoother texture and refined pores.",
    duration: "75 min",
    price: "from $425",
    image: "/media/treatment-04-microneedling.webp",
    alt: "Microneedling pen on folded linen beside a serum bottle",
  },
  {
    id: "laser-rejuvenation",
    n: "05",
    name: "Laser Rejuvenation",
    description:
      "Light-based treatment for sun damage, uneven tone and fine lines — with minimal downtime.",
    duration: "45 min",
    price: "from $350",
    image: "/media/treatment-05-laser.webp",
    alt: "Laser handpiece glowing softly near a client's cheek",
  },
  {
    id: "body-contouring",
    n: "06",
    name: "Body Contouring",
    description:
      "Non-invasive sculpting for stubborn areas. No needles, no recovery time.",
    duration: "60 min",
    price: "from $500",
    image: "/media/treatment-06-body.webp",
    alt: "Body contouring applicator resting on an ivory robe",
  },
];

/** Extra option in the booking form for visitors who are not sure yet. */
export const consultationOption = {
  id: "consultation",
  name: "Consultation — not sure yet",
  duration: "30 min",
} as const;

export const bookingTreatmentOptions = [
  ...treatments.map((t) => ({ id: t.id, name: t.name, duration: t.duration })),
  consultationOption,
];

export function getTreatmentName(id: string): string {
  return bookingTreatmentOptions.find((t) => t.id === id)?.name ?? id;
}
