import { NextResponse } from "next/server";
import { readUser, updateUser, deleteUser } from "@/actions/user";
import { updateUserSchema } from "@/types";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  const { id } = await params;
  const result = await readUser(Number(id));
  if (!result.success) {
    return NextResponse.json({ message: result.error }, { status: 404 });
  }
  return NextResponse.json(result.data);
}

export async function PUT(request: Request, { params }: Params) {
  const { id } = await params;
  const body = await request.json();

  const parsed = updateUserSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.issues[0].message },
      { status: 422 },
    );
  }

  const result = await updateUser(Number(id), parsed.data);
  if (!result.success) {
    return NextResponse.json(
      { message: result.error },
      { status: result.error === "User not found." ? 404 : 409 },
    );
  }

  return NextResponse.json(result.data);
}

export async function DELETE(_req: Request, { params }: Params) {
  const { id } = await params;
  const result = await deleteUser(Number(id));
  if (!result.success) {
    return NextResponse.json({ message: result.error }, { status: 404 });
  }
  return new NextResponse(null, { status: 204 });
}
