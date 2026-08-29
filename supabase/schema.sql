-- ============================================================
-- 블로그 서비스 스키마 (Supabase SQL Editor에서 실행하세요)
-- ============================================================

-- 확장 기능
create extension if not exists "pgcrypto";

-- ------------------------------------------------------------
-- 1. profiles: auth.users 와 1:1 매핑되는 사용자 프로필
-- ------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  display_name text,
  avatar_url text,
  bio text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles are viewable by everyone"
  on public.profiles for select using (true);

create policy "users can insert their own profile"
  on public.profiles for insert with check (auth.uid() = id);

create policy "users can update their own profile"
  on public.profiles for update using (auth.uid() = id);

-- 구글 로그인 등으로 신규 유저가 생성되면 자동으로 profile 생성
create or replace function public.handle_new_user()
returns trigger as $$
declare
  base_username text;
  final_username text;
  suffix int := 0;
begin
  base_username := coalesce(
    new.raw_user_meta_data->>'username',
    new.raw_user_meta_data->>'user_name',
    split_part(new.email, '@', 1)
  );
  base_username := regexp_replace(lower(base_username), '[^a-z0-9_]', '', 'g');
  if base_username is null or base_username = '' then
    base_username := 'user';
  end if;

  final_username := base_username;
  while exists (select 1 from public.profiles where username = final_username) loop
    suffix := suffix + 1;
    final_username := base_username || suffix::text;
  end loop;

  insert into public.profiles (id, username, display_name, avatar_url)
  values (
    new.id,
    final_username,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', final_username),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ------------------------------------------------------------
-- 2. posts: 블로그 글
-- ------------------------------------------------------------
create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  content text not null,
  thumbnail_url text,
  view_count integer not null default 0,
  like_count integer not null default 0,
  comment_count integer not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists posts_author_id_idx on public.posts(author_id);
create index if not exists posts_created_at_idx on public.posts(created_at desc);
create index if not exists posts_like_count_idx on public.posts(like_count desc);

alter table public.posts enable row level security;

create policy "published posts are viewable by everyone"
  on public.posts for select using (published = true or author_id = auth.uid());

create policy "users can insert their own posts"
  on public.posts for insert with check (auth.uid() = author_id);

create policy "users can update their own posts"
  on public.posts for update using (auth.uid() = author_id);

create policy "users can delete their own posts"
  on public.posts for delete using (auth.uid() = author_id);

-- ------------------------------------------------------------
-- 3. post_views: 조회 이벤트 로그 (trend 계산용)
-- ------------------------------------------------------------
create table if not exists public.post_views (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  viewer_id uuid references public.profiles(id) on delete set null,
  viewed_at timestamptz not null default now()
);

create index if not exists post_views_post_id_idx on public.post_views(post_id);
create index if not exists post_views_viewed_at_idx on public.post_views(viewed_at desc);

alter table public.post_views enable row level security;

create policy "anyone can insert a view event"
  on public.post_views for insert with check (true);

create policy "views are viewable by everyone"
  on public.post_views for select using (true);

-- view_count 원자적 증가 RPC
create or replace function public.increment_view_count(p_post_id uuid)
returns void as $$
begin
  update public.posts set view_count = view_count + 1 where id = p_post_id;
end;
$$ language plpgsql security definer set search_path = public;

-- ------------------------------------------------------------
-- 4. likes
-- ------------------------------------------------------------
create table if not exists public.likes (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (post_id, user_id)
);

alter table public.likes enable row level security;

create policy "likes are viewable by everyone"
  on public.likes for select using (true);

create policy "users can like as themselves"
  on public.likes for insert with check (auth.uid() = user_id);

create policy "users can unlike their own like"
  on public.likes for delete using (auth.uid() = user_id);

-- like_count 자동 동기화 트리거
create or replace function public.sync_post_like_count()
returns trigger as $$
begin
  if (tg_op = 'INSERT') then
    update public.posts set like_count = like_count + 1 where id = new.post_id;
  elsif (tg_op = 'DELETE') then
    update public.posts set like_count = greatest(like_count - 1, 0) where id = old.post_id;
  end if;
  return null;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists on_like_change on public.likes;
create trigger on_like_change
  after insert or delete on public.likes
  for each row execute procedure public.sync_post_like_count();

-- ------------------------------------------------------------
-- 5. comments
-- ------------------------------------------------------------
create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now()
);

create index if not exists comments_post_id_idx on public.comments(post_id);

alter table public.comments enable row level security;

create policy "comments are viewable by everyone"
  on public.comments for select using (true);

create policy "users can comment as themselves"
  on public.comments for insert with check (auth.uid() = author_id);

create policy "users can delete their own comments"
  on public.comments for delete using (auth.uid() = author_id);

-- comment_count 자동 동기화 트리거
create or replace function public.sync_post_comment_count()
returns trigger as $$
begin
  if (tg_op = 'INSERT') then
    update public.posts set comment_count = comment_count + 1 where id = new.post_id;
  elsif (tg_op = 'DELETE') then
    update public.posts set comment_count = greatest(comment_count - 1, 0) where id = old.post_id;
  end if;
  return null;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists on_comment_change on public.comments;
create trigger on_comment_change
  after insert or delete on public.comments
  for each row execute procedure public.sync_post_comment_count();

-- ------------------------------------------------------------
-- 6. follows
-- ------------------------------------------------------------
create table if not exists public.follows (
  id uuid primary key default gen_random_uuid(),
  follower_id uuid not null references public.profiles(id) on delete cascade,
  following_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (follower_id, following_id),
  check (follower_id <> following_id)
);

alter table public.follows enable row level security;

create policy "follows are viewable by everyone"
  on public.follows for select using (true);

create policy "users can follow as themselves"
  on public.follows for insert with check (auth.uid() = follower_id);

create policy "users can unfollow as themselves"
  on public.follows for delete using (auth.uid() = follower_id);

-- ------------------------------------------------------------
-- 7. trend 조회용 뷰: 최근 5일간 조회수가 많은 글 (급상승)
-- ------------------------------------------------------------
create or replace view public.trending_posts as
select
  p.*,
  count(pv.id) filter (where pv.viewed_at > now() - interval '5 days') as recent_view_count
from public.posts p
left join public.post_views pv on pv.post_id = p.id
where p.published = true
group by p.id
order by recent_view_count desc;
