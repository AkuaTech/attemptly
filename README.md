# Attemptly

JEE / NEET exam preparation platform. Practice PYQs, build custom tests, track your progress.

## Stack

- React 18 + Vite
- React Router 6
- Supabase (Auth + Postgres with RLS)
- KaTeX for math rendering
- Vanilla CSS (no Tailwind)

## Getting started

```bash
npm install
npm run dev
```

The Supabase project URL and publishable key are currently hardcoded in `src/supabase.js`. Move them to env vars before any non-local deployment.

## Project structure

```
src/
  components/   — TopNav, Sidebar, BottomNav, Modal, MathText
  pages/        — Dashboard, Analytics, MockTests, Subjects, ChaptersList, TopicsList,
                  Profile, Settings, Schedule, Help, Login, Signup, Onboarding
  hooks/        — useQuestions, useTaxonomy, useUserStats
  contexts/     — AuthContext (Supabase auth)
  lib/          — slug utilities
  supabase.js   — Supabase client
  index.css     — Design tokens + all styles

supabase/
  migrations/   — SQL schema (apply with psql against the project DB)
```

## Database

Schema lives in `supabase/migrations/`. Tables (all with RLS enabled):

| Table                       | Purpose                                                    |
|-----------------------------|------------------------------------------------------------|
| `jee_mains`                 | Question bank (read-only for all authenticated users)      |
| `user_progress`             | Per-user, per-topic aggregates (solved, correct, time)     |
| `user_attempts`             | Per-question attempt log                                   |
| `mock_tests`                | User-created custom mock tests                             |
| `mock_test_attempts`        | User attempts of mock tests                                |
| `notification_preferences`  | Per-user email/push notification settings                  |

A `delete_my_account()` `SECURITY DEFINER` RPC lets a user delete their own `auth.users` row (cascades clean up all owned rows).

To apply the schema:

```bash
psql "$DATABASE_URL" -f supabase/migrations/20260426_app_schema.sql
```

## Status

Frontend is wired against Supabase. The question-practice page (`/practice`) is the next major piece of work — every "Start", "Drill", and "Continue" CTA navigates to it with the right query params.
