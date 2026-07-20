// Renders the fairness heatmap: one row per roster member, one column per
// simulated week. The color-per-classification mapping is a pure function
// so a threshold change alone changes what's on screen (BACKLOG.md 1.4).

import { comfortLabel, formatLocalTime } from '../core/fairness.js';
import { COMFORT } from '../core/simulate.js';

const CELL_CLASS_BY_COMFORT = {
  [COMFORT.COMFORTABLE]: 'cell-comfortable',
  [COMFORT.EARLY_OR_LATE]: 'cell-early-or-late',
  [COMFORT.UNREASONABLE]: 'cell-unreasonable',
};

/** Map a comfort classification to its heatmap cell CSS class. */
export function cellClassFor(classification) {
  return CELL_CLASS_BY_COMFORT[classification] ?? 'cell-unknown';
}

const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/** Return the exact local date, time, and comfort classification for a cell. */
export function cellDetail(person, week) {
  const { local, classification } = week;
  const weekday = WEEKDAY_LABELS[new Date(Date.UTC(local.year, local.month - 1, local.day)).getUTCDay()];
  return `${person.name} — ${weekday} ${local.month}/${local.day}/${local.year}, ${formatLocalTime(local)} (${comfortLabel(classification)})`;
}

/** Calculate the next keyboard target, clamping at the heatmap's edges. */
export function nextCellCoordinates(row, week, rowCount, weekCount, key) {
  const movement = {
    ArrowUp: [-1, 0], ArrowDown: [1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1],
  }[key];
  if (!movement) return null;
  return {
    row: Math.max(0, Math.min(rowCount - 1, row + movement[0])),
    week: Math.max(0, Math.min(weekCount - 1, week + movement[1])),
  };
}

/**
 * Render the heatmap grid into `container`, replacing any previous content.
 * `simulationResult` is the array returned by `simulate()`.
 */
export function renderHeatmap(container, simulationResult, options = {}) {
  const { onCellSelect, selectedCell } = options;
  container.innerHTML = '';

  if (simulationResult.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'heatmap-empty';
    empty.textContent = 'Add a teammate to see the fairness heatmap.';
    container.appendChild(empty);
    return;
  }

  const weekCount = simulationResult[0].weeks.length;
  const grid = document.createElement('div');
  grid.className = 'heatmap-grid';
  grid.style.setProperty('--week-count', String(weekCount));

  simulationResult.forEach((person, personIndex) => {
    const row = document.createElement('div');
    row.className = 'heatmap-row';

    const label = document.createElement('span');
    label.className = 'heatmap-row-label';
    label.textContent = person.name;
    row.appendChild(label);

    const cells = document.createElement('div');
    cells.className = 'heatmap-cells';
    person.weeks.forEach((week, weekIndex) => {
      const cell = document.createElement('button');
      cell.type = 'button';
      cell.className = `heatmap-cell ${cellClassFor(week.classification)}`;
      cell.dataset.personIndex = String(personIndex);
      cell.dataset.weekIndex = String(weekIndex);
      cell.setAttribute('aria-label', cellDetail(person, week));
      cell.setAttribute('aria-pressed', String(
        selectedCell?.personIndex === personIndex && selectedCell?.weekIndex === weekIndex
      ));
      if (selectedCell?.personIndex === personIndex && selectedCell?.weekIndex === weekIndex) {
        cell.classList.add('is-selected');
      }
      const select = () => onCellSelect?.({ personIndex, weekIndex, person, week, source: 'cell' });
      cell.addEventListener('click', select);
      cell.addEventListener('focus', select);
      cell.addEventListener('keydown', (event) => {
        const next = nextCellCoordinates(
          personIndex, weekIndex, simulationResult.length, weekCount, event.key
        );
        if (!next) return;
        event.preventDefault();
        grid.querySelector(
          `[data-person-index="${next.row}"][data-week-index="${next.week}"]`
        )?.focus();
      });
      cells.appendChild(cell);
    });
    row.appendChild(cells);

    grid.appendChild(row);
  });

  container.appendChild(grid);
}
