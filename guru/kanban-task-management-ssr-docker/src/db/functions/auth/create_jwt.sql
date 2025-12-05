create or replace function auth.create_jwt(p_user_id uuid) returns text as
$$
declare
  _role text := 'anonymous';
begin
  if p_user_id <> '00000000-0000-0000-0000-000000000000' then _role := 'auth'; end if;
  return auth.sign(
    json_build_object(
     'id',   p_user_id,
     'role', _role,
     'iat',  extract(epoch from now())::integer,
     'exp',  extract(epoch from (now() + interval '5 minutes'))::integer
    ),
    current_setting('app.settings.jwt_secret')
  );
end
$$ language plpgsql;
