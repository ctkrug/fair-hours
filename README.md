# Fair Hours

Paste a recurring meeting time and everyone's time zone, and see whose local time is
quietly worst across a full year — including every daylight-saving shift most tools ignore.

## The problem

Meeting-time tools ("What time is 9am PT in London?") answer a single moment. But
recurring meetings don't live in a single moment — they live across a year, and time
zones don't shift together. When the US, UK, and Australia move their clocks on three
different dates (and Australia moves the *opposite direction*), a meeting that's fair
in March can quietly become a 6am or 11pm call for one teammate by October, and nobody
notices until they complain.

Fair Hours takes a recurring meeting — day of week, local time, and organizer time
zone — plus a roster of teammates' time zones, and simulates every occurrence across
a full year. It surfaces the exact weeks where the meeting time is unreasonable for
someone, and why (a DST transition, not just "bad luck").

## The wow moment

Load the page and it's already filled in: a recurring Tuesday 1pm PT meeting with
teammates in London and Sydney. Fair Hours renders a full-year heatmap showing each
teammate's local start time per week — and the Sydney row swings from comfortable in
January to unreasonable by mid-year, purely because Australia's DST clock moves
opposite the Northern Hemisphere's, while London separately crosses its own comfort
boundary on the UK's own March/October transition weeks.

## Features

- **Recurring meeting input** — day of week, local start time, organizer IANA time
  zone. Editing any field re-simulates and re-renders instantly, no reload.
- **Teammate roster** — add/remove by name + IANA time zone; an inline error shows
  for an unrecognized zone or empty name instead of a blank page.
- **Full-year simulation** — walks every occurrence of the recurring meeting across 52
  weeks, resolving each teammate's local time with the correct UTC offset for that
  specific date (not a single snapshot).
- **Asymmetric DST awareness** — correctly handles hemispheres that shift on different
  dates and in opposite directions, plus zones with no DST at all.
- **Fairness heatmap** — one row per teammate, one column per week, colored by how
  reasonable that local time is (comfortable / early-or-late / unreasonable).

## Running it

No build step — open `site/index.html` directly, or serve the `site/` directory with
any static file server (e.g. `npx serve site`).

```
npm test   # run the test suite
npm run lint  # syntax-check every JS file
```

## Stack

Vanilla JavaScript (ES modules, no framework), using the browser's built-in
[`Intl`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl)
APIs for IANA time zone database access — no bundler required to run it, no server
required to host it. A minimal Node-based test runner exercises the time zone math
in CI.

## Status

Core simulation, editable meeting/roster, and the fairness heatmap are built and
working end to end (Epic 1) — see [`docs/VISION.md`](docs/VISION.md) for the full
design and [`docs/BACKLOG.md`](docs/BACKLOG.md) for what's next (worst-week callouts,
shareable URLs, hardening).

## License

MIT — see [`LICENSE`](LICENSE).
