-- Prepper app schema: per-user progress, attempts, mock tests, notification prefs.

create table if not exists public.user_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  subject text not null,
  chapter text not null,
  topic text not null,
  questions_solved int not null default 0,
  questions_correct int not null default 0,
  total_time_ms bigint not null default 0,
  last_attempted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, subject, chapter, topic)
);
create index if not exists user_progress_user_last_idx
  on public.user_progress(user_id, last_attempted_at desc);

create table if not exists public.user_attempts (
  id bigserial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  question_id bigint not null references public.jee_mains(id) on delete cascade,
  subject text,
  chapter text,
  topic text,
  selected_option text,
  is_correct boolean not null,
  time_spent_ms int not null default 0,
  attempted_at timestamptz not null default now()
);
create index if not exists user_attempts_user_idx on public.user_attempts(user_id);
create index if not exists user_attempts_user_date_idx
  on public.user_attempts(user_id, attempted_at desc);
create index if not exists user_attempts_question_idx on public.user_attempts(question_id);

create table if not exists public.mock_tests (
  id bigserial primary key,
  title text not null,
  pattern text not null,
  num_questions int not null,
  duration_minutes int not null,
  difficulty text not null,
  subject text,
  chapter text,
  topic text,
  is_official boolean not null default false,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.mock_test_attempts (
  id bigserial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  mock_test_id bigint not null references public.mock_tests(id) on delete cascade,
  status text not null default 'started',
  score numeric,
  correct_count int,
  total_count int,
  time_spent_ms bigint,
  started_at timestamptz not null default now(),
  completed_at timestamptz
);
create index if not exists mock_test_attempts_user_idx
  on public.mock_test_attempts(user_id, started_at desc);

-- Link individual answers to the mock attempt they belong to.
-- Idempotent so existing installs pick up the column on the next migration run.
alter table public.user_attempts
  add column if not exists mock_attempt_id bigint
  references public.mock_test_attempts(id) on delete cascade;
create index if not exists user_attempts_mock_attempt_idx
  on public.user_attempts(mock_attempt_id);
delete from public.user_attempts a
using (
  select id
  from (
    select
      id,
      row_number() over (
        partition by mock_attempt_id, question_id
        order by attempted_at desc, id desc
      ) as rn
    from public.user_attempts
    where mock_attempt_id is not null
  ) ranked
  where rn > 1
) duplicates
where a.id = duplicates.id;
create unique index if not exists user_attempts_mock_question_unique_idx
  on public.user_attempts(mock_attempt_id, question_id);

create table if not exists public.notification_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email_daily_summary boolean not null default true,
  email_streak_reminder boolean not null default true,
  email_weak_topic_alerts boolean not null default true,
  email_new_pyqs boolean not null default false,
  push_streak_reminder boolean not null default true,
  push_test_reminders boolean not null default true,
  updated_at timestamptz not null default now()
);

-- updated_at trigger
create or replace function public.set_updated_at() returns trigger
language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

drop trigger if exists trg_user_progress_updated on public.user_progress;
create trigger trg_user_progress_updated
  before update on public.user_progress
  for each row execute function public.set_updated_at();

drop trigger if exists trg_notif_prefs_updated on public.notification_preferences;
create trigger trg_notif_prefs_updated
  before update on public.notification_preferences
  for each row execute function public.set_updated_at();

-- RLS
alter table public.user_progress enable row level security;
alter table public.user_attempts enable row level security;
alter table public.mock_tests enable row level security;
alter table public.mock_test_attempts enable row level security;
alter table public.notification_preferences enable row level security;

alter table public.mock_tests
  alter column is_official set default false;

drop policy if exists user_progress_owner on public.user_progress;
create policy user_progress_owner on public.user_progress
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists user_attempts_owner on public.user_attempts;
create policy user_attempts_owner on public.user_attempts
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists mock_tests_read on public.mock_tests;
create policy mock_tests_read on public.mock_tests
  for select to authenticated
  using (is_official or created_by = auth.uid());

drop policy if exists mock_tests_insert_own on public.mock_tests;
create policy mock_tests_insert_own on public.mock_tests
  for insert to authenticated
  with check (created_by = auth.uid() and is_official = false);

drop policy if exists mock_tests_delete_own on public.mock_tests;
create policy mock_tests_delete_own on public.mock_tests
  for delete to authenticated
  using (created_by = auth.uid() and is_official = false);

drop policy if exists mock_test_attempts_owner on public.mock_test_attempts;
create policy mock_test_attempts_owner on public.mock_test_attempts
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists notification_preferences_owner on public.notification_preferences;
create policy notification_preferences_owner on public.notification_preferences
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- Self-delete RPC. SECURITY DEFINER so the caller can remove their own auth.users row.
create or replace function public.delete_my_account() returns void
language plpgsql security definer set search_path = public, auth as $$
declare uid uuid := auth.uid();
begin
  if uid is null then
    raise exception 'not authenticated';
  end if;
  delete from auth.users where id = uid;
end;
$$;

revoke all on function public.delete_my_account() from public;
grant execute on function public.delete_my_account() to authenticated;

-- Remove legacy sample official mocks. Mock tests are user-created from the UI.
delete from public.mock_tests
where is_official = true
  and created_by is null;
