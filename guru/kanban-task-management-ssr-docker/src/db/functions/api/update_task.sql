create or replace function api.update_task(p_task jsonb, p_column_id uuid) returns jsonb as
$$
declare
  _subtasks  jsonb := '[]'::jsonb;
  _userID    uuid  := current_setting('request.jwt.claims', true)::json ->> 'id';
  _i         jsonb;
  _taskID    uuid;
  _subtaskID uuid;
begin
  update api.tasks
  set
    title       = p_task ->> 'title',
    description = p_task ->> 'description',
    column_id   = p_column_id,
    updated_at  = now()
  where task_id = (p_task ->> 'id')::uuid
  returning task_id into _taskID;

  if _taskID is null then
    raise sqlstate 'PT404' using message = 'Task not found';
  end if;

  for _i in select * from jsonb_array_elements(p_task -> 'subtasks') loop
    if ((_i ->> 'id')::text = '') then -- create subtask
      insert into api.subtasks(title, task_id, user_id) values(_i ->> 'title', (p_task ->> 'id')::uuid, _userID) returning subtask_id into _subtaskID;
      _subtasks := _subtasks || jsonb_build_object('id', _subtaskID, 'title', _i ->> 'title', 'isCompleted', false);
    elseif (_i ->> 'title' = '') then -- delete subtask
      delete from api.subtasks where subtask_id = (_i ->> 'id')::uuid;
    else -- update subtask
      update api.subtasks
      set
        title        = _i ->> 'title',
	is_completed = (_i ->> 'isCompleted')::boolean,
	updated_at   = now()
      where subtask_id = (_i ->> 'id')::uuid
      returning subtask_id into _subtaskID;

      _subtasks := _subtasks || jsonb_build_object('id', _subtaskID, 'title', _i ->> 'title', 'isCompleted', (_i ->> 'isCompleted')::boolean);
    end if;
  end loop;

  return jsonb_build_object(
    'id',          p_task ->> 'id',
    'title',       p_task ->> 'title',
    'description', p_task ->> 'description',
    'subtasks',    _subtasks);
end;
$$ language plpgsql security definer;
