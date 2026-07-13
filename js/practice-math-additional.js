/* Additional Matematik questions: one question appended to each Set 1-10. */
(function () {
  const answerMap = { A: 0, B: 1, C: 2, D: 3 };
  const questions = [
    {
      id: 301,
      topic: "Perpuluhan dan Bahagi",
      level: "Aras Rendah",
      question: "Sebuah kedai alat tulis menerima 15 gulung reben yang sama panjang. Jumlah panjang semua reben itu ialah 64.5 m. Berapakah panjang, dalam m, bagi setiap gulung reben?",
      options: { A: "4.13", B: "4.20", C: "4.30", D: "4.45" },
      answer: "C",
      explanation: "64.5 / 15 = 4.3 m"
    },
    {
      id: 302,
      topic: "Nombor Bercampur dan Peratus",
      level: "Aras Rendah",
      question: "Antara berikut, yang manakah menunjukkan penukaran nombor bercampur kepada peratus yang betul?",
      options: { A: "2 3/4 = 265%", B: "3 1/5 = 320%", C: "4 2/5 = 425%", D: "5 1/10 = 501%" },
      answer: "B",
      explanation: "3 1/5 = 3.2 = 320%"
    },
    {
      id: 303,
      topic: "Wang dan Peratus Keuntungan",
      level: "KBAT",
      question: "Harga modal sebuah botol air ialah RM25. Seorang peniaga ingin memperoleh keuntungan sebanyak 28% daripada harga modal. Berapakah harga jual botol air itu?",
      options: { A: "RM28.00", B: "RM30.50", C: "RM32.00", D: "RM35.00" },
      answer: "C",
      explanation: "Keuntungan = 28% x RM25 = RM7. Harga jual = RM25 + RM7 = RM32"
    },
    {
      id: 304,
      topic: "Kadar dan Penukaran Unit",
      level: "KBAT",
      question: "Secara purata, seekor anak pokok bertambah tinggi sebanyak 8.6 cm dalam sebulan. Berapakah pertambahan tinggi, dalam m, selepas 2.5 tahun?",
      options: { A: "1.58", B: "2.15", C: "2.58", D: "25.8" },
      answer: "C",
      explanation: "2.5 tahun = 30 bulan. 8.6 cm x 30 = 258 cm = 2.58 m"
    },
    {
      id: 305,
      topic: "Pecahan dan Panjang",
      level: "KBAT",
      question: "Lina menggunakan 3/8 daripada seutas tali untuk membuat hiasan. Baki tali itu ialah 250 cm. Berapakah panjang asal, dalam m, tali tersebut?",
      options: { A: "2.5", B: "3.5", C: "4.0", D: "5.0" },
      answer: "C",
      explanation: "Baki = 5/8. Jadi 5/8 = 250 cm. Panjang asal = 250 / 5 x 8 = 400 cm = 4 m"
    },
    {
      id: 306,
      topic: "Jisim dan Operasi Perpuluhan",
      level: "KBAT",
      question: "Jisim sebuah kotak buah ialah 38.475 kg manakala jisim sebuah bakul sayur ialah 21.690 kg. Jika beza jisim itu dikurangkan dengan 5.825 kg, berapakah bakinya?",
      options: { A: "10 kg 960 g", B: "10 kg 970 g", C: "11 kg 960 g", D: "11 kg 970 g" },
      answer: "A",
      explanation: "38.475 - 21.690 = 16.785 kg. 16.785 - 5.825 = 10.960 kg = 10 kg 960 g"
    },
    {
      id: 307,
      topic: "Pecahan dan Pembahagian Sama Rata",
      level: "KBAT",
      question: "Sebuah bekas mengandungi 18 kg makanan kucing. Sebanyak 1/3 daripada makanan itu telah digunakan. Baki makanan dibahagikan sama rata ke dalam 4 beg. Berapakah jisim makanan dalam setiap beg?",
      options: { A: "2 kg", B: "3 kg", C: "4.5 kg", D: "6 kg" },
      answer: "B",
      explanation: "Digunakan = 1/3 x 18 = 6 kg. Baki = 12 kg. Setiap beg = 12 / 4 = 3 kg"
    },
    {
      id: 308,
      topic: "Operasi Bergabung dan Pembundaran",
      level: "KBAT",
      question: "Bahagikan hasil darab 24 dan 5.625 dengan 9. Bundarkan jawapan kepada dua tempat perpuluhan.",
      options: { A: "14.50", B: "15.00", C: "15.25", D: "16.00" },
      answer: "B",
      explanation: "24 x 5.625 = 135. 135 / 9 = 15.00"
    },
    {
      id: 309,
      topic: "Isi Padu Cecair",
      level: "Aras Rendah",
      question: "Sebuah jag mengandungi 1.25 liter jus oren. Sebuah botol pula mengandungi 3/5 liter jus oren. Hitung jumlah isi padu jus oren, dalam ml.",
      options: { A: "1 650 ml", B: "1 750 ml", C: "1 850 ml", D: "1 950 ml" },
      answer: "C",
      explanation: "1.25 liter = 1250 ml. 3/5 liter = 600 ml. Jumlah = 1850 ml"
    },
    {
      id: 310,
      topic: "Peratus dan Bilangan",
      level: "KBAT",
      question: "Sebuah pusat latihan mempunyai 950 orang peserta. Sebanyak 40% ialah peserta lelaki. Daripada peserta perempuan, 20% menyertai kelas robotik. Berapakah bilangan peserta perempuan yang menyertai kelas robotik?",
      options: { A: "114", B: "190", C: "228", D: "380" },
      answer: "A",
      explanation: "Peserta lelaki = 40% x 950 = 380. Peserta perempuan = 950 - 380 = 570. Kelas robotik = 20% x 570 = 114"
    }
  ];

  window.PKSK_SET_QUESTIONS = window.PKSK_SET_QUESTIONS || {};
  questions.forEach((item, index) => {
    const setNo = String(index + 1);
    const current = window.PKSK_SET_QUESTIONS[setNo] || {};
    const existing = current.matematik || [];
    const mapped = {
      sourceId: `MA${item.id}`,
      q: item.question,
      options: ["A", "B", "C", "D"].map((key) => item.options[key]),
      answer: answerMap[item.answer],
      category: item.topic,
      level: item.level,
      explain: item.explanation
    };
    window.PKSK_SET_QUESTIONS[setNo] = {
      ...current,
      matematik: existing.concat(mapped)
    };
  });
})();
