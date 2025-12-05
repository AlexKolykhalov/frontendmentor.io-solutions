grant usage   on schema   auth to guest;
grant execute on function auth.signin,
                          auth.signup,
			  auth.generate_authz_token to guest;
