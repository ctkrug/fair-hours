# Design direction — Fair Hours

## Aesthetic direction

**Blueprint/technical.** Fair Hours is an engineering instrument for a precise
problem (clock math across a year of DST transitions), not a lifestyle app — the
UI should read like a drafting table: a deep blueprint-navy canvas, cyan
grid-paper lines, crisp monospace data, and annotations that look hand-ruled.
This is a deliberate departure from the "dark gray cards + one accent" default,
and from the soft/glassy or playful-toy directions that fit consumer scheduling
apps better than a diagnostic tool.

## Tokens

| Token | Value | Use |
|---|---|---|
| `--bg` | `#0b1826` | page background — deep blueprint navy |
| `--surface-1` | `#122536` | panels (roster, controls) |
| `--surface-2` | `#182f45` | raised panels (heatmap card, callouts) |
| `--grid-line` | `#1c3a52` | faint blueprint grid overlay on `--bg` |
| `--text` | `#eaf4fb` | primary text |
| `--text-muted` | `#8fb0c4` | secondary/help text |
| `--accent` | `#4fd6e8` | cyan — primary interactive accent, "ink" of the blueprint |
| `--accent-support` | `#f2a65a` | amber — draws the eye to worst-hour callouts only |
| `--success` | `#63d69a` | comfortable-hour heatmap cells |
| `--danger` | `#ef5b6f` | unreasonable-hour heatmap cells |
| `--font-display` | `"JetBrains Mono", ui-monospace, "SF Mono", Consolas, monospace` | wordmark, headings, all numeric/time data |
| `--font-ui` | `"Inter", system-ui, -apple-system, sans-serif` | body copy, labels, form controls |
| `--space` | 4px base scale (4/8/12/16/24/32/48/64) | all spacing |
| `--radius` | `4px` controls, `8px` panels | blueprint corners are square-ish, not pill-soft |
| `--shadow` | `0 0 0 1px var(--grid-line), 0 8px 24px rgba(0,0,0,0.35)` | panel elevation — a ruled edge, not a soft drop shadow |
| motion | UI transitions 150–200ms ease-out; heatmap cell reveal 90ms stagger per column | quick, mechanical — like a plotter drawing |

Both fonts load from Google Fonts (`JetBrains Mono`, `Inter`) with the system
stacks above as fallback.

## Layout intent

The **fairness heatmap** is the hero: one row per teammate, one column per week
of the year, each cell colored by how reasonable that teammate's local start
time is that week. On desktop (1440×900) the heatmap card occupies the
majority of the viewport width, with a slim left rail for the meeting-input
form (day/time/organizer zone) and roster (name + IANA zone, add/remove) above
it, and a "worst weeks" callout list below the heatmap. On phone (390×844) the
form and roster stack first, the heatmap scrolls horizontally within its own
card (weeks on the x-axis, sticky teammate-name column), and callouts follow.
No dead background: the blueprint grid-line texture fills unused space instead
of empty color.

## Signature detail

The wordmark "Fair Hours" is set in the mono display font with the two words
kerned tight and a small ruled underline tick beneath "Hours" in `--accent`,
like a dimension line on a technical drawing — echoed at smaller scale as the
favicon (a monogram "FH" inside a dimension-line bracket, cyan on navy).

## Games/toys juice plan

Not applicable — Fair Hours is a data tool, not a game. Interaction feedback
(button press, heatmap cell hover/focus, form validation) follows the D2 craft
rules (120–250ms themed states) but there is no win/lose state, movement, or
SFX to plan.
