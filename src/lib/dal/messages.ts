import "server-only";
import { prisma } from "@/lib/prisma";

export async function getMessages() {
  return prisma.message.findMany({
    orderBy: { createdAt: "desc" },
  });
}

export async function createMessage(name: string, content: string) {
  return prisma.message.create({
    data: { name, content },
  });
}
