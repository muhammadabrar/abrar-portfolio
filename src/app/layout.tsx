import type { Metadata } from "next";
import Script from "next/script";
import { Funnel_Sans, JetBrains_Mono } from "next/font/google";
import { SiteChrome } from "@/components/SiteChrome";
import "./globals.css";

const funnelSans = Funnel_Sans({
  variable: "--font-funnel-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://muhammadabrar.dev";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Muhammad Abrar — Software Engineer",
    template: "%s · Muhammad Abrar",
  },
  description:
    "Software engineer building AI products, WebAR, and systems for the web.",
  keywords: [
    "Software Engineer",
    "Full Stack",
    "Next.js",
    "n8n",
    "RAG",
    "WebAR",
    "Muhammad Abrar",
  ],
  authors: [{ name: "Muhammad Abrar" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "Muhammad Abrar",
    title: "Muhammad Abrar — Software Engineer",
    description:
      "Software engineer building AI products, WebAR, and systems for the web.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Muhammad Abrar — Software Engineer",
    description:
      "Software engineer building AI products, WebAR, and systems for the web.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

const themeInitScript = `
(() => {
  try {
    const stored = localStorage.getItem('theme');
    const theme = stored === 'dark' || stored === 'light'
      ? stored
      : (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    if (theme === 'dark') document.documentElement.classList.add('dark');
    document.documentElement.style.colorScheme = theme;
  } catch {}
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${funnelSans.variable} ${jetbrainsMono.variable} h-full`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col antialiased" suppressHydrationWarning>
        <Script id="theme-init" strategy="beforeInteractive">
          {themeInitScript}
        </Script>
        <SiteChrome>{children}</SiteChrome>
      </body>
    </html>
  );
}
