import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  cellClassFor, cellDetail, isSelectedCell, nextCellCoordinates,
} from '../site/js/ui/heatmap.js';
import { COMFORT } from '../site/js/core/simulate.js';

test('cellClassFor maps every comfort classification to a distinct class', () => {
  assert.equal(cellClassFor(COMFORT.COMFORTABLE), 'cell-comfortable');
  assert.equal(cellClassFor(COMFORT.EARLY_OR_LATE), 'cell-early-or-late');
  assert.equal(cellClassFor(COMFORT.UNREASONABLE), 'cell-unreasonable');
});

test('cellClassFor falls back to a designed class for an unrecognized value', () => {
  assert.equal(cellClassFor('bogus'), 'cell-unknown');
});

test('cellDetail exposes exact local date, time, and classification text', () => {
  assert.equal(cellDetail(
    { name: 'Avery' },
    { local: { year: 2026, month: 3, day: 10, hour: 6, minute: 5 }, classification: COMFORT.UNREASONABLE }
  ), 'Avery — Tue 3/10/2026, 6:05 AM (unreasonable)');
});

test('nextCellCoordinates follows arrows and clamps at every grid boundary', () => {
  assert.deepEqual(nextCellCoordinates(1, 2, 3, 4, 'ArrowUp'), { row: 0, week: 2 });
  assert.deepEqual(nextCellCoordinates(0, 0, 3, 4, 'ArrowUp'), { row: 0, week: 0 });
  assert.deepEqual(nextCellCoordinates(2, 3, 3, 4, 'ArrowRight'), { row: 2, week: 3 });
  assert.equal(nextCellCoordinates(1, 1, 3, 4, 'Enter'), null);
});

test('isSelectedCell matches only the active heatmap coordinates', () => {
  const selected = { personIndex: 1, weekIndex: 2 };
  assert.equal(isSelectedCell(selected, 1, 2), true);
  assert.equal(isSelectedCell(selected, 1, 3), false);
  assert.equal(isSelectedCell(null, 1, 2), false);
});
