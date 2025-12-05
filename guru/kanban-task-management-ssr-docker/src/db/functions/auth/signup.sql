create or replace function auth.signup(p_login text, p_password text) returns jsonb as
$$
declare
  _userID  uuid;
  _boardID uuid;  
begin
  _userID = auth.create_user(p_login, p_password);

  --create default data
  insert into api.boards(name, user_id) values ('Empty board', _userID) returning board_id into _boardID;
  insert into api.columns(name, board_id, user_id) values ('Empty column', _boardID, _userID);
 
  return jsonb_build_object(
    'bearer',  auth.create_jwt(_userID),
    'session', auth.create_session(_userID)
  );
exception
  when unique_violation then
    raise sqlstate 'PT409' using message = 'Login already exists';
  when others then
    raise exception 'An unexpected error occurred: %', SQLERRM;
end;
$$ language plpgsql security definer;
