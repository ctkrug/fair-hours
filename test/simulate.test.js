import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  isValidTimeZone,
  localTimeInZone,
  zonedTimeToUtc,
  classifyHour,
  COMFORT,
  generateOccurrences,
  simulate,
} from '../site/js/core/simulate.js';
import { DEMO_MEETING, DEMO_ROSTER } from '../site/js/core/demo.js';

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

test('zonedTimeToUtc moves a skipped spring-forward time forward by the gap', () => {
  // 2:30 AM does not exist in Los Angeles on 2026-03-08. Recurring calendar
  // events conventionally continue at 3:30 AM rather than moving backward.
  const utc = zonedTimeToUtc(2026, 3, 8, 2, 30, 'America/Los_Angeles');
  const local = localTimeInZone(utc, 'America/Los_Angeles');

  assert.equal(local.hour, 3);
  assert.equal(local.minute, 30);
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

test('generateOccurrences produces one instant per week for the requested span', () => {
  const meeting = { dayOfWeek: 2, hour: 9, minute: 0, timeZone: 'America/Los_Angeles' };
  const occurrences = generateOccurrences(meeting, {
    weeks: 52,
    startDate: new Date('2026-01-01T00:00:00Z'),
  });

  assert.equal(occurrences.length, 52);
  occurrences.forEach((utc) => {
    assert.equal(localTimeInZone(utc, meeting.timeZone).weekday, 'Tue');
    assert.equal(localTimeInZone(utc, meeting.timeZone).hour, 9);
  });
});

test('generateOccurrences steps exactly 7 calendar days apart in the organizer zone', () => {
  const meeting = { dayOfWeek: 2, hour: 9, minute: 0, timeZone: 'America/Los_Angeles' };
  const occurrences = generateOccurrences(meeting, {
    weeks: 5,
    startDate: new Date('2026-01-01T00:00:00Z'),
  });

  const days = occurrences.map((utc) => localTimeInZone(utc, meeting.timeZone).day);
  assert.deepEqual(days, [6, 13, 20, 27, 3]);
});

test('generateOccurrences picks next week when the meeting time already passed today', () => {
  const meeting = { dayOfWeek: 2, hour: 9, minute: 0, timeZone: 'America/Los_Angeles' };
  // 2026-01-06 is a Tuesday; 18:00 UTC that day is already past 9am PT (17:00 UTC).
  const occurrences = generateOccurrences(meeting, {
    weeks: 1,
    startDate: new Date('2026-01-06T18:00:00Z'),
  });

  assert.equal(localTimeInZone(occurrences[0], meeting.timeZone).day, 13);
});

test('generateOccurrences includes today when the meeting time has not yet passed', () => {
  const meeting = { dayOfWeek: 2, hour: 9, minute: 0, timeZone: 'America/Los_Angeles' };
  const occurrences = generateOccurrences(meeting, {
    weeks: 1,
    startDate: new Date('2026-01-06T15:00:00Z'),
  });

  assert.equal(localTimeInZone(occurrences[0], meeting.timeZone).day, 6);
});

test('simulate returns one entry per roster member with 52 classified weeks', () => {
  const meeting = { dayOfWeek: 2, hour: 13, minute: 0, timeZone: 'America/Los_Angeles' };
  const roster = [
    { name: 'Organizer', timeZone: 'America/Los_Angeles' },
    { name: 'London', timeZone: 'Europe/London' },
  ];
  const result = simulate(meeting, roster, { startDate: new Date('2026-01-01T00:00:00Z') });

  assert.equal(result.length, 2);
  assert.equal(result[0].name, 'Organizer');
  assert.equal(result[0].weeks.length, 52);
  assert.ok(Object.values(COMFORT).includes(result[0].weeks[0].classification));
});

test('simulate reveals the wow moment: asymmetric hemisphere DST flags different weeks', () => {
  // A 1pm PT meeting keeps the organizer comfortable year-round. Sydney
  // swings dramatically -- comfortable in January (Southern Hemisphere
  // daylight saving), unreasonable by mid-year once Australia falls back
  // in April -- while London separately crosses its own comfort boundary
  // during the UK's March/October transitions. Because the UK and
  // Australia shift clocks on different dates in different directions,
  // the two teammates' transition weeks don't coincide.
  const meeting = { dayOfWeek: 2, hour: 13, minute: 0, timeZone: 'America/Los_Angeles' };
  const roster = [
    { name: 'Organizer', timeZone: 'America/Los_Angeles' },
    { name: 'London', timeZone: 'Europe/London' },
    { name: 'Sydney', timeZone: 'Australia/Sydney' },
  ];
  const result = simulate(meeting, roster, { startDate: new Date('2026-01-01T00:00:00Z') });

  const london = result.find((r) => r.name === 'London');
  const sydney = result.find((r) => r.name === 'Sydney');

  assert.equal(sydney.weeks[0].classification, COMFORT.COMFORTABLE);
  assert.equal(sydney.weeks[25].classification, COMFORT.UNREASONABLE);

  const londonClassifications = new Set(london.weeks.map((w) => w.classification));
  assert.ok(londonClassifications.has(COMFORT.UNREASONABLE));
  assert.ok(londonClassifications.has(COMFORT.EARLY_OR_LATE));

  const sydneyTransitionWeek = sydney.weeks.findIndex((w) => w.classification === COMFORT.UNREASONABLE);
  const londonReliefWeek = london.weeks.findIndex((w) => w.classification === COMFORT.EARLY_OR_LATE);
  assert.notEqual(sydneyTransitionWeek, londonReliefWeek);
});

test('the pre-filled demo scenario uses valid IANA zones and reproduces the wow moment', () => {
  assert.ok(isValidTimeZone(DEMO_MEETING.timeZone));
  DEMO_ROSTER.forEach((person) => assert.ok(isValidTimeZone(person.timeZone)));

  const result = simulate(DEMO_MEETING, DEMO_ROSTER, {
    startDate: new Date('2026-01-01T00:00:00Z'),
  });

  assert.equal(result.length, 3);
  const sydney = result.find((r) => r.timeZone === 'Australia/Sydney');
  assert.equal(sydney.weeks[0].classification, COMFORT.COMFORTABLE);
  assert.ok(sydney.weeks.some((w) => w.classification === COMFORT.UNREASONABLE));
});
