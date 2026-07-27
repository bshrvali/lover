import { NextRequest, NextResponse } from "next/server";
import { clearVisits, deleteVisit, listVisits } from "@/lib/tracking";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const visits = await listVisits();
  return NextResponse.json({ visits });
}

export async function DELETE(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => ({}))) as {
      id?: string;
      all?: boolean;
    };

    if (body.all) {
      const removed = await clearVisits();
      return NextResponse.json({ ok: true, removed });
    }

    if (!body.id || typeof body.id !== "string") {
      return NextResponse.json({ error: "id required" }, { status: 400 });
    }

    const ok = await deleteVisit(body.id);
    if (!ok) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true, id: body.id });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
