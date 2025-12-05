create or replace function auth.create_session(p_user_id uuid) returns uuid as
$$
declare
  _role      text := 'anonymous';
  _sessionID uuid;
begin
  if p_user_id <> '00000000-0000-0000-0000-000000000000' then _role := 'auth'; end if;

  insert into auth.sessions(user_id, role, expires_at)
  values(p_user_id, _role, now() + interval '15 minutes')
  returning session_id into _sessionID;

  return _sessionID;
end
$$ language plpgsql;
