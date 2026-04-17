import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { readJsonFile } from "@/lib/storage";

type PaymentStore = {
  paidSessions: string[];
};

export async function POST(request: Request) {
  const { sessionId } = (await request.json()) as { sessionId?: string };

  if (!sessionId) {
    return NextResponse.json({ error: "Missing session" }, { status: 400 });
  }

  const store = await readJsonFile<PaymentStore>("payments.json", { paidSessions: [] });

  if (!store.paidSessions.includes(sessionId)) {
    return NextResponse.json({ unlocked: false }, { status: 402 });
  }

  const cookieStore = await cookies();
  cookieStore.set("iot_paid", "1", {
    secure: true,
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30,
    path: "/"
  });

  return NextResponse.json({ unlocked: true });
}
