export type Visit = {
  id: string;
  name: string | null;
  ip: string;
  latitude: number | null;
  longitude: number | null;
  city: string | null;
  country: string | null;
  userAgent: string | null;
  deviceType: string | null;
  deviceVendor: string | null;
  deviceModel: string | null;
  osName: string | null;
  osVersion: string | null;
  browserName: string | null;
  browserVersion: string | null;
  platform: string | null;
  language: string | null;
  languages: string[] | null;
  screenWidth: number | null;
  screenHeight: number | null;
  viewportWidth: number | null;
  viewportHeight: number | null;
  pixelRatio: number | null;
  touchPoints: number | null;
  hardwareConcurrency: number | null;
  timezone: string | null;
  connectionType: string | null;
  at: string;
};

const GIST_FILENAME = "visits.json";

function gistConfig() {
  const token = process.env.GH_TOKEN || process.env.GITHUB_TOKEN;
  const gistId = process.env.VISITS_GIST_ID;
  return { token, gistId };
}

async function readGistVisits(): Promise<Visit[]> {
  const { token, gistId } = gistConfig();
  if (!token || !gistId) return [];

  try {
    const res = await fetch(`https://api.github.com/gists/${gistId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "User-Agent": "lover-app",
      },
      cache: "no-store",
    });
    if (!res.ok) return [];
    const data = (await res.json()) as {
      files?: Record<string, { content?: string }>;
    };
    const raw = data.files?.[GIST_FILENAME]?.content ?? "[]";
    const parsed = JSON.parse(raw) as Visit[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeGistVisits(visits: Visit[]): Promise<void> {
  const { token, gistId } = gistConfig();
  if (!token || !gistId) return;

  await fetch(`https://api.github.com/gists/${gistId}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "Content-Type": "application/json",
      "User-Agent": "lover-app",
    },
    body: JSON.stringify({
      files: {
        [GIST_FILENAME]: {
          content: JSON.stringify(visits.slice(0, 200), null, 2),
        },
      },
    }),
  });
}

export async function addVisit(visit: Omit<Visit, "id" | "at">): Promise<Visit> {
  const entry: Visit = {
    ...visit,
    id: crypto.randomUUID(),
    at: new Date().toISOString(),
  };

  const existing = await readGistVisits();
  const next = [entry, ...existing].slice(0, 200);
  await writeGistVisits(next);
  return entry;
}

export async function listVisits(): Promise<Visit[]> {
  return readGistVisits();
}

export function getClientIp(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() || "unknown";
  }
  return (
    headers.get("x-real-ip") ||
    headers.get("cf-connecting-ip") ||
    "unknown"
  );
}

export async function lookupGeo(ip: string): Promise<{
  latitude: number | null;
  longitude: number | null;
  city: string | null;
  country: string | null;
}> {
  if (!ip || ip === "unknown" || ip === "::1" || ip.startsWith("127.")) {
    return { latitude: null, longitude: null, city: null, country: null };
  }

  try {
    const res = await fetch(`https://ipwho.is/${encodeURIComponent(ip)}`, {
      cache: "no-store",
    });
    if (!res.ok) {
      return { latitude: null, longitude: null, city: null, country: null };
    }
    const data = (await res.json()) as {
      success?: boolean;
      latitude?: number;
      longitude?: number;
      city?: string;
      country?: string;
    };
    if (data.success === false) {
      return { latitude: null, longitude: null, city: null, country: null };
    }
    return {
      latitude: typeof data.latitude === "number" ? data.latitude : null,
      longitude: typeof data.longitude === "number" ? data.longitude : null,
      city: data.city ?? null,
      country: data.country ?? null,
    };
  } catch {
    return { latitude: null, longitude: null, city: null, country: null };
  }
}
