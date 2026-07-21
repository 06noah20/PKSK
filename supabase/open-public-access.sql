-- =====================================================================
-- Portal PKSK — Kemas Kini RLS: Buka Akses Baca Untuk Pengunjung Awam
-- =====================================================================
-- Jalankan skrip ini di Supabase SQL Editor selepas perubahan portal.
-- Ia mengemas kini polisi RLS supaya semua set latihan dan soalan yang
-- diterbitkan boleh dibaca oleh pengunjung tanpa log masuk.
--
-- Polisi admin kekal tidak berubah.
-- =====================================================================

-- ---- questions: Buka baca kepada semua pengunjung untuk soalan diterbitkan ----
DROP POLICY IF EXISTS questions_select ON public.questions;
CREATE POLICY questions_select ON public.questions
  FOR SELECT USING (
    public.is_admin()
    OR (
      is_published
      AND EXISTS (
        SELECT 1 FROM public.practice_sets ps
        WHERE ps.id = questions.practice_set_id
          AND ps.is_published
      )
    )
  );

-- ---- practice_sets: Kekal — sesiapa boleh lihat set diterbitkan ----
-- (Polisi sedia ada sudah betul, tetapi dicipta semula untuk kepastian)
DROP POLICY IF EXISTS practice_sets_select ON public.practice_sets;
CREATE POLICY practice_sets_select ON public.practice_sets
  FOR SELECT USING (is_published OR public.is_admin());

-- ---- notes: Buka baca semua nota diterbitkan tanpa semakan premium ----
DROP POLICY IF EXISTS notes_select ON public.notes;
CREATE POLICY notes_select ON public.notes
  FOR SELECT USING (
    public.is_admin()
    OR is_published
  );

-- ---- question_overrides: Kekal terbuka untuk dibaca ----
-- (Polisi sedia ada sudah 'using (true)' — tiada perubahan diperlukan)

-- =====================================================================
-- POLISI TULIS (admin sahaja) — tiada perubahan, dikekalkan seperti asal:
-- - practice_sets_admin_write
-- - questions_admin_write
-- - notes_admin_write
-- - question_overrides_admin_write
-- =====================================================================

-- =====================================================================
-- SELESAI — Pengunjung awam kini boleh membaca semua kandungan diterbitkan
-- tanpa perlu log masuk atau langganan.
-- =====================================================================
