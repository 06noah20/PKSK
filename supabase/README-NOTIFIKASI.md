# Notifikasi E-mel Automatik — Permintaan Bayaran Premium

Setiap kali pengguna menghantar bukti bayaran (rekod baharu dalam
`payment_requests`), anda akan menerima **e-mel automatik**. Tiada pelayan
sendiri diperlukan — semuanya berjalan dalam Supabase.

Aliran: `payment_requests (INSERT)` → **Database Webhook** →
**Edge Function `notify-payment`** → **e-mel (Resend)** → inbox anda.

---

## Langkah 1 — Dapatkan kunci e-mel (Resend, percuma)

1. Daftar di <https://resend.com> (percuma, 3,000 e-mel/bulan).
2. **API Keys → Create** → salin kunci (`re_...`).
3. Untuk ujian, anda boleh guna pengirim `onboarding@resend.dev` terus.
   Untuk domain sendiri (cth. `no-reply@pkskmy.com`), sahkan domain di
   Resend → **Domains**.

## Langkah 2 — Deploy Edge Function

Pasang [Supabase CLI](https://supabase.com/docs/guides/cli), kemudian:

```bash
supabase login
supabase link --project-ref <PROJECT_REF>     # ref dari URL projek

# Tetapkan secret
supabase secrets set RESEND_API_KEY=re_xxxxxxxx
supabase secrets set ADMIN_EMAIL=anda@email.com
supabase secrets set MAIL_FROM="PKSK <onboarding@resend.dev>"
supabase secrets set WEBHOOK_SECRET=rahsia-panjang-anda   # pilihan

# Deploy fungsi (folder supabase/functions/notify-payment)
supabase functions deploy notify-payment --no-verify-jwt
```

> `--no-verify-jwt` diperlukan kerana Database Webhook memanggil fungsi
> tanpa token pengguna.

Selepas deploy, URL fungsi ialah:
`https://<PROJECT_REF>.functions.supabase.co/notify-payment`

## Langkah 3 — Sambungkan Database Webhook

Supabase Dashboard → **Database → Webhooks → Create a new hook**:

| Medan | Nilai |
|-------|-------|
| Name | `notify-payment` |
| Table | `public.payment_requests` |
| Events | ✅ **Insert** sahaja |
| Type | **Supabase Edge Functions** |
| Edge Function | `notify-payment` |
| HTTP Headers | (jika guna WEBHOOK_SECRET) tambah `x-webhook-secret: rahsia-panjang-anda` |

Simpan.

## Langkah 4 — Uji

1. Buka portal → log masuk sebagai pengguna biasa → **Naik Taraf Premium**
   → isi borang → Hantar.
2. Dalam beberapa saat, e-mel notifikasi patut tiba di `ADMIN_EMAIL`.
3. Log masuk sebagai admin → **🛡️ Admin** → **Luluskan**.

---

### Menyahaktifkan sementara
Padam webhook di Dashboard → Database → Webhooks. Portal & kelulusan manual
tetap berfungsi tanpa notifikasi.

### Nota
- Kunci `RESEND_API_KEY` disimpan sebagai **secret Supabase** — tidak
  didedahkan di frontend.
- Jika e-mel tidak tiba: Dashboard → Edge Functions → `notify-payment` →
  **Logs** untuk melihat ralat.
