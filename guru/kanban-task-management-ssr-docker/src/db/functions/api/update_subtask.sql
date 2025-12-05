create or replace function api.update_subtask(p_subtask jsonb) returns jsonb as
$$
declare
  _subtaskID uuid;
  _title     text;
begin
  update api.subtasks
  set is_completed = (p_subtask ->> 'isCompleted')::boolean, updated_at = now()
  where subtask_id = (p_subtask ->> 'id')::uuid
  returning subtask_id, title into _subtaskID, _title;

  if _subtaskID is null then
    raise sqlstate 'PT404' using message = 'Subtask not found';
  end if;

  return jsonb_build_object('id', _subtaskID, 'title', _title, 'isCompleted', (p_subtask ->> 'isCompleted')::boolean);
end;
$$ language plpgsql security definer;
