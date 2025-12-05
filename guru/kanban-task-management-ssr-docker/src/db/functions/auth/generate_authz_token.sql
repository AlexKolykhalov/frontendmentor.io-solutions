create or replace function auth.generate_authz_token() returns text as
$$
declare
  _userID uuid;
begin
  update auth.sessions set expires_at = now() + interval '15 minutes'
  where session_id = (current_setting('request.cookies', true)::json->>'session-uuid')::uuid
        and expires_at > now()
  returning user_id into _userID;

  if _userID is not null then
    return auth.create_jwt(_userID);
  else
    raise sqlstate 'PT401' using message = 'Unauthorized';
  end if;
end
$$ language plpgsql security definer;
