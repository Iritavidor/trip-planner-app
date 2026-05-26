-- ============================================================
-- שלב 4 — שיתוף טיולים (הרצה ב-Supabase SQL Editor, אחרי schema.sql)
-- ============================================================

-- טבלת שיתופים: עם מי שותף כל טיול ובאיזו הרשאה
create table trip_shares (
  id uuid default gen_random_uuid() primary key,
  trip_id uuid references trips(id) on delete cascade not null,
  shared_with_email text not null,
  permission text not null default 'view' check (permission in ('view', 'edit')),
  created_at timestamp default now(),
  unique (trip_id, shared_with_email)
);

alter table trip_shares enable row level security;

-- ------------------------------------------------------------
-- פונקציות עזר (SECURITY DEFINER) — עוקפות RLS ומונעות רקורסיה
-- בין הפוליסות של trips ל-trip_shares.
-- ------------------------------------------------------------

-- האם המשתמש המחובר הוא הבעלים של הטיול
create or replace function is_trip_owner(_trip_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from trips where id = _trip_id and user_id = auth.uid()
  );
$$;

-- מחזיר את הרשאת השיתוף ('view' / 'edit') של המייל המחובר לטיול, או null
create or replace function trip_share_permission(_trip_id uuid)
returns text
language sql
security definer
set search_path = public
as $$
  select permission from trip_shares
  where trip_id = _trip_id
    and lower(shared_with_email) = lower(auth.jwt() ->> 'email')
  limit 1;
$$;

-- ------------------------------------------------------------
-- פוליסות trip_shares
-- ------------------------------------------------------------

-- הבעלים מנהל את השיתופים של הטיולים שלו (קריאה/הוספה/עדכון/מחיקה)
create policy "Owner manages shares" on trip_shares
  for all
  using (is_trip_owner(trip_id))
  with check (is_trip_owner(trip_id));

-- נמען יכול לראות את רשומות השיתוף שמופנות אליו
create policy "Recipient sees own shares" on trip_shares
  for select
  using (lower(shared_with_email) = lower(auth.jwt() ->> 'email'));

-- ------------------------------------------------------------
-- הרחבת פוליסות trips לטיולים משותפים
-- (משלימות את הפוליסה הקיימת "Users see own trips")
-- ------------------------------------------------------------

-- צפייה בטיול ששותף איתי (view או edit)
create policy "Shared can view trips" on trips
  for select
  using (trip_share_permission(id) is not null);

-- עריכת טיול ששותף איתי עם הרשאת edit בלבד
create policy "Shared can edit trips" on trips
  for update
  using (trip_share_permission(id) = 'edit')
  with check (trip_share_permission(id) = 'edit');
