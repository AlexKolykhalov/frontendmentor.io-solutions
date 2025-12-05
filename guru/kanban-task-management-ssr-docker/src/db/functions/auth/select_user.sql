create or replace function auth.select_user(p_login text, p_password text) returns uuid as
$$
declare
  _userID uuid;
begin
  select user_id into _userID
  from auth.users
  where password = (auth.crypt(p_password, (select password from auth.users where login = p_login)));

  return _userID;
end
$$ language plpgsql;
