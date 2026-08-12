import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep native/node PDF helpers external if still referenced elsewhere.
  serverExternalPackages: ["pdf-parse", "pdfjs-dist"],
};

export default nextConfig;
