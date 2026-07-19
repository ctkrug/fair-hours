// Renders the fairness heatmap: one row per roster member, one column per
// simulated week. The color-per-classification mapping is a pure function
// so a threshold change alone changes what's on screen (BACKLOG.md 1.4).

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

function formatLocalTime(local) {
  const hour12 = ((local.hour + 11) % 12) + 1;
  const suffix = local.hour < 12 ? 'AM' : 'PM';
  return `${hour12}:${String(local.minute).padStart(2, '0')} ${suffix}`;
}

function cellTitle(person, week) {
  const { local, classification } = week;
  const weekday = WEEKDAY_LABELS[new Date(Date.UTC(local.year, local.month - 1, local.day)).getUTCDay()];
  return `${person.name} — ${weekday} ${local.month}/${local.day}, ${formatLocalTime(local)} (${classification.replace(/-/g, ' ')})`;
}

/**
 * Render the heatmap grid into `container`, replacing any previous content.
 * `simulationResult` is the array returned by `simulate()`.
 */
export function renderHeatmap(container, simulationResult) {
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

  simulationResult.forEach((person) => {
    const row = document.createElement('div');
    row.className = 'heatmap-row';

    const label = document.createElement('span');
    label.className = 'heatmap-row-label';
    label.textContent = person.name;
    row.appendChild(label);

    const cells = document.createElement('div');
    cells.className = 'heatmap-cells';
    person.weeks.forEach((week) => {
      const cell = document.createElement('span');
      cell.className = `heatmap-cell ${cellClassFor(week.classification)}`;
      cell.title = cellTitle(person, week);
      cells.appendChild(cell);
    });
    row.appendChild(cells);

    grid.appendChild(row);
  });

  container.appendChild(grid);
}
