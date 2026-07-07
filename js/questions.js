/* =========================================================================
 * BANK SOALAN PKSK  (PKSK Question Bank)
 * =========================================================================
 * Fail ini menyimpan SEMUA soalan & nota pembelajaran PKSK.
 *
 * >>> CARA TAMBAH / GANTI SOALAN <<<
 * Setiap topik ada:
 *   - id, title, icon, summary  -> maklumat topik
 *   - notes[]                    -> nota ringkas (mod BELAJAR)
 *   - questions[]                -> soalan kuiz (mod KUIZ / LATIHAN)
 *
 * Format satu soalan:
 * {
 *   q: "Teks soalan ...",
 *   options: ["Pilihan A", "Pilihan B", "Pilihan C", "Pilihan D"],
 *   answer: 0,                       // indeks jawapan betul (0 = A)
 *   explain: "Sebab jawapan betul"   // ditunjuk selepas jawab
 * }
 *
 * NOTA: Soalan di bawah adalah CONTOH pengisian. Gantikan dengan
 * soalan sebenar PKSK yang dikeluarkan daripada portal asal.
 * ========================================================================= */

const PKSK_DATA = {
  meta: {
    title: "Portal PKSK",
    subtitle: "Pusat Pembelajaran & Pentaksiran Interaktif",
    version: "1.0"
  },

  topics: [
    {
      id: "asas",
      title: "Pengenalan PKSK",
      icon: "📘",
      summary: "Konsep asas, tujuan dan skop PKSK.",
      notes: [
        "PKSK ialah modul pembelajaran dan pentaksiran yang membantu murid menguasai kemahiran teras secara berperingkat.",
        "Pembelajaran dibahagikan kepada 3 mod: Belajar (nota), Latihan (tanpa markah) dan Kuiz (bermarkah).",
        "Setiap topik mengandungi nota ringkas diikuti dengan soalan untuk menguji kefahaman.",
        "Kemajuan anda disimpan secara automatik dalam pelayar (browser) ini."
      ],
      questions: [
        {
          q: "Apakah tujuan utama modul PKSK?",
          options: [
            "Membantu murid menguasai kemahiran teras secara berperingkat",
            "Menggantikan buku teks sepenuhnya",
            "Merekod kehadiran murid",
            "Menguruskan jadual waktu sekolah"
          ],
          answer: 0,
          explain: "PKSK memfokuskan penguasaan kemahiran teras melalui pembelajaran berperingkat."
        },
        {
          q: "Berapakah mod pembelajaran yang disediakan dalam portal PKSK?",
          options: ["2", "3", "4", "5"],
          answer: 1,
          explain: "Tiga mod: Belajar, Latihan dan Kuiz."
        },
        {
          q: "Di manakah kemajuan pembelajaran anda disimpan?",
          options: [
            "Pelayan pusat sekolah",
            "Kad memori",
            "Storan pelayar (browser) anda",
            "Emel guru"
          ],
          answer: 2,
          explain: "Kemajuan disimpan secara setempat melalui localStorage pelayar."
        }
      ]
    },

    {
      id: "kemahiran",
      title: "Kemahiran Teras",
      icon: "🧠",
      summary: "Kemahiran utama yang diuji dalam PKSK.",
      notes: [
        "Kemahiran teras merangkumi kefahaman, aplikasi dan penyelesaian masalah.",
        "Murid perlu menguasai satu peringkat sebelum ke peringkat seterusnya.",
        "Latihan berulang membantu mengukuhkan penguasaan kemahiran."
      ],
      questions: [
        {
          q: "Manakah antara berikut BUKAN kemahiran teras?",
          options: [
            "Kefahaman",
            "Aplikasi",
            "Penyelesaian masalah",
            "Menghafal nombor telefon"
          ],
          answer: 3,
          explain: "Kemahiran teras memfokus kefahaman, aplikasi dan penyelesaian masalah."
        },
        {
          q: "Mengapakah latihan berulang penting?",
          options: [
            "Untuk membuang masa",
            "Untuk mengukuhkan penguasaan kemahiran",
            "Untuk menambah markah kehadiran",
            "Untuk menggantikan kuiz"
          ],
          answer: 1,
          explain: "Latihan berulang mengukuhkan ingatan dan penguasaan."
        }
      ]
    },

    {
      id: "pentaksiran",
      title: "Pentaksiran & Penilaian",
      icon: "📝",
      summary: "Bagaimana pencapaian murid dinilai.",
      notes: [
        "Pentaksiran dijalankan melalui kuiz bermarkah pada setiap topik.",
        "Skor 80% ke atas menunjukkan penguasaan yang baik.",
        "Murid boleh mengulang kuiz untuk memperbaiki markah."
      ],
      questions: [
        {
          q: "Skor minimum yang menunjukkan penguasaan yang baik ialah?",
          options: ["50%", "60%", "70%", "80%"],
          answer: 3,
          explain: "80% ke atas dianggap penguasaan yang baik."
        },
        {
          q: "Bolehkah murid mengulang kuiz?",
          options: [
            "Tidak boleh sama sekali",
            "Boleh, untuk memperbaiki markah",
            "Hanya sekali setahun",
            "Hanya dengan kebenaran khas"
          ],
          answer: 1,
          explain: "Murid digalakkan mengulang kuiz untuk memperbaiki penguasaan."
        }
      ]
    }
  ]
};

// Dedahkan data secara global untuk app.js
window.PKSK_DATA = PKSK_DATA;
