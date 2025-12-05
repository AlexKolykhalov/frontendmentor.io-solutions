grant usage   on schema   api, auth to auth;
grant execute on function api.create_board,
                          api.create_task,
                          api.delete_board,
                          api.delete_task,
                          api.get_board,
                          api.get_initial_data,
                          api.get_task,
                          api.partly_update_task,
                          api.update_board,
                          api.update_subtask,
                          api.update_task,
			  auth.delete_user,
			  auth.signout to auth;
