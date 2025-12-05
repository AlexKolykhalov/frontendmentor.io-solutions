create extension if not exists pgcrypto schema auth; -- using in /auth/create_user.sql, /auth/select_user.sql
create extension if not exists pgjwt    schema auth; -- using in /auth/create_jwt.sql
