# Consistency Dashboard

A daily consistency tracker in Bengali — plan tomorrow's must-do list tonight, check items off during the day, and keep a streak alive. Built as a multi-device, Supabase-backed web app that also ships as an installable PWA and a native desktop app.

Live: `https://cosmat.vercel.app`

---

## Stack

| Layer | Choice | Notes |
|---|---|---|
| Framework | Next.js 16, App Router | Turbopack is the default bundler |
| Language | TypeScript (strict) | no `any` without a justifying comment |
| UI | React 19 + Tailwind CSS v4 | CSS-first config, no `tailwind.config.ts` |
| Data / Auth | Supabase (Postgres, Auth, RLS) | email magic-link only |
| Notifications | Web Push (VAPID) via `web-push` | service worker in `public/sw.js` |
| Scheduling | Vercel Cron | one daily job, defined in `vercel.json` |
| Desktop | Tauri v2 (Rust) | thin native shell around the deployed site |
| Package manager | Bun | `bun install`, `bun run dev` |

---

## Features

- **Today's task list** — add, tick off, and delete tasks scoped to `user_id` + date, with a live completion bar.
- **Streaks** — a day counts only when every task for that day is done; unticking a task the same day rolls the streak back.
- **Evening reminder banner** — after 21:30 local time, if tomorrow has no tasks yet, an inline banner appears letting you draft the list on the spot. Dismissal is remembered per day.
- **Web push at 21:30 Asia/Dhaka** — a cron job pushes the same nudge to subscribed devices even when the app isn't open, deduped so each user gets at most one per day.
- **Stats panel** — 7-day and 30-day views with average completion rate, count of 100% days, and a per-day bar breakdown.
- **Rotating reminder card** — a fixed set of Qur'an, hadith, and personal notes, shuffled on load.
- **Bengali throughout** — all UI copy is Bengali and every user-facing number runs through `toBn()`, so digits render as ০১২৩ rather than 0123.
- **Installable** — PWA manifest plus service worker; a Tauri build wraps the same deployed site in a native window with tray and autostart.

---

## Architecture

### Request flow

