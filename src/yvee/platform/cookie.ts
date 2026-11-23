/**
 * Reads a cookie from `document.cookie` in the browser.
 * Returns `undefined` without a `document` or when the cookie is absent.
 * Values are decoded once; a malformed percent-encoding returns the raw value.
 */
export function readCookie(name: string): string | undefined {
  if (typeof document === "undefined" || typeof document.cookie !== "string") return undefined;
  const prefix = `${name}=`;
  for (const entry of document.cookie.split(";")) {
    const part = entry.trim();
    if (!part.startsWith(prefix)) continue;
    const raw = part.slice(prefix.length);
    try {
      return decodeURIComponent(raw);
    } catch {
      return raw;
    }
  }
  return undefined;
}
