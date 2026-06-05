import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" }); // fallback

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  const email = process.env.SEED_USER_EMAIL ?? "admin@admin.com";
  const password = process.env.SEED_USER_PASSWORD ?? "bia99";
  const username = process.env.SEED_USER_USERNAME ?? "admin";

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log(`User "${email}" already exists — skipping.`);
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: { email, username, password: hashedPassword },
    select: { id: true, email: true, username: true, createdAt: true },
  });

  console.log("Seeded user:", user);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
