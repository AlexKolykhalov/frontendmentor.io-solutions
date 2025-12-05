create role :PGRST_AUTHENTICATOR_ROLE login    password :'PGRST_AUTHENTICATOR_PASSWORD' noinherit nocreatedb nocreaterole nosuperuser;
create role guest                     nologin;
create role anonymous                 nologin;
create role auth                      nologin;
