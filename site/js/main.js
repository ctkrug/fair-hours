import { simulate } from './core/simulate.js';
import { buildWorstWeekCallouts } from './core/fairness.js';
import { DEMO_MEETING, DEMO_ROSTER } from './core/demo.js';
import { parseMeetingInput } from './core/meeting.js';
import { addTeammate, removeTeammate } from './core/roster.js';
import { renderHeatmap } from './ui/heatmap.js';
import { cellDetail } from './ui/heatmap.js';
import { renderCallouts } from './ui/callouts.js';
import { buildShareUrl, decodePlanState } from './core/share.js';

function initialPlan() {
  const rawPlan = new URL(window.location.href).searchParams.get('plan');
  if (!rawPlan) {
    return { meeting: DEMO_MEETING, roster: DEMO_ROSTER, notice: '' };
  }

  const decoded = decodePlanState(rawPlan);
  return decoded.ok
    ? { meeting: decoded.meeting, roster: decoded.roster, notice: '' }
    : { meeting: DEMO_MEETING, roster: DEMO_ROSTER, notice: decoded.error };
}

const plan = initialPlan();

const state = {
  meeting: plan.meeting,
  roster: plan.roster,
  selectedCell: null,
};

const heatmapEl = document.getElementById('heatmap');
const meetingForm = document.getElementById('meeting-form');
const meetingDayEl = document.getElementById('meeting-day');
const meetingTimeEl = document.getElementById('meeting-time');
const meetingTzEl = document.getElementById('meeting-tz');
const meetingTzErrorEl = document.getElementById('meeting-tz-error');
const rosterListEl = document.getElementById('roster-list');
const rosterAddForm = document.getElementById('roster-add-form');
const rosterNameEl = document.getElementById('roster-name');
const rosterTzEl = document.getElementById('roster-tz');
const rosterErrorEl = document.getElementById('roster-error');
const cellDetailEl = document.getElementById('cell-detail');
const calloutsEl = document.getElementById('callouts');
const planNoticeEl = document.getElementById('plan-notice');
const copyLinkEl = document.getElementById('copy-link');
const copyStatusEl = document.getElementById('copy-status');
let copyStatusTimer;

function populateMeetingForm() {
  meetingDayEl.value = String(state.meeting.dayOfWeek);
  meetingTimeEl.value = `${String(state.meeting.hour).padStart(2, '0')}:${String(state.meeting.minute).padStart(2, '0')}`;
  meetingTzEl.value = state.meeting.timeZone;
}

function updateShareUrl() {
  window.history.replaceState({}, '', buildShareUrl(window.location.href, state.meeting, state.roster));
}

function showCopyStatus(message, isError = false) {
  window.clearTimeout(copyStatusTimer);
  copyStatusEl.textContent = message;
  copyStatusEl.classList.toggle('is-error', isError);
  copyLinkEl.classList.toggle('is-confirmed', !isError);
  copyLinkEl.textContent = isError ? 'Copy share link' : 'Copied link';
  copyStatusTimer = window.setTimeout(() => {
    copyStatusEl.textContent = '';
    copyStatusEl.classList.remove('is-error');
    copyLinkEl.classList.remove('is-confirmed');
    copyLinkEl.textContent = 'Copy share link';
  }, 3000);
}

async function copyShareLink() {
  if (!navigator.clipboard?.writeText) {
    showCopyStatus('Copying is unavailable in this browser. Copy the address bar URL instead.', true);
    return;
  }

  try {
    const shareUrl = buildShareUrl(window.location.href, state.meeting, state.roster);
    await navigator.clipboard.writeText(shareUrl);
    showCopyStatus('Share link copied.');
  } catch (error) {
    showCopyStatus('Could not copy the link. Copy the address bar URL instead.', true);
  }
}

function render() {
  const result = simulate(state.meeting, state.roster);
  renderHeatmap(heatmapEl, result, {
    selectedCell: state.selectedCell,
    onCellSelect: showCellDetail,
  });
  renderCallouts(calloutsEl, buildWorstWeekCallouts(result, state.meeting.timeZone), selectCallout);
  renderRosterList();
}

function showCellDetail({ person, week }) {
  cellDetailEl.textContent = cellDetail(person, week);
}

function selectCallout(callout) {
  state.selectedCell = { personIndex: callout.personIndex, weekIndex: callout.weekIndex };
  showCellDetail(callout);
  render();
  const cell = heatmapEl.querySelector(
    `[data-person-index="${callout.personIndex}"][data-week-index="${callout.weekIndex}"]`
  );
  cell?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  cell?.focus({ preventScroll: true });
}

function renderRosterList() {
  rosterListEl.innerHTML = '';

  if (state.roster.length === 0) {
    const empty = document.createElement('li');
    empty.className = 'roster-empty';
    empty.textContent = 'No teammates yet — add one below.';
    rosterListEl.appendChild(empty);
    return;
  }

  state.roster.forEach((person, index) => {
    const item = document.createElement('li');
    item.className = 'roster-item';

    const label = document.createElement('span');
    label.className = 'roster-item-label';
    label.textContent = `${person.name} — ${person.timeZone}`;
    item.appendChild(label);

    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'btn btn-remove';
    removeBtn.textContent = 'Remove';
    removeBtn.setAttribute('aria-label', `Remove ${person.name}`);
    removeBtn.addEventListener('click', () => {
      state.roster = removeTeammate(state.roster, index);
      state.selectedCell = null;
      updateShareUrl();
      render();
    });
    item.appendChild(removeBtn);

    rosterListEl.appendChild(item);
  });
}

function handleMeetingInputChange() {
  const [hour, minute] = meetingTimeEl.value.split(':');
  const result = parseMeetingInput({
    dayOfWeek: meetingDayEl.value,
    hour,
    minute,
    timeZone: meetingTzEl.value,
  });

  if (!result.ok) {
    meetingTzErrorEl.textContent = result.error;
    return;
  }

  meetingTzErrorEl.textContent = '';
  state.meeting = result.meeting;
  state.selectedCell = null;
  updateShareUrl();
  render();
}

function handleRosterAddSubmit(event) {
  event.preventDefault();
  const result = addTeammate(state.roster, rosterNameEl.value, rosterTzEl.value);

  if (!result.ok) {
    rosterErrorEl.textContent = result.error;
    return;
  }

  rosterErrorEl.textContent = '';
  state.roster = result.roster;
  state.selectedCell = null;
  rosterNameEl.value = '';
  rosterTzEl.value = '';
  updateShareUrl();
  render();
}

meetingForm.addEventListener('input', handleMeetingInputChange);
rosterAddForm.addEventListener('submit', handleRosterAddSubmit);
copyLinkEl.addEventListener('click', copyShareLink);

populateMeetingForm();
planNoticeEl.textContent = plan.notice;
render();
