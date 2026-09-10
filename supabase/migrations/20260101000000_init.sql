-- ALTAMAR — initial schema
-- Single-owner sales catalog. No vendor/seller concept anywhere.

create extension if not exists pgcrypto;
create extension if not exists unaccent;

-- unaccent() itself is only STABLE (its dictionary could theoretically be
-- reloaded), so Postgres refuses it inside a GENERATED ALWAYS AS STORED
-- column. This wrapper pins the 'unaccent' dictionary explicitly and is
-- marked IMMUTABLE, which is the standard, documented way to use it in
-- generated columns and indexes.
create or replace function immutable_unaccent(text) returns text as $$
  select unaccent('unaccent', $1)
$$ language sql immutable;

create type product_status as enum ('DRAFT', 'AVAILABLE', 'RESERVED', 'SOLD');
create type product_price_mode as enum ('FIXED', 'NEGOTIABLE', 'CONTACT');
create type currency_code as enum ('DOP', 'USD');

-- ---------------------------------------------------------------------------
-- admins: explicit allow-list of authorized owner accounts. No public
-- registration exists anywhere in the app; rows here are inserted manually.
-- ---------------------------------------------------------------------------
create table admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- products: the one generic entity for every item type.
-- ---------------------------------------------------------------------------
create table products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null check (char_length(title) between 3 and 140),
  short_description text check (
    short_description is null or char_length(short_description) <= 200
  ),
  description text,

  type text not null check (char_length(type) between 2 and 60),
  type_normalized text generated always as (
    lower(regexp_replace(trim(both from immutable_unaccent(type)), '\s+', ' ', 'g'))
  ) stored,

  price numeric(14, 2) check (price is null or price >= 0),
  currency currency_code not null default 'USD',
  price_mode product_price_mode not null default 'FIXED',

  location text check (location is null or char_length(location) <= 120),
  location_normalized text generated always as (
    lower(regexp_replace(trim(both from immutable_unaccent(coalesce(location, ''))), '\s+', ' ', 'g'))
  ) stored,

  status product_status not null default 'DRAFT',
  featured boolean not null default false,
  homepage_position int,

  attributes jsonb not null default '[]'::jsonb,

  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint price_required_unless_contact
    check (price_mode = 'CONTACT' or price is not null),
  constraint published_requires_timestamp
    check (status = 'DRAFT' or published_at is not null),
  constraint attributes_is_array
    check (jsonb_typeof(attributes) = 'array')
);

create index products_status_published_idx
  on products (status, published_at desc);
create index products_type_normalized_idx on products (type_normalized);
create index products_location_normalized_idx on products (location_normalized);
create index products_price_idx on products (price);
create index products_featured_idx
  on products (homepage_position)
  where status = 'AVAILABLE' and homepage_position is not null;
create unique index products_homepage_position_unique_idx
  on products (homepage_position)
  where homepage_position is not null;

create index products_search_idx on products
  using gin (
    to_tsvector(
      'spanish',
      coalesce(title, '') || ' ' || coalesce(short_description, '') || ' ' || coalesce(type, '')
    )
  );

-- ---------------------------------------------------------------------------
-- product_images: cover image = position 0. One source of truth for
-- ordering; no separate is_cover boolean that could disagree with it.
-- ---------------------------------------------------------------------------
create table product_images (
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

create index product_images_product_id_idx
  on product_images (product_id, position);

-- ---------------------------------------------------------------------------
-- product_slug_history: old slugs 308-redirect to the current product.
-- ---------------------------------------------------------------------------
create table product_slug_history (
  slug text primary key,
  product_id uuid not null references products (id) on delete cascade,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- media_cleanup_queue: if a Cloudinary delete fails after the DB row is
-- gone, the orphan is queued for retry rather than blocking the admin.
-- ---------------------------------------------------------------------------
create table media_cleanup_queue (
  public_id text primary key,
  attempts int not null default 0,
  last_error text,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- updated_at trigger
-- ---------------------------------------------------------------------------
create function set_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger products_set_updated_at
  before update on products
  for each row execute function set_updated_at();

-- Whenever a product's slug changes, remember the old one for redirects.
create function record_slug_history() returns trigger as $$
begin
  if old.slug is distinct from new.slug then
    insert into product_slug_history (slug, product_id)
    values (old.slug, old.id)
    on conflict (slug) do nothing;
  end if;
  return new;
end;
$$ language plpgsql;

create trigger products_record_slug_history
  before update on products
  for each row execute function record_slug_history();

-- ---------------------------------------------------------------------------
-- Row Level Security — the real security boundary, not just app filters.
-- ---------------------------------------------------------------------------
alter table admins enable row level security;
alter table products enable row level security;
alter table product_images enable row level security;
alter table product_slug_history enable row level security;
alter table media_cleanup_queue enable row level security;

create function is_admin() returns boolean as $$
  select exists (select 1 from admins where user_id = auth.uid());
$$ language sql stable security definer set search_path = public;

-- admins: only an admin can read the allow-list; no one can write it via API.
create policy admins_select_admin_only on admins
  for select using (is_admin());

-- products: public can read anything that is not a draft.
create policy products_public_read on products
  for select using (status <> 'DRAFT');

create policy products_admin_all on products
  for all using (is_admin()) with check (is_admin());

-- product_images: public can read images of non-draft products only.
create policy product_images_public_read on product_images
  for select using (
    exists (
      select 1 from products p
      where p.id = product_images.product_id and p.status <> 'DRAFT'
    )
  );

create policy product_images_admin_all on product_images
  for all using (is_admin()) with check (is_admin());

-- slug history: public read (needed for redirect lookups), admin write.
create policy product_slug_history_public_read on product_slug_history
  for select using (true);

create policy product_slug_history_admin_write on product_slug_history
  for all using (is_admin()) with check (is_admin());

-- media cleanup queue: admin only, never exposed publicly.
create policy media_cleanup_queue_admin_all on media_cleanup_queue
  for all using (is_admin()) with check (is_admin());
