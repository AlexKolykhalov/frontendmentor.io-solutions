create or replace function api.partly_update_task(p_task_id uuid, p_column_id uuid) returns jsonb as
$$
declare
  _subtasks    jsonb := '[]'::jsonb;
  _taskID      uuid;
  _title       text;
  _description text;
  _rec         record;
begin
  update api.tasks 
  set column_id = p_column_id, updated_at = now()
  where task_id = p_task_id 
  returning task_id, title, description into _taskID, _title, _description;

  if _taskID is null then    
    raise sqlstate 'PT404' using message = 'Task not found';
  end if;   

  for _rec in (select subtask_id, title, is_completed from api.subtasks where task_id = p_task_id order by id) loop
    _subtasks := _subtasks || jsonb_build_object('id', _rec.subtask_id, 'title', _rec.title, 'isCompleted', _rec.is_completed);
  end loop;

  return jsonb_build_object('id', _taskID, 'title', _title, 'description', _description, 'subtasks', _subtasks);
end;
$$ language plpgsql security definer;
