-- Failed admin login attempts, used to throttle password guessing.
create table if not exists login_attempts (
  id bigserial primary key,
  email text not null,
  ip text not null,
  attempted_at timestamptz not null default now()
);

create index if not exists login_attempts_email_idx on login_attempts (email, attempted_at desc);
create index if not exists login_attempts_ip_idx on login_attempts (ip, attempted_at desc);
