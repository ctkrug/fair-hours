# Architecture — Fair Hours

Static site, vanilla ES modules, zero build step. Everything under `site/`
is served as-is; `test/` runs against the same source with Node's built-in
test runner.

## Module map

```
site/
  index.html            entry point: form + roster rail, heatmap card
  css/styles.css         all styling (tokens from docs/DESIGN.md)
  favicon.svg
  js/
    main.js              DOM glue: holds state, wires events, calls render()
    core/
      simulate.js         time zone math -- the correctness-critical core
      demo.js              pre-filled wow-moment meeting + roster
      meeting.js           parses/validates raw meeting-form input
      roster.js            pure add/remove roster operations
      validation.js        shared name/time-zone field validation
    ui/
      heatmap.js           renders the fairness heatmap grid into the DOM
test/
  simulate.test.js, meeting.test.js, roster.test.js,
  validation.test.js, heatmap.test.js
```

## Data flow

1. `main.js` seeds `state = { meeting, roster }` from `core/demo.js` so the
   heatmap renders immediately with no input (the wow moment).
2. `render()` calls `simulate(state.meeting, state.roster)`
   (`core/simulate.js`), then `renderHeatmap(container, result)`
   (`ui/heatmap.js`).
3. Editing the meeting form or roster never mutates `state` directly: raw
   input goes through `parseMeetingInput` / `addTeammate`, which return
   `{ ok: true, ... }` or `{ ok: false, error }`. `main.js` only updates
   `state` and re-renders on `ok: true`; on failure it writes `error` into
   the adjacent `.field-error` element and leaves `state` (and the
   heatmap) untouched. Bad input never reaches the DST math or blanks the
   page.

## The core simulation (`core/simulate.js`)

The whole product depends on converting between "a recurring wall-clock
time in one IANA zone" and "a real UTC instant," across a full year of
that zone's own DST changes -- Node/browser `Intl` only exposes the
opposite direction (instant → local wall time), so:

- `localTimeInZone(utcDate, timeZone)` -- instant → local wall-clock parts,
  via `Intl.DateTimeFormat.formatToParts`.
- `zonedTimeToUtc(year, month, day, hour, minute, timeZone)` -- inverts
  that: guesses the UTC instant assuming zero offset, reads back the
  offset `Intl` actually applies at that guess, and corrects for it (twice,
  to handle the guess itself landing on the wrong side of a transition).
- `generateOccurrences(meeting, { weeks, startDate })` -- finds the next
  matching weekday/time in the organizer's zone, then steps 7 *calendar*
  days at a time (never a fixed 7×24h UTC offset) and re-resolves each one
  through `zonedTimeToUtc`, so the organizer's own DST shifts are reflected
  too.
- `classifyHour(hour)` -- maps a local hour to `comfortable` /
  `early-or-late` / `unreasonable` via four named threshold constants
  (07:00, 08:00, 18:00, 21:00).
- `simulate(meeting, roster, options)` -- runs `generateOccurrences` once,
  then resolves every occurrence into each roster member's own local time
  and classification. Results stay per-person; nothing is averaged.

## The demo scenario (`core/demo.js`)

A Tuesday 1:00 PM organizer meeting in `America/Los_Angeles`, with
teammates in `Europe/London` and `Australia/Sydney`. This specific time was
chosen by simulating the actual year, not picked arbitrarily: a literal
9am PT meeting (as originally drafted) never pushes London past the
comfort threshold, because the US and UK shift clocks in near lockstep.
1:00 PM PT is the smallest realistic change that makes both hemisphere
asymmetries visible -- see the `simulate.test.js` test
`"simulate reveals the wow moment"` for the verified specifics (Sydney
swings from comfortable in January to unreasonable after Australia's April
fallback; London separately crosses its own comfort boundary during the
UK's March/October transitions, on different weeks).

## Rendering (`ui/heatmap.js`)

`cellClassFor(classification)` is a pure lookup table from classification
to CSS class -- the only place color is decided, so a threshold change in
`simulate.js` alone changes what's on screen. `renderHeatmap` is the only
DOM-touching function; it rebuilds the grid from scratch on every call
(no incremental diffing -- the data set is small enough that this is not a
performance concern).

## Running things

- Tests: `npm test` (`node --test test/`). No DOM in the test environment,
  so DOM-building code (`renderHeatmap`, `main.js`) stays a thin, mostly
  unit-tested pure core plus a small untested glue layer -- verified by
  manual smoke-testing with a minimal in-memory DOM stub during
  development, not by an automated test.
- Lint: `npm run lint` (`node --check` on every JS file).
- Serve locally: any static file server rooted at `site/` (e.g.
  `npx serve site`); there is no build step. All asset references are
  relative (`./css/styles.css`, `js/main.js`) via `<base href="./" />` so
  the same build works at a root domain or a subpath like
  `apps.charliekrug.com/fair-hours/`.
