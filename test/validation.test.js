import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateTimeZoneInput, validateTeammateName } from '../site/js/core/validation.js';

test('validateTimeZoneInput accepts a real IANA zone, trimmed', () => {
  const result = validateTimeZoneInput('  Europe/London  ');
  assert.equal(result.ok, true);
  assert.equal(result.value, 'Europe/London');
});

test('validateTimeZoneInput rejects an empty or whitespace-only value', () => {
  assert.equal(validateTimeZoneInput('').ok, false);
  assert.equal(validateTimeZoneInput('   ').ok, false);
  assert.equal(validateTimeZoneInput(undefined).ok, false);
});

test('validateTimeZoneInput rejects an unrecognized zone with a specific message', () => {
  const result = validateTimeZoneInput('Mars/Olympus_Mons');
  assert.equal(result.ok, false);
  assert.match(result.error, /Mars\/Olympus_Mons/);
});

test('validateTeammateName accepts a name, trimmed', () => {
  const result = validateTeammateName('  Priya  ');
  assert.equal(result.ok, true);
  assert.equal(result.value, 'Priya');
});

test('validateTeammateName rejects empty and whitespace-only names', () => {
  assert.equal(validateTeammateName('').ok, false);
  assert.equal(validateTeammateName('   ').ok, false);
});
