import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isValidTimeZone, localTimeInZone } from '../site/js/core/simulate.js';

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
