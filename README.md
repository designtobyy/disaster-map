
# Philippines Disaster Map

Philippines Disaster Map is a free, open-source crowdsourced disaster reporting and visualization app. It lets users report disasters (typhoon, flood, earthquake, fire, landslide), mark locations on a map, set severity, and add descriptions. Reports are stored in Supabase and shown on the map in real time.

Features
- Interactive Leaflet map centered on the Philippines (OpenStreetMap tiles)
- Report modal with map-based location picker
- Real-time updates via Supabase Realtime
- Marker and heatmap views (toggle)
- Filters by disaster type, severity and time window
- Mobile-first responsive design with TailwindCSS and Framer Motion

Tech stack
- React + Vite
- TailwindCSS
- Leaflet.js + react-leaflet
- Supabase (Postgres + Realtime + Auth)

## Quick start (local)

1. Clone the repo

```bash
git clone <repo-url>
cd disaster-map
```

2. Install dependencies

```powershell
npm install
```

3. Create a Supabase project (free)

- Go to https://app.supabase.com and create a new project.
- In the SQL Editor, run the SQL schema in `db/schema.sql` (or copy/paste):

```sql
create extension if not exists pgcrypto;

create table if not exists public.reports (
	id uuid primary key default gen_random_uuid(),
	type text,
	severity integer,
	description text,
	latitude double precision,
	longitude double precision,
	reporter text default 'Guest',
	created_at timestamptz default now()
);
```

- Enable Realtime for the `reports` table in the Supabase UI (Database → Replication / Realtime).

4. Add environment variables

```powershell
cp .env.example .env
# then edit .env and paste your Supabase project URL and anon key
```

5. Run locally

```powershell
npm run dev
```

Open the given localhost URL (usually http://localhost:5173).

## Supabase setup details

- After creating the project, get the `anon` key and `project URL` from Project Settings → API. Put those in `.env` as `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
- If you require protected writes, configure Row Level Security and Policies in Supabase. For a public anonymous reporting flow, grant `insert` to `anon` role or add policies as needed.

## Deployment (Netlify)

1. Create a Netlify account and new site → import from Git.
2. Set build command: `npm run build` and publish directory: `dist`.
3. Add environment variables in Site Settings → Build & deploy → Environment: `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
4. Deploy. The frontend will be served by Netlify; Supabase handles the backend.

## Deployment (Vercel)

1. Create a Vercel account and import the project from Git.
2. Set build command: `npm run build` and output directory: `dist`.
3. Add environment variables in Project Settings → Environment Variables: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`.
4. Deploy.

## Error handling and troubleshooting
- If you see map errors, verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set.
- If realtime updates don't appear, check Realtime is enabled for the `reports` table and the service role keys are correct.
- If `gen_random_uuid()` is not available, enable `pgcrypto` as shown in the schema.

## Next steps and improvements
- Add Supabase Auth UI (Google / email) for authenticated reporter names.
- Add a PWA service worker for offline mode.
- Improve marker icons and clustering for large datasets.

If you want, I can add deployment helper files (Netlify/Vercel) and a Postgres function to aggregate heatmap intensity.
