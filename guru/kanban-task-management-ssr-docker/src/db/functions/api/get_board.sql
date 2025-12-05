create or replace function api.get_board(p_board_id uuid) returns jsonb as
$$
declare
  _userID    uuid := current_setting('request.jwt.claims', true)::json ->> 'id';
  _boardData jsonb;
begin
  with c as (
    with t as (
      with s as (select id, subtask_id, title, is_completed, task_id from api.subtasks where user_id = _userID)
      select t.id, t.column_id, t.task_id, t.title, t.description, coalesce(jsonb_agg(jsonb_build_object('id', s.subtask_id, 'title', s.title, 'isCompleted', s.is_completed) order by s.id) filter (where s.subtask_id is not null), '[]'::jsonb) as subtasks
      from api.tasks t left join s on t.task_id = s.task_id
      where t.user_id = _userID
      group by t.id, t.column_id, t.task_id, t.title, t.description)
    select c.id, c.board_id, c.column_id, c.name, coalesce(jsonb_agg(jsonb_build_object('id', t.task_id, 'title', t.title, 'description', t.description, 'subtasks', t.subtasks) order by t.id) filter (where t.task_id is not null), '[]'::jsonb) as tasks
    from api.columns c left join t on c.column_id = t.column_id
    where c.user_id = _userID
    group by c.id, c.board_id, c.column_id, c.name)
  select jsonb_build_object('id', b.board_id, 'name', b.name, 'columns', jsonb_agg(jsonb_build_object('id', c.column_id, 'name', c.name, 'tasks', c.tasks) order by c.id))
  into _boardData
  from api.boards b left join c on b.board_id = c.board_id
  where b.user_id = _userID and b.board_id = p_board_id
  group by b.id, b.board_id, b.name;

  if _boardData is null then
    raise sqlstate 'PT404' using message = 'Board not found';
  end if;

  return _boardData;
end;
$$ language plpgsql security definer;
