# Consistency Tracker — Master Build Plan

Reference doc for Cursor. Work through phases in order. Each phase is scoped
to be completable in one focused Cursor session — don't jump ahead until the
current phase builds/runs cleanly.

Repo: `github.com/sahinpro/Consistency-tracker`
Stack: Next.js 16 + TypeScript + Tailwind v4 + Supabase (auth + Postgres +
Web Push) + Bun, deployed on Vercel.

Design reference (mobile UI capture):
`npx @builder.io/dev-tools@latest code --url vcp://quickcopy/vcp-85a41a143e684acc9645f1c9da85ca70`

---

## Phase 1 — Desktop shell (Tauri) — done / verify

Native Windows + Mac wrapper that loads the deployed Vercel URL directly.
No changes to the Next.js app itself.

- `src-tauri/tauri.conf.json` — window config, CSP whitelist for the Vercel
  domain + `*.supabase.co`, autostart + notification plugin registration
- `src-tauri/src/main.rs` — system tray (Show/Quit), close-button hides to
  tray instead of quitting, `--minimized` autostart flag handling
- `.github/workflows/build-desktop.yml` — CI matrix building `.msi`/`.exe`
  (Windows) and `.dmg` (Mac, both architectures), since Tauri needs to build
  on each native OS

**Verify:** replace `YOUR-APP.vercel.app` placeholders in `tauri.conf.json`
with the real domain, `bun install`, `bunx tauri dev` launches and loads the
live app correctly.

---

## Phase 2 — UI migration: shadcn/ui + dark theme

Swap the current hand-rolled ivory/black editorial theme for shadcn/ui
defaults in dark mode. Presentational layer only — don't touch hooks,
Supabase calls, or streak/task logic.

1. `bunx shadcn@latest init` (Next.js 16 / React 19 / Tailwind v4 preset,
   dark base color: zinc or neutral)
2. `bunx shadcn@latest add card button input checkbox progress badge tabs
   separator switch`
3. `bun add lucide-react`
4. `src/app/globals.css` — replace custom `--color-ivory/-ink/-muted/-hair/
   -accent/-danger` tokens with shadcn's generated `:root`/`.dark` blocks.
   Force `className="dark"` on `<html>` in `layout.tsx` (always-dark, no
   toggle). Keep the Noto Serif Bengali / Hind Siliguri / EB Garamond
   `@import` and font tokens layered on top. Remove the global
   `border-radius: 0 !important` override.
