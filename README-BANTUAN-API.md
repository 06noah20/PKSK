# Bantuan/Cadangan API

Halaman `Bantuan/Cadangan` menghantar borang ke endpoint backend:

```text
POST /api/bantuan-cadangan
```

Alamat penerima tidak diletakkan dalam frontend. Tetapkan alamat penerima dan maklumat SMTP melalui environment variable server.

## Setup

1. Salin `.env.example` kepada `.env`.
2. Isi nilai berikut dalam `.env`:

```text
FEEDBACK_TO_EMAIL=<alamat penerima rasmi>
SMTP_HOST=<smtp host>
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=<smtp username>
SMTP_PASS=<smtp password atau app password>
MAIL_FROM=<alamat pengirim yang dibenarkan oleh SMTP>
```

3. Pasang dependency dan jalankan portal dengan backend:

```bash
npm install
npm start
```

Nota: Jika portal dihoskan menggunakan GitHub Pages sahaja, endpoint API tidak akan berjalan kerana GitHub Pages hanya menyokong laman static. Gunakan server Node ini, Vercel serverless function dalam folder `api/`, atau backend lain yang boleh menjalankan `/api/bantuan-cadangan`.
