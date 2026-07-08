# Portal PKSK 🎓

Portal pembelajaran dan pentaksiran **interaktif** khas untuk **PKSK** —
*Cabaran Kemasukan Sekolah Khusus*. Fungsi dan **soalan sebenar PKSK** telah
diekstrak daripada portal induk (`PORTAL-UASA / portal-pintar_8`, bahagian
CABARAN "PKSK") dan disatukan ke dalam laman tersendiri ini.

## 📚 Kandungan (119 soalan sebenar)

Diekstrak sepenuhnya daripada 4 kertas rasmi PKSK dalam `portal-pintar_8.html`
(termasuk rajah/jadual soalan):

| Topik | Soalan |
|-------|--------|
| 🧠 Pengetahuan Am | 30 |
| ➗ Matematik | 30 |
| 🔬 Sains | 39 |
| 🔤 English | 20 |

## ✨ Ciri-ciri

| Mod | Fungsi |
|-----|--------|
| 🏠 **Utama** | Papan pemuka + senarai topik & status penguasaan |
| 📖 **Nota** | Nota ringkas setiap topik (flashcard) |
| ✏️ **Latihan PKSK** | Soalan sebenar PKSK + maklum balas serta-merta, markah terbaik direkodkan |

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
