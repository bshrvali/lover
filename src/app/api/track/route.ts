import { NextRequest, NextResponse } from "next/server";
import type { DeviceInfo } from "@/lib/device";
import {
  addVisit,
  getClientIp,
  lookupGeo,
  mapsUrlFor,
  reverseGeocode,
} from "@/lib/tracking";

export const runtime = "nodejs";

function str(v: unknown, max = 120): string | null {
  if (typeof v !== "string") return null;
  const t = v.trim();
  return t ? t.slice(0, max) : null;
}

function num(v: unknown): number | null {
  return typeof v === "number" && Number.isFinite(v) ? v : null;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => ({}))) as {
      name?: string;
      latitude?: number;
      longitude?: number;
      accuracy?: number;
      altitude?: number;
      locationSource?: "gps" | "ip";
      device?: Partial<DeviceInfo>;
    };

    const ip = getClientIp(req.headers);
    const ipGeo = await lookupGeo(ip);
    const d = body.device ?? {};

    const hasGps =
      body.locationSource === "gps" &&
      typeof body.latitude === "number" &&
      typeof body.longitude === "number";

    const latitude = hasGps ? body.latitude! : ipGeo.latitude;
    const longitude = hasGps ? body.longitude! : ipGeo.longitude;
    const locationSource: "gps" | "ip" | null = hasGps
      ? "gps"
      : ipGeo.latitude != null
        ? "ip"
        : null;

    let city = ipGeo.city;
    let country = ipGeo.country;
    let district: string | null = null;
    let address: string | null = null;

    if (hasGps && latitude != null && longitude != null) {
      const precise = await reverseGeocode(latitude, longitude);
      city = precise.city || city;
      country = precise.country || country;
      district = precise.district;
      address = precise.address;
    }

    const visit = await addVisit({
      name: body.name?.slice(0, 80) ?? null,
      ip,
      latitude,
      longitude,
      locationSource,
      locationAccuracy: hasGps ? num(body.accuracy) : null,
      altitude: hasGps ? num(body.altitude) : null,
      ipLatitude: ipGeo.latitude,
      ipLongitude: ipGeo.longitude,
      city,
      district,
      address: address ? address.slice(0, 300) : null,
      country,
      mapsUrl:
        latitude != null && longitude != null
          ? mapsUrlFor(latitude, longitude)
          : null,
      userAgent: req.headers.get("user-agent"),
      deviceType: str(d.deviceType, 40),
      deviceVendor: str(d.deviceVendor, 60),
      deviceModel: str(d.deviceModel, 80),
      osName: str(d.osName, 40),
      osVersion: str(d.osVersion, 40),
      browserName: str(d.browserName, 40),
      browserVersion: str(d.browserVersion, 40),
      platform: str(d.platform, 60),
      language: str(d.language, 40),
      languages: Array.isArray(d.languages)
        ? d.languages.filter((x): x is string => typeof x === "string").slice(0, 8)
        : null,
      screenWidth: num(d.screenWidth),
      screenHeight: num(d.screenHeight),
      viewportWidth: num(d.viewportWidth),
      viewportHeight: num(d.viewportHeight),
      pixelRatio: num(d.pixelRatio),
      touchPoints: num(d.touchPoints ?? d.maxTouchPoints),
      hardwareConcurrency: num(d.hardwareConcurrency),
      timezone: str(d.timezone, 80),
      connectionType: str(d.connectionType, 40),
    });

    return NextResponse.json({ ok: true, id: visit.id });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
