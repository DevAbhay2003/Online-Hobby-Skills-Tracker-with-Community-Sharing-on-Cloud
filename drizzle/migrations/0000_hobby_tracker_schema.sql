create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  display_name text not null,
  bio text default '',
  avatar_url text,
  interests text[] default '{}',
  created_at timestamptz not null default now()
);
grant select on public.profiles to anon;
grant select, insert, update on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;
create policy "profiles readable by everyone" on public.profiles for select using (true);
create policy "users insert own profile" on public.profiles for insert to authenticated with check (auth.uid() = id);
create policy "users update own profile" on public.profiles for update to authenticated using (auth.uid() = id);

create table public.skills (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  category text not null default 'Other',
  current_level text not null default 'BEGINNER' check (current_level in ('BEGINNER','INTERMEDIATE','ADVANCED')),
  target_level text not null default 'ADVANCED' check (target_level in ('BEGINNER','INTERMEDIATE','ADVANCED')),
  status text not null default 'ACTIVE' check (status in ('ACTIVE','PAUSED','COMPLETED')),
  description text default '',
  start_date date not null default current_date,
  target_date date,
  created_at timestamptz not null default now()
);
grant select on public.skills to anon;
grant select, insert, update, delete on public.skills to authenticated;
grant all on public.skills to service_role;
alter table public.skills enable row level security;
create policy "skills readable by everyone" on public.skills for select using (true);
create policy "users manage own skills" on public.skills for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index skills_user_idx on public.skills(user_id);

create table public.goals (
  id uuid primary key default gen_random_uuid(),
  skill_id uuid not null references public.skills(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  target_value numeric not null check (target_value > 0),
  current_value numeric not null default 0,
  unit text not null default 'hours',
  deadline date,
  status text not null default 'ACTIVE' check (status in ('ACTIVE','COMPLETED')),
  created_at timestamptz not null default now()
);
grant select on public.goals to anon;
grant select, insert, update, delete on public.goals to authenticated;
grant all on public.goals to service_role;
alter table public.goals enable row level security;
create policy "goals readable by everyone" on public.goals for select using (true);
create policy "users manage own goals" on public.goals for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index goals_skill_idx on public.goals(skill_id);

create table public.milestones (
  id uuid primary key default gen_random_uuid(),
  goal_id uuid not null references public.goals(id) on delete cascade,
  title text not null,
  target_value numeric not null,
  achieved boolean not null default false,
  achieved_at timestamptz
);
grant select on public.milestones to anon;
grant select, insert, update, delete on public.milestones to authenticated;
grant all on public.milestones to service_role;
alter table public.milestones enable row level security;
create policy "milestones readable by everyone" on public.milestones for select using (true);
create policy "users manage own milestones" on public.milestones for all to authenticated
  using (exists (select 1 from public.goals g where g.id = goal_id and g.user_id = auth.uid()))
  with check (exists (select 1 from public.goals g where g.id = goal_id and g.user_id = auth.uid()));

create table public.practice_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  skill_id uuid not null references public.skills(id) on delete cascade,
  duration_minutes int not null check (duration_minutes > 0),
  activity text not null,
  notes text default '',
  practiced_at date not null default current_date,
  created_at timestamptz not null default now()
);
grant select on public.practice_sessions to anon;
grant select, insert, update, delete on public.practice_sessions to authenticated;
grant all on public.practice_sessions to service_role;
alter table public.practice_sessions enable row level security;
create policy "sessions readable by everyone" on public.practice_sessions for select using (true);
create policy "users manage own sessions" on public.practice_sessions for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index sessions_user_idx on public.practice_sessions(user_id, practiced_at desc);
create index sessions_skill_idx on public.practice_sessions(skill_id);

create table public.posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  skill_id uuid references public.skills(id) on delete set null,
  content text not null,
  media_url text,
  created_at timestamptz not null default now()
);
grant select on public.posts to anon;
grant select, insert, delete on public.posts to authenticated;
grant all on public.posts to service_role;
alter table public.posts enable row level security;
create policy "posts readable by everyone" on public.posts for select using (true);
create policy "users create own posts" on public.posts for insert to authenticated with check (auth.uid() = user_id);
create policy "users delete own posts" on public.posts for delete to authenticated using (auth.uid() = user_id);
create index posts_created_idx on public.posts(created_at desc);

create table public.likes (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (post_id, user_id)
);
grant select on public.likes to anon;
grant select, insert, delete on public.likes to authenticated;
grant all on public.likes to service_role;
alter table public.likes enable row level security;
create policy "likes readable by everyone" on public.likes for select using (true);
create policy "users like as self" on public.likes for insert to authenticated with check (auth.uid() = user_id);
create policy "users unlike own" on public.likes for delete to authenticated using (auth.uid() = user_id);
create index likes_post_idx on public.likes(post_id);

create table public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now()
);
grant select on public.comments to anon;
grant select, insert, delete on public.comments to authenticated;
grant all on public.comments to service_role;
alter table public.comments enable row level security;
create policy "comments readable by everyone" on public.comments for select using (true);
create policy "users comment as self" on public.comments for insert to authenticated with check (auth.uid() = user_id);
create policy "users delete own comments" on public.comments for delete to authenticated using (auth.uid() = user_id);
create index comments_post_idx on public.comments(post_id);

create table public.follows (
  id uuid primary key default gen_random_uuid(),
  follower_id uuid not null references public.profiles(id) on delete cascade,
  following_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (follower_id, following_id),
  check (follower_id <> following_id)
);
grant select on public.follows to anon;
grant select, insert, delete on public.follows to authenticated;
grant all on public.follows to service_role;
alter table public.follows enable row level security;
create policy "follows readable by everyone" on public.follows for select using (true);
create policy "users follow as self" on public.follows for insert to authenticated with check (auth.uid() = follower_id);
create policy "users unfollow own" on public.follows for delete to authenticated using (auth.uid() = follower_id);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, username, display_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', 'user_' || substr(new.id::text, 1, 8)),
    coalesce(new.raw_user_meta_data->>'display_name', new.raw_user_meta_data->>'full_name', 'New User'),
    new.raw_user_meta_data->>'avatar_url'
  ) on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create policy "authenticated users can view uploads" on storage.objects for select to authenticated using (bucket_id = 'uploads');
create policy "authenticated users upload to own folder" on storage.objects for insert to authenticated
  with check (bucket_id = 'uploads' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "users update own uploads" on storage.objects for update to authenticated
  using (bucket_id = 'uploads' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "users delete own uploads" on storage.objects for delete to authenticated
  using (bucket_id = 'uploads' and (storage.foldername(name))[1] = auth.uid()::text);