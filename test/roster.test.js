import { test } from 'node:test';
import assert from 'node:assert/strict';
import { addTeammate, removeTeammate } from '../site/js/core/roster.js';

test('addTeammate appends a valid teammate without mutating the input', () => {
  const original = [{ name: 'Organizer', timeZone: 'America/Los_Angeles' }];
  const result = addTeammate(original, 'Priya', 'Europe/London');

  assert.equal(result.ok, true);
  assert.equal(result.roster.length, 2);
  assert.deepEqual(result.roster[1], { name: 'Priya', timeZone: 'Europe/London' });
  assert.equal(original.length, 1, 'original roster array must not be mutated');
});

test('addTeammate rejects an empty name and leaves the roster unchanged', () => {
  const original = [{ name: 'Organizer', timeZone: 'America/Los_Angeles' }];
  const result = addTeammate(original, '   ', 'Europe/London');

  assert.equal(result.ok, false);
  assert.ok(result.error);
  assert.equal(result.roster, original);
});

test('addTeammate rejects an unrecognized time zone and leaves the roster unchanged', () => {
  const original = [];
  const result = addTeammate(original, 'Priya', 'Not/AZone');

  assert.equal(result.ok, false);
  assert.ok(result.error);
  assert.equal(result.roster, original);
});

test('addTeammate works on an empty roster', () => {
  const result = addTeammate([], 'Noah', 'Australia/Sydney');
  assert.equal(result.ok, true);
  assert.equal(result.roster.length, 1);
});

test('removeTeammate removes only the requested index', () => {
  const roster = [
    { name: 'A', timeZone: 'America/Los_Angeles' },
    { name: 'B', timeZone: 'Europe/London' },
    { name: 'C', timeZone: 'Australia/Sydney' },
  ];
  const result = removeTeammate(roster, 1);

  assert.deepEqual(result.map((p) => p.name), ['A', 'C']);
  assert.equal(roster.length, 3, 'original roster array must not be mutated');
});

test('removeTeammate on the last remaining teammate yields an empty roster', () => {
  const roster = [{ name: 'Solo', timeZone: 'America/Los_Angeles' }];
  assert.deepEqual(removeTeammate(roster, 0), []);
});

test('removeTeammate with an out-of-range index is a no-op', () => {
  const roster = [{ name: 'A', timeZone: 'America/Los_Angeles' }];
  assert.deepEqual(removeTeammate(roster, 5), roster);
});
