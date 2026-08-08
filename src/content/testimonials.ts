export type Testimonial = {
  id: string;
  quote: string;
  name: string;
  role: string;
  company: string;
  accent: string;
  initials: string;
};

export const testimonials: Testimonial[] = [
  {
    id: "ar4u",
    quote:
      "Abrar turned our WebAR idea into a product clients could actually share. The viewer, panel, and launch flow felt calm—and it shipped on time.",
    name: "Hassan Malik",
    role: "Product Lead",
    company: "AR campaign team",
    accent: "linear-gradient(145deg, #1a1a1a 0%, #5a5a5a 55%, #d4d4d4 100%)",
    initials: "HM",
  },
  {
    id: "reply",
    quote:
      "He connected email, OCR, and search into one workflow our ops team still uses daily. Clear thinking, clean delivery, zero drama.",
    name: "Sara Klein",
    role: "Operations Manager",
    company: "ReplyMyMail",
    accent: "linear-gradient(160deg, #f4f1ea 0%, #c8c2b6 45%, #6b6560 100%)",
    initials: "SK",
  },
  {
    id: "n8n",
    quote:
      "The n8n content pipeline Abrar built cut our publishing busywork dramatically. Branching, RAG steps, and handoff points were rock solid.",
    name: "Daniel Ortiz",
    role: "Growth Engineer",
    company: "Futurenostic",
    accent: "linear-gradient(135deg, #0f172a 0%, #334155 50%, #94a3b8 100%)",
    initials: "DO",
  },
  {
    id: "speedy",
    quote:
      "Remote collaboration with Abrar is easy—tight scopes, thoughtful UX, and systems that stay reliable after launch week.",
    name: "Mei Chen",
    role: "Engineering Manager",
    company: "Speedy Brilliant",
    accent: "linear-gradient(150deg, #292524 0%, #78716c 50%, #e7e5e4 100%)",
    initials: "MC",
  },
  {
    id: "lab",
    quote:
      "From web to Electron desktop, he kept Hayat Matrix Lab coherent. We finally had one product surface instead of scattered tools.",
    name: "Omar Farooq",
    role: "Founder",
    company: "Hayat Matrix Lab",
    accent: "linear-gradient(140deg, #14532d 0%, #4d7c0f 45%, #d9f99d 100%)",
    initials: "OF",
  },
];
