// Pure roster editing operations. Never mutates the roster passed in --
// each call returns a new array (or a designed error) so the caller can
// re-render from a single source of truth.

import { validateTeammateName, validateTimeZoneInput } from './validation.js';

/**
 * Add a teammate to a roster. Returns `{ ok: true, roster }` with a new
 * array on success, or `{ ok: false, error, roster }` (the original,
 * unchanged roster) if the name or time zone fails validation.
 */
export function addTeammate(roster, rawName, rawTimeZone) {
  const nameResult = validateTeammateName(rawName);
  if (!nameResult.ok) {
    return { ok: false, error: nameResult.error, roster };
  }

  const timeZoneResult = validateTimeZoneInput(rawTimeZone);
  if (!timeZoneResult.ok) {
    return { ok: false, error: timeZoneResult.error, roster };
  }

  return {
    ok: true,
    roster: [...roster, { name: nameResult.value, timeZone: timeZoneResult.value }],
  };
}

/** Remove the teammate at `index`, returning a new roster array. */
export function removeTeammate(roster, index) {
  return roster.filter((_, i) => i !== index);
}
