# Backlog — Fair Hours

Stories are grouped into epics and marked `[ ]` (not started). Every story has
concrete, checkable acceptance criteria — no "works well" vibes checks.

## Epic 1 — Core simulation & the wow moment

- [x] **1.1 — [WOW MOMENT] Full-year fairness heatmap for the demo meeting.**
  Simulate all 52 occurrences of a recurring Tuesday 1:00 PM PT meeting for
  the organizer plus a London and a Sydney teammate, using `Intl`-backed
  IANA tz rules (not fixed offsets), and render the result as a heatmap.
  - The page loads with this three-person demo pre-filled — no input
    required to see the result.
  - The heatmap renders 3 rows × 52 week columns, each cell computed from a
    real per-date tz resolution (not a single average offset).
  - At least one week is flagged "unreasonable" for the Sydney teammate via
    Australia's October/November DST shift, and at least one week is flagged
    for the London teammate via the UK's March/October shift — on different
    calendar weeks from each other, visibly distinguishable on the heatmap.
  - **Note:** the original draft said "9am PT" — simulating the actual year
    showed that time never pushes London past the comfort threshold (the US
    and UK shift clocks in near lockstep, so their relative offset barely
    moves). 1:00 PM PT is the demo time that actually exercises both
    hemispheres' asymmetric shifts; see `docs/ARCHITECTURE.md` and the
    `simulate.test.js` wow-moment test for the verified specifics.

- [x] **1.2 — Editable recurring-meeting input.**
  Replace the hardcoded demo meeting with a form: day of week, local start
  time, organizer IANA time zone.
  - Changing any field re-runs the simulation and re-renders the heatmap
    without a page reload.
  - Entering an unrecognized time zone string shows an inline error message
    next to the field; it does not throw to the console or blank the page.

- [x] **1.3 — Editable teammate roster.**
  Add/remove teammates by name + IANA time zone.
  - Adding a teammate adds a corresponding heatmap row within one
    simulation cycle.
  - Removing a teammate removes their row.
  - Removing every teammate shows a designed empty state, not a crash or a
    blank heatmap card.

- [x] **1.4 — Comfort classification engine.**
  Classify each simulated occurrence per teammate as comfortable /
  early-or-late / unreasonable using explicit local-hour thresholds.
  - Thresholds are defined as named constants (not magic numbers scattered
    in render code) and covered by a unit test per boundary (e.g. 06:59 vs
    07:00 local).
  - The heatmap cell color is a pure function of the classification, so a
    threshold change alone changes the rendered colors.

- [x] **1.5 — Design polish: demo, form, roster, heatmap.**
  Apply `docs/DESIGN.md` tokens and layout intent to everything shipped in
  this epic.
  - Verified at 390px, 768px, and 1440px widths per the design standard's
    self-review checklist: no horizontal scroll of the page itself, no
    overlapping controls, heatmap card fills ≥60% of desktop viewport width.
  - Every form control (text input, time input, zone input, add/remove
    buttons) has a themed hover, focus-visible, and active state — no naked
    native widgets.

## Epic 2 — Fairness detail & explainability

- [ ] **2.1 — Worst-week callout list.**
  Below the heatmap, list the worst weeks ranked by severity, each showing
  the affected teammate, the local time that week, and which zone's DST
  transition caused it.
  - List is sorted worst-first by a documented severity metric (e.g.
    distance from the comfortable window in minutes).
  - Each callout names a specific transition (e.g. "Australia/Sydney DST
    starts Oct 4") rather than a generic "time zone difference" message.

- [ ] **2.2 — Callout-to-heatmap linking.**
  Selecting a callout highlights and scrolls to the matching heatmap cell.
  - Works via mouse click and via keyboard (Enter/Space) on a focused
    callout.
  - The highlighted cell is visually distinct (not just a color already used
    for classification) and clears when a different callout is selected.

- [ ] **2.3 — Per-cell hover/focus detail.**
  Hovering or keyboard-focusing any heatmap cell shows the exact local date,
  time, and comfort classification for that teammate/week.
  - Reachable by keyboard alone (Tab/arrow navigation through cells), not
    mouse-only.
  - Detail content is exposed to assistive tech (not a mouse-only CSS
    tooltip with no accessible equivalent).

- [ ] **2.4 — Design polish: callouts & cell detail.**
  Apply DESIGN.md tokens/motion to the new UI from this epic.
  - Hover/focus/active transitions measured at 120–250ms ease-out.
  - Squint test: callout severity ranking is visually scannable without
    reading every line (color/weight hierarchy, not just list order).

## Epic 3 — Sharing, validation & ship polish

- [ ] **3.1 — Shareable URL state.**
  Encode the full meeting + roster into the URL (e.g. query string or hash)
  so a link fully reproduces a plan.
  - Loading a URL with valid encoded state renders that exact meeting/roster
    with no additional input.
  - Round-trip test: encode a plan, decode it, and confirm the decoded plan
    equals the original (day, time, organizer zone, every teammate).

- [ ] **3.2 — Copy-link control.**
  A themed "copy link" action that copies the current shareable URL.
  - Button shows a themed hover/focus/active state and a confirmation
    (e.g. "Copied") that clears after a few seconds.
  - Falls back gracefully (visible error state) if the Clipboard API is
    unavailable, rather than failing silently.

- [ ] **3.3 — Input validation & graceful failure.**
  Harden against malformed input: bad URL state, invalid time zone strings,
  empty/whitespace teammate names, duplicate zones.
  - A malformed URL state (truncated, garbage, or an unknown tz inside it)
    falls back to the demo plan with a visible inline notice, never a blank
    page.
  - All validation is covered by unit tests with at least one deliberately
    malformed input per validated field.

- [ ] **3.4 — Final responsive, accessibility, and design self-review.**
  Full pass against the design standard's D3 checklist before this project
  can close out.
  - Verified at 390×844, 768×1024, and 1440×900: composed, no dead space,
    no overlap, no horizontal scroll.
  - Keyboard-only pass: every control reachable and operable in a sane tab
    order, with a visible focus indicator throughout.
  - Status/error messages use an `aria-live` region so screen readers
    announce them without a page reload.
