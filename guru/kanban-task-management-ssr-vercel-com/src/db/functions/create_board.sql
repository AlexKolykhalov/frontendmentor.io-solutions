create function api.create_board(p_board jsonb) returns jsonb as
$$
declare  
  _i         jsonb;
  _board_id  uuid;
  _column_id uuid;  
  _columns   jsonb := '[]'::jsonb;
begin
  insert into api.boards(name) values (p_board ->> 'name') returning board_id into _board_id;
  for _i in select * from jsonb_array_elements(p_board -> 'columns') loop
    insert into api.columns(name, board_id)
    values (_i ->> 'name', _board_id)
    returning column_id into _column_id;
    
    _columns := _columns || jsonb_build_object('id', _column_id, 'name', _i ->> 'name', 'tasks', '[]'::jsonb);
  end loop;
  
  return jsonb_build_object('id', _board_id, 'name', p_board ->> 'name', 'columns', _columns);
end;
$$ language plpgsql;
