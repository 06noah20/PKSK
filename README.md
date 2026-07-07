# Portal PKSK 🎓

Portal pembelajaran dan pentaksiran **interaktif** khas untuk **PKSK** —
*Cabaran Kemasukan Sekolah Khusus*. Fungsi dan **soalan sebenar PKSK** telah
diekstrak daripada portal induk (`PORTAL-UASA / portal-pintar_8`, bahagian
CABARAN "PKSK") dan disatukan ke dalam laman tersendiri ini.

## 📚 Kandungan (65 soalan sebenar)

| Topik | Soalan |
|-------|--------|
| 🧠 Pengetahuan Am | 30 |
| 🧩 Corak & Logik (Penaakulan) | 10 |
| 🔬 Sains | 10 |
| 🔤 English | 10 |
| ➗ Matematik | 5 |

## ✨ Ciri-ciri

| Mod | Fungsi |
|-----|--------|
| 🏠 **Utama** | Papan pemuka + senarai topik & status penguasaan |
| 📖 **Belajar** | Nota ringkas setiap topik (flashcard) |
| ✏️ **Latihan** | Soalan tanpa markah + maklum balas serta-merta |
| 🏆 **Kuiz** | Kuiz bermarkah, markah terbaik direkodkan |
| 📊 **Kemajuan** | Jejak penguasaan, purata & jumlah cubaan |

- Reka bentuk moden, responsif (mobil & desktop)
- Tema **terang / gelap** (auto ikut sistem)
- **Pemasa 20 saat** setiap soalan dalam mod Kuiz (autentik seperti cabaran asal)
- Kemajuan disimpan automatik dalam pelayar (localStorage)
- **Tiada pemasangan** — buka `index.html` terus dalam pelayar

## 🚀 Cara guna

Buka `index.html` dalam mana-mana pelayar web. Untuk hos dalam talian, aktifkan
**GitHub Pages** (Settings → Pages → Branch: `main` / root).

## 📝 Cara tambah / ganti soalan

Semua soalan & nota berada dalam satu fail sahaja:

```
js/questions.js
```

Setiap topik: `id`, `title`, `icon`, `summary`, senarai `notes[]` dan `questions[]`.
Format satu soalan:

```js
{
  q: "Teks soalan …",
  options: ["A", "B", "C", "D"],
  answer: 0,                 // indeks jawapan betul (0 = pilihan pertama)
  explain: "Sebab jawapan"   // ditunjuk selepas menjawab
}
```

> ✅ **Nota:** `js/questions.js` sudah mengandungi **soalan sebenar PKSK**
> yang diekstrak daripada portal induk. Anda boleh tambah soalan baharu
> dengan mengikut format yang sama.

## 📁 Struktur

```
index.html          # Rangka portal
css/style.css       # Gaya + tema terang/gelap
js/questions.js     # Bank soalan (EDIT DI SINI)
js/app.js           # Enjin interaktif (navigasi, kuiz, kemajuan)
```
