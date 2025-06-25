create function api.delete_board(p_id uuid) returns void as
$$
begin
  with delete_board as (delete from api.boards where board_id = p_id returning board_id),
  delete_columns as (delete from api.columns where board_id in (select board_id from delete_board) returning column_id),
  delete_tasks as (delete from api.tasks where column_id in (select column_id from delete_columns) returning task_id)
  delete from api.subtasks where task_id in (select task_id from delete_tasks);
end;
$$ language plpgsql;
