# Portal PKSK 🎓

Portal pembelajaran dan pentaksiran **interaktif** khas untuk **PKSK**, diasingkan
daripada portal induk (`PORTAL-UASA / portal-pintar_8`) supaya PKSK mempunyai
laman tersendiri.

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

> ⚠️ **Nota:** Soalan sedia ada dalam `js/questions.js` adalah **contoh**.
> Gantikan dengan soalan sebenar PKSK daripada portal asal. Setelah akses
> ke repo `PORTAL-UASA` dibenarkan, soalan sebenar boleh diimport terus.

## 📁 Struktur

```
index.html          # Rangka portal
css/style.css       # Gaya + tema terang/gelap
js/questions.js     # Bank soalan (EDIT DI SINI)
js/app.js           # Enjin interaktif (navigasi, kuiz, kemajuan)
```
