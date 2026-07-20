import {
  COMFORT,
  COMFORTABLE_END_HOUR,
  COMFORTABLE_START_HOUR,
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
