import "server-only";
import { prisma } from "@/lib/prisma";
import type { User } from "@/types";

export async function getUserById(id: number): Promise<User | null> {
  return prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      username: true,
      active: true,
      createdAt: true,
    },
  });
}

export async function getUserByEmail(email: string): Promise<User | null> {
  return prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      username: true,
      active: true,
      createdAt: true,
    },
  });
}

export async function getUsers(): Promise<User[]> {
  return prisma.user.findMany({
    select: {
      id: true,
      email: true,
      username: true,
      active: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getUserByUsername(
  username: string,
): Promise<User | null> {
  return prisma.user.findUnique({
    where: { username },
    select: {
      id: true,
      email: true,
      username: true,
      active: true,
      createdAt: true,
    },
  });
}

export async function getUserWithPassword(emailOrUsername: string) {
  const isEmail = emailOrUsername.includes("@");
  return prisma.user.findUnique({
    where: isEmail ? { email: emailOrUsername } : { username: emailOrUsername },
  });
}

export async function createUserRecord(data: {
  email: string;
  username?: string;
  hashedPassword: string;
}): Promise<User> {
  return prisma.user.create({
    data: {
      email: data.email,
      username: data.username,
      password: data.hashedPassword,
    },
    select: {
      id: true,
      email: true,
      username: true,
      active: true,
      createdAt: true,
    },
  });
}

export async function updateUserRecord(
  id: number,
  data: {
    email?: string;
    username?: string;
    hashedPassword?: string;
    active?: boolean;
  },
): Promise<User> {
  return prisma.user.update({
    where: { id },
    data: {
      ...(data.email !== undefined && { email: data.email }),
      ...(data.username !== undefined && { username: data.username }),
      ...(data.hashedPassword !== undefined && {
        password: data.hashedPassword,
      }),
      ...(data.active !== undefined && { active: data.active }),
    },
    select: {
      id: true,
      email: true,
      username: true,
      active: true,
      createdAt: true,
    },
  });
}

export async function deleteUserRecord(id: number): Promise<void> {
  await prisma.user.delete({ where: { id } });
}
