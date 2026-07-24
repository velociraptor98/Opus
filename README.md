# Opus

A job application tracker for people who have outgrown the spreadsheet.

You know the spreadsheet. Twelve columns, three abandoned tabs, a cell that just says "follow up??" from six weeks ago. Opus replaces it: log in, add your applications, and let the app remember what you applied to, when, and what happens next.

## What it does

- **Track applications** — company, position, status, salary, location, source, recruiter contact, links, and free-form notes.
- **Jobs *and* universities** — a toggle switches the whole app between the two tracks. Same pipeline underneath, admissions vocabulary on top: institution, programme, tuition, portal, deadline, and Draft → Submitted → Interview → Accepted.
- **Pipeline statuses** — Pending → Applied → Interviewing → Offered (or Rejected/Closed, because realism).
- **Follow-up nudges** — anything active that's gone quiet for 7+ days gets flagged, so applications stop dying of neglect. Scheduling a next action (e.g. "Phone screen on Friday") snoozes the nudge until that date passes.
- **Upcoming strip** — your scheduled next actions, front and center.
- **Per-application checklist** — resume sent, cover letter sent, follow-up sent.
- **Search, filter, sort** — by status, follow-up state, company, date applied, recent activity, and more.
- **Stats page** — funnel, status breakdown, and activity charts (Recharts). Status history is recorded on every transition, so the funnel counts every stage you *ever* reached — getting rejected after an interview still counts as interviewing.
- **CSV import/export** — escape hatch back to (or from) the spreadsheet. No hard feelings.
- **Auth + sync** — Supabase handles login and storage, so your data follows you around.
- **Dark/light theme** — obviously.

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS 4 · Supabase (auth + Postgres) · Recharts · Vitest + Testing Library

## Getting started

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Set up Supabase**

   Create a project at [supabase.com](https://supabase.com), then drop your credentials into `.env.local`:

   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
   ```

   Apply the migrations in `supabase/migrations/` via the Supabase SQL editor, or `supabase db push` if you've linked the CLI.

3. **Run it**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) and start logging rejections with style.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm start` | Serve the production build |
| `npm run lint` | ESLint |
| `npm test` | Run the test suite once (Vitest) |
| `npm run test:watch` | Run tests in watch mode |

## Project layout

```
src/
├── app/          # Routes: dashboard (/) and stats (/stats)
├── components/   # Job cards, modals, filters, import/export, etc.
├── constants/    # Statuses, sort/filter options, follow-up rules, per-kind vocabulary
├── context/      # Auth and toast providers
└── lib/          # Supabase clients, CSV, dates, pipeline analytics
supabase/
└── migrations/   # Database schema
```
