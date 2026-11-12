/** Build a shareable profile URL from a handle or raw URL. */
export function socialUrl(
  network: 'instagram' | 'facebook' | 'tiktok',
  value: string,
): string {
  const trimmed = value.trim();
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  const handle = trimmed.replace(/^@/, '').replace(/\s+/g, '');
  switch (network) {
    case 'instagram':
      return `https://instagram.com/${handle}`;
    case 'facebook':
      return `https://facebook.com/${encodeURIComponent(handle)}`;
    case 'tiktok':
      return `https://www.tiktok.com/@${handle}`;
    default:
      return trimmed;
  }
}
