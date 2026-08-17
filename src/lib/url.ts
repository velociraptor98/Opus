/**
 * The `link` field is free text — typed into the form, or read from an
 * imported CSV that we did not write. Handing it straight to an `href` lets a
 * `javascript:` (or `data:`) URL run as script when the link is clicked, so
 * every anchor built from stored data goes through here first.
 */

const SAFE_PROTOCOLS = ["http:", "https:"];

/**
 * The value to put in an `href`, or null if the link cannot be trusted as one.
 *
 * A scheme-less entry ("acme.com/jobs") is what people actually type, so it is
 * read as https rather than dropped — without a scheme the browser would treat
 * it as a path relative to the app, which never went anywhere useful.
 */
export function safeExternalUrl(link: string): string | null {
  const trimmed = link.trim();
  if (!trimmed) return null;

  const candidate = /^[a-z][a-z0-9+.-]*:/i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;

  try {
    const url = new URL(candidate);
    return SAFE_PROTOCOLS.includes(url.protocol) ? url.href : null;
  } catch {
    return null;
  }
}
