-- =====================================================================
-- Portal PKSK — Skema Pangkalan Data Supabase
-- =====================================================================
-- Fail ini mewujudkan jadual, trigger, Row Level Security (RLS) dan
-- polisi akses untuk portal PKSK. Ia TIDAK menyentuh reka bentuk portal
-- atau soalan sedia ada dalam js/questions.js.
--
-- Cara guna: Supabase Dashboard -> SQL Editor -> tampal & Run.
-- Boleh dijalankan berulang kali (idempoten) dengan selamat.
-- =====================================================================

create extension if not exists "pgcrypto";

-- =====================================================================
-- 1. JADUAL
-- =====================================================================

-- 1.1 profiles ---------------------------------------------------------
create table if not exists public.profiles (
  id           uuid primary key references auth.users (id) on delete cascade,
  full_name    text,
  role         text not null default 'user'  check (role in ('user', 'admin')),
  access_level text not null default 'free'  check (access_level in ('free', 'premium')),
  is_active    boolean not null default true,
  created_at   timestamptz not null default now()
);

-- 1.2 practice_sets ----------------------------------------------------
create table if not exists public.practice_sets (
  id           uuid primary key default gen_random_uuid(),
  set_number   int  not null,
  title        text not null,
  is_free      boolean not null default false,
  is_published boolean not null default false,
  created_at   timestamptz not null default now(),
  unique (set_number)
);

-- 1.3 questions --------------------------------------------------------
create table if not exists public.questions (
  id               uuid primary key default gen_random_uuid(),
  practice_set_id  uuid references public.practice_sets (id) on delete cascade,
  subject          text,
  question_text    text not null,
  option_a         text,
  option_b         text,
  option_c         text,
  option_d         text,
  correct_option   text check (correct_option in ('A', 'B', 'C', 'D')),
  image_url        text,
  difficulty       text check (difficulty in ('mudah', 'sederhana', 'sukar')),
  is_preview       boolean not null default false,
  is_published     boolean not null default false,
  sort_order       int not null default 0,
  created_at       timestamptz not null default now()
);
create index if not exists idx_questions_set on public.questions (practice_set_id);

-- 1.4 notes ------------------------------------------------------------
create table if not exists public.notes (
  id           uuid primary key default gen_random_uuid(),
  subject      text,
  title        text not null,
  content      text,
  image_url    text,
  access_level text not null default 'free' check (access_level in ('free', 'premium')),
  is_published boolean not null default false,
  created_at   timestamptz not null default now()
);

-- 1.5 subscriptions ----------------------------------------------------
create table if not exists public.subscriptions (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references auth.users (id) on delete cascade,
  status            text not null default 'inactive'
                      check (status in ('active', 'inactive', 'cancelled', 'expired')),
  plan_name         text,
  started_at        timestamptz,
  expires_at        timestamptz,
  payment_reference text,
  created_at        timestamptz not null default now()
);
create index if not exists idx_subscriptions_user on public.subscriptions (user_id);

-- =====================================================================
-- 2. FUNGSI PEMBANTU (SECURITY DEFINER — elak rekursi RLS)
-- =====================================================================

-- Semak sama ada pengguna semasa ialah admin yang aktif.
create or replace function public.is_admin()
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin' and is_active
  );
$$;

-- Dapatkan aras akses pengguna semasa ('free' / 'premium' / null).
create or replace function public.my_access_level()
returns text
language sql stable security definer set search_path = public
as $$
  select access_level from public.profiles
  where id = auth.uid() and is_active;
$$;

-- =====================================================================
-- 3. TRIGGER
-- =====================================================================

-- 3.1 Cipta profil secara automatik selepas pengguna mendaftar.
create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', new.email))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 3.2 Halang pengguna biasa daripada menukar role / access_level / is_active.
--     (Admin dibenarkan; pengguna biasa: nilai keistimewaan dikekalkan.)
create or replace function public.guard_profile_privileges()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  if public.is_admin() then
    return new;
  end if;
  new.role         := old.role;
  new.access_level := old.access_level;
  new.is_active    := old.is_active;
  return new;
end;
$$;

drop trigger if exists trg_guard_profile on public.profiles;
create trigger trg_guard_profile
  before update on public.profiles
  for each row execute function public.guard_profile_privileges();

-- =====================================================================
-- 4. AKTIFKAN ROW LEVEL SECURITY
-- =====================================================================
alter table public.profiles      enable row level security;
alter table public.practice_sets enable row level security;
alter table public.questions     enable row level security;
alter table public.notes         enable row level security;
alter table public.subscriptions enable row level security;

-- =====================================================================
-- 5. POLISI
-- =====================================================================

-- ---- 5.1 profiles ----------------------------------------------------
-- Pengguna hanya boleh melihat profil sendiri; admin boleh lihat semua.
drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles
  for select using (id = auth.uid() or public.is_admin());

-- Pengguna boleh kemas kini profil sendiri (trigger mengekalkan role/
-- access_level/is_active); admin boleh kemas kini semua.
drop policy if exists profiles_update on public.profiles;
create policy profiles_update on public.profiles
  for update using (id = auth.uid() or public.is_admin())
             with check (id = auth.uid() or public.is_admin());

-- Admin boleh tambah / padam profil.
drop policy if exists profiles_admin_insert on public.profiles;
create policy profiles_admin_insert on public.profiles
  for insert with check (public.is_admin());
drop policy if exists profiles_admin_delete on public.profiles;
create policy profiles_admin_delete on public.profiles
  for delete using (public.is_admin());

