import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cellClassFor } from '../site/js/ui/heatmap.js';
import { COMFORT } from '../site/js/core/simulate.js';

test('cellClassFor maps every comfort classification to a distinct class', () => {
  assert.equal(cellClassFor(COMFORT.COMFORTABLE), 'cell-comfortable');
  assert.equal(cellClassFor(COMFORT.EARLY_OR_LATE), 'cell-early-or-late');
  assert.equal(cellClassFor(COMFORT.UNREASONABLE), 'cell-unreasonable');
});

test('cellClassFor falls back to a designed class for an unrecognized value', () => {
  assert.equal(cellClassFor('bogus'), 'cell-unknown');
});
