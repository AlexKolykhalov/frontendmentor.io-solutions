create or replace function api.delete_board(p_board_id uuid) returns void as
$$
declare
  _boardID uuid;
begin
  select board_id into _boardID from api.boards where board_id = p_board_id;

  if _boardID is null then
    raise sqlstate 'PT404' using message = 'Board not found';
  end if;

  with delete_board as (delete from api.boards where board_id = p_board_id returning board_id),
  delete_columns as (delete from api.columns where board_id in (select board_id from delete_board) returning column_id),
  delete_tasks as (delete from api.tasks where column_id in (select column_id from delete_columns) returning task_id)
  delete from api.subtasks where task_id in (select task_id from delete_tasks);
end;
$$ language plpgsql security definer;
