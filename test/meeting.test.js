import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseMeetingInput } from '../site/js/core/meeting.js';

const VALID = { dayOfWeek: '2', hour: '13', minute: '0', timeZone: 'America/Los_Angeles' };

test('parseMeetingInput accepts valid string form input', () => {
  const result = parseMeetingInput(VALID);
  assert.equal(result.ok, true);
  assert.deepEqual(result.meeting, {
    dayOfWeek: 2,
    hour: 13,
    minute: 0,
    timeZone: 'America/Los_Angeles',
  });
});

test('parseMeetingInput rejects an unrecognized time zone', () => {
  const result = parseMeetingInput({ ...VALID, timeZone: 'Not/AZone' });
  assert.equal(result.ok, false);
  assert.match(result.error, /Not\/AZone/);
});

test('parseMeetingInput rejects an out-of-range day of week', () => {
  assert.equal(parseMeetingInput({ ...VALID, dayOfWeek: '7' }).ok, false);
  assert.equal(parseMeetingInput({ ...VALID, dayOfWeek: '-1' }).ok, false);
});

test('parseMeetingInput rejects an out-of-range hour', () => {
  assert.equal(parseMeetingInput({ ...VALID, hour: '24' }).ok, false);
  assert.equal(parseMeetingInput({ ...VALID, hour: '-1' }).ok, false);
});

test('parseMeetingInput rejects an out-of-range minute', () => {
  assert.equal(parseMeetingInput({ ...VALID, minute: '60' }).ok, false);
  assert.equal(parseMeetingInput({ ...VALID, minute: '-1' }).ok, false);
});

test('parseMeetingInput rejects non-numeric fields instead of throwing', () => {
  const result = parseMeetingInput({ ...VALID, hour: 'noon' });
  assert.equal(result.ok, false);
  assert.ok(result.error);
});

test('parseMeetingInput rejects an absent object instead of throwing', () => {
  const result = parseMeetingInput();
  assert.equal(result.ok, false);
  assert.match(result.error, /required/i);
});

test('parseMeetingInput accepts the boundary values 0 and 23/59', () => {
  assert.equal(parseMeetingInput({ ...VALID, dayOfWeek: '0', hour: '0', minute: '0' }).ok, true);
  assert.equal(parseMeetingInput({ ...VALID, dayOfWeek: '6', hour: '23', minute: '59' }).ok, true);
});
