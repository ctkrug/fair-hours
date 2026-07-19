// The pre-filled wow-moment scenario: a recurring meeting comfortable for
// its Pacific-time organizer that quietly turns unreasonable for London and
// Sydney teammates on different weeks, because the UK and Australia shift
// their clocks on different dates in different directions. Loads with no
// input required so the fairness heatmap is visible immediately.

export const DEMO_MEETING = {
  dayOfWeek: 2, // Tuesday
  hour: 13,
  minute: 0,
  timeZone: 'America/Los_Angeles',
};

export const DEMO_ROSTER = [
  { name: 'You (organizer)', timeZone: 'America/Los_Angeles' },
  { name: 'Priya — London', timeZone: 'Europe/London' },
  { name: 'Noah — Sydney', timeZone: 'Australia/Sydney' },
];
