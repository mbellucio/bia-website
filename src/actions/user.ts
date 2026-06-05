"use server";

import bcrypt from "bcryptjs";
import {
  createUserSchema,
  updateUserSchema,
  type CreateUserInput,
  type UpdateUserInput,
  type User,
} from "@/types";
import {
  createUserRecord,
  deleteUserRecord,
  getUserByEmail,
  getUserById,
  getUserWithPassword,
  getUsers,
  updateUserRecord,
} from "@/lib/dal/users";

const SALT_ROUNDS = 12;

type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

export async function createUser(
  input: CreateUserInput,
): Promise<ActionResult<User>> {
  const parsed = createUserSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const { email, username, password } = parsed.data;

  const existing = await getUserByEmail(email);
  if (existing) {
    return { success: false, error: "A user with that email already exists." };
  }

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await createUserRecord({ email, username, hashedPassword });

  return { success: true, data: user };
}

export async function readUser(id: number): Promise<ActionResult<User>> {
  const user = await getUserById(id);
  if (!user) {
    return { success: false, error: "User not found." };
  }
  return { success: true, data: user };
}

export async function readUsers(): Promise<ActionResult<User[]>> {
  const users = await getUsers();
  return { success: true, data: users };
}

export async function updateUser(
  id: number,
  input: UpdateUserInput,
): Promise<ActionResult<User>> {
  const parsed = updateUserSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const { email, username, password, active } = parsed.data;

  const existing = await getUserById(id);
  if (!existing) {
    return { success: false, error: "User not found." };
  }

  if (email && email !== existing.email) {
    const emailTaken = await getUserByEmail(email);
    if (emailTaken) {
      return { success: false, error: "That email is already in use." };
    }
  }

  const hashedPassword = password
    ? await bcrypt.hash(password, SALT_ROUNDS)
    : undefined;

  const user = await updateUserRecord(id, {
    email,
    username,
    hashedPassword,
    active,
  });

  return { success: true, data: user };
}

export async function deleteUser(id: number): Promise<ActionResult<void>> {
  const existing = await getUserById(id);
  if (!existing) {
    return { success: false, error: "User not found." };
  }

  await deleteUserRecord(id);
  return { success: true, data: undefined };
}

export async function verifyUserPassword(
  emailOrUsername: string,
  password: string,
): Promise<ActionResult<User>> {
  const user = await getUserWithPassword(emailOrUsername);
  if (!user) {
    return { success: false, error: "Invalid email or password." };
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    return { success: false, error: "Invalid email or password." };
  }

  const { password: _pw, ...safeUser } = user;
  return { success: true, data: safeUser };
}
