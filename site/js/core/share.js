// URL-safe serialization for a complete Fair Hours plan. Keeping this pure
// makes a shared plan portable and lets UI code handle failures deliberately.

/** Return a query-string value that contains the meeting and full roster. */
export function encodePlanState(meeting, roster) {
  return encodeURIComponent(JSON.stringify({ meeting, roster }));
}

/** Build a relative share URL that remains valid when served from a subpath. */
export function buildShareUrl(locationHref, meeting, roster) {
  const url = new URL(locationHref);
  url.searchParams.set('plan', encodePlanState(meeting, roster));
  return url.href;
}
