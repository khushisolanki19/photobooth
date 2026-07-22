-- Photo Booth collaborative rooms schema
-- Run this in the Supabase SQL editor for your project.

create extension if not exists "pgcrypto";

create table if not exists public.rooms (
  id text primary key,
  code text unique not null,
  host_id text not null,
  layout_id text not null default 'classic-vertical-4',
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  status text not null default 'active' check (status in ('active', 'ended')),
  strip_slots jsonb not null default '[]'::jsonb,
  theme jsonb not null default '{}'::jsonb
);

create table if not exists public.participants (
  id text primary key,
  room_id text not null references public.rooms(id) on delete cascade,
  name text not null,
  is_host boolean not null default false,
  connected boolean not null default true,
  joined_at timestamptz not null default now(),
  color text not null default '#C45C5C'
);

create table if not exists public.photos (
  id text primary key,
  room_id text not null references public.rooms(id) on delete cascade,
  participant_id text not null references public.participants(id) on delete cascade,
  storage_path text not null,
  public_url text not null,
  created_at timestamptz not null default now()
);

create index if not exists rooms_code_idx on public.rooms(code);
create index if not exists participants_room_idx on public.participants(room_id);
create index if not exists photos_room_idx on public.photos(room_id);

-- Storage bucket for temporary room photos
-- Create via dashboard or:
-- insert into storage.buckets (id, name, public) values ('room-photos', 'room-photos', true);

alter table public.rooms enable row level security;
alter table public.participants enable row level security;
alter table public.photos enable row level security;

-- Party-friendly open policies (anon guests). Tighten for production.
create policy "rooms read" on public.rooms for select using (true);
create policy "rooms insert" on public.rooms for insert with check (true);
create policy "rooms update" on public.rooms for update using (true);
create policy "rooms delete" on public.rooms for delete using (true);

create policy "participants read" on public.participants for select using (true);
create policy "participants insert" on public.participants for insert with check (true);
create policy "participants update" on public.participants for update using (true);
create policy "participants delete" on public.participants for delete using (true);

create policy "photos read" on public.photos for select using (true);
create policy "photos insert" on public.photos for insert with check (true);
create policy "photos delete" on public.photos for delete using (true);

-- Optional: auto-expire cleanup helper
-- delete from public.rooms where expires_at < now() or status = 'ended';
