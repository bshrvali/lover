export function encodeName(name: string): string {
  const bytes = new TextEncoder().encode(name.trim());
  let binary = "";
  bytes.forEach((b) => {
    binary += String.fromCharCode(b);
  });
  return btoa(binary);
}

export function decodeName(encoded: string): string | null {
  try {
    const normalized = decodeURIComponent(encoded)
      .replace(/-/g, "+")
      .replace(/_/g, "/");
    const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4);
    const binary = atob(padded);
    const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
    const name = new TextDecoder().decode(bytes).trim();
    return name.length > 0 ? name : null;
  } catch {
    return null;
  }
}

/** Path-safe base64 (keeps readable padding, escapes path-breaking chars). */
export function toPathSegment(base64: string): string {
  return encodeURIComponent(base64);
}
