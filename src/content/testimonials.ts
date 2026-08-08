export type Testimonial = {
  id: string;
  quote: string;
  name: string;
  role: string;
  company: string;
  accent: string;
  initials: string;
  linkedIn?: string;
};

export const testimonials: Testimonial[] = [
  {
    id: "speedy",
    quote:
      "I’ve had the pleasure of working with Muhammad Abrar since January 2023, and during this time he has consistently demonstrated strong technical skills, adaptability, and a proactive approach to solving problems. He has contributed to several important projects, including AR-4U, an Augmented Reality platform, our n8n-based content automation systems, and most recently ReplyMyMail, an AI-powered email automation platform. Muhammad is quick to learn new technologies, takes ownership of his work, and is able to turn ideas into practical, reliable solutions. He has been a valuable part of our team, and I would gladly recommend him to anyone looking for a dedicated and capable full-stack developer.”",
    name: "Markus Koelmann",
    role: "CEO",
    company: "Speedy Brilliant (HK)",
    accent: "linear-gradient(150deg, #292524 0%, #78716c 50%, #e7e5e4 100%)",
    initials: "MK",
    linkedIn: "https://www.linkedin.com/in/markuskoelmann/",
  },
  {
    id: "ar4u",
    quote:
      "Abrar turned our WebAR idea into a product clients could actually share. The viewer, panel, and launch flow felt calm—and it shipped on time.",
    name: "Usman Abid",
    role: "Project Manager",
    company: "AR-4U",
    accent: "linear-gradient(145deg, #1a1a1a 0%, #5a5a5a 55%, #d4d4d4 100%)",
    initials: "UA",
    linkedIn: "https://www.linkedin.com/in/syed-usman-abid/",
  },
  {
    id: "steve",
    quote:
      "The n8n content pipeline Abrar built cut our publishing busywork dramatically. Branching, RAG steps, and handoff points were rock solid.",
    name: "Steve",
    role: "Project Manager",
    company: "ReplyMyMail",
    accent: "linear-gradient(160deg, #f4f1ea 0%, #c8c2b6 45%, #6b6560 100%)",
    initials: "ST",
    linkedIn: "https://www.linkedin.com/in/debabrata-chatterjee-aa105233/",
  },
  // {
  //   id: "lab",
  //   quote:
  //     "From web to Electron desktop, he kept Hayat Matrix Lab coherent. We finally had one product surface instead of scattered tools.",
  //   name: "Arshid Hayat",
  //   role: "Co-founder",
  //   company: "Hayat Matrix",
  //   accent: "linear-gradient(140deg, #14532d 0%, #4d7c0f 45%, #d9f99d 100%)",
  //   initials: "AH",
  // },
  
  {
    id: "hamza",
    quote:
      "I’ve watched Abrar ship under pressure for years—sharp, dependable, and always thinking two steps ahead for the people using his work.",
    name: "Hamza Faham",
    role: "Best friend",
    company: "Personal",
    accent: "linear-gradient(145deg, #1e3a5f 0%, #3b82f6 50%, #bfdbfe 100%)",
    initials: "HF",
    linkedIn: "https://www.linkedin.com/in/hamza-faham-87a124201/",
  },
  {
    id: "awais",
    quote:
      "Muhammad Abrar is a high-velocity software engineer who turns unfamiliar problems into elegant technical solutions with impressive speed and precision. Any team lead or client would be fortunate to have his problem-solving capability on their side.",
    name: "Awais Rehman",
    role: "Software Engineer",
    company: "AR-4U",
    accent: "linear-gradient(155deg, #422006 0%, #a16207 50%, #fde68a 100%)",
    initials: "AW",
    linkedIn: "https://www.linkedin.com/in/awaisrehman100/",
  },
  {
    id: "futurenostic",
    quote:
      "On our Futurenostic builds, Abrar was the engineer you could hand a messy brief to and get a clean, shippable system back—steady under pressure, clear in communication.",
    name: "Malik Saif Ali",
    role: "Team Lead",
    company: "Futurenostic",
    accent: "linear-gradient(135deg, #0f172a 0%, #334155 50%, #94a3b8 100%)",
    initials: "SA",
    linkedIn: "https://www.linkedin.com/in/saif-ali-9ab3b21a4/",
  },
];
