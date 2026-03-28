create extension if not exists pgcrypto;

create type public.user_role as enum (
  'shopper',
  'grower',
  'load_shifter',
  'admin'
);

create type public.profile_status as enum (
  'pending',
  'active',
  'suspended'
);

create type public.fulfillment_mode as enum (
  'direct_delivery',
  'pickup',
  'distribution_centre_dropoff',
  'load_shifter_delivery'
);

create type public.address_type as enum (
  'delivery',
  'farm',
  'pickup',
  'distribution_centre',
  'billing'
);

create type public.order_status as enum (
  'draft',
  'awaiting_confirmation',
  'confirmed',
  'packed',
  'in_transit',
  'delivered',
  'cancelled',
  'refunded'
);

create type public.delivery_status as enum (
  'unassigned',
  'available',
  'accepted',
  'picked_up',
  'delivered',
  'failed',
  'cancelled'
);

create type public.payment_status as enum (
  'pending',
  'paid',
  'partially_refunded',
  'refunded'
);

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role public.user_role not null,
  status public.profile_status not null default 'pending',
  full_name text not null,
  phone text,
  company_name text,
  abn text,
  bio text,
  service_area text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.addresses (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  type public.address_type not null,
  label text,
  address_line_1 text not null,
  address_line_2 text,
  suburb text not null,
  state text not null,
  postcode text not null,
  country_code text not null default 'AU',
  formatted_address text not null,
  latitude numeric(9, 6),
  longitude numeric(9, 6),
  delivery_notes text,
  place_id text,
  validation_provider text,
  validation_status text,
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.grower_profiles (
  profile_id uuid primary key references public.profiles (id) on delete cascade,
  farm_name text not null,
  short_description text,
  seasonal_notes text,
  cold_chain_required boolean not null default false,
  offers_direct_delivery boolean not null default false,
  offers_pickup boolean not null default true,
  offers_distribution_dropoff boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.load_shifter_profiles (
  profile_id uuid primary key references public.profiles (id) on delete cascade,
  vehicle_type text not null,
  refrigerated boolean not null default false,
  max_load_kg numeric(10, 2),
  availability_notes text,
  created_at timestamptz not null default now()
);

create table public.distribution_centres (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  address_id uuid not null references public.addresses (id),
  max_hold_hours integer not null default 48,
  intake_notes text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  grower_id uuid not null references public.profiles (id) on delete cascade,
  name text not null,
  category text not null,
  description text,
  unit text not null,
  price numeric(10, 2) not null check (price >= 0),
  stock_quantity numeric(10, 2) not null default 0,
  min_order_quantity numeric(10, 2) not null default 1,
  seasonal_start date,
  seasonal_end date,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  shopper_id uuid not null references public.profiles (id),
  grower_id uuid not null references public.profiles (id),
  delivery_address_id uuid references public.addresses (id),
  fulfillment_mode public.fulfillment_mode not null,
  status public.order_status not null default 'awaiting_confirmation',
  payment_status public.payment_status not null default 'pending',
  distribution_centre_id uuid references public.distribution_centres (id),
  subtotal numeric(10, 2) not null default 0,
  delivery_fee numeric(10, 2) not null default 0,
  commission_fee numeric(10, 2) not null default 0,
  total numeric(10, 2) not null default 0,
  delivery_window_start timestamptz,
  delivery_window_end timestamptz,
  shopper_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  product_id uuid not null references public.products (id),
  quantity numeric(10, 2) not null check (quantity > 0),
  unit_price numeric(10, 2) not null check (unit_price >= 0),
  line_total numeric(10, 2) not null check (line_total >= 0)
);

create table public.deliveries (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null unique references public.orders (id) on delete cascade,
  load_shifter_id uuid references public.profiles (id),
  pickup_address_id uuid references public.addresses (id),
  dropoff_address_id uuid references public.addresses (id),
  status public.delivery_status not null default 'unassigned',
  vehicle_requirements text,
  pickup_time timestamptz,
  delivered_at timestamptz,
  proof_of_delivery_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.transactions (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  gross_amount numeric(10, 2) not null,
  commission_amount numeric(10, 2) not null,
  delivery_amount numeric(10, 2) not null default 0,
  grower_payout_amount numeric(10, 2) not null,
  load_shifter_payout_amount numeric(10, 2) not null default 0,
  payout_status text not null default 'pending',
  created_at timestamptz not null default now()
);

create index profiles_role_idx on public.profiles (role);
create index addresses_profile_idx on public.addresses (profile_id);
create index products_grower_idx on public.products (grower_id);
create index products_active_idx on public.products (is_active);
create index orders_shopper_idx on public.orders (shopper_id);
create index orders_grower_idx on public.orders (grower_id);
create index orders_status_idx on public.orders (status);
create index deliveries_load_shifter_idx on public.deliveries (load_shifter_id);
create index transactions_order_idx on public.transactions (order_id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, role, full_name)
  values (
    new.id,
    coalesce((new.raw_user_meta_data ->> 'role')::public.user_role, 'shopper'),
    coalesce(new.raw_user_meta_data ->> 'full_name', 'New user')
  );

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
