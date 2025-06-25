create function api.update_board(p_board jsonb) returns jsonb as
$$
declare
  _i         jsonb;
  _column_id uuid;
  _columns   jsonb := '[]'::jsonb;
begin
  update api.boards set name = p_board ->> 'name', updated_at = now() where board_id = (p_board ->> 'id')::uuid;
  for _i in select * from jsonb_array_elements(p_board -> 'columns') loop
    if ((_i ->> 'id')::text = '') then -- create
      insert into api.columns(name, board_id) values(_i ->> 'name', (p_board ->> 'id')::uuid) returning column_id into _column_id;
      _columns := _columns || jsonb_build_object('id', _column_id, 'name', _i ->> 'name', 'tasks', '[]'::jsonb);
    elseif (_i ->> 'name' = '') then -- delete
      with delete_columns as (delete from api.columns where column_id = (_i ->> 'id')::uuid returning column_id),
      delete_tasks as (delete from api.tasks where column_id in (select column_id from delete_columns) returning task_id)
      delete from api.subtasks where task_id in (select task_id from delete_tasks);
      _columns := _columns || jsonb_build_object('id', _i ->> 'id', 'name', '', 'tasks', '[]'::jsonb);
    else -- update
      update api.columns set name = _i ->> 'name', updated_at = now() where column_id = (_i ->> 'id')::uuid returning column_id into _column_id;
      _columns := _columns || jsonb_build_object('id', _column_id, 'name', _i ->> 'name', 'tasks', '[]'::jsonb);
    end if;    
  end loop;

  return jsonb_build_object('id', p_board ->> 'id', 'name', p_board ->> 'name', 'columns', _columns);
end;
$$ language plpgsql;
