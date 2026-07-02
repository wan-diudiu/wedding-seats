-- Enable realtime for tables
begin;
  -- Create tables
  create table if not exists tables (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    type text not null check (type in ('round', 'long')),
    capacity integer not null default 10,
    position_x integer not null default 0,
    position_y integer not null default 0,
    relation_type text,
    created_at timestamp with time zone default now()
  );

  create table if not exists guests (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    side text not null check (side in ('bride', 'groom', 'both')),
    relation text not null,
    table_id uuid references tables(id) on delete set null,
    seat_number integer,
    special_needs text,
    created_at timestamp with time zone default now()
  );

  create table if not exists conflicts (
    id uuid primary key default gen_random_uuid(),
    guest_a_id uuid not null references guests(id) on delete cascade,
    guest_b_id uuid not null references guests(id) on delete cascade,
    reason text,
    created_at timestamp with time zone default now(),
    unique(guest_a_id, guest_b_id)
  );

  -- Enable Row Level Security
  alter table tables enable row level security;
  alter table guests enable row level security;
  alter table conflicts enable row level security;

  -- Create policies (allow all for demo; adjust for production)
  create policy "Allow all" on tables for all using (true) with check (true);
  create policy "Allow all" on guests for all using (true) with check (true);
  create policy "Allow all" on conflicts for all using (true) with check (true);

  -- Enable realtime
  alter publication supabase_realtime add table tables;
  alter publication supabase_realtime add table guests;
  alter publication supabase_realtime add table conflicts;
commit;
