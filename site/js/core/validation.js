// Shared input validation for the meeting form and roster editor. Every
// function returns a designed result object instead of throwing, so a bad
// value produces an inline error state rather than an uncaught exception.

import { isValidTimeZone } from './simulate.js';

/** Validate a raw IANA time zone string from a form field. */
export function validateTimeZoneInput(rawTimeZone) {
  if (typeof rawTimeZone !== 'string') {
    return { ok: false, error: 'Time zone is required.' };
  }
  const trimmed = rawTimeZone.trim();
  if (!trimmed) {
    return { ok: false, error: 'Time zone is required.' };
  }
  if (!isValidTimeZone(trimmed)) {
    return { ok: false, error: `"${trimmed}" is not a recognized IANA time zone.` };
  }
  return { ok: true, value: trimmed };
}

/** Validate a raw teammate name from a form field. */
export function validateTeammateName(rawName) {
  const trimmed = (rawName ?? '').trim();
  if (!trimmed) {
    return { ok: false, error: 'Name is required.' };
  }
  return { ok: true, value: trimmed };
}
