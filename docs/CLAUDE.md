# BeforeTheWhistle — Claude Code Context

## What this is
A single-page GitHub Pages site (`index.html`) called **BeforeTheWhistle** — a summer soccer training program for a group of 15-year-old girls preparing for Fall high school tryouts. Sessions run Mon–Fri, 5:00–6:30 PM at **Harry Downes Field**, June 1 – August 28, 2026.

## Security
- Password gate on page load. Pin: `summerskills2026`
- Stored in `checkPin()` function in the first `<script>` block
- Uses `sessionStorage` to stay unlocked for the session

## Fonts
- **Barlow Condensed** (600) — logo only (`--logo`)
- **DM Serif Display** — headings (`--serif`)
- **DM Sans** (300/400/500/600) — body (`--sans`)
- All loaded from Google Fonts in `<head>`

## Color palette (CSS variables)
- `--accent`: #2e6b3e (green)
- `--accent-light`: #d6ead9
- `--black`: #111111
- `--white`: #fafaf8
- `--off-white`: #f2f1ee
- `--mid`: #6b6b6b
- `--border`: #dddbd6

## Sections (in order)
1. **Next Session** (`#thisweek`) — dynamically shows the next upcoming technical session from SESSIONS data. Auto-updates daily. Built by `buildNextSession()`.
2. **Training Calendar** (`#technical`) — week-by-week slider (Sun–Sat). Shows technical sessions (green) and strength sessions (amber) per day. Click opens a detail panel with warm-up, main session, and RSVP list. Built by `buildWeekCalendar()`.
3. **Strength Training Plan** (`#strength`) — tabbed by phase (Foundation/Build/Power/Taper). 3 workouts/week Mon/Wed/Fri. Built by `renderTabs()` and `renderWorkouts()`.
4. **Nutrition & Recovery** (`#nutrition`) — static content, pre/post training guidance.
5. **Drills & Training Resources** (`#drills`) — static content, 6 drill cards.
6. **Contact** (`#contact`) — Formspree form. Endpoint: `https://formspree.io/f/xwvzdord`. Sends to aideengill88@gmail.com. Uses `@formspree/ajax@1` CDN. Fields: name, email, message.

## Data architecture
The main data script block is marked `// ── GOOGLE SHEETS CONFIG ──` and contains:

### Google Sheets (live data source)
- **Technical sessions**: `SHEET_TECHNICAL_URL` — CSV with columns: `date, focus, title, time, location, warmup, main` (warmup/main items separated by `;`)
- **Strength workouts**: `SHEET_STRENGTH_URL` — CSV with columns: `phase, phase_label, day, day_label, title, duration, exercises` (exercises formatted as `Name|sets|note` separated by `;`)
- Sheets are fetched on load via `loadFromSheets()`. If unavailable, fallback hardcoded data is used.

### Fallback hardcoded data
- `SESSIONS` — object keyed by date string (`'YYYY-MM-DD'`), each with: `focus, title, time, location, warmup[], main[]`
- `MILESTONES` — keyed by date: Camp Starts Jul 6, Tryouts Start Aug 24
- `PHASES` — array of 4 phase objects (label, sub, tag, desc)
- `WORKOUTS` — object keyed 0–3 (phase), each an array of 3 workout objects (Mon/Wed/Fri)

## Key functions
| Function | Purpose |
|---|---|
| `buildWeekCalendar()` | Renders the current week in the Training Calendar |
| `calPrevWeek()` / `calNextWeek()` | Week navigation |
| `openPanel(key, type, ...)` | Opens detail panel for a session or workout |
| `closePanel()` | Closes detail panel |
| `addRsvp()` / `removeRsvp()` | RSVP management (stored in `rsvpData` object, resets on page refresh) |
| `buildNextSession()` | Renders the Next Session card (clears container first) |
| `renderTabs()` / `renderWorkouts()` | Renders Strength Plan section |
| `setPhase(i)` | Switches active phase tab |
| `loadFromSheets()` | Fetches Google Sheets CSVs and re-renders all sections |
| `twToggleRsvp(ds)` / `twAddRsvp(ds)` | RSVP on Next Session card |

## Session focus areas & colors
- `passing` → green (`--accent-light`)
- `dribbling` → amber
- `shooting` → red
- `defending` → blue
- `trapping` → teal
- `scrimmage` → purple

## Things to know
- RSVP data is in-memory only — resets on page refresh (no backend)
- Strength sessions are auto-assigned to Mon/Wed/Fri based on `STRENGTH_DAYS = [1, 3, 5]`
- Phase is auto-determined by date via `getPhaseForDate()`
- Calendar renders May–August 2026 (`for (let m = 4; m <= 7; m++)`)
- The session panel hides the RSVP section for strength workouts (`rsvpSec.style.display = 'none'`)
- Cooldown is intentionally excluded from session display and sheet columns
- Nav label for Technical section reads "Technical" (links to `#technical`)

## Owner
Aideen Gill — aideengill88@gmail.com
