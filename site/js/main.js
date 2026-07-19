import { simulate } from './core/simulate.js';
import { DEMO_MEETING, DEMO_ROSTER } from './core/demo.js';
import { parseMeetingInput } from './core/meeting.js';
import { addTeammate, removeTeammate } from './core/roster.js';
import { renderHeatmap } from './ui/heatmap.js';

const state = {
  meeting: DEMO_MEETING,
  roster: DEMO_ROSTER,
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

function render() {
  const result = simulate(state.meeting, state.roster);
  renderHeatmap(heatmapEl, result);
  renderRosterList();
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
  rosterNameEl.value = '';
  rosterTzEl.value = '';
  render();
}

meetingForm.addEventListener('input', handleMeetingInputChange);
rosterAddForm.addEventListener('submit', handleRosterAddSubmit);

render();
