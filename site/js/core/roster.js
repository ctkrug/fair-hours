// Pure roster editing operations. Never mutates the roster passed in --
// each call returns a new array (or a designed error) so the caller can
// re-render from a single source of truth.

import { validateTeammateName, validateTimeZoneInput } from './validation.js';

export const MAX_ROSTER_SIZE = 50;

/**
 * Add a teammate to a roster. Returns `{ ok: true, roster }` with a new
 * array on success, or `{ ok: false, error, roster }` (the original,
 * unchanged roster) if the name or time zone fails validation.
 */
export function addTeammate(roster, rawName, rawTimeZone) {
  if (roster.length >= MAX_ROSTER_SIZE) {
    return { ok: false, error: `A plan can include at most ${MAX_ROSTER_SIZE} teammates.`, roster };
  }

  const nameResult = validateTeammateName(rawName);
  if (!nameResult.ok) {
    return { ok: false, error: nameResult.error, roster };
  }

  const timeZoneResult = validateTimeZoneInput(rawTimeZone);
  if (!timeZoneResult.ok) {
    return { ok: false, error: timeZoneResult.error, roster };
  }

  if (roster.some((person) => person.timeZone === timeZoneResult.value)) {
    return { ok: false, error: 'Each teammate must have a distinct time zone.', roster };
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
