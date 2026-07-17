# Panduan Akaun & Kelulusan Portal PKSK

Portal menggunakan satu aliran pendaftaran dan pembayaran:

1. Pengguna daftar melalui **Log Masuk / Daftar** atau dengan menekan Set Latihan 2–10.
2. Pengguna mengimbas QR, mengisi rujukan bayaran dan memuat naik gambar resit.
3. Akaun terus diwujudkan dengan status **Menunggu kelulusan admin**.
4. Pengguna masih boleh log masuk dan membuka Set Latihan 1.
5. Admin menyemak resit dan meluluskan akaun dalam **Panel Admin**.
6. Set Latihan 2–10 dibuka dan notifikasi kelulusan muncul dalam paparan akaun pengguna.

## Mod lokal/demo

Selagi `SUPABASE_URL` dan `SUPABASE_ANON_KEY` dalam `js/supabase-client.js` kosong, portal menggunakan `localStorage` pelayar.

Akaun admin lokal telah disediakan:

- ID pengguna: `pkskmy`
- Kata laluan: `pkskmy@2026`

Data mod lokal hanya wujud pada pelayar dan peranti yang sama. Gunakan mod ini untuk ujian, bukan sebagai sistem akaun produksi.

## Ujian aliran lokal

1. Buka portal, daftar satu akaun pengguna dan hantar bukti bayaran mockup.
2. Paparan akaun mesti menunjukkan **Menunggu kelulusan admin**.
3. Log keluar dan log masuk menggunakan akaun `pkskmy`.
4. Pilih pengguna dalam **Panel Admin**, kemudian tekan **Luluskan**.
5. Log masuk semula sebagai pengguna tadi.
6. Notifikasi kelulusan mesti dipaparkan dan Set Latihan 2–10 tidak lagi berkunci.

## Mengurus soalan tanpa GitHub

Log masuk sebagai admin dan buka **Panel Admin → Urus Soalan**. Admin boleh:

- memilih Set 1–10 dan subjek;
- menambah, mengemas kini atau memadam satu soalan serta memuat naik gambar rajah;
- mengimport satu fail JSON untuk menggantikan bank soalan pilihan;
- mengeksport bank soalan sebagai salinan keselamatan;
- memulihkan soalan asal.

Dalam mod lokal, perubahan disimpan dalam `localStorage`. Dalam mod Supabase,
perubahan disimpan dalam jadual `question_overrides` dan digunakan oleh semua pengguna.
Gambar rajah produksi disimpan dalam bucket Supabase `question-images`.

Ujian automatik yang sama boleh dijalankan dengan:

```sh
npm run test:auth
```

## Sambungan Supabase untuk produksi

Projek ini telah disambungkan kepada Supabase `erwmjhohjadwcrrvqack`.

1. Buka **SQL Editor** dan jalankan keseluruhan fail
   `supabase/migrate-live-admin-storage.sql`.
2. Dalam **Authentication → Users**, tambah pengguna berikut dan aktifkan
   pilihan auto-confirm:

```text
Email: admin@pkskmy.com
Password: pkskmy@2026
```

3. Jalankan semula `supabase/migrate-live-admin-storage.sql` supaya profil
   pengguna itu dinaik taraf kepada admin.
4. Portal membenarkan admin log masuk menggunakan alias berikut:

```text
ID pengguna: pkskmy
Password: pkskmy@2026
```

Nilai sambungan berada dalam `js/supabase-client.js`:

```js
const SUPABASE_URL = "https://erwmjhohjadwcrrvqack.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_...";
```

Publishable key selamat digunakan pada frontend; jangan letakkan service-role key
atau kata laluan pangkalan data dalam fail JavaScript.

## Masalah biasa

- **Pengguna masih melihat MENUNGGU** — admin belum menekan Luluskan, atau pengguna perlu log masuk semula.
- **Panel Admin tidak muncul** — akaun semasa bukan `role = admin`.
- **Set 2 masih berkunci selepas diluluskan** — buka semula paparan Latihan atau muat semula halaman.
- **Data pengguna hilang pada pelayar lain** — ini normal dalam mod lokal; sambungkan Supabase untuk data merentas peranti.
