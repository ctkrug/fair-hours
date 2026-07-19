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

Enter a recurring Tuesday 9am PT meeting with teammates in London and Sydney. Fair
Hours renders a full-year heatmap showing each teammate's local start time per week —
and lights up the exact weeks each spring/fall where one person silently gets a 6am
or 11pm call, because Australia's DST clock moves opposite the Northern Hemisphere's.

## Planned features

- **Recurring meeting input** — day of week, local start time, organizer IANA time zone.
- **Teammate roster** — name + IANA time zone, add/remove freely.
- **Full-year simulation** — walks every occurrence of the recurring meeting across 52
  weeks, resolving each teammate's local time with the correct UTC offset for that
  specific date (not a single snapshot).
- **Asymmetric DST awareness** — correctly handles hemispheres that shift on different
  dates and in opposite directions, plus zones with no DST at all.
- **Fairness heatmap** — one row per teammate, one column per week, colored by how
  reasonable that local time is (comfortable / early-or-late / unreasonable).
- **Worst-week callouts** — a ranked list of the weeks and people most affected, with
  the local time and the reason (e.g. "UK springs forward before the US").
- **Shareable, no backend** — everything runs client-side against the IANA time zone
  database; state is encodable in the URL so a plan can be shared with a link.

## Stack

Vanilla JavaScript (ES modules, no framework), using the browser's built-in
[`Intl`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl)
APIs for IANA time zone database access — no bundler required to run it, no server
required to host it. A minimal Node-based test runner exercises the time zone math
in CI.

## Status

Early scaffold — see [`docs/VISION.md`](docs/VISION.md) for the full design and
[`docs/BACKLOG.md`](docs/BACKLOG.md) for the build plan.

## License

MIT — see [`LICENSE`](LICENSE).
