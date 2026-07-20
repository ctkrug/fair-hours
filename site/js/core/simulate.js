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

const WEEKDAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/**
 * The IANA offset (in minutes) such that `wall-clock time in `timeZone`
 * expressed as a UTC-labeled instant` === `instantMs + offset`.
 */
export function timeZoneOffsetMinutesAt(instantMs, timeZone) {
  const local = localTimeInZone(new Date(instantMs), timeZone);
  const asUtc = Date.UTC(local.year, local.month - 1, local.day, local.hour, local.minute);
  return (asUtc - instantMs) / 60000;
}

/**
 * Resolve the real UTC instant for a wall-clock date/time in `timeZone`.
 * Intl only exposes UTC-instant -> local-wall conversion, so this inverts it:
 * guess the offset from a naive UTC interpretation of the wall time, then
 * refine once against that guess to handle dates where the offset itself
 * changes (a DST transition week).
 */
export function zonedTimeToUtc(year, month, day, hour, minute, timeZone) {
  const naiveUtcMs = Date.UTC(year, month - 1, day, hour, minute);
  const offset = timeZoneOffsetMinutesAt(naiveUtcMs, timeZone);
  let instantMs = naiveUtcMs - offset * 60000;

  const refinedOffset = timeZoneOffsetMinutesAt(instantMs, timeZone);
  if (refinedOffset !== offset) {
    instantMs = naiveUtcMs - refinedOffset * 60000;
  }

  // A spring-forward gap has no exact wall-clock match. The offset refinement
  // above lands on the preceding clock time; shift forward by the skipped
  // interval so a recurring meeting follows calendar-event convention.
  const resolved = localTimeInZone(new Date(instantMs), timeZone);
  const resolvedWallMs = Date.UTC(
    resolved.year, resolved.month - 1, resolved.day, resolved.hour, resolved.minute
  );
  if (resolvedWallMs < naiveUtcMs) {
    instantMs += naiveUtcMs - resolvedWallMs;
  }

  return new Date(instantMs);
}

/** Comfort classifications for a teammate's local meeting hour. */
export const COMFORT = Object.freeze({
  COMFORTABLE: 'comfortable',
  EARLY_OR_LATE: 'early-or-late',
  UNREASONABLE: 'unreasonable',
});

// Local-hour thresholds (24h clock). Each is the first hour *inside* the
// named band; a band runs from its own threshold up to the next one.
export const COMFORTABLE_START_HOUR = 8; // 08:00 local and later...
export const COMFORTABLE_END_HOUR = 18; // ...until 18:00 local is comfortable.
export const REASONABLE_START_HOUR = 7; // 07:00-07:59 and 18:00-20:59...
export const REASONABLE_END_HOUR = 21; // ...are early-or-late, not unreasonable.

/**
 * Classify a local wall-clock hour (0-23) as comfortable, early-or-late, or
 * unreasonable, per the named thresholds above.
 */
export function classifyHour(hour) {
  if (hour >= COMFORTABLE_START_HOUR && hour < COMFORTABLE_END_HOUR) {
    return COMFORT.COMFORTABLE;
  }
  if (hour >= REASONABLE_START_HOUR && hour < REASONABLE_END_HOUR) {
    return COMFORT.EARLY_OR_LATE;
  }
  return COMFORT.UNREASONABLE;
}

/**
 * Generate the UTC instants for every occurrence of a recurring meeting.
 *
 * `meeting.dayOfWeek` is 0 (Sunday) - 6 (Saturday), in the organizer's own
 * time zone. The first occurrence is the next matching weekday on or after
 * `startDate` (today, if it's that weekday and the time hasn't passed yet);
 * every occurrence after that is exactly 7 calendar days later in the
 * organizer's zone, re-resolved through `zonedTimeToUtc` so each one
 * reflects that date's real offset rather than a fixed cadence in UTC.
 */
export function generateOccurrences(meeting, options = {}) {
  const { dayOfWeek, hour, minute, timeZone } = meeting;
  const { weeks = 52, startDate = new Date() } = options;

  const today = localTimeInZone(startDate, timeZone);
  const todayWeekday = WEEKDAY_NAMES.indexOf(today.weekday);

  let daysUntilFirst = (dayOfWeek - todayWeekday + 7) % 7;
  const meetingAlreadyPassedToday =
    today.hour > hour || (today.hour === hour && today.minute >= minute);
  if (daysUntilFirst === 0 && meetingAlreadyPassedToday) {
    daysUntilFirst = 7;
  }

  // Calendar-day arithmetic only: these ms values are never treated as real
  // instants, just used to step whole days across the organizer's calendar.
  const todayAsCalendarMs = Date.UTC(today.year, today.month - 1, today.day);
  const firstOccurrenceCalendarMs = todayAsCalendarMs + daysUntilFirst * 86400000;

  const occurrences = [];
  for (let week = 0; week < weeks; week += 1) {
    const calendarMs = firstOccurrenceCalendarMs + week * 7 * 86400000;
    const calendarDate = new Date(calendarMs);
    occurrences.push(
      zonedTimeToUtc(
        calendarDate.getUTCFullYear(),
        calendarDate.getUTCMonth() + 1,
        calendarDate.getUTCDate(),
        hour,
        minute,
        timeZone
      )
    );
  }
  return occurrences;
}

/**
 * Simulate a recurring meeting across a roster: for every teammate, resolve
 * every occurrence to that teammate's local wall time and comfort
 * classification. Returns one entry per roster member, each carrying its
 * own week-by-week results — fairness is reported per person, never
 * collapsed into a single team-wide average.
 */
export function simulate(meeting, roster, options = {}) {
  const occurrences = generateOccurrences(meeting, options);

  return roster.map((person) => ({
    ...person,
    weeks: occurrences.map((utc) => {
      const local = localTimeInZone(utc, person.timeZone);
      return {
        utc,
        local,
        classification: classifyHour(local.hour),
      };
    }),
  }));
}
