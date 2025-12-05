create table api.boards (
  id         serial      primary key,
  board_id   uuid        unique default gen_random_uuid(),
  name       varchar(30) not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  user_id    uuid        not null,

  foreign key (user_id) references auth.users(user_id)
);
-- alter table api.boards enable row level security;
-- create policy api_board_policy on api.boards
--   for select
--   using (user_id = auth.get_user_id_by_session_token())

create table api.columns (
  id         serial      primary key,
  column_id  uuid        unique default gen_random_uuid(),
  name       varchar(30) not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  board_id   uuid        not null,
  user_id    uuid        not null,
  
  foreign key (board_id) references api.boards(board_id),
  foreign key (user_id)  references auth.users(user_id)
);
-- alter table api.columns enable row level security;

create table api.tasks (
  id          serial       primary key,
  task_id     uuid         unique default gen_random_uuid(),
  title       varchar(100) not null,
  description varchar(300) not null, -- p_task ->> 'description' = ''
  created_at  timestamptz  default now(),
  updated_at  timestamptz  default now(),
  column_id   uuid         not null,
  user_id     uuid         not null,
  
  foreign key (column_id) references api.columns(column_id),
  foreign key (user_id)   references auth.users(user_id)
);
-- alter table api.tasks enable row level security;

create table api.subtasks (
  id           serial       primary key,
  subtask_id   uuid         unique default gen_random_uuid(),
  title        varchar(100) not null,
  is_completed boolean      default false,
  created_at   timestamptz  default now(),
  updated_at   timestamptz  default now(),
  task_id      uuid         not null,
  user_id      uuid         not null,
  
  foreign key (task_id) references api.tasks(task_id),
  foreign key (user_id) references auth.users(user_id)
);
-- alter table api.subtasks enable row level security;
