create table auth.users (
  id         serial      primary key,
  user_id    uuid        unique default gen_random_uuid(),
  login      varchar(50) unique not null,
  password   text        unique not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table auth.sessions (
  id         serial      primary key,
  session_id uuid        unique default gen_random_uuid(),
  user_id    uuid        not null,
  role       text        default 'anonymous',
  created_at timestamptz default now(),
  expires_at timestamptz default now(),

  foreign key (user_id) references auth.users(user_id)
);
