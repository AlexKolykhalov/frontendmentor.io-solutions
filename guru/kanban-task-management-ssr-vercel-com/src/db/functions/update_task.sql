create function api.update_task(p_task jsonb, p_column_id uuid) returns jsonb as
$$
declare
  _i          jsonb;
  _subtask_id uuid;
  _subtasks   jsonb := '[]'::jsonb;  
begin
  update
    api.tasks
  set
    title       = p_task ->> 'title',
    description = p_task ->> 'description',
    column_id   = p_column_id,
    updated_at  = now()
  where
    task_id = (p_task ->> 'id')::uuid;
  
  for _i in select * from jsonb_array_elements(p_task -> 'subtasks') loop
    if ((_i ->> 'id')::text = '') then -- create
      insert into api.subtasks(title, task_id) values(_i ->> 'title', (p_task ->> 'id')::uuid) returning subtask_id into _subtask_id;
      _subtasks := _subtasks || jsonb_build_object('id', _subtask_id, 'title', _i ->> 'title', 'isCompleted', false);
    elseif (_i ->> 'title' = '') then -- delete
      delete from api.subtasks where subtask_id = (_i ->> 'id')::uuid;
    else -- update
      update
        api.subtasks
      set
        title = _i ->> 'title', is_completed = (_i ->> 'isCompleted')::boolean
      where
        subtask_id = (_i ->> 'id')::uuid returning subtask_id into _subtask_id;
      
      _subtasks := _subtasks || jsonb_build_object('id', _subtask_id, 'title', _i ->> 'title', 'isCompleted', (_i ->> 'isCompleted')::boolean);
    end if;    
  end loop;

  return jsonb_build_object(
    'id',          p_task ->> 'id',
    'title',       p_task ->> 'title',
    'description', p_task ->> 'description',
    'subtasks',    _subtasks);
end;
$$ language plpgsql;
