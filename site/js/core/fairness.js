import {
  COMFORT,
  COMFORTABLE_END_HOUR,
  COMFORTABLE_START_HOUR,
  localTimeInZone,
  timeZoneOffsetMinutesAt,
} from './simulate.js';

const MINUTES_PER_HOUR = 60;

/**
 * Return how far a local time falls outside the comfortable 08:00–18:00
 * window. Comfortable times intentionally have zero severity.
 */
export function severityMinutes(local) {
  const totalMinutes = local.hour * MINUTES_PER_HOUR + local.minute;
  const start = COMFORTABLE_START_HOUR * MINUTES_PER_HOUR;
  const end = COMFORTABLE_END_HOUR * MINUTES_PER_HOUR;

  if (totalMinutes >= start && totalMinutes < end) return 0;
  if (totalMinutes < start) return start - totalMinutes;
  return totalMinutes - end;
}

/** Format the simulation's numeric local time for compact UI labels. */
export function formatLocalTime(local) {
  const hour12 = ((local.hour + 11) % 12) + 1;
  const suffix = local.hour < 12 ? 'AM' : 'PM';
  return `${hour12}:${String(local.minute).padStart(2, '0')} ${suffix}`;
}

/** Convert a comfort identifier into reader-facing text. */
export function comfortLabel(classification) {
  return classification === COMFORT.EARLY_OR_LATE
    ? 'early or late'
    : classification;
}

const DAY_MS = 86400000;
const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

/**
 * Find the latest offset change in the week ending at an occurrence. The
 * sampled midday instants avoid ambiguous local clock hours while preserving
 * the local calendar day needed for an understandable DST annotation.
 */
export function findRecentTransition(utc, timeZone) {
  const endDay = Date.UTC(utc.getUTCFullYear(), utc.getUTCMonth(), utc.getUTCDate(), 12);
  let previousOffset = timeZoneOffsetMinutesAt(endDay - 8 * DAY_MS, timeZone);

  for (let day = 7; day >= 0; day -= 1) {
    const instant = endDay - day * DAY_MS;
    const offset = timeZoneOffsetMinutesAt(instant, timeZone);
    if (offset !== previousOffset) {
      const local = localTimeInZone(new Date(instant), timeZone);
      return {
        timeZone,
        local,
        direction: offset > previousOffset ? 'starts' : 'ends',
      };
    }
    previousOffset = offset;
  }
  return null;
}

/** Format a detected time-zone offset change as a concise DST explanation. */
export function transitionLabel(transition) {
  if (!transition) return 'No nearby DST transition';
  return `${transition.timeZone} DST ${transition.direction} ${MONTH_NAMES[transition.local.month - 1]} ${transition.local.day}`;
}

/**
 * Return the weeks where a DST shift makes a person's meeting time worse.
 * Rankings use minute distance from the comfortable window, then preserve
 * chronological order for equal impacts.
 */
export function buildWorstWeekCallouts(simulationResult, organizerTimeZone) {
  const callouts = [];

  simulationResult.forEach((person) => {
    person.weeks.forEach((week, weekIndex) => {
      if (weekIndex === 0) return;
      const previous = person.weeks[weekIndex - 1];
      const severity = severityMinutes(week.local);
      if (severity <= severityMinutes(previous.local)) return;

      const transition =
        findRecentTransition(week.utc, person.timeZone) ??
        findRecentTransition(week.utc, organizerTimeZone);
      if (!transition) return;

      callouts.push({
        person,
        week,
        weekIndex,
        severity,
        transition,
        transitionText: transitionLabel(transition),
      });
    });
  });

  return callouts.sort((a, b) => b.severity - a.severity || a.weekIndex - b.weekIndex);
}
