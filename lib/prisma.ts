import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as {
  prisma: PrismaClient | undefined;
};

const client = new PrismaClient({
  log: process.env.NODE_ENV === "development" ? ["error"] : ["error"],
  errorFormat: "pretty",
});

// Gracefully handle connection errors in development
if (process.env.NODE_ENV === "development") {
  client.$connect().catch((err) => {
    console.warn(
      "[Prisma] Database connection warning (non-blocking):",
      err.message,
    );
  });
}

export const prisma = globalForPrisma.prisma || client;

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
