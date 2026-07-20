import { test } from 'node:test';
import assert from 'node:assert/strict';
import { calloutSummary } from '../site/js/ui/callouts.js';
import { COMFORT } from '../site/js/core/simulate.js';

test('calloutSummary combines teammate, exact time, classification, and DST cause', () => {
  assert.equal(calloutSummary({
    person: { name: 'Sam' },
    week: { local: { hour: 5, minute: 30 }, classification: COMFORT.UNREASONABLE },
    transitionText: 'Australia/Sydney DST starts Oct 4',
  }), 'Sam: 5:30 AM · unreasonable · Australia/Sydney DST starts Oct 4');
});
