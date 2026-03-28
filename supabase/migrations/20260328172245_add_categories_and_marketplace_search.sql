create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  description text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

insert into public.categories (name, slug, description, sort_order)
values
  ('Fruit', 'fruit', 'Fresh seasonal fruit from local growers.', 10),
  ('Vegetables', 'vegetables', 'Leafy greens, roots, and seasonal vegetables.', 20),
  ('Herbs', 'herbs', 'Fresh herbs and aromatic bunches.', 30),
  ('Eggs', 'eggs', 'Farm fresh eggs and related products.', 40),
  ('Meat', 'meat', 'Beef, lamb, pork, poultry, and butcher packs.', 50),
  ('Dairy', 'dairy', 'Milk, cheese, yoghurt, and cultured dairy.', 60),
  ('Honey', 'honey', 'Local honey and bee products.', 70),
  ('Pantry', 'pantry', 'Preserves, oils, sauces, and pantry staples.', 80),
  ('Other', 'other', 'Specialty listings that do not fit a standard category.', 90);

alter table public.products
  add column category_id uuid references public.categories (id);

update public.products p
set category_id = c.id
from public.categories c
where lower(trim(p.category)) = lower(c.name);

update public.products p
set category_id = c.id
from public.categories c
where p.category_id is null
  and c.slug = 'other';

alter table public.products
  alter column category_id set not null;

create index products_category_idx on public.products (category_id);
