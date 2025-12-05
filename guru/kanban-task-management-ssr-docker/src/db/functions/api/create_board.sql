create or replace function api.create_board(p_board jsonb) returns jsonb as
$$
declare
  _userID   uuid  := current_setting('request.jwt.claims', true)::json ->> 'id';
  _columns  jsonb := '[]'::jsonb;
  _i        jsonb;
  _boardID  uuid;
  _columnID uuid;  
begin
  insert into api.boards(name, user_id) values (p_board ->> 'name', _userID) returning board_id into _boardID;
  for _i in select * from jsonb_array_elements(p_board -> 'columns') loop
    insert into api.columns(name, board_id, user_id)
    values (_i ->> 'name', _boardID, _userID)
    returning column_id into _columnID;
    
    _columns := _columns || jsonb_build_object('id', _columnID, 'name', _i ->> 'name', 'tasks', '[]'::jsonb);
  end loop;
  
  return jsonb_build_object('id', _boardID, 'name', p_board ->> 'name', 'columns', _columns);
end;
$$ language plpgsql security definer;
