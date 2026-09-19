-- Content reports table — required so users can flag AI-generated content
-- without leaving the app (Google Play Developer Program Policy, AI-Generated
-- Content section). Run this in Supabase SQL editor before launch.

create table if not exists content_reports (
  id uuid primary key default gen_random_uuid(),
  user_id integer,
  session_id text,
  reason text not null,
  message text,
  created_at timestamptz not null default now()
);

create index if not exists content_reports_created_at_idx on content_reports (created_at desc);
