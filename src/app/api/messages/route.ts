import { NextResponse } from "next/server";
import { getMessages, createMessage } from "@/lib/dal/messages";
import { messageSchema } from "@/types";

export async function GET() {
  const messages = await getMessages();
  return NextResponse.json(messages);
}

export async function POST(request: Request) {
  const body = await request.json();

  const result = messageSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { errors: result.error.flatten().fieldErrors },
      { status: 422 },
    );
  }

  const message = await createMessage(result.data.name, result.data.content);
  return NextResponse.json(message, { status: 201 });
}
