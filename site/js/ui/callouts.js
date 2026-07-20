import { comfortLabel, formatLocalTime } from '../core/fairness.js';

/** Return the compact, scannable sentence displayed for a worst-week callout. */
export function calloutSummary(callout) {
  return `${callout.person.name}: ${formatLocalTime(callout.week.local)} · ${comfortLabel(callout.week.classification)} · ${callout.transitionText}`;
}

/** Render ranked DST callouts and relay their selection to the application. */
export function renderCallouts(container, callouts, onSelect) {
  container.innerHTML = '';
  if (callouts.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'callouts-empty';
    empty.textContent = 'No DST shift makes this meeting worse in the next 52 weeks.';
    container.appendChild(empty);
    return;
  }

  callouts.forEach((callout) => {
    const item = document.createElement('li');
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'callout';
    button.dataset.personIndex = String(callout.personIndex);
    button.dataset.weekIndex = String(callout.weekIndex);
    const severity = document.createElement('strong');
    severity.textContent = `${callout.severity} min outside comfort`;
    const summary = document.createElement('span');
    summary.textContent = calloutSummary(callout);
    button.append(severity, summary);
    button.addEventListener('click', () => onSelect?.(callout));
    item.appendChild(button);
    container.appendChild(item);
  });
}
