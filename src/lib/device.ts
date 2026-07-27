export type DeviceInfo = {
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
  maxTouchPoints: number | null;
  timezone: string | null;
  connectionType: string | null;
};

type UAData = {
  brands?: { brand: string; version: string }[];
  mobile?: boolean;
  platform?: string;
  getHighEntropyValues?: (hints: string[]) => Promise<{
    platform?: string;
    platformVersion?: string;
    model?: string;
    architecture?: string;
    bitness?: string;
    fullVersionList?: { brand: string; version: string }[];
  }>;
};

function pickBrowser(brands?: { brand: string; version: string }[]) {
  if (!brands?.length) return { name: null as string | null, version: null as string | null };
  const ignore = /not.?a.?brand/i;
  const real = brands.find((b) => !ignore.test(b.brand)) || brands[0];
  return { name: real?.brand ?? null, version: real?.version ?? null };
}

function parseFromUa(ua: string): Partial<DeviceInfo> {
  const out: Partial<DeviceInfo> = {};

  if (/iPhone/i.test(ua)) {
    out.deviceType = "mobile";
    out.deviceVendor = "Apple";
    out.deviceModel = "iPhone";
  } else if (/iPad/i.test(ua)) {
    out.deviceType = "tablet";
    out.deviceVendor = "Apple";
    out.deviceModel = "iPad";
  } else if (/Android/i.test(ua)) {
    out.deviceType = /Mobile/i.test(ua) ? "mobile" : "tablet";
    out.deviceVendor = "Android";
    const modelMatch =
      ua.match(/;\s*([^;)]+)\s+Build\//i) ||
      ua.match(/Android[^;]*;\s*([^;)]+)/i);
    if (modelMatch?.[1] && !/wv|browser/i.test(modelMatch[1])) {
      out.deviceModel = modelMatch[1].trim();
      const brand = modelMatch[1].trim().split(/\s+/)[0];
      if (brand) out.deviceVendor = brand;
    }
  } else if (/Macintosh|Mac OS X/i.test(ua)) {
    out.deviceType = "desktop";
    out.deviceVendor = "Apple";
    out.deviceModel = "Mac";
  } else if (/Windows/i.test(ua)) {
    out.deviceType = "desktop";
    out.deviceVendor = "PC";
    out.deviceModel = "Windows PC";
  } else if (/Linux/i.test(ua)) {
    out.deviceType = "desktop";
    out.deviceVendor = "PC";
    out.deviceModel = "Linux";
  }

  const osPatterns: [RegExp, string][] = [
    [/iPhone OS (\d+[_\d]*)/i, "iOS"],
    [/CPU OS (\d+[_\d]*)/i, "iPadOS"],
    [/Android (\d+(?:\.\d+)*)/i, "Android"],
    [/Mac OS X (\d+[_\d]*)/i, "macOS"],
    [/Windows NT (\d+(?:\.\d+)*)/i, "Windows"],
    [/CrOS/i, "Chrome OS"],
    [/Linux/i, "Linux"],
  ];
  for (const [re, name] of osPatterns) {
    const m = ua.match(re);
    if (m) {
      out.osName = name;
      out.osVersion = m[1] ? m[1].replace(/_/g, ".") : null;
      break;
    }
  }

  const browserPatterns: [RegExp, string][] = [
    [/Edg\/([\d.]+)/i, "Edge"],
    [/OPR\/([\d.]+)/i, "Opera"],
    [/SamsungBrowser\/([\d.]+)/i, "Samsung Internet"],
    [/Chrome\/([\d.]+)/i, "Chrome"],
    [/Firefox\/([\d.]+)/i, "Firefox"],
    [/Version\/([\d.]+).*Safari/i, "Safari"],
  ];
  for (const [re, name] of browserPatterns) {
    const m = ua.match(re);
    if (m) {
      out.browserName = name;
      out.browserVersion = m[1] ?? null;
      break;
    }
  }

  return out;
}

export async function collectDeviceInfo(): Promise<DeviceInfo> {
  const ua = navigator.userAgent || "";
  const parsed = parseFromUa(ua);
  const uaData = (navigator as Navigator & { userAgentData?: UAData }).userAgentData;

  let hints: Awaited<ReturnType<NonNullable<UAData["getHighEntropyValues"]>>> | null = null;
  if (uaData?.getHighEntropyValues) {
    try {
      hints = await uaData.getHighEntropyValues([
        "platform",
        "platformVersion",
        "model",
        "architecture",
        "bitness",
        "fullVersionList",
      ]);
    } catch {
      hints = null;
    }
  }

  const fromBrands = pickBrowser(hints?.fullVersionList || uaData?.brands);
  const conn = (navigator as Navigator & {
    connection?: { effectiveType?: string };
  }).connection;

  const deviceType =
    parsed.deviceType ||
    (uaData?.mobile ? "mobile" : "desktop");

  return {
    deviceType,
    deviceVendor: parsed.deviceVendor ?? null,
    deviceModel: hints?.model || parsed.deviceModel || null,
    osName: hints?.platform || uaData?.platform || parsed.osName || null,
    osVersion: hints?.platformVersion || parsed.osVersion || null,
    browserName: fromBrands.name || parsed.browserName || null,
    browserVersion: fromBrands.version || parsed.browserVersion || null,
    platform: navigator.platform || hints?.platform || null,
    language: navigator.language || null,
    languages: navigator.languages ? [...navigator.languages] : null,
    screenWidth: screen.width || null,
    screenHeight: screen.height || null,
    viewportWidth: window.innerWidth || null,
    viewportHeight: window.innerHeight || null,
    pixelRatio: window.devicePixelRatio || null,
    touchPoints: navigator.maxTouchPoints ?? null,
    hardwareConcurrency: navigator.hardwareConcurrency ?? null,
    maxTouchPoints: navigator.maxTouchPoints ?? null,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || null,
    connectionType: conn?.effectiveType || null,
  };
}
