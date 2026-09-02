# Setunia

Track your gym personal bests and log your working sets over time — free to run and host.

**Stack:** Next.js (App Router) · Supabase (Postgres + Auth + Storage) · Tailwind + shadcn/ui · GitHub + Vercel for hosting. Every piece has a free tier and this app fits comfortably inside it.

## 1. Create a Supabase project

1. Go to [supabase.com](https://supabase.com), sign up, and create a new (free) project.
2. Open **SQL Editor**, paste the contents of [`supabase/schema.sql`](supabase/schema.sql), and run it. This creates the tables, security policies, the avatar storage bucket, and seeds ~20 common exercises.
3. Open **Project Settings → API** and copy the **Project URL** and the **anon public** key.
4. *(Optional, for faster local testing)* Under **Authentication → Providers → Email**, you can turn off "Confirm email" so new signups can log in immediately without clicking a confirmation link. Leave it on for a real deployment.

## 2. Configure the app

```bash
cp .env.local.example .env.local
```

Fill in the two values from step 1:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
```

## 3. Run it locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), sign up with an email + password, and start logging sets.

## 4. Deploy for free

1. Push this repo to GitHub.
2. Go to [vercel.com](https://vercel.com), import the GitHub repo.
3. Add the same two environment variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`) in the Vercel project settings.
4. Deploy. Vercel will redeploy automatically on every push to `main`.

## How it works

- **Exercises** are either global (seeded, visible to everyone) or custom (owned by one user, visible only to them).
- **Personal bests** are never stored separately — they're derived from your logged sets (the heaviest weight, or longest duration, you've logged for that exercise). Log a heavier set and it automatically becomes your new PB.
- All data access is protected by Postgres Row Level Security: a user can only ever read or write their own records, profile, and custom exercises.
- Feedback is a `mailto:` link to hej@nuuvie.com — no backend required.

## Project structure

- `app/(auth)/` — login and signup pages
- `app/(app)/` — the logged-in app (dashboard, exercises, profile, feedback), protected by `middleware.ts`
- `lib/supabase/` — Supabase client helpers for the browser, server components, and middleware
- `supabase/schema.sql` — the full database schema, security policies, and seed data
