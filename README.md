# Consistency Dashboard

Production build of the daily consistency tracker — Next.js 16 (App Router) + TypeScript + Tailwind CSS v4 + Supabase + Web Push, deployable to Vercel.

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

## 4. Deploy (Vercel)
1. `vercel` or connect the repo in the Vercel dashboard.
2. Add every var from `.env.example` under Project Settings → Environment Variables.
3. Also set `CRON_SECRET` to any random string — Vercel Cron sends it automatically as `Authorization: Bearer $CRON_SECRET`.
4. `vercel.json` already schedules `/api/cron/evening-reminder` at 15:30 UTC = 21:30 Asia/Dhaka daily.

## 5. The real "boot popup" — production answer
Skip startup scripts entirely. Once deployed:
1. Open the site in Chrome/Edge.
2. Click the install icon in the address bar ("Install app").
3. Go to `chrome://apps`, right-click the installed app → **"Start app when you sign in"**.

That's native OS-level autostart — no `.bat`/`.exe` hacks — because the browser handles it once it's an installed PWA. Paired with web push (fires even when the app isn't open), the 9:30 PM reminder becomes a real background job instead of something that only works if a tab happens to be open.

## Data model
- `tasks` — one row per task, scoped to `user_id` + `date`.
- `streaks` — current streak count per user.
- `user_settings` — notification opt-in + reminder dedupe flags.
- `push_subscriptions` — one row per browser/device subscribed to push.

All four tables have Row Level Security on — a user can only ever touch their own rows. See `supabase/schema.sql`.

## Notes
- `public/icon-192.png` and `public/icon-512.png` are referenced by `manifest.json` but not included — drop your own in.
- `.cursorrules` in the repo root encodes the conventions above for Cursor's AI — keep it in sync if you change the architecture.
