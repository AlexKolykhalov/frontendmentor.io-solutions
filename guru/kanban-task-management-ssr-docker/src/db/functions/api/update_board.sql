create or replace function api.update_board(p_board jsonb) returns jsonb as
$$
declare
  _userID  uuid := current_setting('request.jwt.claims', true)::json ->> 'id';
  _i       jsonb;
  _boardID uuid;
begin
  update api.boards
  set name = p_board ->> 'name', updated_at = now()
  where board_id = (p_board ->> 'id')::uuid
  returning board_id into _boardID;

  if _boardID is null then
    raise sqlstate 'PT404' using message = 'Board not found';
  end if;

  for _i in select * from jsonb_array_elements(p_board -> 'columns') loop
    if ((_i ->> 'id')::text = '') then -- create column
      insert into api.columns(name, board_id, user_id) values(_i ->> 'name', (p_board ->> 'id')::uuid, _userID);
    elseif (_i ->> 'name' = '') then -- delete column
      with delete_columns as (delete from api.columns where column_id = (_i ->> 'id')::uuid returning column_id),
      delete_tasks as (delete from api.tasks where column_id in (select column_id from delete_columns) returning task_id)
      delete from api.subtasks where task_id in (select task_id from delete_tasks);
    else -- update column
      update api.columns set name = _i ->> 'name', updated_at = now() where column_id = (_i ->> 'id')::uuid;
    end if;
  end loop;

  return api.get_board((p_board->>'id')::uuid);
end;
$$ language plpgsql security definer;
