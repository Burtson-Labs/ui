/*
 * URL checks for anything a model or a user can put on the page: a link's
 * href, an image's src. Each returns the URL when its protocol is on the
 * allow list and undefined otherwise, so `javascript:`, `vbscript:` and other
 * script-bearing URLs never reach the DOM. Relative URLs are allowed: they
 * resolve against the page, so they inherit its http(s) protocol.
 */

// Only the protocol is checked; this base just lets relative URLs parse on
// the server, where there is no document.
const FALLBACK_BASE = 'http://localhost/';

function protocolOf(url: string): string | undefined {
  // An about:blank or srcdoc page has no base a relative URL can resolve
  // against; the fallback still gives an absolute URL its own protocol.
  const bases =
    typeof document !== 'undefined' ? [document.baseURI, FALLBACK_BASE] : [FALLBACK_BASE];
  for (const base of bases) {
    try {
      return new URL(url, base).protocol;
    } catch {
      // try the next base
    }
  }
  return undefined;
}

/**
 * An http(s) link, or undefined for anything else. `mailto` also allows
 * mailto: links; `blob` allows blob: URLs (a local file the app created).
 */
export function safeLinkHref(
  url: string | null | undefined,
  { mailto = false, blob = false }: { mailto?: boolean; blob?: boolean } = {},
): string | undefined {
  const value = url?.trim();
  if (!value) return undefined;
  const protocol = protocolOf(value);
  return protocol === 'https:' ||
    protocol === 'http:' ||
    (mailto && protocol === 'mailto:') ||
    (blob && protocol === 'blob:')
    ? value
    : undefined;
}

// Any data:image type. An SVG in an <img> cannot run script or load other
// resources; the URL is never used as a link target (safeLinkHref refuses data:).
const DATA_IMAGE = /^data:image\/[a-z0-9.+-]+[;,]/i;

/**
 * An image source that is http(s), blob: or a `data:image/…` URL, or
 * undefined for anything else (javascript:, data:text/html). Use it for
 * `<img src>` only, never for a link.
 */
export function safeImageSrc(url: string | null | undefined): string | undefined {
  const value = url?.trim();
  if (!value) return undefined;
  if (/^data:/i.test(value)) return DATA_IMAGE.test(value) ? value : undefined;
  const protocol = protocolOf(value);
  return protocol === 'https:' || protocol === 'http:' || protocol === 'blob:' ? value : undefined;
}
