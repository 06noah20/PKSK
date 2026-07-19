# Analitik Pelawat (GA4)

Panel Admin mempunyai paparan Analitik Pelawat. Statistik akaun dibaca terus daripada Supabase menggunakan sesi admin dan polisi RLS. Statistik pelawat dibaca melalui Edge Function `ga4-analytics`; private key tidak pernah dihantar ke pelayar.

Jika GA4 belum dikonfigurasi, panel akan memaparkan keadaan kosong yang dilabel dengan jelas.

## Maklumat yang diperlukan

- GA4 Measurement ID, contoh format `G-XXXXXXXXXX`, untuk memasang pengumpulan data pada portal.
- GA4 Property ID berbentuk nombor, bukan Measurement ID.
- E-mel Google service account.
- Private key service account.

Service account perlu ditambah sebagai pengguna Property GA4 dengan role **Viewer**.

## Tetapkan secrets Edge Function

Jalankan daripada komputer yang mempunyai Supabase CLI dan sudah dipautkan kepada projek yang betul:

```bash
supabase secrets set GA4_PROPERTY_ID="PROPERTY_ID_SEBENAR"
supabase secrets set GA4_CLIENT_EMAIL="SERVICE_ACCOUNT_SEBENAR"
supabase secrets set GA4_PRIVATE_KEY="PRIVATE_KEY_SEBENAR"
supabase functions deploy ga4-analytics
```

Jangan masukkan nilai tersebut ke dalam `index.html`, fail JavaScript frontend, Git atau `.env.example`.

## Keselamatan

Edge Function menyemak token sesi Supabase dan memanggil fungsi pangkalan data `public.is_admin()`. Pengguna biasa menerima respons `403` walaupun mengetahui URL Edge Function. Paparan tidak memulangkan alamat IP, e-mel atau butiran individu.
