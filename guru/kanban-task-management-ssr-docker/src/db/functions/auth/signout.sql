create or replace function auth.signout() returns void as
$$
declare
  _sessionID uuid := current_setting('request.cookies', true)::json ->> 'session-uuid';
begin
  delete from auth.sessions where session_id = _sessionID;
end
$$ language plpgsql security definer;
