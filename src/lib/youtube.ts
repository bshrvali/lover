/** Extract a YouTube video id from a raw id or full URL. */
export function extractYoutubeId(input: string | null | undefined): string | null {
  if (!input) return null;
  const raw = input.trim();
  if (!raw) return null;

  // Already a bare video id
  if (/^[\w-]{11}$/.test(raw)) return raw;

  try {
    const decoded = decodeURIComponent(raw);
    const candidate = decoded.trim();

    if (/^[\w-]{11}$/.test(candidate)) return candidate;

    // youtu.be/ID
    const short = candidate.match(/youtu\.be\/([\w-]{11})/i);
    if (short?.[1]) return short[1];

    // youtube.com/watch?v=ID | /embed/ID | /shorts/ID | /live/ID
    const long = candidate.match(
      /(?:youtube\.com\/(?:watch\?(?:[^#]*&)?v=|embed\/|shorts\/|live\/)|youtube-nocookie\.com\/embed\/)([\w-]{11})/i,
    );
    if (long?.[1]) return long[1];

    // Fallback: v=ID anywhere
    const vParam = candidate.match(/[?&]v=([\w-]{11})/i);
    if (vParam?.[1]) return vParam[1];
  } catch {
    return null;
  }

  return null;
}
