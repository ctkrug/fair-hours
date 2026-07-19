import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  isValidTimeZone,
  localTimeInZone,
  zonedTimeToUtc,
  classifyHour,
  COMFORT,
} from '../site/js/core/simulate.js';

test('isValidTimeZone accepts real IANA zones', () => {
  assert.equal(isValidTimeZone('America/Los_Angeles'), true);
  assert.equal(isValidTimeZone('Europe/London'), true);
  assert.equal(isValidTimeZone('Australia/Sydney'), true);
});

test('isValidTimeZone rejects garbage input', () => {
  assert.equal(isValidTimeZone('Not/AZone'), false);
  assert.equal(isValidTimeZone(''), false);
});

test('localTimeInZone resolves a known instant correctly', () => {
  // 2026-01-06 17:00 UTC is 09:00 in Los Angeles (winter, PST = UTC-8).
  const utc = new Date(Date.UTC(2026, 0, 6, 17, 0));
  const result = localTimeInZone(utc, 'America/Los_Angeles');

  assert.equal(result.hour, 9);
  assert.equal(result.minute, 0);
  assert.equal(result.day, 6);
});

test('localTimeInZone reflects the DST shift across a transition', () => {
  // Same UTC wall-clock hour, one week apart, straddling the US spring-
  // forward transition (2026-03-08). The LA local hour should shift by
  // one even though the UTC input pattern didn't change.
  const before = localTimeInZone(new Date(Date.UTC(2026, 2, 1, 17, 0)), 'America/Los_Angeles');
  const after = localTimeInZone(new Date(Date.UTC(2026, 2, 15, 17, 0)), 'America/Los_Angeles');

  assert.notEqual(before.hour, after.hour);
});

test('zonedTimeToUtc inverts localTimeInZone for a winter date', () => {
  // 9am PT in January is PST (UTC-8) -> 17:00 UTC.
  const utc = zonedTimeToUtc(2026, 1, 6, 9, 0, 'America/Los_Angeles');
  assert.equal(utc.toISOString(), '2026-01-06T17:00:00.000Z');
});

test('zonedTimeToUtc reflects the organizer zone crossing into its own DST', () => {
  // Same 9am PT wall time in July is PDT (UTC-7) -> 16:00 UTC, one hour
  // earlier than the January instant despite an identical local time.
  const utc = zonedTimeToUtc(2026, 7, 6, 9, 0, 'America/Los_Angeles');
  assert.equal(utc.toISOString(), '2026-07-06T16:00:00.000Z');
});

test('zonedTimeToUtc round-trips through localTimeInZone', () => {
  const utc = zonedTimeToUtc(2026, 11, 3, 14, 30, 'Australia/Sydney');
  const local = localTimeInZone(utc, 'Australia/Sydney');
  assert.equal(local.hour, 14);
  assert.equal(local.minute, 30);
  assert.equal(local.day, 3);
});

test('classifyHour treats mid-morning through afternoon as comfortable', () => {
  assert.equal(classifyHour(8), COMFORT.COMFORTABLE);
  assert.equal(classifyHour(12), COMFORT.COMFORTABLE);
  assert.equal(classifyHour(17), COMFORT.COMFORTABLE);
});

test('classifyHour boundary: 06:59 is unreasonable, 07:00 is early-or-late', () => {
  assert.equal(classifyHour(6), COMFORT.UNREASONABLE);
  assert.equal(classifyHour(7), COMFORT.EARLY_OR_LATE);
});

test('classifyHour boundary: 07:59 is early-or-late, 08:00 is comfortable', () => {
  assert.equal(classifyHour(7), COMFORT.EARLY_OR_LATE);
  assert.equal(classifyHour(8), COMFORT.COMFORTABLE);
});

test('classifyHour boundary: 17:59 is comfortable, 18:00 is early-or-late', () => {
  assert.equal(classifyHour(17), COMFORT.COMFORTABLE);
  assert.equal(classifyHour(18), COMFORT.EARLY_OR_LATE);
});

test('classifyHour boundary: 20:59 is early-or-late, 21:00 is unreasonable', () => {
  assert.equal(classifyHour(20), COMFORT.EARLY_OR_LATE);
  assert.equal(classifyHour(21), COMFORT.UNREASONABLE);
});

test('classifyHour treats the dead of night as unreasonable', () => {
  assert.equal(classifyHour(0), COMFORT.UNREASONABLE);
  assert.equal(classifyHour(3), COMFORT.UNREASONABLE);
  assert.equal(classifyHour(23), COMFORT.UNREASONABLE);
});
