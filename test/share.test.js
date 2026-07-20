import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildShareUrl, encodePlanState } from '../site/js/core/share.js';

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
