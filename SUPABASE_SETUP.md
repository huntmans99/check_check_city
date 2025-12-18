# Supabase Setup Guide

## 1. Create Orders Table

Go to Supabase SQL Editor and run:

```sql
create table orders (
  id uuid primary key default uuid_generate_v4(),
  customer_name text not null,
  customer_phone text not null,
  customer_address text,
  delivery_location text not null,
  items jsonb not null,
  subtotal decimal(10, 2) not null,
  delivery_fee decimal(10, 2) not null,
  total decimal(10, 2) not null,
  status text not null default 'pending',
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table orders enable row level security;

create policy "Allow public read" on orders
  for select using (true);

create policy "Allow public insert" on orders
  for insert with check (true);

create policy "Allow all updates" on orders
  for update using (true);
```

## 2. Create Users Table

Go to Supabase SQL Editor and run:

```sql
create table users (
  id uuid primary key default uuid_generate_v4(),
  phone text not null unique,
  name text not null,
  address text not null,
  password_hash text not null,
  created_at timestamp with time zone default now()
);

alter table users enable row level security;

create policy "Allow public read users" on users
  for select using (true);

create policy "Allow public insert users" on users
  for insert with check (true);

create policy "Allow public update users" on users
  for update using (true);
```

That's it! Users can now:
- Create accounts with phone number and password
- Login with phone + password
- See their order history at `/orders` page
- Orders automatically save to their account