-- ---- 5.2 practice_sets ----------------------------------------------
-- Sesiapa boleh lihat set yang diterbitkan; admin lihat semua.
drop policy if exists practice_sets_select on public.practice_sets;
create policy practice_sets_select on public.practice_sets
  for select using (is_published or public.is_admin());

-- Admin sahaja boleh tambah / edit / padam.
drop policy if exists practice_sets_admin_write on public.practice_sets;
create policy practice_sets_admin_write on public.practice_sets
  for all using (public.is_admin()) with check (public.is_admin());

-- ---- 5.3 questions ---------------------------------------------------
-- Baca:
--   * Pengunjung (anon) — hanya soalan is_preview = true (diterbitkan).
--   * Pengguna free     — Set Latihan 1 (set_number = 1).
--   * Pengguna premium  — semua set yang diterbitkan.
--   * Admin             — semua.
drop policy if exists questions_select on public.questions;
create policy questions_select on public.questions
  for select using (
    public.is_admin()
    or (
      is_published and (
        is_preview
        or (
          auth.uid() is not null
          and exists (
            select 1 from public.practice_sets ps
            where ps.id = questions.practice_set_id
              and ps.is_published
              and (
                public.my_access_level() = 'premium'
                or (public.my_access_level() = 'free' and ps.set_number = 1)
              )
          )
        )
      )
    )
  );

-- Admin sahaja boleh tambah / edit / padam.
drop policy if exists questions_admin_write on public.questions;
create policy questions_admin_write on public.questions
  for all using (public.is_admin()) with check (public.is_admin());

-- ---- 5.4 notes -------------------------------------------------------
-- Baca:
--   * Nota free (diterbitkan)    — sesiapa sahaja.
--   * Nota premium (diterbitkan) — pengguna premium sahaja.
--   * Admin                      — semua.
drop policy if exists notes_select on public.notes;
create policy notes_select on public.notes
  for select using (
    public.is_admin()
    or (
      is_published and (
        access_level = 'free'
        or (access_level = 'premium' and public.my_access_level() = 'premium')
      )
    )
  );

-- Admin sahaja boleh tambah / edit / padam.
drop policy if exists notes_admin_write on public.notes;
create policy notes_admin_write on public.notes
  for all using (public.is_admin()) with check (public.is_admin());

-- ---- 5.5 subscriptions ----------------------------------------------
-- Pengguna hanya boleh melihat langganan sendiri; admin lihat semua.
drop policy if exists subscriptions_select on public.subscriptions;
create policy subscriptions_select on public.subscriptions
  for select using (user_id = auth.uid() or public.is_admin());

-- Admin sahaja boleh tambah / edit / padam langganan.
-- (Kunci service_role pada backend pembayaran memintas RLS secara automatik.)
drop policy if exists subscriptions_admin_write on public.subscriptions;
create policy subscriptions_admin_write on public.subscriptions
  for all using (public.is_admin()) with check (public.is_admin());

-- =====================================================================
-- 6. PERMINTAAN NAIK TARAF (bayaran QR manual + kelulusan admin)
-- =====================================================================

create table if not exists public.payment_requests (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  full_name   text,
  email       text,
  amount      numeric,
  reference   text,   -- rujukan bank / nama pembayar
  note        text,
  status      text not null default 'pending'
                check (status in ('pending', 'approved', 'rejected')),
  created_at  timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by uuid references auth.users (id)
);
create index if not exists idx_payreq_status on public.payment_requests (status);
create index if not exists idx_payreq_user   on public.payment_requests (user_id);

alter table public.payment_requests enable row level security;

-- Pengguna hantar permintaan sendiri; admin lihat/urus semua.
drop policy if exists payreq_insert on public.payment_requests;
create policy payreq_insert on public.payment_requests
  for insert with check (user_id = auth.uid());

drop policy if exists payreq_select on public.payment_requests;
create policy payreq_select on public.payment_requests
  for select using (user_id = auth.uid() or public.is_admin());

drop policy if exists payreq_admin_update on public.payment_requests;
create policy payreq_admin_update on public.payment_requests
  for update using (public.is_admin()) with check (public.is_admin());

-- Luluskan: jadikan pengguna premium + rekod langganan + tanda diluluskan.
create or replace function public.approve_premium(p_request uuid, p_months int default 12)
returns void
language plpgsql security definer set search_path = public
as $$
declare v_user uuid;
begin
  if not public.is_admin() then
    raise exception 'Tidak dibenarkan';
  end if;
  select user_id into v_user from public.payment_requests where id = p_request;
  if v_user is null then
    raise exception 'Permintaan tidak dijumpai';
  end if;

  update public.profiles set access_level = 'premium' where id = v_user;

  insert into public.subscriptions (user_id, status, plan_name, started_at, expires_at)
  values (v_user, 'active', 'premium', now(), now() + make_interval(months => p_months));

  update public.payment_requests
    set status = 'approved', reviewed_at = now(), reviewed_by = auth.uid()
    where id = p_request;
end;
$$;

-- Tolak permintaan.
create or replace function public.reject_payment(p_request uuid)
returns void
language plpgsql security definer set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Tidak dibenarkan';
  end if;
  update public.payment_requests
    set status = 'rejected', reviewed_at = now(), reviewed_by = auth.uid()
    where id = p_request;
end;
$$;

grant execute on function public.approve_premium(uuid, int) to authenticated;
grant execute on function public.reject_payment(uuid) to authenticated;

-- =====================================================================
-- SELESAI
-- =====================================================================