5. Component-by-component:
   - `Dashboard.tsx` → `bg-background text-foreground` wrapper, hero as
     `bg-card`/`bg-muted`
   - `QuoteCard.tsx` → `<Card><CardContent>`, tag → `<Badge variant="outline">`,
     next-reminder button → `<Button variant="outline" size="sm">`
   - `TaskList.tsx` → `<Progress>` for the bar, `<Checkbox>` per task,
     delete → `<Button variant="ghost" size="icon"><X/></Button>`, add-row →
     `<Input>` + `<Button>`
   - `StatsPanel.tsx` → week/month switch as `<Tabs>`, stat blocks as small
     `<Card>`s, per-day bars as `<Progress>` at `h-1.5`
   - `StreakBadge.tsx` → add lucide `<Flame/>` icon before the number
   - `NotifyToggle.tsx` → `<Switch>` (it's a real on/off state, not a button)
   - `ReminderBanner.tsx` → `<Card>` wrapper, `<Input>` + `<Button
     variant="secondary">` row, delete/dismiss → ghost icon buttons
6. `bun run dev` — check every screen in dark mode. `bun run lint` /
   `tsc --noEmit` clean before moving on.

**Favicon:** generate via an AI image tool using this prompt, then run
through realfavicongenerator.net for all sizes into `public/`:

> A minimalist favicon icon for a consistency-tracking app called
> "ধারাবাহিকতা" — a single thin-lined crescent moon merged with a small
> flame at its tip, symbolizing an Islamic daily-discipline streak. Flat
> vector style, single color (warm gold `#D4AF7A`) on a solid dark
> charcoal/near-black background (`#0B0B0C`), no text, no gradients, no
> shadows, simple geometric linework, centered composition, crisp at
> 32×32px, square canvas with even padding.

---

## Phase 3 — Android native app (Kotlin)

New Android Studio project, min SDK 26. Shares the existing Supabase project
(same auth, same account across web/desktop/Android). Target: Sahin's own
rooted phone (Magisk) **and** non-rooted phones on his network — one APK,
runtime-detected mode.

### 3.0 — Data model (extend existing Supabase schema)

```sql
-- tasks: tomorrow's plan, one row per todo item
tasks (
  id uuid pk, user_id uuid fk, title text,
  planned_date date, planned_start_time time,
  actual_start_time timestamptz, completed_at timestamptz,
  status text -- 'pending' | 'started' | 'done' | 'missed'
)

-- block_config: per-user blocking preferences
block_config (
  user_id uuid pk, blocked_apps text[], blocked_domains text[],
  daily_window_start time, daily_window_end time, ringtone_uri text
)

-- block_events: audit log — feeds the "honesty mirror" stat
block_events (
  id uuid pk, user_id uuid fk, event_type text, -- 'block_start' |
  -- 'override_requested' | 'override_granted' | 'auto_relock'
  reason_text text, created_at timestamptz
)
```

### 3.1 — Module: root detector

- `libsu` (topjohnwu) for root session management
- `RootCapability.detect()` → `ROOT_AVAILABLE` | `NON_ROOT` at first launch,
  cached; re-checked if the user later roots/unroots
- Drives which block-engine implementation gets instantiated (strategy
  pattern: `BlockEngine` interface, `RootBlockEngine` /
  `NonRootBlockEngine` implementations)

### 3.2 — Module: block engine (dual mode)

**Root mode** (Sahin's phone):
- App blocking: `pm suspend-app <package>` / `pm unsuspend-app <package>`
  via root shell — no foreground polling needed, Android's own "app
  unavailable" system dialog handles the UX
- Domain blocking: systemless hosts bind-mount (AdAway pattern) —
  `mount -o bind /data/local/tmp/hosts_blocked /system/etc/hosts` when
  active, unmount to restore. Note in setup docs: browsers with Secure
  DNS/DoH enabled can bypass hosts-file blocking — instruct disabling
  Private DNS in Android network settings during setup.

**Non-root mode** (network's phones):
- App blocking: `AccessibilityService` watching
  `TYPE_WINDOW_STATE_CHANGED` events; on a blocked package in foreground,
  show a full-screen block Activity (or `SYSTEM_ALERT_WINDOW` overlay) and
  return to home. Scope the accessibility config to window-state events
  only — no content/text capture, for both privacy and to minimize the
  permission's footprint.
- Domain blocking: local `VpnService` doing on-device DNS filtering only
  (loopback — never forwards traffic to a remote server). Blocks
  facebook.com/youtube.com etc. system-wide across apps and browsers.

Both modes expose the same interface: `startBlock(config)`,
`endBlock()`, `isActive()`.

### 3.3 — Module: scheduler

- `AlarmManager` (exact alarms) for:
  - Daily evening-planning reminder at the user-set time (e.g. 9:30 PM),
    custom ringtone via a dedicated `NotificationChannel`
  - One alarm per task's `planned_start_time`, set when tomorrow's plan is
    saved
- `BroadcastReceiver` on `BOOT_COMPLETED` to reschedule all alarms
- `WorkManager` periodic job (~every 2 min while a block session is
  active) — self-heal check: if the block should be active but isn't
  (something unsuspended/unmounted it outside the app's own flow),
  re-apply it

### 3.4 — Module: evening planning UI

- Reminder notification → opens "Plan tomorrow" screen
- Add todo items, each with an optional planned start time
- Each item has a "Start Work" button — tapping records
  `actual_start_time`, flips status to `started`
- If `planned_start_time` passes with `actual_start_time` still null:
  fire the reminder notification (custom ringtone) **and** call
  `BlockEngine.startBlock()` with the configured block list

### 3.5 — Module: emergency override

Shared flow regardless of root/non-root mode:
1. Opened only from the main app (never blocked — it's the app itself)
2. 45–60s forced wait screen, not skippable
3. Type-to-confirm commitment sentence, paste disabled
4. Short reflective question ("keno ekhon lagbe?") — answer logged to
   `block_events.reason_text`
5. On success: `BlockEngine.endBlock()` for the requested target only,
   persistent countdown notification, hard cap 10 minutes
6. At 0: `BlockEngine.startBlock()` re-applied automatically (same
   `WorkManager`/`AlarmManager` path as the self-heal check)

### 3.6 — Settings screen

- Blocked apps picker (installed-apps list with checkboxes)
- Blocked domains (free text list — pre-filled with facebook.com,
  youtube.com, m.facebook.com, m.youtube.com)
- Daily block window start/end
- Evening planning reminder time
- Ringtone picker (`RingtoneManager.ACTION_RINGTONE_PICKER` intent,
  store the returned URI)

### 3.7 — Privacy / distribution (multi-user, sideload)

- VPN filtering stays 100% on-device — document this explicitly in the
  app's own "why we need this permission" screens, since it's the trust
  claim that matters most when installing on other people's phones
- Accessibility Service permission-rationale screen shown before the
  system permission prompt, explaining exactly what it does and doesn't
  read
- Per-user data isolation via existing Supabase RLS policies — extend
  RLS to the three new tables above
- Distribute as a direct APK (not Play Store) — Play policy scrutinizes
  Accessibility-Service blocking apps heavily; sideloading suits a
  closed group/network install base and avoids that friction

---

## Build order for Cursor sessions

1. Phase 2 (shadcn/dark migration) — self-contained, web-only, do first
2. Phase 3.0–3.1 (schema + root detector) — foundation, no UI yet
3. Phase 3.2 (block engine, root path only) — test end-to-end on Sahin's
   own phone before building the non-root path
4. Phase 3.3–3.4 (scheduler + planning UI) — the actual daily-use loop
5. Phase 3.5 (emergency override) — needed before real daily use, or the
   block engine is untestable without a way out
6. Phase 3.2 non-root path + 3.6 settings — once the root path is proven
7. Phase 3.7 — before handing APKs to anyone else on the network
