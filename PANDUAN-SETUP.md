# 📋 Panduan Setup Portal PKSK — Supabase & Langganan Premium

Ikut langkah ini satu per satu. Tanda ✅ setiap kali selesai.
Semua **kod sudah siap** — ini hanya konfigurasi (sekali sahaja).

> Portal tetap berfungsi walaupun langkah ini belum dibuat. Log masuk &
> kunci premium hanya "hidup" selepas Bahagian A + B disiapkan.

---

## ✅ BAHAGIAN A — Pangkalan Data Supabase

- [ ] **A1.** Daftar di <https://supabase.com> → **New Project**
      (pilih region Singapore, simpan kata laluan DB).
- [ ] **A2.** Buka **SQL Editor** → **New query**.
- [ ] **A3.** Buka fail `supabase/setup.sql` dalam repo → salin **semua** →
      tampal → **Run**. Patut nampak "Success".
- [ ] **A4.** Pergi **Settings → API**, salin dua nilai:
      - **Project URL** (cth. `https://abcd.supabase.co`)
      - **anon public** key (`eyJ...`)

## ✅ BAHAGIAN B — Sambungkan Portal

- [ ] **B1.** Buka `js/supabase-client.js` (boleh edit terus di GitHub web).
- [ ] **B2.** Isi dua baris di atas:
      ```js
      const SUPABASE_URL = "https://abcd.supabase.co";   // dari A4
      const SUPABASE_ANON_KEY = "eyJ...";                // dari A4
      ```
- [ ] **B3.** Commit. Tunggu ~2 minit → buka `www.pkskmy.com` (incognito)
      → butang **Log Masuk** kini berfungsi. Cuba **Daftar Akaun**.

> anon key memang selamat didedahkan — data dilindungi oleh RLS.

## ✅ BAHAGIAN C — Jadikan Diri Anda Admin

- [ ] **C1.** Daftar satu akaun di portal guna e-mel anda (Bahagian B3).
- [ ] **C2.** Supabase → **Table Editor → profiles** → cari baris anda.
- [ ] **C3.** Tukar `role` kepada `admin` → Save.
- [ ] **C4.** Refresh portal → butang **🛡️ Admin** muncul di header.

## ✅ BAHAGIAN D — Butiran Bank & QR (Langganan)

- [ ] **D1.** Buka `js/premium.js` → isi objek `BANK`:
      ```js
      const BANK = {
        payTo:   "NAMA ANDA",
        bank:    "Maybank",
        account: "1234 5678 9012",
        amount:  "RM30",
        plan:    "Premium (12 bulan)",
        qr:      "assets/bank-qr.png"
      };
      ```
- [ ] **D2.** Muat naik gambar **kod QR bank** anda ke `assets/bank-qr.png`
      (GitHub → folder `assets` → Add file → Upload files).
- [ ] **D3.** Commit. Uji: log masuk sebagai pengguna biasa → cuba buka
      **Set Latihan 2** → skrin Naik Taraf papar QR anda.

## ✅ BAHAGIAN E — Notifikasi E-mel (Pilihan)

Ikut fail berasingan: **`supabase/README-NOTIFIKASI.md`**
(ringkas: daftar Resend → deploy `notify-payment` → sambung Database Webhook).

- [ ] **E1.** Daftar <https://resend.com> → dapat API key.
- [ ] **E2.** Deploy Edge Function + set secret (lihat README).
- [ ] **E3.** Database → Webhooks → picu INSERT `payment_requests`.
- [ ] **E4.** Uji hantar bayaran → e-mel tiba di inbox anda.

---

## 🔄 Aliran Harian (selepas semua siap)

1. Pengguna daftar → akaun **free** (Set 1 sahaja).
2. Pengguna cuba Set 2 → skrin **Naik Taraf** → bayar guna QR → hantar borang.
3. Anda dapat **e-mel notifikasi** (jika Bahagian E dibuat).
4. Anda log masuk → **🛡️ Admin** → **Luluskan** → pengguna jadi **premium**.

## 🧾 Nilai yang perlu diisi (ringkasan)

| Tempat | Nilai |
|--------|-------|
| `js/supabase-client.js` | `SUPABASE_URL`, `SUPABASE_ANON_KEY` |
| `js/premium.js` | butiran `BANK` |
| `assets/bank-qr.png` | gambar QR bank |
| Supabase secrets (Bhg E) | `RESEND_API_KEY`, `ADMIN_EMAIL`, `MAIL_FROM` |

## 🛟 Masalah biasa

- **Butang Log Masuk kata "belum diaktifkan"** → Bahagian B belum diisi/commit.
- **Perubahan tak muncul** → tunggu 1–2 min (GitHub Pages) + refresh
  `Ctrl+Shift+R` atau guna incognito.
- **Butang Admin tak muncul** → `role` belum `admin` (Bahagian C) / belum
  log keluar-masuk semula.
- **QR tak nampak** → fail bukan `assets/bank-qr.png` tepat, atau belum commit.
