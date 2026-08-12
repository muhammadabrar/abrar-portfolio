import "dotenv/config";
import { defineConfig } from "prisma/config";

// Prefer DIRECT_URL for migrations (Supabase session pooler / direct).
// App runtime still uses DATABASE_URL (transaction pooler) via PrismaPg.
const migrateUrl = process.env.DIRECT_URL || process.env.DATABASE_URL;
if (!migrateUrl) {
  throw new Error("Set DATABASE_URL (and preferably DIRECT_URL for Supabase).");
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: migrateUrl,
  },
});
