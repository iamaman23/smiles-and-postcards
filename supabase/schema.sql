create table if not exists public.cities (
  id text primary key,
  city_id text not null unique,
  city text not null default '',
  country text not null default '',
  title text not null default '',
  excerpt text not null default '',
  image text not null default '',
  hero_image text not null default '',
  featured boolean not null default false,
  pinned boolean not null default true,
  show_on_home boolean not null default true,
  best_season text not null default '',
  date text not null default '',
  budget text not null default '',
  budget_symbol text not null default '$',
  final_score numeric not null default 0,
  tags jsonb not null default '[]'::jsonb,
  highlights jsonb not null default '[]'::jsonb,
  warnings jsonb not null default '[]'::jsonb,
  skip_if jsonb not null default '[]'::jsonb,
  stats jsonb not null default '{}'::jsonb,
  meta jsonb not null default '{}'::jsonb,
  geo jsonb not null default '{}'::jsonb,
  scores jsonb not null default '{}'::jsonb,
  budget_breakdown jsonb not null default '[]'::jsonb,
  recommendation_profile jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  published_by text not null default ''
);

create table if not exists public.itineraries (
  id text primary key,
  city_id text not null references public.cities (id) on delete cascade,
  days integer not null default 3,
  travel_styles jsonb not null default '[]'::jsonb,
  itinerary jsonb not null default '[]'::jsonb,
  food jsonb not null default '[]'::jsonb,
  gems jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  published_by text not null default ''
);

create table if not exists public.places (
  id text primary key,
  city_id text not null references public.cities (id) on delete cascade,
  city text not null default '',
  country text not null default '',
  slug text not null default '',
  name text not null default '',
  kind text not null default '',
  kinds jsonb not null default '[]'::jsonb,
  geo jsonb not null default '{}'::jsonb,
  "desc" text not null default '',
  tip text not null default '',
  cuisine text not null default '',
  price text not null default '',
  image text not null default '',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  published_by text not null default ''
);

create table if not exists public.recommendations (
  id text primary key,
  title text not null default '',
  description text not null default '',
  filters jsonb not null default '{}'::jsonb,
  ranking jsonb not null default '{}'::jsonb,
  city_ids jsonb not null default '[]'::jsonb,
  ranked_cities jsonb not null default '[]'::jsonb,
  result_count integer not null default 0,
  cover_city_id text not null default '',
  updated_at timestamptz not null default timezone('utc', now()),
  published_by text not null default ''
);

create table if not exists public.site_config (
  key text primary key,
  filter_tags jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.users (
  id text primary key,
  email text not null unique,
  display_name text not null default '',
  photo_url text not null default '',
  email_verified boolean not null default false,
  provider_ids jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  last_sign_in_at timestamptz not null default timezone('utc', now())
);

create index if not exists cities_featured_idx on public.cities (featured);
create index if not exists cities_show_on_home_idx on public.cities (show_on_home);
create index if not exists itineraries_city_id_idx on public.itineraries (city_id);
create index if not exists places_city_id_idx on public.places (city_id);
create index if not exists users_email_idx on public.users (email);
