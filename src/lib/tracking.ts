type Visit = {
  id: string;
  name: string | null;
  ip: string;
  latitude: number | null;
  longitude: number | null;
  city: string | null;
  country: string | null;
  userAgent: string | null;
  at: string;
};

const globalStore = globalThis as typeof globalThis & {
  __loverVisits?: Visit[];
};

function getStore(): Visit[] {
  if (!globalStore.__loverVisits) {
    globalStore.__loverVisits = [];
  }
  return globalStore.__loverVisits;
}

export function addVisit(visit: Omit<Visit, "id" | "at">): Visit {
  const entry: Visit = {
    ...visit,
    id: crypto.randomUUID(),
    at: new Date().toISOString(),
  };
  const store = getStore();
  store.unshift(entry);
  if (store.length > 200) store.length = 200;
  return entry;
}

export function listVisits(): Visit[] {
  return [...getStore()];
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
      next: { revalidate: 0 },
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
