-- Altamar on Neon: single-owner catalog schema.
-- Run with `pnpm db:migrate` after setting DATABASE_URL.
create extension if not exists pgcrypto;
create extension if not exists unaccent;

create or replace function immutable_unaccent(text) returns text as $$
  select unaccent('unaccent', $1)
$$ language sql immutable;

do $$ begin
  create type product_status as enum ('DRAFT', 'AVAILABLE', 'RESERVED', 'SOLD');
exception when duplicate_object then null; end $$;
do $$ begin
  create type product_price_mode as enum ('FIXED', 'NEGOTIABLE', 'CONTACT');
exception when duplicate_object then null; end $$;
do $$ begin
  create type currency_code as enum ('DOP', 'USD');
exception when duplicate_object then null; end $$;

create table if not exists admins (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  password_hash text not null,
  created_at timestamptz not null default now()
);

create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null check (char_length(title) between 3 and 140),
  short_description text check (short_description is null or char_length(short_description) <= 200),
  description text,
  type text not null check (char_length(type) between 2 and 60),
  type_normalized text generated always as (lower(regexp_replace(trim(both from immutable_unaccent(type)), '\s+', ' ', 'g'))) stored,
  price numeric(14, 2) check (price is null or price >= 0),
  currency currency_code not null default 'USD',
  price_mode product_price_mode not null default 'FIXED',
  location text check (location is null or char_length(location) <= 120),
  location_normalized text generated always as (lower(regexp_replace(trim(both from immutable_unaccent(coalesce(location, ''))), '\s+', ' ', 'g'))) stored,
  status product_status not null default 'DRAFT',
  featured boolean not null default false,
  homepage_position int,
  attributes jsonb not null default '[]'::jsonb,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint price_required_unless_contact check (price_mode = 'CONTACT' or price is not null),
  constraint published_requires_timestamp check (status = 'DRAFT' or published_at is not null),
  constraint attributes_is_array check (jsonb_typeof(attributes) = 'array')
);

create table if not exists product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products (id) on delete cascade,
  public_id text not null unique,
  width int not null check (width > 0),
  height int not null check (height > 0),
  format text not null,
  bytes int not null check (bytes > 0),
  alt text,
  position int not null default 0,
  created_at timestamptz not null default now(),
  unique (product_id, position) deferrable initially deferred
);

create table if not exists product_slug_history (
  slug text primary key,
  product_id uuid not null references products (id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists media_cleanup_queue (
  public_id text primary key,
  attempts int not null default 0,
  last_error text,
  created_at timestamptz not null default now()
);

create index if not exists products_status_published_idx on products (status, published_at desc);
create index if not exists products_type_normalized_idx on products (type_normalized);
create index if not exists products_location_normalized_idx on products (location_normalized);
create index if not exists products_price_idx on products (price);
create index if not exists products_featured_idx on products (homepage_position) where status = 'AVAILABLE' and homepage_position is not null;
create unique index if not exists products_homepage_position_unique_idx on products (homepage_position) where homepage_position is not null;
create index if not exists product_images_product_id_idx on product_images (product_id, position);
create index if not exists products_search_idx on products using gin (to_tsvector('spanish', coalesce(title, '') || ' ' || coalesce(short_description, '') || ' ' || coalesce(type, '')));

create or replace function set_updated_at() returns trigger as $$
begin new.updated_at = now(); return new; end;
$$ language plpgsql;

drop trigger if exists products_set_updated_at on products;
create trigger products_set_updated_at before update on products for each row execute function set_updated_at();

create or replace function record_slug_history() returns trigger as $$
begin
  if old.slug is distinct from new.slug then
    insert into product_slug_history (slug, product_id) values (old.slug, old.id) on conflict (slug) do nothing;
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists products_record_slug_history on products;
create trigger products_record_slug_history before update on products for each row execute function record_slug_history();
