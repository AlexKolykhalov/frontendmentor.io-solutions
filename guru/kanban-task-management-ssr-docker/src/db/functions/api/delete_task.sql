create or replace function api.delete_task(p_task_id uuid) returns void as
$$
declare
  _taskID uuid;
begin
  select task_id into _taskID from api.tasks where task_id = p_task_id;

  if _taskID is null then    
    raise sqlstate 'PT404' using message = 'Task not found';
  end if;

  delete from api.subtasks where task_id = p_task_id;
  delete from api.tasks where task_id = p_task_id;
end;
$$ language plpgsql security definer;
