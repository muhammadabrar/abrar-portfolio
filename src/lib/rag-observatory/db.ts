import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
  pgPool?: Pool;
};

/**
 * Neon + node-pg: drop channel_binding=require (breaks many clients),
 * ensure sslmode + connect_timeout for cold starts.
 */
function normalizeDatabaseUrl(raw: string): string {
  try {
    const u = new URL(raw);
    u.searchParams.delete("channel_binding");
    if (!u.searchParams.get("sslmode")) {
      u.searchParams.set("sslmode", "require");
    }
    if (!u.searchParams.get("connect_timeout")) {
      u.searchParams.set("connect_timeout", "30");
    }
    // Prisma/pg on serverless-ish Next routes: keep pool tiny
    if (!u.searchParams.get("connection_limit")) {
      u.searchParams.set("connection_limit", "1");
    }
    return u.toString();
  } catch {
    return raw;
  }
}

function createPool() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }
  return new Pool({
    connectionString: normalizeDatabaseUrl(connectionString),
    max: 3,
    idleTimeoutMillis: 20_000,
    connectionTimeoutMillis: 30_000,
    ssl: { rejectUnauthorized: false },
  });
}

function createPrisma() {
  const pool = globalForPrisma.pgPool ?? createPool();
  globalForPrisma.pgPool = pool;
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrisma();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
