create or replace function auth.create_user(p_login text, p_password text) returns uuid as
$$
declare
  _userID uuid;
begin  
  insert into auth.users(login, password)
  values(p_login, auth.crypt(p_password, (select gen_salt('bf'))))
  returning user_id into _userID;

  return _userID;
end
$$ language plpgsql;
