grant usage   on schema   api, auth to anonymous;
grant execute on function api.get_board,
                          api.get_task,
			  api.get_initial_data,
			  auth.signout to anonymous;