Every request first hits `proxy.ts` at the repo root (this is Next.js 16's rename of `middleware.ts`; it runs on the Node.js runtime, not Edge). The proxy creates a server Supabase client bound to the request cookies, calls `auth.getUser()` to refresh the session, and redirects anonymous visitors to `/login` unless they're already on `/login` or `/auth/*`. Static assets, the manifest, and the service worker are excluded via the matcher.

`src/app/page.tsx` is a Server Component: it resolves the user server-side and renders `<Dashboard userId={...} />`. Everything below that point is a Client Component, because the dashboard is interactive and talks to Supabase from the browser.

### Auth

Login is Supabase email magic-link only. `src/app/login/page.tsx` calls `signInWithOtp` with a redirect to `/auth/callback`. That route handler (`src/app/auth/callback/route.ts`) accepts either a PKCE `code` (via `exchangeCodeForSession`) or a `token_hash` (via `verifyOtp`), sets the session cookie, and redirects home; failures bounce back to `/login?error=expired`.

### Supabase client boundaries

There are exactly three ways to reach Supabase, and mixing them up is the main thing to avoid:

- `src/lib/supabase/client.ts` — `createBrowserClient`, used by Client Components and hooks. Subject to RLS.
- `src/lib/supabase/server.ts` — `createServerClient` bound to `await cookies()`, used by Server Components and route handlers. Also subject to RLS. Cookie writes are wrapped in try/catch because a Server Component render can't set cookies; the proxy handles session refresh instead.
- The service-role client, instantiated inline **only** in `src/app/api/cron/evening-reminder/route.ts`. It bypasses RLS because the cron job must read every user's settings, so it is deliberately not exported for reuse.

`src/lib/supabase/types.ts` hand-maintains the `Database` type (Row/Insert/Update/Relationships per table) that parameterises all three clients, so queries are typed end to end.

### Data flow on the client

State lives in three hooks under `src/hooks/`, each owning one slice and one query:

- `useTasks(userId, date)` — fetches today's tasks ordered by `position`; `addTask` appends, `toggleTask` updates optimistically then writes, `deleteTask` removes.
- `useStreak(userId)` — reads the streak row; `recompute(allDone)` increments when the previous complete day was yesterday, resets to 1 otherwise, and decrements if a completed day is un-completed. It short-circuits when nothing would change.
- `useStats(userId, rangeDays)` — pulls `date, done` rows since the cutoff and aggregates them into per-day totals in memory.

`Dashboard.tsx` wires them together: toggling a task writes through `useTasks`, then hands the recomputed "is every task done" boolean to `useStreak`.

### The 21:30 reminder, two ways

The same nudge fires through two independent paths, because a browser tab may not be open:

1. **In-app** — `ReminderBanner` polls once a minute. After 21:30 (`isEveningNow()`), if `reminder_dismissed_date` isn't today and tomorrow has zero tasks, it renders the drafting UI. Saving inserts the drafted tasks dated tomorrow and dismisses the banner.
2. **Push** — `vercel.json` schedules `GET /api/cron/evening-reminder` at `30 15 * * *` UTC, which is 21:30 Asia/Dhaka (UTC+6, no DST). The handler rejects anything without `Authorization: Bearer $CRON_SECRET`, then for each user with `notify_enabled` and `notified_date !== today`, checks whether tomorrow is empty and pushes to every stored subscription before stamping `notified_date`.

Subscriptions are created by `NotifyToggle` → `subscribeToPush()` (`src/lib/push.ts`), which requests permission, subscribes via the service worker with the VAPID public key, and POSTs the subscription to `/api/push/subscribe`. That route authenticates the user, validates the payload, and upserts on `endpoint`. `public/sw.js` renders the notification and focuses (or opens) the app on click.

### Styling

Tailwind v4 is configured entirely in CSS. `src/app/globals.css` imports the fonts, then `@import "tailwindcss"`, then declares design tokens in an `@theme` block — `--color-ivory`, `--color-ink`, `--color-muted`, `--color-hair`, `--color-accent`, `--color-danger`, plus the serif/sans font stacks. Each token automatically generates utilities (`bg-ivory`, `text-muted`, `border-hair`, …), so there is no `tailwind.config.ts` and no `content` array. PostCSS runs only `@tailwindcss/postcss`; autoprefixer is gone because v4 handles prefixing internally. A global rule forces `border-radius: 0` for the flat, print-like look.

---

## Project structure

```
proxy.ts                     auth gate + session refresh (was middleware.ts)
vercel.json                  cron schedule for the evening reminder
postcss.config.mjs           @tailwindcss/postcss only
supabase/schema.sql          tables, indexes, RLS policies

src/app/
  layout.tsx                 metadata, viewport, service worker registration
  globals.css                Tailwind v4 entry + @theme design tokens
  page.tsx                   server component; auth check → Dashboard
  login/page.tsx             magic-link form
  auth/callback/route.ts     code / token_hash → session
  api/push/subscribe/        stores a push subscription for the current user
  api/cron/evening-reminder/ service-role cron job, Bearer-token guarded

src/components/
  Dashboard.tsx              composes the page, owns the toggle → streak wiring
  TaskList.tsx               list, progress bar, add/toggle/delete
  StreakBadge.tsx            streak count
  StatsPanel.tsx             7/30-day aggregates and per-day bars
  ReminderBanner.tsx         21:30 in-app nudge + tomorrow drafting
  NotifyToggle.tsx           push opt-in/out
  QuoteCard.tsx              rotating reminders

src/hooks/                   useTasks, useStreak, useStats
src/lib/
  dates.ts                   toBn(), todayStr(), tomorrowStr(), isEveningNow(), prettyDateBn()
  push.ts                    browser push subscription
  supabase/                  client.ts, server.ts, types.ts

public/                      manifest.json, sw.js, icons
src-tauri/                   Rust desktop shell (tray, autostart)
```

---

## Data model

| Table | Key | Purpose |
|---|---|---|
| `tasks` | `id`, indexed on `(user_id, date)` | one row per task, scoped to a user and a day |
| `streaks` | `user_id` | current streak `count` + `last_complete_date` |
| `user_settings` | `user_id` | `notify_enabled`, `reminder_dismissed_date`, `notified_date` |
| `push_subscriptions` | `id`, unique `endpoint` | one row per browser/device |

All four have Row Level Security enabled with a single `auth.uid() = user_id` policy for both `using` and `with check`, so a user can only ever touch their own rows. Every table cascades on user delete. Source of truth is `supabase/schema.sql` — change it there, never through the dashboard UI.

---

## 1. Supabase setup

1. Create a project at supabase.com.
2. SQL Editor → run `supabase/schema.sql`.
3. Project Settings → API → copy `Project URL` and `anon public` key into `.env.local`.
4. Project Settings → API → copy `service_role` key (server-only, never expose client-side) into `SUPABASE_SERVICE_ROLE_KEY`.
5. Authentication → Providers → make sure Email (magic link) is enabled.

## 2. Push notifications (VAPID)

```
bunx web-push generate-vapid-keys
```

Put the public key in both `NEXT_PUBLIC_VAPID_PUBLIC_KEY` and `VAPID_PUBLIC_KEY`, the private key in `VAPID_PRIVATE_KEY`.

## 3. Local dev

```
cp .env.example .env.local   # fill in the values above
bun install
bun run dev
```

`bun run build` runs a full production build with type checking; `bun run lint` type-checks only.

### Environment variables

| Variable | Used by | Purpose |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | browser + server | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | browser + server | RLS-scoped anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | cron route only | bypasses RLS — never expose client-side |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | browser | push subscription key |
| `VAPID_PUBLIC_KEY` / `VAPID_PRIVATE_KEY` | cron route | signs push messages |
| `VAPID_SUBJECT` | cron route | `mailto:` contact for push services |
| `CRON_SECRET` | cron route | Bearer token Vercel sends with the scheduled request |

## 4. Deploy (Vercel)

1. `vercel` or connect the repo in the Vercel dashboard.
2. Add every var from `.env.example` under Project Settings → Environment Variables.
3. Also set `CRON_SECRET` to any random string — Vercel Cron sends it automatically as `Authorization: Bearer $CRON_SECRET`.
4. `vercel.json` already schedules `/api/cron/evening-reminder` at 15:30 UTC = 21:30 Asia/Dhaka daily.

## 5. Windows + Mac desktop app

The Next.js site stays on Vercel. The desktop app is a native Tauri window that loads that same site, so login and tasks stay in sync with the web.

**Windows (this PC)**

```
cmd.exe //c tauri-dev.bat      # run
cmd.exe //c tauri-build.bat    # installer
```

The `bun run desktop` and `bun run desktop:build` scripts do the same thing, but on Windows run them from `cmd`, not Git Bash — Git Bash picks the wrong `link.exe`. Installers land in `src-tauri/target/release/bundle/` (NSIS `.exe` and MSI).

**Mac**

Mac builds cannot run on Windows. In GitHub: Actions → `build-desktop` → Run workflow. Apple Silicon and Intel `.dmg` files show up as artifacts. Pushing a `v*` tag also drafts a GitHub Release.

Closing the window hides to the tray instead of quitting. Autostart is enabled on first launch.

## 6. Browser install (PWA)

Once deployed:

1. Open the site in Chrome/Edge.
2. Click the install icon in the address bar ("Install app").
3. Go to `chrome://apps`, right-click the installed app → **"Start app when you sign in"**.

That's native OS-level autostart — no `.bat`/`.exe` hacks — because the browser handles it once it's an installed PWA. Paired with web push (fires even when the app isn't open), the 9:30 PM reminder becomes a real background job instead of something that only works if a tab happens to be open.

---

## Conventions

- Server Components by default; `"use client"` only when state, effects, or browser APIs are needed.
- Supabase access goes through `lib/supabase/client.ts` or `lib/supabase/server.ts` — never instantiate a client inline in a component. The one exception is the service-role client in the cron route.
- All date/time logic goes through `lib/dates.ts`. Asia/Dhaka is UTC+6 with no DST — don't assume the server's local timezone.
- Any user-facing number goes through `toBn()`. Don't hardcode Bengali numerals.
- Design tokens live in the `@theme` block in `globals.css`, not as inline hex.
- Keep the app lean — check that a dependency is genuinely needed before `bun add`.

## Notes

- `public/icon-192.png` and `public/icon-512.png` are referenced by `manifest.json` but not included — drop your own in.
- `.cursorrules` in the repo root encodes the conventions above for Cursor's AI — keep it in sync if you change the architecture.
