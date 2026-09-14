-- ÉTABLI · schéma initial
-- Réseau d'ateliers partagés : ateliers, machines, habilitations, réservations, crédits.

create extension if not exists btree_gist;

-- ---------------------------------------------------------------- types

create type user_role as enum ('member', 'admin');

create type machine_category as enum (
  'laser', 'impression_3d', 'bois', 'metal', 'textile', 'electronique'
);

create type machine_status as enum ('available', 'maintenance', 'retired');

create type certification_status as enum ('pending', 'approved', 'rejected');

create type booking_status as enum ('pending', 'confirmed', 'cancelled', 'completed');

-- ---------------------------------------------------------------- tables

create table workshops (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique,
  name        text not null,
  city        text not null,
  address     text not null,
  latitude    double precision,
  longitude   double precision,
  description text not null default '',
  opening     text not null default '',
  image_url   text,
  published   boolean not null default true,
  created_at  timestamptz not null default now()
);

create table machines (
  id             uuid primary key default gen_random_uuid(),
  workshop_id    uuid not null references workshops (id) on delete cascade,
  slug           text not null unique,
  name           text not null,
  category       machine_category not null,
  status         machine_status not null default 'available',
  summary        text not null default '',
  description    text not null default '',
  image_url      text,
  hourly_credits integer not null default 1 check (hourly_credits > 0),
  created_at     timestamptz not null default now()
);

create index machines_workshop_idx on machines (workshop_id);
create index machines_category_idx on machines (category);

create table profiles (
  id                   uuid primary key references auth.users (id) on delete cascade,
  full_name            text not null default '',
  phone                text,
  role                 user_role not null default 'member',
  home_workshop_id     uuid references workshops (id) on delete set null,
  credits_balance      integer not null default 0,
  onboarding_completed boolean not null default false,
  email_notifications  boolean not null default true,
  created_at           timestamptz not null default now()
);

-- Habilitation : le droit d'utiliser une famille de machines, validé par un admin.
create table certifications (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references profiles (id) on delete cascade,
  category    machine_category not null,
  status      certification_status not null default 'pending',
  motivation  text not null default '',
  review_note text,
  reviewed_by uuid references profiles (id) on delete set null,
  reviewed_at timestamptz,
  created_at  timestamptz not null default now(),
  unique (user_id, category)
);

create table bookings (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references profiles (id) on delete cascade,
  machine_id uuid not null references machines (id) on delete cascade,
  starts_at  timestamptz not null,
  ends_at    timestamptz not null,
  status     booking_status not null default 'confirmed',
  credits    integer not null check (credits >= 0),
  project    text not null default '',
  created_at timestamptz not null default now(),
  constraint bookings_period_check check (ends_at > starts_at)
);

create index bookings_user_idx on bookings (user_id, starts_at desc);
create index bookings_machine_idx on bookings (machine_id, starts_at);

-- Deux réservations actives ne peuvent pas se chevaucher sur la même machine.
alter table bookings
  add constraint bookings_no_overlap
  exclude using gist (
    machine_id with =,
    tstzrange (starts_at, ends_at) with &&
  )
  where (status in ('pending', 'confirmed', 'completed'));

create table credit_transactions (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references profiles (id) on delete cascade,
  delta      integer not null,
  reason     text not null,
  booking_id uuid references bookings (id) on delete set null,
  created_at timestamptz not null default now()
);

create index credit_transactions_user_idx on credit_transactions (user_id, created_at desc);

-- ---------------------------------------------------------------- helpers

-- security definer : contourne RLS pour éviter une récursion de politique sur profiles.
create or replace function is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from profiles where id = auth.uid() and role = 'admin'
  );
$$;

-- Un compte auth crée toujours son profil, avec 10 crédits offerts.
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into profiles (id, full_name, credits_balance)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    10
  );

  insert into credit_transactions (user_id, delta, reason)
  values (new.id, 10, 'Crédits de bienvenue');

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ---------------------------------------------------------------- réservation

