import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildShareUrl, decodePlanState, encodePlanState } from '../site/js/core/share.js';

const meeting = { dayOfWeek: 2, hour: 13, minute: 0, timeZone: 'America/Los_Angeles' };
const roster = [
  { name: 'Priya & Co', timeZone: 'Europe/London' },
  { name: 'Noah', timeZone: 'Australia/Sydney' },
];

test('encodePlanState preserves every meeting and roster field', () => {
  const decoded = JSON.parse(decodeURIComponent(encodePlanState(meeting, roster)));
  assert.deepEqual(decoded, { meeting, roster });
});

test('buildShareUrl adds plan state without losing an existing path', () => {
  const url = new URL(buildShareUrl('https://example.test/fair-hours/?source=demo', meeting, roster));
  assert.equal(url.pathname, '/fair-hours/');
  assert.deepEqual(JSON.parse(decodeURIComponent(url.searchParams.get('plan'))), { meeting, roster });
});

test('decodePlanState round-trips a complete plan', () => {
  const result = decodePlanState(encodePlanState(meeting, roster));
  assert.deepEqual(result, { ok: true, meeting, roster });
});

test('decodePlanState rejects absent, truncated, and invalid-zone state', () => {
  assert.equal(decodePlanState('').ok, false);
  assert.equal(decodePlanState('%7B%22meeting').ok, false);
  const invalidZone = encodeURIComponent(JSON.stringify({
    meeting: { ...meeting, timeZone: 'Mars/Olympus_Mons' }, roster,
  }));
  assert.equal(decodePlanState(invalidZone).ok, false);
});

test('decodePlanState rejects roster entries with malformed fields', () => {
  const malformed = encodeURIComponent(JSON.stringify({
    meeting,
    roster: [{ name: '   ', timeZone: 'Europe/London' }],
  }));
  assert.equal(decodePlanState(malformed).ok, false);
});

test('decodePlanState rejects duplicate zones in a shared roster', () => {
  const duplicateZones = encodeURIComponent(JSON.stringify({
    meeting,
    roster: [
      { name: 'Priya', timeZone: 'Europe/London' },
      { name: 'Sam', timeZone: 'Europe/London' },
    ],
  }));
  assert.equal(decodePlanState(duplicateZones).ok, false);
});
