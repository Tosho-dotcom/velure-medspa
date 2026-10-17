export const navLinks = [
  { label: "Treatments", target: "#treatments" },
  { label: "The Ritual", target: "#ritual" },
  { label: "Contact", target: "#contact" },
] as const;

/** Fixed nav height on desktop; anchor scrolling compensates for it. */
export const NAV_OFFSET = -84;
