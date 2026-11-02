export type ProjectCategory = "product" | "automation";

export type ProjectSubsystem = {
  name: string;
  description: string;
};

export type Project = {
  slug: string;
  name: string;
  shortName: string;
  eyebrow: string;
  summary: string;
  problem: string;
  role: string;
  shipped: string[];
  stack: string[];
  outcome: string;
  liveUrl?: string;
  liveLabel?: string;
  accent: string;
  /** CSS gradient fallback when no cover image is set */
  cover: string;
  coverImage?: string;
  thumbnail?: string;
  gallery?: { src: string; alt: string }[];
  featured?: boolean;
  category: ProjectCategory;
  subsystems?: ProjectSubsystem[];
};

export const projects: Project[] = [
  {
    slug: "abrar-sandbox",
    name: "RAG Observatory",
    shortName: "AbrarSandbox",
    eyebrow: "AbrarSandbox · RAG",
    summary:
      "Hands-on beginner lab for real RAG — upload docs, watch Mistral embeddings land in Qdrant, then test answers with citations and quotas.",
    problem:
      "Most RAG demos are black boxes or fake animations. Beginners need a real pipeline they can see, limit-test, and verify with citations.",
    role: "Designed and built an educational RAG sandbox in the portfolio (guest mode, Mistral, Qdrant).",
    shipped: [
      "Guest-only sandbox with per-user Qdrant collections",
      "Real ingest pipeline: parse → chunk → Mistral embed → Qdrant",
      "Playground with live retrieval audit, citations, and testing guide",
      "Free-tier quotas + optional bring-your-own Mistral key",
    ],
    stack: ["Next.js", "Mistral", "Qdrant", "Prisma", "SQLite", "TypeScript"],
    outcome:
      "Visitors can experience and test a real RAG system without creating an account.",
    liveUrl: "/abrar-sandbox/RAG/sources",
    liveLabel: "Open RAG Observatory",
    accent: "#2dd4bf",
    cover:
      "linear-gradient(145deg, #07080a 0%, #0c1a1a 40%, #134e4a 70%, #2dd4bf 100%)",
    featured: true,
    category: "product",
    subsystems: [
      {
        name: "Ingestion Observatory",
        description:
          "Drag-and-drop sources with stage-by-stage parse, clean, chunk, and embed animation.",
      },
      {
        name: "Query Audit Playground",
        description:
          "Chat plus live retrieval funnel, reranking leaderboard, and citation explainability.",
      },
    ],
  },
  {
    slug: "wellrun-school",
    name: "WellRun School",
    shortName: "WellRun School",
    eyebrow: "School operating system",
    summary:
      "Multi-tenant school platform for Pakistan: public school discovery, a staff operations console, and a parent app on one API.",
    problem:
      "Schools run admissions, attendance, fees, payroll and exams across paper, spreadsheets and chat groups, and parents get little visibility.",
    role: "Designed and built the full platform: monorepo, API, three frontends, deployment.",
    shipped: [
      "pnpm/Turborepo monorepo: Next.js discovery site, React staff console, parent PWA, NestJS API",
      "90+ Prisma/PostgreSQL models across admissions, attendance, fees, payroll, exams, timetable, inventory and accounting",
      "English/Urdu (RTL) parent app with lockout-protected sign-in and per-child access scoping",
      "Private Cloudflare R2 storage with server-side image re-encoding and short-lived signed links",
      "AI assistant (Anthropic SDK) with tool calling; proposed changes run only after the user confirms",
      "Deployed on an Azure VM with nginx, PM2 and Azure Postgres",
    ],
    stack: [
      "NestJS",
      "PostgreSQL",
      "Prisma",
      "Next.js",
      "React",
      "Vite",
      "TypeScript",
      "Cloudflare R2",
      "Claude API",
    ],
    outcome:
      "One backend powers school discovery for parents and day-to-day operations for staff.",
    liveUrl: "https://console.wellrunsystem.com/",
    liveLabel: "Open WellRun Console",
    accent: "#4642FF",
    cover:
      "linear-gradient(145deg, #16161d 0%, #1f1d4f 45%, #4642ff 80%, #7f66ff 100%)",
    featured: true,
    category: "product",
    subsystems: [
      {
        name: "Discover",
        description: "Mobile-first public site to browse and compare schools.",
      },
      {
        name: "Console",
        description: "Staff operations: students, attendance, fees, payroll, exams.",
      },
      {
        name: "Parent app",
        description: "English/Urdu PWA for results, fees and school notices.",
      },
    ],
  },
  {
    slug: "ar-4u",
    name: "AR-4U",
    shortName: "AR-4U",
    eyebrow: "WebAR platform",
    summary:
      "WebAR platform so brands can share interactive 3D and AR experiences from the browser.",
    problem:
      "Teams needed a reliable way to host 3D models, manage customers, and let end users view AR on mobile without friction.",
    role: "Full-stack ownership across marketing site, viewer, and customer management.",
    shipped: [
      "Next.js marketing site with multi-locale SEO",
      "MERN customer panel for models and accounts",
      "Three.js and Google model-viewer AR experiences",
      "QR / shareable AR links for campaigns",
    ],
    stack: ["Next.js", "React", "Node.js", "MongoDB", "Three.js", "model-viewer", "Strapi"],
    outcome:
      "Clients can publish and manage AR assets end-to-end—from upload to shareable viewer.",
    liveUrl: "https://ar-4u.com",
    liveLabel: "Visit AR-4U",
    accent: "#111111",
    cover: "linear-gradient(145deg, #1a1a1a 0%, #4a4a4a 55%, #d4d4d4 100%)",
    coverImage: "/images/projects/ar-4u/ar-4u-thumbnail.png",
    thumbnail: "/images/projects/ar-4u/ar-4u-thumbnail.png",
    gallery: [
      {
        src: "/images/projects/ar-4u/3d-view.png",
        alt: "AR-4U product viewer with QR share panel",
      },
      {
        src: "/images/projects/ar-4u/upload-model.png",
        alt: "AR-4U admin upload and 3D reposition workflow",
      },
      {
        src: "/images/projects/ar-4u/deca-series.png",
        alt: "AR-4U Deca Series marketing page",
      },
      {
        src: "/images/projects/ar-4u/models-library.png",
        alt: "AR-4U 3D models library",
      },
    ],
    featured: true,
    category: "product",
  },
  {
    slug: "replymymail",
    name: "ReplyMyMail",
    shortName: "ReplyMyMail",
    eyebrow: "AI email & docs",
    summary:
      "AI email product plus document ops—OCR, embeddings, and workflows that keep inboxes moving.",
    problem:
      "Support and ops teams drown in repetitive mail and scattered PDFs.",
    role: "Built the product site and contributed across the AI ops ecosystem.",
    shipped: [
      "Next.js product site (EN/DE)",
      "Paperless management for email/docs",
      "OCR, embeddings, and document search",
      "Document workflows and generation helpers",
    ],
    stack: ["Next.js", "Node.js", "MongoDB", "Python", "OCR", "PostgreSQL", "Vite"],
    outcome:
      "A cohesive ecosystem to market the product and process mail and PDFs.",
    liveUrl: "https://replymymail.com",
    liveLabel: "Visit ReplyMyMail",
    accent: "#2f2f2f",
    cover: "linear-gradient(160deg, #f4f1ea 0%, #c8c2b6 45%, #6b6560 100%)",
    coverImage: "/images/projects/replymymail/replymymail-thumbnail.png",
    thumbnail: "/images/projects/replymymail/replymymail-thumbnail.png",
    gallery: [
      {
        src: "/images/projects/replymymail/product-site.png",
        alt: "ReplyMyMail marketing site hero — AI powered email for fast teams",
      },
      {
        src: "/images/projects/replymymail/dashboard.png",
        alt: "ReplyMyMail admin dashboard with email and document metrics",
      },
    ],
    featured: true,
    category: "product",
    subsystems: [
      {
        name: "Product website",
        description: "Marketing site for AI reply automation.",
      },
      {
        name: "Paperless / email management",
        description: "Ops UI and APIs for email documents.",
      },
      {
        name: "Embeddings & OCR",
        description: "Extract text and retrieve knowledge from PDFs and mail.",
      },
      {
        name: "Document workflows",
        description: "Generation helpers for day-to-day ops.",
      },
    ],
  },
  {
    slug: "hayat-matrix-lab",
    name: "Hayat Matrix Lab",
    shortName: "Hayat Lab",
    eyebrow: "Lab management",
    summary:
      "Lab management system with web app, desktop builds, and patient reporting.",
    problem:
      "Labs need reliable software for online and desktop installs with accurate reports.",
    role: "Full-stack monorepo: web UI, APIs, Prisma/SQLite, Electron packaging.",
    shipped: [
      "React web app for lab operations",
      "Node server with Prisma + SQLite",
      "PDF report generation",
      "Electron desktop builds for Mac/Windows",
    ],
    stack: ["React", "Vite", "Node.js", "Prisma", "SQLite", "Electron", "TypeScript"],
    outcome:
      "One codebase serves clinic workflows on the web and as a desktop product.",
    liveUrl: "https://hayatmatrix.com",
    liveLabel: "Visit Hayat Matrix",
    accent: "#3d4a5c",
    cover: "linear-gradient(150deg, #e8eef5 0%, #8fa3b8 50%, #2c3642 100%)",
    coverImage: "/images/projects/Hayat-matrix/Hayat-matrix-thumbnail.png",
    thumbnail: "/images/projects/Hayat-matrix/Hayat-matrix-thumbnail.png",
    gallery: [
      {
        src: "/images/projects/Hayat-matrix/dashboard.png",
        alt: "Hayat Matrix Lab dashboard overview",
      },
      {
        src: "/images/projects/Hayat-matrix/patients.png",
        alt: "Patients list and management view",
      },
      {
        src: "/images/projects/Hayat-matrix/patient-detail.png",
        alt: "Patient detail screen",
      },
      {
        src: "/images/projects/Hayat-matrix/doctors-commissions.png",
        alt: "Doctors and commissions management",
      },
      {
        src: "/images/projects/Hayat-matrix/doctor-detail.png",
        alt: "Doctor detail screen",
      },
      {
        src: "/images/projects/Hayat-matrix/test-result.png",
        alt: "Test result and reporting view",
      },
    ],
    featured: true,
    category: "product",
  },
  {
    slug: "n8n-content-flow",
    name: "Mako Content Flow",
    shortName: "Mako",
    eyebrow: "n8n · Agentic AI",
    summary:
      "Multi-branch n8n workflow for topic research, RAG context, drafting, and publishing.",
    problem:
      "Content teams needed a repeatable pipeline from topic to multi-channel publish.",
    role: "Designed and maintained the agentic automation flow at Speedy Brilliant (HK).",
    shipped: [
      "Topic fetch and RAG-style context retrieval",
      "Agentic generation and editing branches",
      "Google Sheets/Docs integrations",
      "Publishing paths to Medium and LinkedIn",
    ],
    stack: ["n8n", "RAG", "Agentic AI", "Google Sheets", "Google Docs"],
    outcome:
      "Cut manual content-ops steps with a branching, inspectable automation pipeline.",
    accent: "#222222",
    cover: "linear-gradient(135deg, #111111 0%, #333333 40%, #999999 100%)",
    coverImage: "/images/projects/Mako-Content-Flow/Mako-Content-Flow-thumbnail.png",
    thumbnail: "/images/projects/Mako-Content-Flow/Mako-Content-Flow-thumbnail.png",
    featured: true,
    category: "automation",
  },
];

export function getProject(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}

export function getAllProjectSlugs(): string[] {
  return projects.map((p) => p.slug);
}

export function getFeaturedProjects(): Project[] {
  return projects.filter((p) => p.featured);
}
