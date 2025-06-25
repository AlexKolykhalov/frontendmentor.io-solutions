create function api.create_task(p_task jsonb, p_column_id uuid) returns jsonb as
$$
declare
  _task_id    uuid;
  _subtask_id uuid;
  _i          jsonb;
  _subtasks   jsonb := '[]'::jsonb;
begin
  insert into api.tasks(title, description, column_id)
  values (p_task ->> 'title', p_task ->> 'description', p_column_id) returning task_id into _task_id;

  for _i in select * from jsonb_array_elements(p_task -> 'subtasks') loop
    insert into api.subtasks(title, task_id) values (_i ->> 'title', _task_id) returning subtask_id into _subtask_id;
    _subtasks := _subtasks || jsonb_build_object('id', _subtask_id, 'title', _i ->> 'title', 'isCompleted', false);
  end loop;

  return jsonb_build_object (
    'id',          _task_id,
    'title',       p_task ->> 'title',
    'description', p_task ->> 'description',
    'subtasks',    _subtasks
  );
end;
$$ language plpgsql;
