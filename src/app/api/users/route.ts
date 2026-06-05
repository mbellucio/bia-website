import { NextResponse } from "next/server";
import { readUsers, createUser } from "@/actions/user";
import { createUserSchema } from "@/types";

export async function GET() {
  const result = await readUsers();
  if (!result.success) {
    return NextResponse.json({ message: result.error }, { status: 500 });
  }
  return NextResponse.json(result.data);
}

export async function POST(request: Request) {
  const body = await request.json();

  const parsed = createUserSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.issues[0].message },
      { status: 422 },
    );
  }

  const result = await createUser(parsed.data);
  if (!result.success) {
    return NextResponse.json({ message: result.error }, { status: 409 });
  }

  return NextResponse.json(result.data, { status: 201 });
}
