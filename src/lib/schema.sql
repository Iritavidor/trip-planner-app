-- טבלת טיולים
create table trips (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  name text not null,
  data jsonb not null default '{}',
  created_at timestamp default now(),
  updated_at timestamp default now()
);

-- עדכון אוטומטי של updated_at בכל update
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trips_updated_at
  before update on trips
  for each row execute function update_updated_at();

-- הרשאות
alter table trips enable row level security;

create policy "Users see own trips" on trips
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
