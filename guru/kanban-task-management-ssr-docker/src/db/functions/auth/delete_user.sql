create or replace function auth.delete_user() returns void as
$$
declare
  _userID uuid := current_setting('request.jwt.claims', true)::json ->> 'id';
begin
  delete from api.subtasks where user_id = _userID;
  delete from api.tasks    where user_id = _userID;
  delete from api.columns  where user_id = _userID;
  delete from api.boards   where user_id = _userID;

  delete from auth.sessions where user_id = _userID;
  delete from auth.users    where user_id = _userID;
end
$$ language plpgsql security definer;
