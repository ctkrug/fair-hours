// URL-safe serialization for a complete Fair Hours plan. Keeping this pure
// makes a shared plan portable and lets UI code handle failures deliberately.

import { parseMeetingInput } from './meeting.js';
import { addTeammate } from './roster.js';

/** Return a query-string value that contains the meeting and full roster. */
export function encodePlanState(meeting, roster) {
  return encodeURIComponent(JSON.stringify({ meeting, roster }));
}

/** Build a relative share URL that remains valid when served from a subpath. */
export function buildShareUrl(locationHref, meeting, roster) {
  const url = new URL(locationHref);
  url.searchParams.set('plan', encodePlanState(meeting, roster));
  return url.href;
}

/** Decode and validate a plan parameter, returning a designed error on bad links. */
export function decodePlanState(rawState) {
  if (!rawState) {
    return { ok: false, error: 'This shared plan is missing its schedule details.' };
  }

  let decoded;
  try {
    decoded = JSON.parse(decodeURIComponent(rawState));
  } catch (error) {
    return { ok: false, error: 'This shared plan is malformed. The demo has been restored.' };
  }

  const rawMeeting = decoded?.meeting;
  const meetingResult = parseMeetingInput(rawMeeting);
  if (!meetingResult.ok || !Array.isArray(decoded?.roster)) {
    return { ok: false, error: 'This shared plan is invalid. The demo has been restored.' };
  }

  let roster = [];
  for (const person of decoded.roster) {
    const teammateResult = addTeammate(roster, person?.name, person?.timeZone);
    if (!teammateResult.ok) {
      return { ok: false, error: 'This shared plan is invalid. The demo has been restored.' };
    }
    roster = teammateResult.roster;
  }

  return { ok: true, meeting: meetingResult.meeting, roster };
}
