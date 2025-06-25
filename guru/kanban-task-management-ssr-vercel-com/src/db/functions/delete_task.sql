create function api.delete_task(p_id uuid) returns void as
$$
begin
  with delete_task as (delete from api.tasks where task_id = p_id returning task_id)
  delete from api.subtasks where task_id in (select task_id from delete_task);
end;
$$ language plpgsql;
