import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  comfortLabel,
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
