create or replace function api.create_task(p_task jsonb, p_column_id uuid) returns jsonb as
$$
declare
  _userID    uuid  := current_setting('request.jwt.claims', true)::json ->> 'id';
  _taskID    uuid;
  _subtaskID uuid;
  _i          jsonb;
  _subtasks   jsonb := '[]'::jsonb;
begin
  insert into api.tasks(title, description, column_id, user_id)
  values (p_task ->> 'title', p_task ->> 'description', p_column_id, _userID) returning task_id into _taskID;

  for _i in select * from jsonb_array_elements(p_task -> 'subtasks') loop
    insert into api.subtasks(title, task_id, user_id) values (_i ->> 'title', _taskID, _userID) returning subtask_id into _subtaskID;
    _subtasks := _subtasks || jsonb_build_object('id', _subtaskID, 'title', _i ->> 'title', 'isCompleted', false);
  end loop;

  return jsonb_build_object (
    'id',          _taskID,
    'title',       p_task ->> 'title',
    'description', p_task ->> 'description',
    'subtasks',    _subtasks
  );
end;
$$ language plpgsql security definer
