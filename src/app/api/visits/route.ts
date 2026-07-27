import { NextResponse } from "next/server";
import { listVisits } from "@/lib/tracking";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const visits = await listVisits();
  return NextResponse.json({ visits });
}
