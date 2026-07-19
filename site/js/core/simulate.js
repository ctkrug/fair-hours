// Core time zone math. No framework, no build step: relies only on the
// Intl APIs that ship IANA tz data in both browsers and Node.

/** True if `tz` is a recognized IANA time zone identifier. */
export function isValidTimeZone(tz) {
  try {
    return Intl.supportedValuesOf('timeZone').includes(tz);
  } catch {
    // Intl.supportedValuesOf is unavailable in some older runtimes; fall
    // back to letting the formatter itself throw on an invalid zone.
    try {
      new Intl.DateTimeFormat('en-US', { timeZone: tz });
      return true;
    } catch {
      return false;
    }
  }
}

/**
 * Resolve the local wall-clock time for a UTC instant in a given IANA time
 * zone, using the formatter's own DST rules for that specific date rather
 * than a fixed offset.
 */
export function localTimeInZone(utcDate, timeZone) {
  const fmt = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hour: 'numeric',
    minute: '2-digit',
    hour12: false,
    weekday: 'short',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

  const parts = Object.fromEntries(
    fmt.formatToParts(utcDate).map((p) => [p.type, p.value])
  );

  return {
    weekday: parts.weekday,
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(parts.day),
    hour: Number(parts.hour) % 24,
    minute: Number(parts.minute),
  };
}
