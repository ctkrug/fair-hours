import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  comfortLabel,
  buildWorstWeekCallouts,
  findRecentTransition,
  formatLocalTime,
  severityMinutes,
  transitionLabel,
} from '../site/js/core/fairness.js';
import { COMFORT } from '../site/js/core/simulate.js';

test('severityMinutes is zero throughout the comfortable window', () => {
  assert.equal(severityMinutes({ hour: 8, minute: 0 }), 0);
  assert.equal(severityMinutes({ hour: 17, minute: 59 }), 0);
});

test('severityMinutes preserves minute-level distances at both boundaries', () => {
  assert.equal(severityMinutes({ hour: 7, minute: 59 }), 1);
  assert.equal(severityMinutes({ hour: 6, minute: 0 }), 120);
  assert.equal(severityMinutes({ hour: 18, minute: 0 }), 0);
  assert.equal(severityMinutes({ hour: 18, minute: 1 }), 1);
  assert.equal(severityMinutes({ hour: 23, minute: 59 }), 359);
  assert.equal(severityMinutes({ hour: 0, minute: 0 }), 480);
});

test('display helpers preserve exact time and readable classification', () => {
  assert.equal(formatLocalTime({ hour: 0, minute: 5 }), '12:05 AM');
  assert.equal(formatLocalTime({ hour: 12, minute: 0 }), '12:00 PM');
  assert.equal(comfortLabel(COMFORT.EARLY_OR_LATE), 'early or late');
  assert.equal(comfortLabel(COMFORT.UNREASONABLE), 'unreasonable');
});

test('findRecentTransition identifies Sydney daylight saving starting in its transition week', () => {
  const transition = findRecentTransition(new Date('2026-10-06T20:00:00Z'), 'Australia/Sydney');
  assert.deepEqual(transition, {
    timeZone: 'Australia/Sydney',
    local: { weekday: 'Sun', year: 2026, month: 10, day: 4, hour: 23, minute: 0 },
    direction: 'starts',
  });
  assert.equal(transitionLabel(transition), 'Australia/Sydney DST starts Oct 4');
});

test('findRecentTransition identifies London daylight saving ending and ignores stable weeks', () => {
  const transition = findRecentTransition(new Date('2026-10-27T20:00:00Z'), 'Europe/London');
  assert.equal(transition.direction, 'ends');
  assert.equal(transitionLabel(transition), 'Europe/London DST ends Oct 25');
  assert.equal(findRecentTransition(new Date('2026-07-14T20:00:00Z'), 'Europe/London'), null);
});

test('buildWorstWeekCallouts ranks increased discomfort and keeps its transition explanation', () => {
  const utc = new Date('2026-03-10T20:00:00Z');
  const result = [{
    name: 'New York',
    timeZone: 'America/New_York',
    weeks: [
      { utc: new Date('2026-03-03T20:00:00Z'), local: { hour: 6, minute: 0 } },
      { utc, local: { hour: 5, minute: 30 } },
    ],
  }, {
    name: 'Chicago',
    timeZone: 'America/Chicago',
    weeks: [
      { utc: new Date('2026-03-03T20:00:00Z'), local: { hour: 19, minute: 0 } },
      { utc, local: { hour: 20, minute: 0 } },
    ],
  }];

  const callouts = buildWorstWeekCallouts(result, 'America/Los_Angeles');
  assert.equal(callouts.length, 2);
  assert.equal(callouts[0].person.name, 'New York');
  assert.equal(callouts[0].severity, 150);
  assert.equal(callouts[0].transitionText, 'America/New_York DST starts Mar 8');
  assert.equal(callouts[1].person.name, 'Chicago');
});

test('buildWorstWeekCallouts excludes stable and improving weeks', () => {
  const utc = new Date('2026-07-14T20:00:00Z');
  const result = [{
    name: 'Stable',
    timeZone: 'Europe/London',
    weeks: [
      { utc: new Date('2026-07-07T20:00:00Z'), local: { hour: 20, minute: 0 } },
      { utc, local: { hour: 20, minute: 0 } },
      { utc, local: { hour: 19, minute: 0 } },
    ],
  }];
  assert.deepEqual(buildWorstWeekCallouts(result, 'America/Los_Angeles'), []);
});
