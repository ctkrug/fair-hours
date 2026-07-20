// Parses and validates raw meeting-form input into the shape `simulate()`
// expects, returning a designed error instead of feeding malformed values
// into the DST math.

import { validateTimeZoneInput } from './validation.js';

export const WEEKDAY_LABELS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/**
 * Parse raw meeting-form fields (strings, as they arrive from form inputs)
 * into a validated meeting object, or a designed error.
 */
export function parseMeetingInput({ dayOfWeek, hour, minute, timeZone } = {}) {
  const timeZoneResult = validateTimeZoneInput(timeZone);
  if (!timeZoneResult.ok) {
    return { ok: false, error: timeZoneResult.error };
  }

  const dow = Number(dayOfWeek);
  if (!Number.isInteger(dow) || dow < 0 || dow > 6) {
    return { ok: false, error: 'Day of week must be a value between Sunday and Saturday.' };
  }

  const h = Number(hour);
  if (!Number.isInteger(h) || h < 0 || h > 23) {
    return { ok: false, error: 'Start hour must be between 0 and 23.' };
  }

  const m = Number(minute);
  if (!Number.isInteger(m) || m < 0 || m > 59) {
    return { ok: false, error: 'Start minute must be between 0 and 59.' };
  }

  return {
    ok: true,
    meeting: { dayOfWeek: dow, hour: h, minute: m, timeZone: timeZoneResult.value },
  };
}