-- Tout le métier sensible est ici : une seule transaction vérifie l'habilitation,
-- le solde de crédits et le chevauchement, puis débite. Le client ne peut pas
-- écrire bookings ni credit_transactions directement (voir les politiques RLS).
create or replace function book_machine(
  p_machine_id uuid,
  p_starts_at  timestamptz,
  p_ends_at    timestamptz,
  p_project    text default ''
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user    uuid := auth.uid();
  v_machine machines;
  v_hours   numeric;
  v_cost    integer;
  v_balance integer;
  v_booking uuid;
begin
  if v_user is null then
    raise exception 'AUTH_REQUIRED';
  end if;

  select * into v_machine from machines where id = p_machine_id;

  if v_machine is null then
    raise exception 'MACHINE_NOT_FOUND';
  end if;

  if v_machine.status <> 'available' then
    raise exception 'MACHINE_UNAVAILABLE';
  end if;

  if p_ends_at <= p_starts_at then
    raise exception 'INVALID_RANGE';
  end if;

  if p_starts_at < now() then
    raise exception 'SLOT_IN_PAST';
  end if;

  if not exists (
    select 1 from certifications
    where user_id = v_user
      and category = v_machine.category
      and status = 'approved'
  ) then
    raise exception 'CERTIFICATION_REQUIRED';
  end if;

  v_hours := extract(epoch from (p_ends_at - p_starts_at)) / 3600;
  v_cost := ceil(v_hours)::integer * v_machine.hourly_credits;

  select credits_balance into v_balance
  from profiles where id = v_user for update;

  if v_balance < v_cost then
    raise exception 'INSUFFICIENT_CREDITS';
  end if;

  insert into bookings (user_id, machine_id, starts_at, ends_at, credits, project, status)
  values (v_user, p_machine_id, p_starts_at, p_ends_at, v_cost, coalesce(p_project, ''), 'confirmed')
  returning id into v_booking;

  update profiles set credits_balance = credits_balance - v_cost where id = v_user;

  insert into credit_transactions (user_id, delta, reason, booking_id)
  values (v_user, -v_cost, 'Réservation ' || v_machine.name, v_booking);

  return v_booking;
exception
  when exclusion_violation then
    raise exception 'SLOT_TAKEN';
end;
$$;

-- Annulation par le membre : remboursement intégral si > 2h avant le créneau.
create or replace function cancel_booking(p_booking_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user    uuid := auth.uid();
  v_booking bookings;
  v_refund  integer;
begin
  select * into v_booking from bookings where id = p_booking_id;

  if v_booking is null then
    raise exception 'BOOKING_NOT_FOUND';
  end if;

  if v_booking.user_id <> v_user and not is_admin() then
    raise exception 'FORBIDDEN';
  end if;

  if v_booking.status <> 'confirmed' then
    raise exception 'NOT_CANCELLABLE';
  end if;

  update bookings set status = 'cancelled' where id = p_booking_id;

  v_refund := case when v_booking.starts_at - now() > interval '2 hours'
                   then v_booking.credits else 0 end;

  if v_refund > 0 then
    update profiles set credits_balance = credits_balance + v_refund
    where id = v_booking.user_id;

    insert into credit_transactions (user_id, delta, reason, booking_id)
    values (v_booking.user_id, v_refund, 'Remboursement annulation', p_booking_id);
  end if;
end;
$$;

-- Disponibilités : un membre doit voir qu'un créneau est pris sans rien savoir
-- de la réservation d'autrui. Cette fonction ne renvoie que les bornes horaires.
create or replace function machine_busy_slots(p_machine_id uuid, p_day date)
returns table (starts_at timestamptz, ends_at timestamptz)
language sql
security definer
set search_path = public
stable
as $$
  select b.starts_at, b.ends_at
  from bookings b
  where b.machine_id = p_machine_id
    and b.status in ('pending', 'confirmed', 'completed')
    and b.starts_at < (p_day + 1)::timestamptz
    and b.ends_at > p_day::timestamptz
  order by b.starts_at;
$$;
