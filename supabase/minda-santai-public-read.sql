-- =====================================================================
-- Minda Santai — benarkan pengunjung awam (anon) membaca poster
-- =====================================================================
-- Jalankan SEKALI di Supabase: Dashboard -> SQL Editor -> tampal -> Run.
--
-- Poster ruang "Minda Santai" disimpan sebagai satu baris dalam jadual
-- public.notes (subject = 'minda-santai'). Dasar ini menambah kebenaran
-- SELECT khusus untuk baris tersebut supaya ia boleh dibaca oleh sesiapa
-- sahaja (termasuk pengunjung yang tidak log masuk) di laman utama.
--
-- Ia bersifat TAMBAHAN sahaja — dasar RLS lain tidak diubah atau dipadam.
-- =====================================================================

alter table public.notes enable row level security;

drop policy if exists notes_public_minda_santai on public.notes;
create policy notes_public_minda_santai on public.notes
  for select
  using (subject = 'minda-santai' and is_published);
