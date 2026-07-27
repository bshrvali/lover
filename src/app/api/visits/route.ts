import { NextRequest, NextResponse } from "next/server";
import { listVisits } from "@/lib/tracking";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const key = req.nextUrl.searchParams.get("key");
  const expected = process.env.VISITS_SECRET || "lover-secret";

  if (key !== expected) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  return NextResponse.json({ visits: listVisits() });
}
