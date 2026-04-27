-- Maintain user_progress aggregates from user_attempts.

create or replace function public.maintain_user_progress() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.subject is null or new.chapter is null or new.topic is null then
    return new;
  end if;

  insert into public.user_progress (
    user_id, subject, chapter, topic,
    questions_solved, questions_correct, total_time_ms, last_attempted_at
  ) values (
    new.user_id, new.subject, new.chapter, new.topic,
    1,
    case when new.is_correct then 1 else 0 end,
    coalesce(new.time_spent_ms, 0),
    new.attempted_at
  )
  on conflict (user_id, subject, chapter, topic) do update set
    questions_solved  = public.user_progress.questions_solved + 1,
    questions_correct = public.user_progress.questions_correct + case when new.is_correct then 1 else 0 end,
    total_time_ms     = public.user_progress.total_time_ms + coalesce(new.time_spent_ms, 0),
    last_attempted_at = greatest(coalesce(public.user_progress.last_attempted_at, new.attempted_at), new.attempted_at);

  return new;
end;
$$;

drop trigger if exists trg_user_attempts_progress on public.user_attempts;
create trigger trg_user_attempts_progress
  after insert on public.user_attempts
  for each row execute function public.maintain_user_progress();
