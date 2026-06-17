import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const prismaClientSingleton = () => {
  // Strips "file:" prefix from SQLite URL to get the file path
  const rawUrl = process.env.DATABASE_URL || "file:./dev.db";
  const dbPath = rawUrl.startsWith("file:") ? rawUrl.replace("file:", "") : rawUrl;
  
  // PrismaBetterSqlite3 automatically instantiates better-sqlite3 using the url config
  const adapter = new PrismaBetterSqlite3({ url: dbPath });
  
  return new PrismaClient({ adapter });
};

declare global {
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>;
}

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== "production") globalThis.prismaGlobal = prisma;
