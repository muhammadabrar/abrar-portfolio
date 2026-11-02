# Muhammad Abrar
**Software Engineer · Full Stack · Agentic AI / Automation**

Pakistan (Remote) · +92 320 984 3122 · muhammadabrar.work@gmail.com  
Products: [AR-4U](https://ar-4u.com) · [ReplyMyMail](https://replymymail.com)

---

## Summary

Full Stack Software Engineer with 3+ years shipping production web products and AI automation. Recently designed and built two multi-app systems end to end: WellRun School, a multi-tenant school operations platform (NestJS, PostgreSQL, React, Next.js), and Azam Construction, a React Native app for project, labour and finance management. Also experienced in n8n agentic workflows, RAG pipelines and WebAR, working remotely with product teams under tight delivery timelines.

---

## Technical Skills

| Area | Technologies |
|---|---|
| Languages | TypeScript, JavaScript, Python, PHP, C++ |
| Frontend | React, Next.js, React Native, Expo, Vite, Tailwind CSS, Redux, TanStack Query, Three.js, model-viewer |
| Backend | Node.js, NestJS, Express, FastAPI, Flask, Django, REST APIs, JWT auth, Zod |
| Data | PostgreSQL, MongoDB, MySQL, SQLite, Redis, Prisma ORM, Mongoose, Qdrant |
| AI / Automation | Claude API, Mistral, RAG, Agentic AI, tool calling, n8n, OCR pipelines, embeddings/search, web scraping, Selenium |
| Cloud / Tools | Cloudflare R2, Azure, AWS, Docker, nginx, PM2, Git, pnpm/Turborepo, Vitest, Electron, Strapi, Vercel, Figma |

---

## Experience

### Speedy Brilliant (HK) Ltd. — AR-4U / ReplyMyMail
**Full Stack Software Developer** · Remote (Hong Kong) · Dec 2022 – Present

- Own end-to-end delivery of company web applications: Node/Express APIs, React/Next.js frontends, and UI improvements used by customers in production.
- Improve performance and cost by optimizing API payloads, rendering, database access, and SEO.
- Build AI product features: LinkedIn comment generation, email-reply automation (ReplyMyMail), and document OCR/embedding workflows for ops teams.
- Design and maintain WebAR experiences (Three.js / Google model-viewer) and customer panels for 3D asset management on AR-4U.
- Deliver Python/Selenium scraping pipelines with admin tooling for lead collection.

### Futurenostic
**Software Engineer** · Remote · Jan 2025 – Mar 2025 (3 months)

- Built and maintained agentic AI automation workflows in n8n for content research, drafting, and multi-channel publishing.
- Implemented RAG-style retrieval steps (topic/context fetch from structured sources) so generation stages used grounded, up-to-date inputs.
- Integrated branching logic across Google Sheets/Docs and publishing targets (e.g. Medium, LinkedIn) to reduce manual content ops.

---

# Page 2

## Selected Projects

### WellRun School — School OS (Pakistan)  
[console.wellrunsystem.com](https://console.wellrunsystem.com/)
*NestJS · PostgreSQL · Prisma · Next.js · React · Claude API* · Sep – Oct 2026

Multi-tenant platform: public school discovery, staff operations console, and parent app on one API.

- Built a pnpm/Turborepo monorepo of four apps (Next.js discovery site, React staff console, parent PWA, NestJS API) sharing types, design tokens and i18n packages.
- Modeled 90+ Prisma/PostgreSQL entities across 35+ API modules: admissions, attendance, fee plans/invoices/receipts, payroll, exams and report cards, timetable, inventory, accounting vouchers, certificates.
- Shipped an English/Urdu (RTL) parent app with lockout-protected sign-in and per-child access scoping; files in private Cloudflare R2 with server-side image re-encoding and short-lived signed links.
- Added an AI assistant (Anthropic SDK) with tool calling where proposed changes run only after the user confirms; deployed on an Azure VM with nginx, PM2 and Azure Postgres.

### Azam Construction — Project, Labour & Finance App
*React Native · Expo · Node · Express · MongoDB · Cloudflare R2* · Oct 2026

Mobile app for a construction company to run projects, labour and finances, with a read-only client view.

- Built an Express 5 + MongoDB API and an Expo Router app (iOS/Android) with admin and client roles, where clients see only their assigned projects.
- Implemented four contract types (with material, supervision, labour cost, service charges) with separate cost and client prices, so profit is tracked while clients never receive internal costs.
- Built weekly attendance and payroll with advance deductions, locked paid weeks, numbered receipts shared as PDF/WhatsApp, plus project job-costing and company cash-book ledgers.
- Covered pricing and contract rules with automated tests; private R2 file storage with signed links.

### RAG Observatory — Educational RAG Lab  
[muhammadabrar.dev](https://muhammadabrar.dev/abrar-sandbox/RAG/sources)
*Next.js · Mistral · Qdrant · Prisma · TypeScript*

- Built a guest-mode sandbox with a real pipeline (parse, chunk, Mistral embed, Qdrant) and a playground showing live retrieval audit, reranking and citations.
- Added per-user collections, free-tier quotas and optional bring-your-own API key.

### AR-4U — WebAR / AR-as-a-Service  
[ar-4u.com](https://ar-4u.com)
*Next.js · MERN · Three.js*

- Shipped a multi-locale Next.js marketing site with SEO pages and shareable AR/QR viewer links; built the MERN customer panel for 3D model management with Three.js and model-viewer previews.

### ReplyMyMail — AI Email & Document Ops  
[replymymail.com](https://replymymail.com)
*Next.js · Node · Python*

- Delivered the EN/DE product site and systems for draft replies, paperless email/doc management, OCR and embeddings/search.

### Hayat Matrix — Lab Information System  
[hayatmatrix.com](https://hayatmatrix.com)
*React · Node · Prisma · Electron*

- Developed monorepo APIs and React UI for lab workflows with PDF reports; packaged Electron builds for Mac/Windows with seed/license scripts.

---

## Education

**Bachelor of Computer Science** — Virtual University of Pakistan · Swabi, Pakistan  
Sep 2024 – Present

---

## Additional

- Comfortable owning features across the stack, from API design and databases to UI, SEO, deployment, and automation.
- Strong remote collaboration habits: clear scopes, iterative shipping, and production reliability over demo-only prototypes.
- Interests: agentic AI systems, RAG pipelines, WebAR/3D experiences, and data automation.
