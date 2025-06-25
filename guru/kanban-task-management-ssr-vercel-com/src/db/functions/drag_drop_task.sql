create function api.drag_drop_task(p_column_id_to uuid, p_task_id uuid) returns jsonb as
$$
declare
  _task_id     uuid;
  _title       text;
  _description text;
  _subtasks    jsonb;
begin
  update
    api.tasks
  set
    column_id = p_column_id_to
  where
    task_id = p_task_id
  returning task_id, title, description into _task_id, _title, _description;

  select
    jsonb_agg(jsonb_build_object('id', subtask_id, 'title', title, 'isCompleted', is_completed))
  into _subtasks
  from
    api.subtasks
  where
    task_id = p_task_id;

  return jsonb_build_object(
    'id',          _task_id,
    'title',       _title,
    'description', _description,
    'subtasks',    _subtasks
  );
end;
$$ language plpgsql;
