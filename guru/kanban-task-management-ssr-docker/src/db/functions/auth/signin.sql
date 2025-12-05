create or replace function auth.signin(p_login text, p_password text) returns jsonb as
$$
declare
  _userID uuid;
begin
  _userID = auth.select_user(p_login, p_password);
  if _userID is not null then
    return jsonb_build_object(
      'bearer',  auth.create_jwt(_userID),
      'session', auth.create_session(_userID)
    );
  else
    raise sqlstate 'PT401' using message = 'Invalid credentials';
  end if;
end
$$ language plpgsql security definer;
