import { NextRequest, NextResponse } from "next/server";
import { addVisit, getClientIp, lookupGeo } from "@/lib/tracking";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => ({}))) as {
      name?: string;
      latitude?: number;
      longitude?: number;
    };

    const ip = getClientIp(req.headers);
    const geo = await lookupGeo(ip);

    // Prefer precise browser coords when available; otherwise IP-based lat/long.
    const latitude =
      typeof body.latitude === "number" ? body.latitude : geo.latitude;
    const longitude =
      typeof body.longitude === "number" ? body.longitude : geo.longitude;

    const visit = addVisit({
      name: body.name?.slice(0, 80) ?? null,
      ip,
      latitude,
      longitude,
      city: geo.city,
      country: geo.country,
      userAgent: req.headers.get("user-agent"),
    });

    // Silent response — no useful data leaked to the visitor UI.
    return NextResponse.json({ ok: true, id: visit.id });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
