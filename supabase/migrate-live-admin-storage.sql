-- =====================================================================
-- PKSK: migrasi akaun, kelulusan, bayaran dan pengurusan soalan
-- Jalankan dalam Supabase Dashboard -> SQL Editor sebagai pemilik projek.
-- Selamat dijalankan semula.
-- =====================================================================

alter table public.profiles add column if not exists email text;
alter table public.profiles add column if not exists approval_status text not null default 'pending';
alter table public.profiles add column if not exists approval_notified boolean not null default true;
alter table public.profiles add column if not exists reviewed_at timestamptz;
alter table public.profiles add column if not exists reviewed_by uuid references auth.users (id) on delete set null;

update public.profiles p
set email = u.email
from auth.users u
where p.id = u.id and p.email is null;

create or replace function public.is_admin()
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin' and is_active
  );
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles
    (id, full_name, email, role, access_level, approval_status, approval_notified)
  values
    (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', new.email), new.email,
     'user', 'free', 'pending', true)
  on conflict (id) do update set
    full_name = coalesce(excluded.full_name, public.profiles.full_name),
    email = coalesce(excluded.email, public.profiles.email);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.guard_profile_privileges()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  if public.is_admin() then return new; end if;
  new.role := old.role;
  new.access_level := old.access_level;
  new.approval_status := old.approval_status;
  new.reviewed_at := old.reviewed_at;
  new.reviewed_by := old.reviewed_by;
  new.is_active := old.is_active;
  return new;
end;
$$;

drop trigger if exists trg_guard_profile on public.profiles;
create trigger trg_guard_profile
  before update on public.profiles
  for each row execute function public.guard_profile_privileges();

create table if not exists public.payment_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  full_name text,
  email text,
  amount numeric(10,2),
  reference text,
  receipt_url text,
  note text,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  created_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by uuid references auth.users (id) on delete set null
);

create index if not exists idx_payreq_status on public.payment_requests (status);
create index if not exists idx_payreq_user on public.payment_requests (user_id);
alter table public.payment_requests enable row level security;

drop policy if exists payreq_insert on public.payment_requests;
create policy payreq_insert on public.payment_requests
  for insert to authenticated with check (user_id = auth.uid());
drop policy if exists payreq_select on public.payment_requests;
create policy payreq_select on public.payment_requests
  for select to authenticated using (user_id = auth.uid() or public.is_admin());
drop policy if exists payreq_admin_update on public.payment_requests;
create policy payreq_admin_update on public.payment_requests
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

create table if not exists public.question_overrides (
  set_number int not null check (set_number between 1 and 10),
  subject text not null check (subject in ('pengetahuan','matematik','sains','english')),
  questions jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users (id) on delete set null,
  primary key (set_number, subject)
);

alter table public.question_overrides enable row level security;
drop policy if exists question_overrides_select on public.question_overrides;
create policy question_overrides_select on public.question_overrides for select using (true);
drop policy if exists question_overrides_admin_write on public.question_overrides;
create policy question_overrides_admin_write on public.question_overrides
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create or replace function public.approve_registration(p_user uuid)
returns void
language plpgsql security definer set search_path = public
as $$
begin
  if not public.is_admin() then raise exception 'Tidak dibenarkan'; end if;
  update public.profiles
  set approval_status = 'approved', access_level = 'premium', approval_notified = false,
      reviewed_at = now(), reviewed_by = auth.uid()
  where id = p_user and role <> 'admin';
  if not found then raise exception 'Akaun pengguna tidak dijumpai'; end if;
  update public.payment_requests
  set status = 'approved', reviewed_at = now(), reviewed_by = auth.uid()
  where user_id = p_user and status = 'pending';
end;
$$;

create or replace function public.reject_registration(p_user uuid)
returns void
language plpgsql security definer set search_path = public
as $$
begin
  if not public.is_admin() then raise exception 'Tidak dibenarkan'; end if;
  update public.profiles
  set approval_status = 'rejected', access_level = 'free', approval_notified = false,
      reviewed_at = now(), reviewed_by = auth.uid()
  where id = p_user and role <> 'admin';
  if not found then raise exception 'Akaun pengguna tidak dijumpai'; end if;
  update public.payment_requests
  set status = 'rejected', reviewed_at = now(), reviewed_by = auth.uid()
  where user_id = p_user and status = 'pending';
end;
$$;

create or replace function public.mark_approval_notification_read()
returns void language sql security definer set search_path = public
as $$ update public.profiles set approval_notified = true where id = auth.uid(); $$;

grant execute on function public.approve_registration(uuid) to authenticated;
grant execute on function public.reject_registration(uuid) to authenticated;
grant execute on function public.mark_approval_notification_read() to authenticated;

insert into storage.buckets (id, name, public)
values ('receipts','receipts', true), ('question-images','question-images', true)
on conflict (id) do update set public = excluded.public;

drop policy if exists receipts_upload on storage.objects;
create policy receipts_upload on storage.objects
  for insert to authenticated with check (bucket_id = 'receipts' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists receipts_read on storage.objects;
create policy receipts_read on storage.objects
  for select using (bucket_id = 'receipts');

drop policy if exists question_images_read on storage.objects;
create policy question_images_read on storage.objects
  for select using (bucket_id = 'question-images');
drop policy if exists question_images_admin_upload on storage.objects;
create policy question_images_admin_upload on storage.objects
  for insert to authenticated with check (bucket_id = 'question-images' and public.is_admin());
drop policy if exists question_images_admin_delete on storage.objects;
create policy question_images_admin_delete on storage.objects
  for delete to authenticated using (bucket_id = 'question-images' and public.is_admin());

-- Jadikan akaun dalaman admin@pkskmy.com sebagai admin jika ia sudah
-- dicipta melalui Authentication -> Users -> Add user.
update public.profiles
set role = 'admin', access_level = 'premium', approval_status = 'approved',
    approval_notified = true, is_active = true
where lower(email) = 'admin@pkskmy.com';

select 'PKSK migration complete' as result;
