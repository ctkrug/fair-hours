# Vision — Fair Hours

## The problem

Time zone converters answer "what time is it there right now" — a single
instant. But the question that actually matters for a team is different:
**is this *recurring* meeting fair across the whole year it will run?**

It usually isn't, and nobody notices, because:

- Daylight saving transitions happen on different calendar dates in different
  countries (US: early March / early November; UK: late March / late
  October; most of the world: never).
- The Southern Hemisphere shifts its clocks in the *opposite* direction at
  the *opposite* time of year — Australia springs forward in October, not
  March.
- A meeting time that's comfortable in January can silently become a 6am or
  11pm call for one teammate by June, purely because two time zones' DST
  windows stopped overlapping the way they did when the meeting was scheduled.

Every general-purpose scheduling tool (Calendly, World Clock, "time zone
converter" web search widgets) answers the single-moment question. None of
them simulate a recurring meeting across a full year and flag *when* it goes
wrong and *why*.

## Who it's for

Distributed teams and managers who set up a recurring meeting once and never
revisit it — the person most likely to eat the bad time slot is rarely the
person scheduling the meeting, so nobody in the room has a reason to notice.
Also useful for anyone negotiating a standing time across zones before
committing to it.

## The core idea

Given:
- a recurring meeting definition (day of week, local start time, organizer's
  IANA time zone), and
- a roster of teammates (name + IANA time zone),

Fair Hours walks every occurrence of that meeting across the next 52 weeks,
resolves each teammate's local wall-clock time for that specific date using
real IANA tz rules (not a fixed UTC offset), classifies each occurrence as
comfortable / early-or-late / unreasonable per teammate, and renders the
result as a heatmap: one row per teammate, one column per week. Weeks where
someone crosses into "unreasonable" are called out explicitly, with the
reason (which zone's DST transition caused it).

## Key design decisions

- **Simulate the year, don't snapshot a moment.** The entire value of the
  tool is in walking 52 real occurrences and re-resolving each one — a
  shortcut that only checks "now" and "now + 6 months" would miss transition
  weeks that fall in between.
- **Trust the platform's tz database, don't hand-roll DST rules.** DST rules
  change (governments change transition dates); reimplementing them is a
  maintenance trap and a correctness risk. `Intl.DateTimeFormat` with a
  `timeZone` option resolves against the browser/Node's IANA tzdata, which
  gets updated independent of this app's release cycle.
- **No backend, no build step.** The entire computation is deterministic
  client-side math over public tz data — there's nothing for a server to do,
  and shipping it as static files means it's trivially hostable anywhere,
  including as a link that encodes full state in the URL for sharing.
- **Fairness is per-person, not average.** A tool that optimizes for the
  *average* comfort across the team can still bless a schedule that's always
  terrible for one specific person. Fair Hours reports per-teammate,
  per-week results — it never collapses the team into a single score.

## What "v1 done" looks like

- A user can enter a recurring meeting (day, time, organizer zone) and add/
  remove teammates by name + IANA zone.
- The app simulates all 52 occurrences and renders a full-year heatmap,
  correctly reflecting asymmetric hemisphere DST shifts (verified against at
  least one Northern/Southern hemisphere pair).
- The worst weeks per teammate are called out with the specific reason
  (which zone transitioned and when).
- The full plan (meeting + roster) round-trips through a shareable URL.
- The page is a polished, single-brand static site deployable to
  `apps.charliekrug.com/fair-hours` with no server and no leading-slash
  asset paths.
- Invalid input (bad time zone, malformed URL state) fails gracefully with
  an inline message, never a blank page or console-only error.
