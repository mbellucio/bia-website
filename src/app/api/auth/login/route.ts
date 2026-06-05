import { NextResponse } from "next/server";
import { verifyUserPassword } from "@/actions/user";
import { z } from "zod";

const loginSchema = z.object({
  emailOrUsername: z.string().min(1, "Email or username is required"),
  password: z.string().min(1),
});

export async function POST(request: Request) {
  const body = await request.json();

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.issues[0].message },
      { status: 422 },
    );
  }

  const result = await verifyUserPassword(
    parsed.data.emailOrUsername,
    parsed.data.password,
  );
  if (!result.success) {
    return NextResponse.json({ message: result.error }, { status: 401 });
  }

  return NextResponse.json(result.data);
}
