-- Additive column on jee_mains to support numerical (integer-type) questions.
-- The table already exists with mcq rows + an `answer text` column; this only
-- adds the audit column for the LLM-extracted answer so the change is safe to
-- re-run. Image flags from the source JSON are intentionally not stored — the
-- app renders <img> tags inline via MathText, so the flags are unused.

alter table public.jee_mains
  add column if not exists answer_raw text;

-- Practice/taxonomy queries now mix mcq + integer, so index the type and the
-- common out-of-syllabus filter.
create index if not exists jee_mains_type_idx on public.jee_mains (type);
create index if not exists jee_mains_in_syllabus_idx
  on public.jee_mains (subject, chapter, topic)
  where is_out_of_syllabus = false;

-- Keep the id sequence in step with the max id so inserts after a manual
-- import don't collide.
do $$
declare m bigint;
begin
  select coalesce(max(id), 1) into m from public.jee_mains;
  perform setval(pg_get_serial_sequence('public.jee_mains', 'id'), m, true);
end $$;
