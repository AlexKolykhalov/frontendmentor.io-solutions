create or replace function api.get_task(p_task_id uuid) returns jsonb as
$$
declare
  _userID   uuid := current_setting('request.jwt.claims', true)::json ->> 'id';
  _taskData jsonb;
begin
  with s as (select id, subtask_id, title, is_completed, task_id from api.subtasks where user_id = _userID)
  select jsonb_build_object(
    'id', t.task_id,
    'title', t.title,
    'description', t.description,
    'subtasks', coalesce(jsonb_agg(jsonb_build_object('id', s.subtask_id, 'title', s.title, 'isCompleted', s.is_completed) order by s.id) filter (where s.subtask_id is not null), '[]'::jsonb)
  )
  into _taskData
  from api.tasks t left join s on t.task_id = s.task_id
  where t.user_id = _userID and t.task_id = p_task_id
  group by t.task_id, t.title, t.description;

  if _taskData is null then
    raise sqlstate 'PT404' using message = 'Task not found';
  end if;

  return _taskData;
end;
$$ language plpgsql security definer;
