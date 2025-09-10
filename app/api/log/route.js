import { NextResponse } from "next/server";
import { logEvent } from "@/lib/logger";

export async function POST(req) {
  const body = await req.json();
  logEvent(body);
  return NextResponse.json({ ok: true });
}
