# Photo Booth

A polished vintage photo booth web app. Take photos with your device camera, style them with strip themes, and optionally create collaborative rooms so friends can contribute from different devices.

## Features

- Live camera booth with countdown, flash, flip camera, and retakes
- Multiple strip layouts (classic 4, mini 3, double strip, 2×2, horizontal, 6-photo, collage)
- Theme gallery (Classic, Vintage Film, Y2K, Coquette, Cute, Scrapbook, Retro, Disco, Birthday, Party, Love/Friends, Minimal, Seasonal, Holiday, Custom)
- Edit Design mode + Surprise Me
- High-resolution canvas export (PNG / JPG / Share / double print)
- Collaborative rooms with guest join (no account), shared photo tray, host slot builder
- Temporary photo uploads with host delete / expiry

## Tech stack

- Next.js (App Router) + React + TypeScript
- Tailwind CSS
- Zustand (session state)
- Supabase (database, storage, realtime) — optional for local solo use
- HTML Canvas for strip rendering / export

## Install & run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Solo photo booth works without any backend configuration.

## Environment variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon (public) key |

Do not put service-role keys in the frontend.

## Configure Supabase (multi-device rooms)

1. Create a Supabase project.
2. In the SQL editor, run [`supabase/schema.sql`](supabase/schema.sql).
3. Create a public storage bucket named `room-photos`.
4. Under Storage policies, allow anon upload/read/delete for that bucket (party demo) or tighten for production.
5. Enable Realtime for tables `rooms`, `participants`, and `photos`.
6. Add the URL and anon key to `.env.local`.
7. Restart `npm run dev`.

Without these variables, rooms still work in **local demo mode** (same browser / tabs via `localStorage` + `BroadcastChannel`). Cross-device parties need Supabase.

## How realtime rooms work

1. Host creates a room → short code like `PHOTO-7K2X`.
2. Friends join with the code + a display name (temporary guest id, no login).
3. Each person uses their own camera; captures upload to the room tray.
4. Host assigns tray photos into strip slots (drag on desktop, tap-to-place on mobile).
5. Themes decorate the printable strip; canvas export includes everything in the preview.
6. Photos are temporary: rooms expire after ~6 hours, and hosts can **Delete room** to purge data.

## Deploy

Deploy to [Vercel](https://vercel.com) (or any Next.js host):

1. Push the repo and import the project.
2. Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in the host env settings.
3. Deploy.

Camera access requires HTTPS (or `localhost`).

## Scripts

```bash
npm run dev      # development server
npm run build    # production build
npm run start    # serve production build
npm run lint     # eslint
```

## Project structure

```
src/app/           # Landing, booth flow, room pages
src/components/    # Camera, strip, themes, room UI
src/lib/layouts.ts # Layout registry
src/lib/themes/    # Theme catalog + Surprise Me
src/lib/canvas/    # Shared preview/export renderer
src/lib/room/      # Supabase + local room services
supabase/          # SQL schema
```
