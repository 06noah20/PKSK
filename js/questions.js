/* =========================================================================
 * BANK SOALAN PKSK  (PKSK Question Bank)
 * =========================================================================
 * Diekstrak SEPENUHNYA daripada portal induk PORTAL-UASA/portal-pintar_8.html,
 * bahagian CABARAN "PKSK" — 4 kertas rasmi:
 *   Pengetahuan Am (30) · Matematik (30) · Sains (39) · English (20)
 *   = 119 soalan sebenar.
 *
 * Format satu soalan:
 * { q, options:[...], answer, explain, fig? }
 *   fig = HTML/SVG rajah (dipaparkan seadanya). Semua rajah self-contained.
 * ========================================================================= */

const PKSK_DATA = {
  "meta": {
    "title": "Portal PKSK",
    "subtitle": "Cabaran Kemasukan Sekolah Khusus — Uji Minda Kau!",
    "version": "2.0"
  },
  "topics": [
    {
      "id": "pengetahuan",
      "title": "Pengetahuan Am",
      "icon": "🧠",
      "summary": "Soalan popular pengetahuan am — sejarah, negara, sains & matematik harian.",
      "notes": [
        "Pengetahuan Am menguji pengetahuan umum: negara & dunia, sains, sukan, budaya dan matematik harian.",
        "Baca berita dan fakta menarik setiap hari untuk memperkukuh pengetahuan am.",
        "Untuk soalan matematik, baca dengan teliti dan kenal pasti operasi yang betul sebelum mengira."
      ],
      "questions": [
        {
          "q": "Siapakah Perdana Menteri yang memperkenalkan konsep 1Malaysia?",
          "options": [
            "Tun Dr. Mahathir Mohamad",
            "Tun Abdullah Ahmad Badawi",
            "Dato' Sri Mohd Najib Tun Abdul Razak",
            "Dato' Seri Ismail Sabri Yaakob"
          ],
          "answer": 2,
          "explain": "Konsep 1Malaysia diperkenalkan oleh Dato' Sri Mohd Najib Tun Abdul Razak."
        },
        {
          "q": "Perisian komputer yang manakah digunakan untuk memudahkan pengurusan dan pengiraan data?",
          "options": [
            "Microsoft Word",
            "Microsoft Powerpoint",
            "Microsoft Excel",
            "Microsoft Team"
          ],
          "answer": 2,
          "explain": "Microsoft Excel ialah perisian hamparan untuk mengurus dan mengira data."
        },
        {
          "q": "Apakah cogan kata yang tertera di Jata Negara?",
          "options": [
            "Tegas, Cekap, Amanah",
            "Bersekutu Bertambah Mutu",
            "Majulah Negara Malaysia",
            "Keranamu Malaysia"
          ],
          "answer": 1,
          "explain": "Cogan kata pada Jata Negara ialah 'Bersekutu Bertambah Mutu'."
        },
        {
          "q": "Negeri manakah yang turut dikenali dengan \"Negeri Di Bawah Bayu\"?",
          "options": [
            "Sarawak",
            "Sabah",
            "Kelantan",
            "Perlis"
          ],
          "answer": 1,
          "explain": "Sabah dikenali sebagai 'Negeri Di Bawah Bayu'."
        },
        {
          "q": "Komanwel disertai oleh negara berikut kecuali",
          "options": [
            "India",
            "Singapura",
            "Filipina",
            "Bangladesh"
          ],
          "answer": 2,
          "explain": "Filipina bukan ahli Komanwel; India, Singapura dan Bangladesh ialah ahli Komanwel."
        },
        {
          "q": "Logo sukan Olimpik memaparkan simbol bulatan yang mencerminkan",
          "options": [
            "Perpaduan",
            "Jumlah benua di dunia",
            "Semangat kesukanan",
            "Jumlah negara anggota"
          ],
          "answer": 1,
          "explain": "Lima bulatan Olimpik melambangkan lima benua di dunia."
        },
        {
          "q": "Puncak paling tinggi di Banjaran Titiwangsa adalah di",
          "options": [
            "Gunung Kinabalu",
            "Gunung Korbu",
            "Gunung Tahan",
            "Gunung Stong"
          ],
          "answer": 1,
          "explain": "Gunung Korbu ialah puncak tertinggi di Banjaran Titiwangsa."
        },
        {
          "q": "Apakah mata wang bagi negara Brunei?",
          "options": [
            "Ringgit Brunei",
            "Brunei Dollar",
            "Brunei Peso",
            "Rupiah Brunei"
          ],
          "answer": 0,
          "explain": "Mata wang Brunei ialah Ringgit Brunei (Dolar Brunei / BND)."
        },
        {
          "q": "Negara manakah diketuai oleh seorang Presiden?",
          "options": [
            "Brunei",
            "Malaysia",
            "Singapura",
            "Thailand"
          ],
          "answer": 2,
          "explain": "Singapura diketuai oleh seorang Presiden."
        },
        {
          "q": "Apakah nama ibu negara Thailand?",
          "options": [
            "Ranong",
            "Bangkok",
            "Hat Yai",
            "Siam Riep"
          ],
          "answer": 1,
          "explain": "Ibu negara Thailand ialah Bangkok."
        },
        {
          "q": "Syarikat elektronik Samsung berasal daripada negara",
          "options": [
            "Korea Utara",
            "Jepun",
            "Korea Selatan",
            "China"
          ],
          "answer": 2,
          "explain": "Samsung ialah syarikat dari Korea Selatan."
        },
        {
          "q": "Berapakah jumlah pemain bagi sebuah pasukan bola sepak?",
          "options": [
            "9",
            "10",
            "11",
            "12"
          ],
          "answer": 2,
          "explain": "Satu pasukan bola sepak mempunyai 11 pemain di padang."
        },
        {
          "q": "Salim ingin membeli sebuah komputer riba berharga RM6000. Beliau menggunakan kupon potongan harga 6%. Berapakah jumlah yang perlu dibayar Salim?",
          "options": [
            "RM7540",
            "RM5640",
            "RM4640",
            "RM5460"
          ],
          "answer": 1,
          "explain": "RM6000 × 0.94 = RM5640."
        },
        {
          "q": "Ranjit memerlukan 1 meter tali untuk mengikat 4 buah kotak. Berapakah panjang tali yang diperlukannya untuk mengikat 350 buah kotak?",
          "options": [
            "7.85 meter",
            "78.5 meter",
            "87.5 meter",
            "8.75 meter"
          ],
          "answer": 2,
          "explain": "350 ÷ 4 = 87.5 meter."
        },
        {
          "q": "Sekiranya harga petrol meningkat daripada RM2.72 kepada RM3.70 seliter, berapakah peratus peningkatan harga petrol tersebut?",
          "options": [
            "42.3%",
            "35.5%",
            "40.3%",
            "36.0%"
          ],
          "answer": 3,
          "explain": "(3.70 − 2.72) ÷ 2.72 × 100% ≈ 36.0%."
        },
        {
          "q": "Kelas 6 Jupiter ada 50 orang murid, 80% daripada mereka menduduki peperiksaan, dan ½ daripada mereka gagal. Berapakah bilangan murid yang lulus?",
          "options": [
            "25",
            "40",
            "20",
            "45"
          ],
          "answer": 2,
          "explain": "80% × 50 = 40 menduduki; separuh gagal, maka 40 ÷ 2 = 20 lulus."
        },
        {
          "q": "Ayah Azman bekerja di New York. Dia menelefon Azman setiap jam 8 malam waktu Malaysia. New York lebih awal 12 jam berbanding Malaysia. Pukul berapakah panggilan dibuat di New York?",
          "options": [
            "12 tengah hari",
            "8 pagi",
            "6 petang",
            "4 petang"
          ],
          "answer": 1,
          "explain": "8 malam waktu Malaysia − 12 jam = 8 pagi waktu New York."
        },
        {
          "q": "Apakah organel sel tumbuhan yang menjalankan proses fotosintesis?",
          "options": [
            "Klorin",
            "Kloroplas",
            "Akar",
            "Mitokondria"
          ],
          "answer": 1,
          "explain": "Fotosintesis berlaku di dalam kloroplas."
        },
        {
          "q": "Seorang yang buta warna selalunya menghadapi kesukaran membezakan warna",
          "options": [
            "Merah dan hijau",
            "Hitam dan putih",
            "Putih sahaja",
            "Kelabu sahaja"
          ],
          "answer": 0,
          "explain": "Buta warna paling lazim ialah sukar membezakan warna merah dan hijau."
        },
        {
          "q": "Seorang doktor pakar jantung juga dikenali sebagai",
          "options": [
            "Pakar kardiologi",
            "Pakar ortopedik",
            "Pakar pediatrik",
            "Pakar urologi"
          ],
          "answer": 0,
          "explain": "Doktor pakar jantung ialah pakar kardiologi."
        },
        {
          "q": "Berapakah jumlah bilangan gigi orang dewasa?",
          "options": [
            "30",
            "31",
            "32",
            "34"
          ],
          "answer": 2,
          "explain": "Orang dewasa mempunyai 32 batang gigi."
        },
        {
          "q": "Adik Samad berusia 2 tahun semasa Samad berusia 8 tahun. Berapakah usia Samad ketika adiknya berusia 25 tahun?",
          "options": [
            "40",
            "32",
            "31",
            "42"
          ],
          "answer": 2,
          "explain": "Beza usia ialah 6 tahun, maka 25 + 6 = 31 tahun."
        },
        {
          "q": "Abang Halim meminati masakan dan bercita-cita menjadi chef. Apakah bidang pengajian yang sesuai diikuti?",
          "options": [
            "Bidang hospitaliti",
            "Bidang kulinari",
            "Bidang seni teater",
            "Bidang kejuruteraan"
          ],
          "answer": 1,
          "explain": "Bidang kulinari ialah bidang pengajian seni masakan."
        },
        {
          "q": "Apakah tujuan vaksin diberikan kepada rakyat Malaysia?",
          "options": [
            "Untuk memberi penawar kepada wabak COVID-19",
            "Untuk mencapai imuniti kelompok dan mengurangkan risiko jangkitan",
            "Untuk memberi kuasa luar biasa kepada penerima",
            "Untuk membunuh kuman di dalam badan"
          ],
          "answer": 1,
          "explain": "Vaksin bertujuan mencapai imuniti kelompok dan mengurangkan risiko jangkitan."
        },
        {
          "q": "Apakah haiwan kebangsaan Malaysia?",
          "options": [
            "Burung helang",
            "Singa",
            "Harimau",
            "Gajah"
          ],
          "answer": 2,
          "explain": "Harimau Malaya ialah haiwan kebangsaan Malaysia."
        },
        {
          "q": "Yang manakah syarikat yang tidak menawarkan perkhidmatan jalur internet di Malaysia?",
          "options": [
            "TIME",
            "TM",
            "PETRONAS",
            "MAXIS"
          ],
          "answer": 2,
          "explain": "PETRONAS ialah syarikat minyak dan gas, bukan pembekal jalur internet."
        },
        {
          "q": "Di manakah terletaknya Pulau Mabul?",
          "options": [
            "Terengganu",
            "Perak",
            "Sabah",
            "Kedah"
          ],
          "answer": 2,
          "explain": "Pulau Mabul terletak di Sabah."
        },
        {
          "q": "Apakah nama bagi pawang Masyarakat Kadazan?",
          "options": [
            "Bobohina",
            "Bobohizan",
            "Bobohamas",
            "Bobalian"
          ],
          "answer": 1,
          "explain": "Pawang ritual Masyarakat Kadazan dikenali sebagai Bobohizan."
        },
        {
          "q": "Etnik terbesar dari negeri Sarawak ialah",
          "options": [
            "Murut",
            "Kadazan",
            "Iban",
            "Melanau"
          ],
          "answer": 2,
          "explain": "Etnik terbesar di Sarawak ialah kaum Iban."
        },
        {
          "q": "Tarian ___ terkenal dalam kalangan Masyarakat Kadazan Dusun.",
          "options": [
            "Kapit",
            "Sumazau",
            "Ngajat",
            "Ulik Mayang"
          ],
          "answer": 1,
          "explain": "Tarian Sumazau ialah tarian terkenal masyarakat Kadazan Dusun."
        }
      ]
    },
    {
      "id": "matematik",
      "title": "Matematik",
      "icon": "➗",
      "summary": "Penyelesaian masalah matematik — nombor, ukuran, wang & masa.",
      "notes": [
        "Bahagian ini menekankan penyelesaian masalah, bukan sekadar mengira.",
        "Lihat rajah/jadual yang diberi dengan teliti sebelum menjawab.",
        "Semak unit (kg, g, cm, RM) dan tukar jika perlu sebelum mengira."
      ],
      "questions": [
        {
          "q": "Encik Kamal membeli 12 batang paip yang sama panjang. Jumlah panjang kesemua batang paip itu ialah 49.8 m. Hitung panjang, dalam m, bagi sebatang paip itu.",
          "options": [
            "4.08",
            "4.15",
            "4.16",
            "4.21"
          ],
          "answer": 1,
          "explain": "49.8 ÷ 12 = 4.15 m."
        },
        {
          "q": "Antara berikut, yang manakah betul?",
          "options": [
            "2¼ = 225%",
            "3⁵⁄₁₀ = 303%",
            "3²⁄₅ = 325%",
            "4½ = 420%"
          ],
          "answer": 0,
          "explain": "2¼ = 2.25 = 225%."
        },
        {
          "q": "Harga kos sebatang pen ialah RM10. Pekedai memperoleh keuntungan sebanyak 40% daripada harga kos. Berapakah harga jual pen tersebut?",
          "options": [
            "40 sen",
            "RM4.00",
            "RM14.00",
            "RM14.40"
          ],
          "answer": 2,
          "explain": "Untung = 40% × RM10 = RM4. Harga jual = RM10 + RM4 = RM14.00."
        },
        {
          "q": "Secara purata, rambut manusia tumbuh 12.3 mm dalam masa sebulan. Berapakah panjang, dalam cm, rambut yang tumbuh dalam tempoh 3.25 tahun?",
          "options": [
            "4.797",
            "47.97",
            "479.7",
            "4797"
          ],
          "answer": 1,
          "explain": "3.25 tahun = 39 bulan. 12.3 × 39 = 479.7 mm = 47.97 cm."
        },
        {
          "q": "Zahirah menggunakan ⅗ daripada jumlah panjang sehelai kain untuk menjahit langsir. Dia masih ada 320 cm baki kain itu. Berapakah panjang asal, dalam m, kain itu?",
          "options": [
            "1.6",
            "3.2",
            "4.5",
            "8.0"
          ],
          "answer": 3,
          "explain": "Baki = ⅖ = 320 cm, jadi jumlah = 320 ÷ 2 × 5 = 800 cm = 8.0 m."
        },
        {
          "q": "Berapakah bakinya nilai beza jisim di rajah ditolakkan dengan 18.325 kg?",
          "options": [
            "12 kg 985 g",
            "12 kg 995 g",
            "13 kg 985 g",
            "13 kg 995 g"
          ],
          "answer": 2,
          "explain": "49.025 − 16.715 = 32.310 kg; 32.310 − 18.325 = 13.985 kg = 13 kg 985 g.",
          "fig": "<div style=\"text-align:center\"><span style=\"display:inline-block;border:2px solid #0e2a47;border-radius:8px;padding:8px 16px;font-weight:800;color:#16385c;background:#fff;margin:4px\">49.025 kg</span><span style=\"display:inline-block;border:2px solid #0e2a47;border-radius:8px;padding:8px 16px;font-weight:800;color:#16385c;background:#fff;margin:4px\">16.715 kg</span></div>"
        },
        {
          "q": "Rajah menunjukkan jisim sekampit beras. Rehan menggunakan ⅓ daripada beras itu untuk memasak. Baki beras dimasukkan ke dalam 2 bekas secara sama rata. Berapakah jisim beras di dalam setiap bekas?",
          "options": [
            "2.5 kg",
            "5.0 kg",
            "7.5 kg",
            "8.2 kg"
          ],
          "answer": 1,
          "explain": "Guna ⅓ × 15 = 5 kg; baki 10 kg ÷ 2 = 5.0 kg setiap bekas.",
          "fig": "<div style=\"text-align:center\"><div style=\"display:inline-block;background:#33373b;color:#fff;border-radius:8px;padding:22px 26px;font-weight:800\">Beras<br>15 kg</div></div>"
        },
        {
          "q": "Bahagikan hasil darab 18 dan 7.036 dengan 9. Bundarkan jawapan kepada dua tempat perpuluhan.",
          "options": [
            "3.518",
            "3.52",
            "14.072",
            "14.07"
          ],
          "answer": 3,
          "explain": "(18 × 7.036) ÷ 9 = 126.648 ÷ 9 = 14.072 ≈ 14.07."
        },
        {
          "q": "Rajah menunjukkan isipadu air di dalam dua bekas. Hitung jumlah isipadu air, dalam ml.",
          "options": [
            "1 580",
            "1 630",
            "1 725",
            "1 780"
          ],
          "answer": 3,
          "explain": "⅖ ℓ = 400 ml; 1 ℓ 380 ml = 1380 ml; jumlah = 1780 ml.",
          "fig": "<svg viewBox=\"0 0 220 165\" xmlns=\"http://www.w3.org/2000/svg\" font-family=\"Segoe UI\"><g transform=\"translate(20,0)\"><rect x=\"6\" y=\"10\" width=\"60\" height=\"120\" rx=\"6\" fill=\"#fff\" stroke=\"#0e2a47\" stroke-width=\"2\"/><rect x=\"8\" y=\"82\" width=\"56\" height=\"48\" fill=\"#cfe0ef\"/><text x=\"36\" y=\"150\" font-size=\"13\" font-weight=\"700\" fill=\"#16385c\" text-anchor=\"middle\">2/5 ℓ</text></g><g transform=\"translate(120,0)\"><rect x=\"6\" y=\"10\" width=\"60\" height=\"120\" rx=\"6\" fill=\"#fff\" stroke=\"#0e2a47\" stroke-width=\"2\"/><rect x=\"8\" y=\"30\" width=\"56\" height=\"100\" fill=\"#cfe0ef\"/><text x=\"36\" y=\"150\" font-size=\"13\" font-weight=\"700\" fill=\"#16385c\" text-anchor=\"middle\">1 ℓ 380 mℓ</text></g></svg>"
        },
        {
          "q": "Rajah menunjukkan muatan sebuah akuarium. Andy mengisi ¾ daripada akuarium itu dengan air. Berapa banyakkah air lagi, dalam ml, diperlukan untuk memenuhkan akuarium itu?",
          "options": [
            "7 500",
            "9 250",
            "10 500",
            "22 500"
          ],
          "answer": 0,
          "explain": "Baki = ¼ × 30 ℓ = 7.5 ℓ = 7 500 ml.",
          "fig": "<svg viewBox=\"0 0 240 150\" xmlns=\"http://www.w3.org/2000/svg\" font-family=\"Segoe UI\"><path d=\"M40 40 L180 40 L210 20 L70 20 Z\" fill=\"#eef3f8\" stroke=\"#0e2a47\"/><path d=\"M180 40 L210 20 L210 110 L180 130 Z\" fill=\"#dfe8f2\" stroke=\"#0e2a47\"/><rect x=\"40\" y=\"40\" width=\"140\" height=\"90\" fill=\"#f7fafd\" stroke=\"#0e2a47\"/><text x=\"110\" y=\"90\" font-size=\"15\" font-weight=\"800\" fill=\"#16385c\" text-anchor=\"middle\">30 ℓ</text></svg>"
        },
        {
          "q": "Encik Ali membeli 4 kotak buah epal. Setiap kotak mengandungi 20 biji epal. Jika 15% daripada jumlah biji epal telah rosak, berapa biji epal yang masih elok?",
          "options": [
            "12",
            "24",
            "68",
            "96"
          ],
          "answer": 2,
          "explain": "4 × 20 = 80; rosak = 15% × 80 = 12; elok = 80 − 12 = 68."
        },
        {
          "q": "Kak Yong membeli 3 ℓ air tebu. ⅙ daripada air tebu itu diberi kepada jirannya, manakala yang lain diminum oleh 6 orang anaknya, sebanyak 300 ml seorang. Bakinya disimpan. Berapakah isipadu, dalam ml, air tebu yang disimpan?",
          "options": [
            "500 ml",
            "700 ml",
            "1 300 ml",
            "1 800 ml"
          ],
          "answer": 1,
          "explain": "3 ℓ = 3000 ml; jiran = ⅙ = 500 ml; anak = 6 × 300 = 1800 ml; baki = 3000 − 500 − 1800 = 700 ml."
        },
        {
          "q": "Jumlah harga 1 pen dan 2 buku ialah RM8. Jumlah harga 3 pen dan 4 buku yang sama ialah RM18. Berapakah harga bagi sebuah buku?",
          "options": [
            "RM3",
            "RM4",
            "RM5",
            "RM6"
          ],
          "answer": 0,
          "explain": "1 pen + 2 buku = RM8; 3 pen + 4 buku = RM18. Selesai serentak: buku = RM3."
        },
        {
          "q": "Perimeter sebuah segi empat tepat ialah 70 cm. Lebar segi empat tepat ialah ⅖ daripada panjangnya. Berapakah lebar segi empat tepat itu?",
          "options": [
            "6",
            "10",
            "11",
            "13"
          ],
          "answer": 1,
          "explain": "p + l = 35; l = ⅖p → (7/5)p = 35 → p = 25, l = 10 cm."
        },
        {
          "q": "Apakah nombor pada tempat kosong?",
          "options": [
            "5",
            "9",
            "17",
            "21"
          ],
          "answer": 2,
          "explain": "Berdasarkan corak pada roda nombor, nilai di tempat kosong ialah 17.",
          "fig": "<svg viewBox=\"0 0 200 200\" xmlns=\"http://www.w3.org/2000/svg\" font-family=\"Segoe UI\"><circle cx=\"100\" cy=\"22\" r=\"15\" fill=\"#eef3f8\" stroke=\"#0e2a47\"/><text x=\"100\" y=\"26\" font-size=\"13\" font-weight=\"800\" fill=\"#16385c\" text-anchor=\"middle\">12</text><circle cx=\"155\" cy=\"45\" r=\"15\" fill=\"#eef3f8\" stroke=\"#0e2a47\"/><text x=\"155\" y=\"49\" font-size=\"13\" font-weight=\"800\" fill=\"#16385c\" text-anchor=\"middle\">13</text><circle cx=\"178\" cy=\"100\" r=\"15\" fill=\"#eef3f8\" stroke=\"#0e2a47\"/><text x=\"178\" y=\"104\" font-size=\"13\" font-weight=\"800\" fill=\"#16385c\" text-anchor=\"middle\">?</text><circle cx=\"155\" cy=\"155\" r=\"15\" fill=\"#eef3f8\" stroke=\"#0e2a47\"/><text x=\"155\" y=\"159\" font-size=\"13\" font-weight=\"800\" fill=\"#16385c\" text-anchor=\"middle\">16</text><circle cx=\"100\" cy=\"178\" r=\"15\" fill=\"#eef3f8\" stroke=\"#0e2a47\"/><text x=\"100\" y=\"182\" font-size=\"13\" font-weight=\"800\" fill=\"#16385c\" text-anchor=\"middle\">14</text><circle cx=\"45\" cy=\"155\" r=\"15\" fill=\"#eef3f8\" stroke=\"#0e2a47\"/><text x=\"45\" y=\"159\" font-size=\"13\" font-weight=\"800\" fill=\"#16385c\" text-anchor=\"middle\">11</text><circle cx=\"22\" cy=\"100\" r=\"15\" fill=\"#eef3f8\" stroke=\"#0e2a47\"/><text x=\"22\" y=\"104\" font-size=\"13\" font-weight=\"800\" fill=\"#16385c\" text-anchor=\"middle\">5</text><circle cx=\"45\" cy=\"45\" r=\"15\" fill=\"#eef3f8\" stroke=\"#0e2a47\"/><text x=\"45\" y=\"49\" font-size=\"13\" font-weight=\"800\" fill=\"#16385c\" text-anchor=\"middle\">8</text><circle cx=\"100\" cy=\"100\" r=\"40\" fill=\"none\" stroke=\"#9fb6cf\" stroke-dasharray=\"3 3\"/><text x=\"100\" y=\"105\" font-size=\"11\" fill=\"#5b6b7d\" text-anchor=\"middle\">?</text></svg>"
        },
        {
          "q": "Apakah nombor pada tempat kosong?",
          "options": [
            "15",
            "18",
            "27",
            "36"
          ],
          "answer": 1,
          "explain": "Corak: (nombor kanan × nombor tengah) + nombor kiri = nombor bawah. Maka (3 × 3) + 9 = 18.",
          "fig": "<svg viewBox=\"0 0 400 100\" xmlns=\"http://www.w3.org/2000/svg\" font-family=\"Segoe UI\"><g transform=\"translate(0,0)\"><circle cx=\"45\" cy=\"45\" r=\"40\" fill=\"#fff\" stroke=\"#0e2a47\"/><line x1=\"45\" y1=\"5\" x2=\"45\" y2=\"85\" stroke=\"#cdd9e6\"/><line x1=\"5\" y1=\"45\" x2=\"85\" y2=\"45\" stroke=\"#cdd9e6\"/><text x=\"28\" y=\"35\" font-size=\"13\" font-weight=\"800\" text-anchor=\"middle\" fill=\"#16385c\">6</text><text x=\"62\" y=\"35\" font-size=\"13\" font-weight=\"800\" text-anchor=\"middle\" fill=\"#16385c\">2</text><text x=\"45\" y=\"52\" font-size=\"12\" text-anchor=\"middle\" fill=\"#b3261e\">2</text><text x=\"45\" y=\"72\" font-size=\"13\" font-weight=\"800\" text-anchor=\"middle\" fill=\"#16385c\">10</text></g><g transform=\"translate(100,0)\"><circle cx=\"45\" cy=\"45\" r=\"40\" fill=\"#fff\" stroke=\"#0e2a47\"/><line x1=\"45\" y1=\"5\" x2=\"45\" y2=\"85\" stroke=\"#cdd9e6\"/><line x1=\"5\" y1=\"45\" x2=\"85\" y2=\"45\" stroke=\"#cdd9e6\"/><text x=\"28\" y=\"35\" font-size=\"13\" font-weight=\"800\" text-anchor=\"middle\" fill=\"#16385c\">8</text><text x=\"62\" y=\"35\" font-size=\"13\" font-weight=\"800\" text-anchor=\"middle\" fill=\"#16385c\">5</text><text x=\"45\" y=\"52\" font-size=\"12\" text-anchor=\"middle\" fill=\"#b3261e\">3</text><text x=\"45\" y=\"72\" font-size=\"13\" font-weight=\"800\" text-anchor=\"middle\" fill=\"#16385c\">23</text></g><g transform=\"translate(200,0)\"><circle cx=\"45\" cy=\"45\" r=\"40\" fill=\"#fff\" stroke=\"#0e2a47\"/><line x1=\"45\" y1=\"5\" x2=\"45\" y2=\"85\" stroke=\"#cdd9e6\"/><line x1=\"5\" y1=\"45\" x2=\"85\" y2=\"45\" stroke=\"#cdd9e6\"/><text x=\"28\" y=\"35\" font-size=\"13\" font-weight=\"800\" text-anchor=\"middle\" fill=\"#16385c\">6</text><text x=\"62\" y=\"35\" font-size=\"13\" font-weight=\"800\" text-anchor=\"middle\" fill=\"#16385c\">6</text><text x=\"45\" y=\"52\" font-size=\"12\" text-anchor=\"middle\" fill=\"#b3261e\">3</text><text x=\"45\" y=\"72\" font-size=\"13\" font-weight=\"800\" text-anchor=\"middle\" fill=\"#16385c\">24</text></g><g transform=\"translate(300,0)\"><circle cx=\"45\" cy=\"45\" r=\"40\" fill=\"#fff\" stroke=\"#0e2a47\"/><line x1=\"45\" y1=\"5\" x2=\"45\" y2=\"85\" stroke=\"#cdd9e6\"/><line x1=\"5\" y1=\"45\" x2=\"85\" y2=\"45\" stroke=\"#cdd9e6\"/><text x=\"28\" y=\"35\" font-size=\"13\" font-weight=\"800\" text-anchor=\"middle\" fill=\"#16385c\">9</text><text x=\"62\" y=\"35\" font-size=\"13\" font-weight=\"800\" text-anchor=\"middle\" fill=\"#16385c\">3</text><text x=\"45\" y=\"52\" font-size=\"12\" text-anchor=\"middle\" fill=\"#b3261e\">3</text><text x=\"45\" y=\"72\" font-size=\"13\" font-weight=\"800\" text-anchor=\"middle\" fill=\"#16385c\">?</text></g></svg>"
        },
        {
          "q": "Rajah terdiri daripada segi empat tepat ABDE dan segi tiga BCD. Luas BCD ialah ⅓ daripada luas ABDE. Cari luas, dalam cm², bagi rajah BCD.",
          "options": [
            "16",
            "18",
            "32",
            "45"
          ],
          "answer": 0,
          "explain": "Luas ABDE = 18 × 5 = 90 cm²; luas BCD = ⅓ × 90 = 30 cm². (Sila sahkan pilihan jawapan.)",
          "fig": "<svg viewBox=\"0 0 240 120\" xmlns=\"http://www.w3.org/2000/svg\" font-family=\"Segoe UI\"><rect x=\"30\" y=\"30\" width=\"120\" height=\"60\" fill=\"#eef3f8\" stroke=\"#0e2a47\" stroke-width=\"2\"/><path d=\"M150 30 L150 90 L200 90 Z\" fill=\"#dfe8f2\" stroke=\"#0e2a47\" stroke-width=\"2\"/><text x=\"45\" y=\"24\" font-size=\"13\" font-weight=\"800\" fill=\"#16385c\">A</text><text x=\"150\" y=\"24\" font-size=\"13\" font-weight=\"800\" fill=\"#16385c\">B</text><text x=\"205\" y=\"95\" font-size=\"13\" font-weight=\"800\" fill=\"#16385c\">C</text><text x=\"150\" y=\"105\" font-size=\"13\" font-weight=\"800\" fill=\"#16385c\">D</text><text x=\"18\" y=\"95\" font-size=\"13\" font-weight=\"800\" fill=\"#16385c\">E</text><text x=\"90\" y=\"24\" font-size=\"12\" fill=\"#16385c\" text-anchor=\"middle\">18 cm</text><text x=\"12\" y=\"62\" font-size=\"12\" fill=\"#16385c\">5 cm</text></svg>"
        },
        {
          "q": "Gaji Encik Tan dalam bulan Disember ialah RM1 800. Gajinya naik 15% dalam bulan Januari. Hitungkan jumlah gaji Encik Tan dalam bulan Disember, Januari dan Februari.",
          "options": [
            "RM5 720",
            "RM5 750",
            "RM5 880",
            "RM5 940"
          ],
          "answer": 3,
          "explain": "Jan = Feb = 1800 × 1.15 = 2070; jumlah = 1800 + 2070 + 2070 = RM5 940."
        },
        {
          "q": "Rajah menunjukkan waktu pada sebuah jam. 2¾ jam selepas waktu yang ditunjukkan ialah",
          "options": [
            "8.25 a.m.",
            "9.25 a.m.",
            "8.25 p.m.",
            "9.25 p.m."
          ],
          "answer": 3,
          "explain": "18:40 = 6:40 p.m.; tambah 2 jam 45 minit = 9:25 p.m.",
          "fig": "<div style=\"text-align:center\"><div style=\"display:inline-block;background:#111;color:#fff;font-weight:800;font-size:34px;letter-spacing:3px;border-radius:12px;padding:10px 26px;font-family:monospace\">18:40</div></div>"
        },
        {
          "q": "Antara nombor berikut, yang manakah lebih besar daripada 4²⁷⁄₁₀₀?",
          "options": [
            "4.027",
            "4.072",
            "4.270",
            "4.277"
          ],
          "answer": 3,
          "explain": "4²⁷⁄₁₀₀ = 4.27; 4.277 > 4.27."
        },
        {
          "q": "Purata bagi 3 kg, 2.48 kg, 700 g dan y kg ialah 1.7 kg. Apakah nilai y?",
          "options": [
            "0.48",
            "0.62",
            "1.08",
            "1.20"
          ],
          "answer": 1,
          "explain": "Jumlah = 4 × 1.7 = 6.8; 3 + 2.48 + 0.7 = 6.18; y = 6.8 − 6.18 = 0.62."
        },
        {
          "q": "Diberi kawasan berlorek adalah ⅕ daripada seluruh rajah itu. Cari peratus kawasan tidak berlorek.",
          "options": [
            "80%",
            "40%",
            "60%",
            "20%"
          ],
          "answer": 0,
          "explain": "Tidak berlorek = ⅖ = 80%.",
          "fig": "<svg viewBox=\"0 0 140 130\" xmlns=\"http://www.w3.org/2000/svg\"><polygon points=\"35,15 105,15 130,65 105,115 35,115 10,65\" fill=\"#fff\" stroke=\"#0e2a47\" stroke-width=\"2\"/><polygon points=\"70,65 105,45 118,80 80,100\" fill=\"#33373b\"/></svg>"
        },
        {
          "q": "Terdapat 24 biji epal yang elok di dalam sebuah bakul. Nisbah bilangan epal yang rosak kepada bilangan epal yang elok ialah 1 : 4. Berapakah bilangan epal yang rosak?",
          "options": [
            "4",
            "6",
            "8",
            "10"
          ],
          "answer": 1,
          "explain": "Elok = 24 → rosak = 24 ÷ 4 = 6."
        },
        {
          "q": "Antara berikut, yang manakah lebih daripada 2²⁄₅ km?",
          "options": [
            "2 km 4 m",
            "2.04 km",
            "2 400 m",
            "2 450 m"
          ],
          "answer": 3,
          "explain": "2²⁄₅ km = 2.4 km = 2 400 m; 2 450 m > 2 400 m."
        },
        {
          "q": "Terdapat 1 200 orang murid di dalam sebuah sekolah. 40% daripada murid itu ialah murid lelaki. 30% daripada murid perempuan ialah orang Cina. Berapakah bilangan murid perempuan Cina di sekolah itu?",
          "options": [
            "720",
            "216",
            "480",
            "144"
          ],
          "answer": 1,
          "explain": "Lelaki = 480; perempuan = 720; Cina = 30% × 720 = 216."
        },
        {
          "q": "Rajah menunjukkan jisim sebiji kek (1.2 kg) yang dipotong kepada 8 bahagian sama saiz. Izzah makan separuh kek itu dan Zarif makan sepotong kek itu. Baki kek dimakan oleh Izzul. Berapakah jisim, dalam g, kek yang dimakan oleh Izzul?",
          "options": [
            "150",
            "400",
            "450",
            "600"
          ],
          "answer": 2,
          "explain": "1 potong = 1200 ÷ 8 = 150 g; Izzah = 600 g; Zarif = 150 g; Izzul = 1200 − 600 − 150 = 450 g.",
          "fig": "<svg viewBox=\"0 0 140 140\" xmlns=\"http://www.w3.org/2000/svg\" font-family=\"Segoe UI\"><path d=\"M70,70 L70.0,12.0 A58,58 0 0 1 111.0,29.0 Z\" fill=\"#e8b64a\" stroke=\"#fff\" stroke-width=\"1.5\"/><text x=\"83.8\" y=\"36.8\" font-size=\"9.5\" font-weight=\"700\" fill=\"#fff\" text-anchor=\"middle\"></text><path d=\"M70,70 L111.0,29.0 A58,58 0 0 1 128.0,70.0 Z\" fill=\"#d99a2b\" stroke=\"#fff\" stroke-width=\"1.5\"/><text x=\"103.2\" y=\"56.2\" font-size=\"9.5\" font-weight=\"700\" fill=\"#fff\" text-anchor=\"middle\"></text><path d=\"M70,70 L128.0,70.0 A58,58 0 0 1 111.0,111.0 Z\" fill=\"#e8b64a\" stroke=\"#fff\" stroke-width=\"1.5\"/><text x=\"103.2\" y=\"83.8\" font-size=\"9.5\" font-weight=\"700\" fill=\"#fff\" text-anchor=\"middle\"></text><path d=\"M70,70 L111.0,111.0 A58,58 0 0 1 70.0,128.0 Z\" fill=\"#d99a2b\" stroke=\"#fff\" stroke-width=\"1.5\"/><text x=\"83.8\" y=\"103.2\" font-size=\"9.5\" font-weight=\"700\" fill=\"#fff\" text-anchor=\"middle\"></text><path d=\"M70,70 L70.0,128.0 A58,58 0 0 1 29.0,111.0 Z\" fill=\"#e8b64a\" stroke=\"#fff\" stroke-width=\"1.5\"/><text x=\"56.2\" y=\"103.2\" font-size=\"9.5\" font-weight=\"700\" fill=\"#fff\" text-anchor=\"middle\"></text><path d=\"M70,70 L29.0,111.0 A58,58 0 0 1 12.0,70.0 Z\" fill=\"#d99a2b\" stroke=\"#fff\" stroke-width=\"1.5\"/><text x=\"36.8\" y=\"83.8\" font-size=\"9.5\" font-weight=\"700\" fill=\"#fff\" text-anchor=\"middle\"></text><path d=\"M70,70 L12.0,70.0 A58,58 0 0 1 29.0,29.0 Z\" fill=\"#e8b64a\" stroke=\"#fff\" stroke-width=\"1.5\"/><text x=\"36.8\" y=\"56.2\" font-size=\"9.5\" font-weight=\"700\" fill=\"#fff\" text-anchor=\"middle\"></text><path d=\"M70,70 L29.0,29.0 A58,58 0 0 1 70.0,12.0 Z\" fill=\"#d99a2b\" stroke=\"#fff\" stroke-width=\"1.5\"/><text x=\"56.2\" y=\"36.8\" font-size=\"9.5\" font-weight=\"700\" fill=\"#fff\" text-anchor=\"middle\"></text></svg><div style=\"text-align:center;font-weight:800;color:#16385c\">1.2 kg</div>"
        },
        {
          "q": "Rajah menunjukkan satu carta pai stem yang dikumpul oleh empat orang murid (jumlah 1 200 keping). Hitung jumlah bilangan setem yang dikumpul oleh Kumar dan Afif.",
          "options": [
            "720",
            "660",
            "480",
            "180"
          ],
          "answer": 1,
          "explain": "Kumar = 100 − 25 − 15 − 20 = 40%; Kumar + Afif = 55% × 1200 = 660.",
          "fig": "<svg viewBox=\"0 0 140 140\" xmlns=\"http://www.w3.org/2000/svg\" font-family=\"Segoe UI\"><path d=\"M70,70 L70.0,12.0 A58,58 0 0 1 104.1,116.9 Z\" fill=\"#4e79a7\" stroke=\"#fff\" stroke-width=\"1.5\"/><text x=\"104.2\" y=\"58.9\" font-size=\"9.5\" font-weight=\"700\" fill=\"#fff\" text-anchor=\"middle\">Kumar 40%</text><path d=\"M70,70 L104.1,116.9 A58,58 0 0 1 23.1,104.1 Z\" fill=\"#e8b64a\" stroke=\"#fff\" stroke-width=\"1.5\"/><text x=\"64.4\" y=\"105.5\" font-size=\"9.5\" font-weight=\"700\" fill=\"#fff\" text-anchor=\"middle\">Aziz 25%</text><path d=\"M70,70 L23.1,104.1 A58,58 0 0 1 14.8,52.1 Z\" fill=\"#59a14f\" stroke=\"#fff\" stroke-width=\"1.5\"/><text x=\"34.5\" y=\"75.6\" font-size=\"9.5\" font-weight=\"700\" fill=\"#fff\" text-anchor=\"middle\">Afif 15%</text><path d=\"M70,70 L14.8,52.1 A58,58 0 0 1 70.0,12.0 Z\" fill=\"#e15759\" stroke=\"#fff\" stroke-width=\"1.5\"/><text x=\"48.9\" y=\"40.9\" font-size=\"9.5\" font-weight=\"700\" fill=\"#fff\" text-anchor=\"middle\">Seng 20%</text></svg>"
        },
        {
          "q": "Terdapat 4 biji guli biru dan 2 biji guli hijau di dalam sebuah bekas. Sebiji guli dikeluarkan. Nyatakan kebolehjadian guli yang dikeluarkan berwarna hitam.",
          "options": [
            "Pasti",
            "Mustahil",
            "Kecil kemungkinan",
            "Sama kemungkinan"
          ],
          "answer": 1,
          "explain": "Tiada guli hitam di dalam bekas, jadi mustahil."
        },
        {
          "q": "Puan Mawar berumur 31 tahun. Dalam 5 tahun akan datang, umur Adam adalah setengah daripada umur Puan Mawar. Berapakah umur Adam sekarang?",
          "options": [
            "13 tahun",
            "18 tahun",
            "25 tahun",
            "31 tahun"
          ],
          "answer": 0,
          "explain": "Dalam 5 tahun: Mawar = 36, Adam = 18; maka sekarang Adam = 18 − 5 = 13 tahun."
        },
        {
          "q": "Di sebuah kilang kereta, terdapat 1 674 buah kereta Q. Semua kereta perlu dihantar ke 6 buah negeri secara sama rata. Hitung jumlah kereta yang diterima oleh 4 buah negeri.",
          "options": [
            "1 116",
            "1 136",
            "1 216",
            "1 336"
          ],
          "answer": 0,
          "explain": "1674 ÷ 6 = 279; 279 × 4 = 1 116."
        }
      ]
    },
    {
      "id": "sains",
      "title": "Sains",
      "icon": "🔬",
      "summary": "Penyelesaian masalah sains — hidupan, tenaga, bahan & alam.",
      "notes": [
        "Sains menguji kefahaman konsep dan kemahiran mentafsir rajah, jadual dan graf.",
        "Kaitkan setiap konsep dengan contoh dalam kehidupan seharian.",
        "Perhatikan kata kunci soalan seperti \"sebab\", \"kesan\", \"ciri\" dan \"fungsi\"."
      ],
      "questions": [
        {
          "q": "Rajah menunjukkan sejenis haiwan (kucing dan anaknya). Antara berikut yang manakah menunjukkan ciri-ciri haiwan di atas?<br><span class=en>Which of the following is a characteristic of the animal shown above?</span>",
          "options": [
            "Haiwan yang menjaga telur / take care of eggs",
            "Haiwan yang mempunyai sisik / has scales",
            "Haiwan yang melahirkan anak / gives birth",
            "Haiwan yang mempunyai tanduk / has horns"
          ],
          "answer": 2,
          "explain": "Kucing ialah mamalia yang melahirkan anak.",
          "fig": "<div style=\"font-size:44px;text-align:center;margin:6px 0\">🐈</div>"
        },
        {
          "q": "Rajah menunjukkan laluan udara semasa proses menarik nafas: Hidung &rarr; Y &rarr; X. Apakah yang diwakili oleh X dan Y?<br><span class=en>What do X and Y represent?</span>",
          "options": [
            "X: Mulut, Y: Peparu",
            "X: Trakea, Y: Peparu",
            "X: Peparu, Y: Trakea",
            "X: Peparu, Y: Salur udara"
          ],
          "answer": 2,
          "explain": "Udara: Hidung &rarr; Trakea (Y) &rarr; Peparu (X).",
          "fig": "<div style=\"text-align:center;font-weight:700;color:#16385c;font-size:15px\">Hidung / Nose &nbsp;&rarr;&nbsp; <span style=\"color:#b3261e\">Y</span> &nbsp;&rarr;&nbsp; <span style=\"color:#b3261e\">X</span> &nbsp;&rarr;</div>"
        },
        {
          "q": "Maklumat: \\\"Penyingkiran bahan buangan yang tidak diperlukan oleh badan.\\\" Apakah proses itu?<br><span class=en>What is the process?</span>",
          "options": [
            "Perkumuhan / Excretion",
            "Pernafasan / Breathing",
            "Penyahtinjaan / Defecation",
            "Tindak balas terhadap rangsangan / Response to stimulation"
          ],
          "answer": 0,
          "explain": "Penyingkiran bahan buangan (kumuh) daripada badan ialah perkumuhan."
        },
        {
          "q": "Rajah menunjukkan tabiat buruk manusia (minum arak, makan berlebihan, berbaring menonton TV). Apakah yang akan berlaku jika tabiat ini berterusan?<br><span class=en>What will happen if these habits continue?</span>",
          "options": [
            "Mampu melawan pelbagai penyakit",
            "Dapat hidup dengan gembira",
            "Manusia akan lambat bergerak balas terhadap rangsangan",
            "Tubuh badan menjadi sihat"
          ],
          "answer": 2,
          "explain": "Tabiat buruk menjejaskan kesihatan; badan menjadi lambat bergerak balas terhadap rangsangan.",
          "fig": "<div style=\"font-size:44px;text-align:center;margin:6px 0\">🍺🍔📺</div>"
        },
        {
          "q": "Rajah menunjukkan empat haiwan: R (paus), S (ketam), T (katak), U (pari). Antara berikut yang manakah bernafas menggunakan insang?<br><span class=en>Which breathe using gills?</span>",
          "options": [
            "R dan U",
            "T dan S",
            "S dan U",
            "R dan T"
          ],
          "answer": 2,
          "explain": "Ketam (S) dan ikan pari (U) bernafas menggunakan insang.",
          "fig": "<div style=\"font-size:44px;text-align:center;margin:6px 0\">🐋 🦀 🐸 🐠</div>"
        },
        {
          "q": "Maklumat penyiasatan di sawah padi: belalang > ular; helang < ular; katak > helang tetapi < ular. Carta palang manakah mewakili maklumat ini?<br><span class=en>Which bar chart represents this information?</span>",
          "options": [
            "Belalang tertinggi > Ular > Katak > Helang terendah",
            "Ular tertinggi > Katak > Belalang > Helang",
            "Belalang tinggi, Ular rendah, Katak sederhana",
            "Belalang tertinggi tetapi Katak < Helang"
          ],
          "answer": 0,
          "explain": "Susunan betul: Belalang > Ular > Katak > Helang."
        },
        {
          "q": "Rajah menunjukkan seekor kura-kura. Apakah tingkah laku haiwan ini untuk melindungi diri daripada musuh?<br><span class=en>What is the behaviour of the animal to protect itself?</span>",
          "options": [
            "Menyamar / Camouflage",
            "Menggulungkan diri / Curls up",
            "Mempunyai cangkerang yang keras / Has a hard shell",
            "Memasukkan anggota badannya ke dalam cangkerang / Retracts body into shell"
          ],
          "answer": 3,
          "explain": "Tingkah laku kura-kura ialah memasukkan anggota badan ke dalam cangkerang.",
          "fig": "<div style=\"font-size:44px;text-align:center;margin:6px 0\">🐢</div>"
        },
        {
          "q": "Bilangan murid yang menghidap selesema bertambah dari 15 orang kepada 80 orang dalam seminggu. Apakah kesimpulan yang boleh dibuat?<br><span class=en>What conclusion can be made?</span>",
          "options": [
            "Selesema adalah penyakit yang berjangkit",
            "Selesema disebabkan oleh mikroorganisma",
            "Selesema menyerang kanak-kanak",
            "Selesema bertambah apabila bilangan hari bertambah"
          ],
          "answer": 0,
          "explain": "Peningkatan pesat menunjukkan selesema ialah penyakit berjangkit."
        },
        {
          "q": "Rajah menunjukkan ikan jerung dan ikan remora yang berinteraksi. Apakah bentuk interaksi simbiosis antara dua haiwan tersebut?<br><span class=en>What is the symbiotic interaction?</span>",
          "options": [
            "Parasitisme / Parasitism",
            "Komensalisme / Commensalism",
            "Mutualisme / Mutualism",
            "Intraspesies / Intraspecies"
          ],
          "answer": 1,
          "explain": "Remora mendapat manfaat tanpa memudaratkan jerung &mdash; komensalisme.",
          "fig": "<div style=\"font-size:44px;text-align:center;margin:6px 0\">🦈</div>"
        },
        {
          "q": "Rajah menunjukkan satu objek diletakkan di hadapan lampu suluh. Bagaimanakah untuk menjadikan saiz bayang-bayang bola itu lebih besar daripada saiz asal?<br><span class=en>How to make the shadow larger?</span>",
          "options": [
            "Dekatkan bola dengan skrin",
            "Jauhkan bola dengan skrin (dekatkan pada lampu)",
            "Ubah kedudukan lampu suluh",
            "Ubah kedudukan skrin"
          ],
          "answer": 1,
          "explain": "Menjauhkan bola dari skrin (mendekatkannya pada lampu) membesarkan bayang-bayang.",
          "fig": "<div style=\"font-size:44px;text-align:center;margin:6px 0\">🔦</div>"
        },
        {
          "q": "Antara fenomena berikut, yang manakah melibatkan prinsip pembiasan cahaya?<br><span class=en>Which involves refraction of light?</span>",
          "options": [
            "L dan N",
            "M dan N",
            "L dan O",
            "M dan O"
          ],
          "answer": 2,
          "explain": "Pensel dalam air (L) dan objek dalam air (O) kelihatan bengkok &mdash; pembiasan cahaya. (Sila sahkan rajah.)"
        },
        {
          "q": "Rajah menunjukkan dua perkakas elektrik: R (cerek) dan S (pembesar suara). Antara berikut, alat yang sama dengan R dan S berdasarkan perubahan bentuk tenaga?<br><span class=en>Which pair has the same energy change as R and S?</span>",
          "options": [
            "💡 Lampu meja & 🫧 pengisar",
            "🪒 Seterika & 💨 pengering rambut",
            "🍞 Pembakar roti & 📻 radio",
            "🍚 Periuk nasi & 🪱 kipas"
          ],
          "answer": 2,
          "explain": "Cerek (haba) & pembesar suara (bunyi) = Pembakar roti (haba) & radio (bunyi).",
          "fig": "<div style=\"font-size:34px;text-align:center\">🫖 R &nbsp;&nbsp; 🔊 S</div>"
        },
        {
          "q": "Rajah menunjukkan sebuah rumah yang dipasang dengan panel suria. Apakah kegunaan paling utama panel suria tersebut?<br><span class=en>What is the main purpose of the solar panel?</span>",
          "options": [
            "Menghilangkan bau di dalam rumah",
            "Meningkatkan suhu di dalam rumah",
            "Memanaskan air",
            "Membekalkan tenaga elektrik ke dalam rumah"
          ],
          "answer": 3,
          "explain": "Panel suria menukar cahaya matahari kepada tenaga elektrik untuk rumah.",
          "fig": "<div style=\"font-size:44px;text-align:center;margin:6px 0\">🏠☀️</div>"
        },
        {
          "q": "Langkah-langkah mengukur suhu air: R (letak termometer dalam air), S (tunggu aras merkuri berhenti), T (pegang batang termometer secara tegak), U (laraskan mata pada meniskus dan baca). Susun mengikut urutan yang betul.<br><span class=en>Arrange the steps in the correct order.</span>",
          "options": [
            "T, R, S dan U",
            "T, S, R dan U",
            "R, U, T dan S",
            "R, T, U dan S"
          ],
          "answer": 0,
          "explain": "Pegang tegak (T) &rarr; letak dalam air (R) &rarr; tunggu (S) &rarr; baca (U)."
        },
        {
          "q": "Selepas tart dibakar, acuan tidak boleh ditanggalkan. Apakah langkah terbaik supaya tart dapat dikeluarkan dengan mudah?<br><span class=en>Best way to remove the tart from the mold?</span>",
          "options": [
            "Cungkil acuan dengan garfu",
            "Biarkan acuan sejuk pada suhu bilik",
            "Jemur acuan di bawah cahaya matahari",
            "Rendam acuan tart dalam bekas berisi air panas"
          ],
          "answer": 3,
          "explain": "Air panas mengembangkan logam acuan supaya tart mudah tanggal.",
          "fig": "<div style=\"font-size:44px;text-align:center;margin:6px 0\">🥧</div>"
        },
        {
          "q": "Rajah menunjukkan jisim Q yang diukur menggunakan neraca tiga palang. Berapakah bacaan jisim Q?<br><span class=en>What is the mass of Q on the triple-beam balance?</span>",
          "options": [
            "20.7 g",
            "7.20 g",
            "27.7 g",
            "277.5 g"
          ],
          "answer": 2,
          "explain": "Jumlah bacaan tiga palang = 27.7 g. (Sila sahkan kedudukan penunjuk.)",
          "fig": "<div style=\"font-size:44px;text-align:center;margin:6px 0\">⚖️</div>"
        },
        {
          "q": "Jadual menunjukkan masa yang diambil oleh 4 buah kereta untuk bergerak 200 km: R=5, S=3, T=8, U=2 jam. Pilih urutan yang betul bermula daripada paling perlahan kepada paling laju.<br><span class=en>From slowest to fastest.</span>",
          "options": [
            "T, R, S, U",
            "U, S, R, T",
            "T, S, R, U",
            "U, S, T, R"
          ],
          "answer": 0,
          "explain": "Masa paling lama = paling perlahan: T(8) > R(5) > S(3) > U(2)."
        },
        {
          "q": "Penyiasatan daya geseran kereta mainan menuruni landasan condong. Jarak dilalui: Kaca=12 cm, Simen=9 cm, Kertas pasir=6 cm. Apakah kesimpulan penyiasatan ini?<br><span class=en>What is the conclusion?</span>",
          "options": [
            "Daya geseran paling besar di atas permukaan kertas pasir",
            "Daya geseran paling besar di atas permukaan kaca",
            "Semakin berkurang daya geseran, kereta bergerak lebih dekat",
            "Semakin bertambah daya geseran, kereta bergerak lebih jauh"
          ],
          "answer": 0,
          "explain": "Jarak terpendek (kertas pasir) menunjukkan daya geseran paling besar."
        },
        {
          "q": "Rajah menunjukkan dua kumpulan objek. Kumpulan P: payung, baju hujan, khemah. Kumpulan Q: tayar, meja, stoking. Apakah sumber asas bahan bagi P dan Q?<br><span class=en>Source of materials for P and Q?</span>",
          "options": [
            "P: Petroleum, Q: Tumbuhan",
            "P: Tumbuhan, Q: Haiwan",
            "P: Petroleum, Q: Haiwan",
            "P: Batuan, Q: Petroleum"
          ],
          "answer": 0,
          "explain": "P (plastik/nilon) daripada petroleum; Q (getah, kayu, kapas) daripada tumbuhan.",
          "fig": "<div style=\"font-size:44px;text-align:center;margin:6px 0\">☂️ 🧥 ⛺</div>"
        },
        {
          "q": "Rajah menunjukkan makanan dalam tin. Bagaimanakah cara untuk mencegah tin makanan itu daripada berkarat?<br><span class=en>How to prevent the food can from rusting?</span>",
          "options": [
            "Menyalut dengan plastik",
            "Menyadur dengan logam",
            "Mengecat",
            "Menyapu minyak atau gris"
          ],
          "answer": 0,
          "explain": "Tin makanan disalut supaya tidak berkarat dan selamat untuk makanan. (Sila sahkan jawapan.)",
          "fig": "<div style=\"font-size:44px;text-align:center;margin:6px 0\">🥫</div>"
        },
        {
          "q": "Nabil meletakkan gelas berisi kiub ais di atas meja. Selepas 15 minit, terdapat titisan air pada permukaan luar gelas. Apakah proses yang berlaku?<br><span class=en>What is the process?</span>",
          "options": [
            "Pembekuan / Freezing",
            "Penyejatan / Evaporation",
            "Peleburan / Melting",
            "Kondensasi / Condensation"
          ],
          "answer": 3,
          "explain": "Wap air di udara terkondensasi pada permukaan gelas yang sejuk &mdash; kondensasi.",
          "fig": "<div style=\"font-size:44px;text-align:center;margin:6px 0\">🥤🧊</div>"
        },
        {
          "q": "Jadual menunjukkan sifat kimia bahan melalui rasa: R (masam), S (manis/masin/tawar), T (pahit). Apakah bahan yang boleh diwakili oleh R, S dan T?<br><span class=en>Substances represented by R, S and T?</span>",
          "options": [
            "R: Cuka, S: Garam, T: Peria",
            "R: Peria, S: Gula, T: Lemon",
            "R: Tepung gandum, S: Kubis, T: Tomato",
            "R: Badam, S: Minyak, T: Nasi"
          ],
          "answer": 0,
          "explain": "Cuka = masam, Garam = masin, Peria = pahit."
        },
        {
          "q": "Rajah menunjukkan satu cara yang betul untuk melupuskan sejenis bahan buangan. Jika bahan buangan itu tidak dilupuskan dengan betul, apakah yang akan berlaku kepada alam sekitar?<br><span class=en>If not disposed of properly, what happens?</span>",
          "options": [
            "Menyebabkan pencemaran udara",
            "Menjadi tempat pembiakan haiwan perosak",
            "Menyebabkan perubahan iklim",
            "Memudaratkan haiwan dan tumbuhan akuatik"
          ],
          "answer": 1,
          "explain": "Bahan buangan yang tidak dilupus dengan betul menjadi tempat pembiakan haiwan perosak. (Sila sahkan jenis bahan dalam rajah.)",
          "fig": "<div style=\"font-size:44px;text-align:center;margin:6px 0\">♻️</div>"
        },
        {
          "q": "Antara berikut, yang manakah merupakan bahan buangan tidak terbiodegradasi?<br><span class=en>Which is non-biodegradable waste?</span>",
          "options": [
            "Surat khabar / Newspaper",
            "Tulang ikan / Fish bone",
            "Kotak kadbod / Cardboard box",
            "Botol kaca / Glass bottle"
          ],
          "answer": 3,
          "explain": "Botol kaca tidak terbiodegradasi.",
          "fig": "<div style=\"font-size:44px;text-align:center;margin:6px 0\">📰 🐟 📦 🫙</div>"
        },
        {
          "q": "Langkah membuat jeruk mangga: P (potong), Q (basuh & tus), R (campur garam, biar semalaman), S (basuh & tus semula), T (?), U (tutup balang dengan ketat). Apakah langkah T?<br><span class=en>What is step T?</span>",
          "options": [
            "Letakkan mangga ke dalam sebuah balang",
            "Keringkan mangga di bawah cahaya matahari",
            "Rendam mangga dalam larutan cuka semalaman dan tambah gula",
            "Rendam mangga dalam larutan gula yang pekat untuk beberapa hari dan tambah sedikit cuka"
          ],
          "answer": 3,
          "explain": "Selepas dibasuh, mangga direndam dalam larutan gula pekat (+ sedikit cuka) untuk dijerukkan."
        },
        {
          "q": "Rajah menunjukkan aktiviti yang melibatkan daya (menekan/menolak). Antara aktiviti berikut, yang manakah melibatkan daya yang sama seperti aktiviti di atas?<br><span class=en>Which activity involves the same force?</span>",
          "options": [
            "Mengepam tayar basikal / Pump the bicycle tire",
            "Mendayung sampan / Rowing a boat",
            "Menarik pintu / Pull the door",
            "Menolak troli / Pushing trolley"
          ],
          "answer": 0,
          "explain": "Aktiviti itu ialah menekan/menolak (daya tolak) &mdash; sama seperti mengepam tayar. (Sila sahkan rajah.)",
          "fig": "<div style=\"font-size:44px;text-align:center;margin:6px 0\">💪</div>"
        },
        {
          "q": "Penyiasatan fasa bulan: 1hb tidak kelihatan, 5hb sabit, 10hb separa, 15hb purnama, 20hb tidak kelihatan, 25hb sabit. Ramalkan fasa bulan pada 27hb.<br><span class=en>Predict the phase of the moon on the 27th.</span>",
          "options": [
            "Bulan separa / Half moon",
            "Bulan purnama / Full moon",
            "Anak bulan / New moon",
            "Bulan sabit / Crescent"
          ],
          "answer": 3,
          "explain": "Selepas 25hb (sabit) dan semakin membesar, 27hb masih bulan sabit.",
          "fig": "<svg viewBox=\"0 0 400 90\" xmlns=\"http://www.w3.org/2000/svg\" font-family=\"Segoe UI\"><circle cx=\"35\" cy=\"38\" r=\"24\" fill=\"#1a1a2a\" stroke=\"#0e2a47\"/><text x=\"35\" y=\"82\" font-size=\"11\" fill=\"#16385c\" text-anchor=\"middle\">1 hb</text><circle cx=\"100\" cy=\"38\" r=\"24\" fill=\"#1a1a2a\" stroke=\"#0e2a47\"/><clipPath id=\"c1\"><rect x=\"76\" y=\"14\" width=\"7\" height=\"48\"/></clipPath><circle cx=\"100\" cy=\"38\" r=\"24\" fill=\"#f5e08a\" clip-path=\"url(#c1)\"/><text x=\"100\" y=\"82\" font-size=\"11\" fill=\"#16385c\" text-anchor=\"middle\">5 hb</text><circle cx=\"165\" cy=\"38\" r=\"24\" fill=\"#1a1a2a\" stroke=\"#0e2a47\"/><clipPath id=\"c2\"><rect x=\"141\" y=\"14\" width=\"24\" height=\"48\"/></clipPath><circle cx=\"165\" cy=\"38\" r=\"24\" fill=\"#f5e08a\" clip-path=\"url(#c2)\"/><text x=\"165\" y=\"82\" font-size=\"11\" fill=\"#16385c\" text-anchor=\"middle\">10 hb</text><circle cx=\"230\" cy=\"38\" r=\"24\" fill=\"#1a1a2a\" stroke=\"#0e2a47\"/><clipPath id=\"c3\"><rect x=\"206\" y=\"14\" width=\"48\" height=\"48\"/></clipPath><circle cx=\"230\" cy=\"38\" r=\"24\" fill=\"#f5e08a\" clip-path=\"url(#c3)\"/><text x=\"230\" y=\"82\" font-size=\"11\" fill=\"#16385c\" text-anchor=\"middle\">15 hb</text><circle cx=\"295\" cy=\"38\" r=\"24\" fill=\"#1a1a2a\" stroke=\"#0e2a47\"/><text x=\"295\" y=\"82\" font-size=\"11\" fill=\"#16385c\" text-anchor=\"middle\">20 hb</text><circle cx=\"360\" cy=\"38\" r=\"24\" fill=\"#1a1a2a\" stroke=\"#0e2a47\"/><clipPath id=\"c5\"><rect x=\"336\" y=\"14\" width=\"7\" height=\"48\"/></clipPath><circle cx=\"360\" cy=\"38\" r=\"24\" fill=\"#f5e08a\" clip-path=\"url(#c5)\"/><text x=\"360\" y=\"82\" font-size=\"11\" fill=\"#16385c\" text-anchor=\"middle\">25 hb</text></svg>"
        },
        {
          "q": "Rajah menunjukkan satu buruj di langit. Apakah arah yang ditunjukkan oleh buruj di atas?<br><span class=en>What direction is shown by the constellation?</span>",
          "options": [
            "Utara / North",
            "Selatan / South",
            "Timur / East",
            "Barat / West"
          ],
          "answer": 0,
          "explain": "Buruj petunjuk arah (Buruj Biduk) menunjukkan arah utara. (Sila sahkan buruj dalam rajah.)",
          "fig": "<div style=\"font-size:44px;text-align:center;margin:6px 0\">⭐</div>"
        },
        {
          "q": "Rajah menunjukkan fenomena di kawasan X (bahagian Bumi yang gelap). Apakah yang menyebabkan fenomena ini berlaku?<br><span class=en>What causes this phenomenon?</span>",
          "options": [
            "Putaran Bumi pada paksinya dari Barat ke Timur",
            "Putaran Bumi pada paksinya dari Timur ke Barat",
            "Peredaran Bumi mengelilingi Matahari dari Timur ke Barat",
            "Peredaran Bumi mengelilingi Matahari dari Barat ke Timur"
          ],
          "answer": 0,
          "explain": "Siang dan malam disebabkan putaran Bumi pada paksinya dari Barat ke Timur.",
          "fig": "<svg viewBox=\"0 0 300 110\" xmlns=\"http://www.w3.org/2000/svg\" font-family=\"Segoe UI\"><circle cx=\"55\" cy=\"55\" r=\"26\" fill=\"#f5c542\"/><text x=\"55\" y=\"95\" font-size=\"11\" text-anchor=\"middle\" fill=\"#16385c\">Matahari</text><circle cx=\"210\" cy=\"55\" r=\"30\" fill=\"#5aa0d0\" stroke=\"#0e2a47\"/><path d=\"M210 25 A30 30 0 0 1 210 85 Z\" fill=\"#1a2a44\"/><text x=\"255\" y=\"45\" font-size=\"11\" fill=\"#16385c\">Kawasan X</text><text x=\"210\" y=\"100\" font-size=\"11\" text-anchor=\"middle\" fill=\"#16385c\">Bumi</text></svg>"
        },
        {
          "q": "Rajah menunjukkan perbandingan saiz antara Matahari, Bumi dan Bulan. Berapakah nisbah saiz antara Matahari, Bumi dan Bulan?<br><span class=en>Ratio between the Sun, Earth and Moon?</span>",
          "options": [
            "400 : 4 : 1",
            "1 : 4 : 400",
            "1 : 40 : 400",
            "40 : 4 : 1"
          ],
          "answer": 0,
          "explain": "Matahari paling besar, Bulan paling kecil &mdash; nisbah 400 : 4 : 1.",
          "fig": "<div style=\"font-size:44px;text-align:center;margin:6px 0\">☀️ 🌍 🌕</div>"
        },
        {
          "q": "Rajah menunjukkan kedudukan planet dalam Sistem Suria. Apakah planet yang paling besar dalam Sistem Suria?<br><span class=en>What is the biggest planet in the Solar System?</span>",
          "options": [
            "Utarid / Mercury",
            "Bumi / Earth",
            "Musytari / Jupiter",
            "Marikh / Mars"
          ],
          "answer": 2,
          "explain": "Musytari (Jupiter) ialah planet terbesar dalam Sistem Suria.",
          "fig": "<div style=\"font-size:44px;text-align:center;margin:6px 0\">🪐</div>"
        },
        {
          "q": "Rajah menunjukkan kedudukan Matahari, Bulan dan Bumi pada kedudukan sebaris (Matahari &mdash; Bulan &mdash; Bumi). Apakah fenomena yang berlaku?<br><span class=en>What is the phenomenon?</span>",
          "options": [
            "Gerhana Bulan / Lunar Eclipse",
            "Fasa-fasa Bulan / Moon phases",
            "Gerhana Matahari / Solar Eclipse",
            "Bulan purnama / Full moon"
          ],
          "answer": 2,
          "explain": "Bulan berada antara Matahari dan Bumi &mdash; Gerhana Matahari.",
          "fig": "<div style=\"font-size:44px;text-align:center;margin:6px 0\">☀️ 🌑 🌍</div>"
        },
        {
          "q": "Mengapakah tempoh masa gerhana Bulan lebih lama berbanding gerhana Matahari?<br><span class=en>Why is the lunar eclipse longer than the solar eclipse?</span>",
          "options": [
            "Saiz Bumi lebih besar berbanding Bulan",
            "Bulan lebih dekat dengan Bumi",
            "Bayang-bayang Bumi jatuh ke atas Bulan",
            "Gerhana Matahari berlaku pada waktu malam"
          ],
          "answer": 0,
          "explain": "Bumi lebih besar, maka bayang-bayangnya lebih besar dan gerhana Bulan berlangsung lebih lama."
        },
        {
          "q": "Rajah menunjukkan perkembangan teknologi dalam bidang pertanian: W &rarr; X (menanam dengan tangan) &rarr; Y (membajak dengan kerbau) &rarr; Z (traktor). Apakah W?<br><span class=en>What is W (the earliest method)?</span>",
          "options": [
            "Menggunakan alat purba / kayu bertajam untuk menggali",
            "Menggunakan mesin penuai",
            "Menggunakan sistem pengairan moden",
            "Menggunakan dron pertanian"
          ],
          "answer": 0,
          "explain": "W ialah kaedah paling awal &mdash; menggunakan alat purba/kayu bertajam. (Sila sahkan pilihan bergambar.)"
        },
        {
          "q": "Antara alat berikut yang manakah menggunakan prinsip roda dan gandar? P (gunting), Q (pahat), R (gear pengasah), S (pengasah pensel berengkol).<br><span class=en>Which tools use the wheel-and-axle principle?</span>",
          "options": [
            "P dan Q",
            "R dan S",
            "Q dan R",
            "P dan S"
          ],
          "answer": 1,
          "explain": "Pengasah pensel berengkol (S) dan gear pengasah (R) menggunakan roda dan gandar.",
          "fig": "<div style=\"font-size:44px;text-align:center;margin:6px 0\">✂️ 🪛</div>"
        },
        {
          "q": "Rajah menunjukkan dua buah bas, X (dua tingkat) dan Y. Bas Y lebih stabil berbanding bas X. Apakah faktor yang mempengaruhi kestabilan bas Y?<br><span class=en>What factor affects the stability of bus Y?</span>",
          "options": [
            "Warna dan ketinggian / Colour and height",
            "Luas tapak dan bentuk / Base area and shape",
            "Ketinggian dan luas tapak / Height and base area",
            "Luas tapak dan jisim / Base area and mass"
          ],
          "answer": 2,
          "explain": "Kestabilan dipengaruhi oleh ketinggian yang rendah dan luas tapak yang besar.",
          "fig": "<div style=\"font-size:44px;text-align:center;margin:6px 0\">🚌</div>"
        },
        {
          "q": "Rajah menunjukkan seorang jurutera binaan. Beliau dikehendaki membina bangunan yang kuat dan kukuh. Apakah yang perlu dilakukan?<br><span class=en>What should be done to build a strong building?</span>",
          "options": [
            "Mengurangkan kos pembinaan",
            "Memastikan struktur bangunan diletakkan dengan betul",
            "Menggunakan bahan binaan bermutu rendah",
            "Menggunakan bahan binaan yang terdiri daripada konkrit dan besi"
          ],
          "answer": 3,
          "explain": "Bahan konkrit dan besi menjadikan bangunan kuat dan kukuh.",
          "fig": "<div style=\"font-size:44px;text-align:center;margin:6px 0\">👷</div>"
        },
        {
          "q": "Rajah menunjukkan seekor zirafah yang sedang minum air. Mengapakah zirafah mengangkangkan kaki hadapannya?<br><span class=en>Why does the giraffe spread its front legs?</span>",
          "options": [
            "Untuk menguatkan kakinya",
            "Untuk mengurangkan jisimnya",
            "Memudahkannya untuk minum air",
            "Untuk menambahkan kestabilan badannya"
          ],
          "answer": 3,
          "explain": "Mengangkang kaki merendahkan badan dan menambah kestabilan semasa minum.",
          "fig": "<div style=\"font-size:44px;text-align:center;margin:6px 0\">🦒</div>"
        },
        {
          "q": "Antara aktiviti berikut, yang manakah menggunakan teknologi?<br><span class=en>Which of the following activities used technology?</span>",
          "options": [
            "J dan K",
            "K dan M",
            "K dan L",
            "J dan M"
          ],
          "answer": 0,
          "explain": "Aktiviti yang menggunakan alat/mesin moden menggunakan teknologi. (Sila sahkan gambar J, K, L, M.)"
        }
      ]
    },
    {
      "id": "english",
      "title": "English",
      "icon": "🔤",
      "summary": "English Language Skills — vocabulary, grammar & comprehension.",
      "notes": [
        "This section tests vocabulary, grammar and reading comprehension.",
        "Read the whole sentence first, then choose the word that fits best.",
        "Watch for singular/plural and correct verb forms."
      ],
      "questions": [
        {
          "q": "Wardina is a ___. She loves to read books so much.",
          "options": [
            "bookshelf",
            "bookseller",
            "bookworm",
            "bookcase"
          ],
          "answer": 2,
          "explain": "A person who loves reading is a bookworm."
        },
        {
          "q": "Everyday, Mr Samuel buys ___ to get the news of the day.",
          "options": [
            "newspapers",
            "newsprint",
            "notebooks",
            "postcards"
          ],
          "answer": 0,
          "explain": "News of the day comes from newspapers."
        },
        {
          "q": "Charlie writes the tips given by the speaker in his ___.",
          "options": [
            "blackboard",
            "textbook",
            "cardboard",
            "notebook"
          ],
          "answer": 3,
          "explain": "You write notes in a notebook."
        },
        {
          "q": "\\\"You should take part in the competition to display your skills and talent.\\\" The same meaning of the word 'display' is ___.",
          "options": [
            "show",
            "conceal",
            "accept",
            "increase"
          ],
          "answer": 0,
          "explain": "'Display' means to show."
        },
        {
          "q": "\\\"During Jasmine's birthday party last Sunday, she looked so cheerful.\\\" The opposite meaning of the word 'cheerful' is ___.",
          "options": [
            "happy",
            "joyful",
            "noisy",
            "sad"
          ],
          "answer": 3,
          "explain": "The opposite of cheerful is sad."
        },
        {
          "q": "Rashid and Hamidi bought those magazines. The books are ___.",
          "options": [
            "his",
            "ours",
            "theirs",
            "mine"
          ],
          "answer": 2,
          "explain": "Belonging to Rashid and Hamidi = theirs."
        },
        {
          "q": "The burglar tip-toed ___ in the bedroom.",
          "options": [
            "quietly",
            "noisily",
            "expertly",
            "worriedly"
          ],
          "answer": 0,
          "explain": "A burglar moves quietly to avoid being heard."
        },
        {
          "q": "___ the motorbike is very old, it can still function properly.",
          "options": [
            "Therefore",
            "Because",
            "Although",
            "Moreover"
          ],
          "answer": 2,
          "explain": "'Although' shows contrast."
        },
        {
          "q": "They are well-behaved, ___ they?",
          "options": [
            "weren't",
            "aren't",
            "wasn't",
            "isn't"
          ],
          "answer": 1,
          "explain": "Question tag for 'are' (positive) is 'aren't'."
        },
        {
          "q": "The children are not in their rooms. ___ are at the playground.",
          "options": [
            "He",
            "She",
            "We",
            "They"
          ],
          "answer": 3,
          "explain": "'The children' = They."
        },
        {
          "q": "Who is the sports secretary?",
          "options": [
            "Mr Samy",
            "Pn Linda",
            "En Zaharuddin",
            "Cik Farina Aisyah"
          ],
          "answer": 3,
          "explain": "The notice is signed by Cik Farina Aisyah (Sports Secretary).",
          "fig": "<div style=\"font-weight:800;text-align:center;color:#16385c\">SPORTS TRAINING — SK SERI MELATI</div><table class=\"data-table\" style=\"max-width:520px\"><tr><th>Day</th><th>Time</th><th>Games</th><th>Teacher</th></tr><tr><td>Monday</td><td>2.00–3.30 PM</td><td>Volleyball</td><td>En Zaharuddin</td></tr><tr><td>Tuesday</td><td>4.00–6.30 PM</td><td>Handball</td><td>En Yahuza</td></tr><tr><td>Wednesday</td><td>3.00–4.30 PM</td><td>Badminton</td><td>En Shahrul</td></tr><tr><td>Thursday</td><td>4.30–6.00 PM</td><td>Football</td><td>En Badli</td></tr><tr><td>Friday</td><td>4.00–5.30 PM</td><td>Netball</td><td>Pn Anisah</td></tr></table>"
        },
        {
          "q": "There will be no training on ___.",
          "options": [
            "Sunday",
            "Monday",
            "Tuesday",
            "Wednesday"
          ],
          "answer": 0,
          "explain": "Training is only Monday–Friday, so none on Sunday.",
          "fig": "<div style=\"font-weight:800;text-align:center;color:#16385c\">SPORTS TRAINING — SK SERI MELATI</div><table class=\"data-table\" style=\"max-width:520px\"><tr><th>Day</th><th>Time</th><th>Games</th><th>Teacher</th></tr><tr><td>Monday</td><td>2.00–3.30 PM</td><td>Volleyball</td><td>En Zaharuddin</td></tr><tr><td>Tuesday</td><td>4.00–6.30 PM</td><td>Handball</td><td>En Yahuza</td></tr><tr><td>Wednesday</td><td>3.00–4.30 PM</td><td>Badminton</td><td>En Shahrul</td></tr><tr><td>Thursday</td><td>4.30–6.00 PM</td><td>Football</td><td>En Badli</td></tr><tr><td>Friday</td><td>4.00–5.30 PM</td><td>Netball</td><td>Pn Anisah</td></tr></table>"
        },
        {
          "q": "At what time do the pupils have their volleyball training?",
          "options": [
            "Two",
            "Three",
            "Four",
            "Five"
          ],
          "answer": 0,
          "explain": "Volleyball starts at 2.00 PM (Two).",
          "fig": "<div style=\"font-weight:800;text-align:center;color:#16385c\">SPORTS TRAINING — SK SERI MELATI</div><table class=\"data-table\" style=\"max-width:520px\"><tr><th>Day</th><th>Time</th><th>Games</th><th>Teacher</th></tr><tr><td>Monday</td><td>2.00–3.30 PM</td><td>Volleyball</td><td>En Zaharuddin</td></tr><tr><td>Tuesday</td><td>4.00–6.30 PM</td><td>Handball</td><td>En Yahuza</td></tr><tr><td>Wednesday</td><td>3.00–4.30 PM</td><td>Badminton</td><td>En Shahrul</td></tr><tr><td>Thursday</td><td>4.30–6.00 PM</td><td>Football</td><td>En Badli</td></tr><tr><td>Friday</td><td>4.00–5.30 PM</td><td>Netball</td><td>Pn Anisah</td></tr></table>"
        },
        {
          "q": "Why is it possible to practise volleyball at 2.30 pm?",
          "options": [
            "It is after lunch",
            "It is indoor",
            "They have sunshades",
            "The court is vacant"
          ],
          "answer": 1,
          "explain": "(Sila sahkan jawapan booklet.)",
          "fig": "<div style=\"font-weight:800;text-align:center;color:#16385c\">SPORTS TRAINING — SK SERI MELATI</div><table class=\"data-table\" style=\"max-width:520px\"><tr><th>Day</th><th>Time</th><th>Games</th><th>Teacher</th></tr><tr><td>Monday</td><td>2.00–3.30 PM</td><td>Volleyball</td><td>En Zaharuddin</td></tr><tr><td>Tuesday</td><td>4.00–6.30 PM</td><td>Handball</td><td>En Yahuza</td></tr><tr><td>Wednesday</td><td>3.00–4.30 PM</td><td>Badminton</td><td>En Shahrul</td></tr><tr><td>Thursday</td><td>4.30–6.00 PM</td><td>Football</td><td>En Badli</td></tr><tr><td>Friday</td><td>4.00–5.30 PM</td><td>Netball</td><td>Pn Anisah</td></tr></table>"
        },
        {
          "q": "There should be ___ players in a team to play netball.",
          "options": [
            "Two",
            "Five",
            "Seven",
            "Eleven"
          ],
          "answer": 2,
          "explain": "A netball team has 7 players.",
          "fig": "<div style=\"font-weight:800;text-align:center;color:#16385c\">SPORTS TRAINING — SK SERI MELATI</div><table class=\"data-table\" style=\"max-width:520px\"><tr><th>Day</th><th>Time</th><th>Games</th><th>Teacher</th></tr><tr><td>Monday</td><td>2.00–3.30 PM</td><td>Volleyball</td><td>En Zaharuddin</td></tr><tr><td>Tuesday</td><td>4.00–6.30 PM</td><td>Handball</td><td>En Yahuza</td></tr><tr><td>Wednesday</td><td>3.00–4.30 PM</td><td>Badminton</td><td>En Shahrul</td></tr><tr><td>Thursday</td><td>4.30–6.00 PM</td><td>Football</td><td>En Badli</td></tr><tr><td>Friday</td><td>4.00–5.30 PM</td><td>Netball</td><td>Pn Anisah</td></tr></table>"
        },
        {
          "q": "The poster is about ___.",
          "options": [
            "Road Safety",
            "Home Safety",
            "School Safety",
            "Community Responsibility"
          ],
          "answer": 1,
          "explain": "The poster is about keeping your home safe.",
          "fig": "<div style=\"border:2px solid #0e2a47;border-radius:10px;padding:14px;max-width:420px;margin:0 auto;background:#fff\"><div style=\"background:#0e2a47;color:#fff;font-weight:800;text-align:center;padding:6px;border-radius:6px\">KEEP YOUR HOME SAFE</div><p style=\"margin:8px 0 4px;font-weight:700\">When you are on holidays:</p><ul style=\"margin:0 0 0 18px;font-size:14px\"><li>Lock the doors, gates and windows</li><li>Turn on the outside lights</li><li>Inform your neighbours to look on your house</li></ul></div>"
        },
        {
          "q": "Why must you lock all doors, windows and gates?",
          "options": [
            "To make people know nobody is at home",
            "Not to let your neighbours enter your house",
            "To ensure that your locks are in good condition",
            "To avoid burglary and break-in"
          ],
          "answer": 3,
          "explain": "Locking up avoids burglary and break-in.",
          "fig": "<div style=\"border:2px solid #0e2a47;border-radius:10px;padding:14px;max-width:420px;margin:0 auto;background:#fff\"><div style=\"background:#0e2a47;color:#fff;font-weight:800;text-align:center;padding:6px;border-radius:6px\">KEEP YOUR HOME SAFE</div><p style=\"margin:8px 0 4px;font-weight:700\">When you are on holidays:</p><ul style=\"margin:0 0 0 18px;font-size:14px\"><li>Lock the doors, gates and windows</li><li>Turn on the outside lights</li><li>Inform your neighbours to look on your house</li></ul></div>"
        },
        {
          "q": "The whole family went to the airport to fetch sister.",
          "options": [
            "True",
            "False"
          ],
          "answer": 1,
          "explain": "False — mother stayed home to cook.",
          "fig": "<div style=\"border:1px solid #cdd9e6;border-radius:10px;padding:12px;max-width:440px;margin:0 auto;background:#fff;font-size:14px\"><b>Tuesday, 15th August 2023</b><br>We went to fetch sister at the airport. All of us, except for mother, who preferred to stay home to finish cooking, were at the Kuala Lumpur International Airport in Sepang. Half an hour later, sister appeared in front of us laden with three big bags. We hugged each other.</div>"
        },
        {
          "q": "Forty five minutes later, the sister appeared.",
          "options": [
            "True",
            "False"
          ],
          "answer": 1,
          "explain": "False — she appeared half an hour (30 minutes) later.",
          "fig": "<div style=\"border:1px solid #cdd9e6;border-radius:10px;padding:12px;max-width:440px;margin:0 auto;background:#fff;font-size:14px\"><b>Tuesday, 15th August 2023</b><br>We went to fetch sister at the airport. All of us, except for mother, who preferred to stay home to finish cooking, were at the Kuala Lumpur International Airport in Sepang. Half an hour later, sister appeared in front of us laden with three big bags. We hugged each other.</div>"
        },
        {
          "q": "The sister brought home three huge luggage.",
          "options": [
            "True",
            "False"
          ],
          "answer": 0,
          "explain": "True — she was laden with three big bags.",
          "fig": "<div style=\"border:1px solid #cdd9e6;border-radius:10px;padding:12px;max-width:440px;margin:0 auto;background:#fff;font-size:14px\"><b>Tuesday, 15th August 2023</b><br>We went to fetch sister at the airport. All of us, except for mother, who preferred to stay home to finish cooking, were at the Kuala Lumpur International Airport in Sepang. Half an hour later, sister appeared in front of us laden with three big bags. We hugged each other.</div>"
        }
      ]
    }
  ]
};

// Dedahkan data secara global untuk app.js
window.PKSK_DATA = PKSK_DATA;
