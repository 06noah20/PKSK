/* =========================================================================
 * BANK SOALAN PKSK  (PKSK Question Bank)
 * =========================================================================
 * Diekstrak daripada portal induk (PORTAL-UASA / portal-pintar_8), bahagian
 * CABARAN "PKSK" — Cabaran kemasukan sekolah khusus.
 *
 * Subjek asal PKSK: Pengetahuan Am, Matematik, Sains, English
 * + set penaakulan Corak & Logik.
 *
 * >>> FORMAT SATU SOALAN <<<
 * {
 *   q: "Teks soalan ...",
 *   options: ["A", "B", "C", "D"],
 *   answer: 0,                       // indeks jawapan betul (0 = A)
 *   explain: "Sebab jawapan betul"   // ditunjuk selepas menjawab
 * }
 * ========================================================================= */

const PKSK_DATA = {
  meta: {
    title: "Portal PKSK",
    subtitle: "Cabaran Kemasukan Sekolah Khusus — Uji Minda Kau!",
    version: "1.0"
  },

  topics: [
    /* ================= PENGETAHUAN AM (30 soalan) ================= */
    {
      id: "pengetahuan",
      title: "Pengetahuan Am",
      icon: "🧠",
      summary: "Pengetahuan am, negara, sains, sukan & matematik harian.",
      notes: [
        "Pengetahuan Am menguji pengetahuan umum merentas pelbagai bidang: sejarah, geografi, sains, sukan dan matematik harian.",
        "Baca berita, buku dan fakta menarik setiap hari untuk memperkukuh pengetahuan am.",
        "Bagi soalan matematik, baca dengan teliti dan kenal pasti operasi yang betul sebelum mengira."
      ],
      questions: [
        { q: "Siapakah Perdana Menteri yang memperkenalkan konsep 1Malaysia?", options: ["Tun Dr. Mahathir Mohamad", "Tun Abdullah Ahmad Badawi", "Dato' Sri Mohd Najib Tun Abdul Razak", "Dato' Seri Ismail Sabri Yaakob"], answer: 2, explain: "Konsep 1Malaysia diperkenalkan oleh Dato' Sri Mohd Najib Tun Abdul Razak." },
        { q: "Perisian komputer yang manakah digunakan untuk memudahkan pengurusan dan pengiraan data?", options: ["Microsoft Word", "Microsoft Powerpoint", "Microsoft Excel", "Microsoft Team"], answer: 2, explain: "Microsoft Excel ialah perisian hamparan untuk mengurus dan mengira data." },
        { q: "Apakah cogan kata yang tertera di Jata Negara?", options: ["Tegas, Cekap, Amanah", "Bersekutu Bertambah Mutu", "Majulah Negara Malaysia", "Keranamu Malaysia"], answer: 1, explain: "Cogan kata pada Jata Negara ialah 'Bersekutu Bertambah Mutu'." },
        { q: "Negeri manakah yang turut dikenali dengan \"Negeri Di Bawah Bayu\"?", options: ["Sarawak", "Sabah", "Kelantan", "Perlis"], answer: 1, explain: "Sabah dikenali sebagai 'Negeri Di Bawah Bayu'." },
        { q: "Komanwel disertai oleh negara berikut kecuali", options: ["India", "Singapura", "Filipina", "Bangladesh"], answer: 2, explain: "Filipina bukan ahli Komanwel; India, Singapura dan Bangladesh ialah ahli Komanwel." },
        { q: "Logo sukan Olimpik memaparkan simbol bulatan yang mencerminkan", options: ["Perpaduan", "Jumlah benua di dunia", "Semangat kesukanan", "Jumlah negara anggota"], answer: 1, explain: "Lima bulatan Olimpik melambangkan lima benua di dunia." },
        { q: "Puncak paling tinggi di Banjaran Titiwangsa adalah di", options: ["Gunung Kinabalu", "Gunung Korbu", "Gunung Tahan", "Gunung Stong"], answer: 1, explain: "Gunung Korbu ialah puncak tertinggi di Banjaran Titiwangsa." },
        { q: "Apakah mata wang bagi negara Brunei?", options: ["Ringgit Brunei", "Brunei Dollar", "Brunei Peso", "Rupiah Brunei"], answer: 0, explain: "Mata wang Brunei ialah Ringgit Brunei (Dolar Brunei / BND)." },
        { q: "Negara manakah diketuai oleh seorang Presiden?", options: ["Brunei", "Malaysia", "Singapura", "Thailand"], answer: 2, explain: "Singapura diketuai oleh seorang Presiden." },
        { q: "Apakah nama ibu negara Thailand?", options: ["Ranong", "Bangkok", "Hat Yai", "Siam Riep"], answer: 1, explain: "Ibu negara Thailand ialah Bangkok." },
        { q: "Syarikat elektronik Samsung berasal daripada negara", options: ["Korea Utara", "Jepun", "Korea Selatan", "China"], answer: 2, explain: "Samsung ialah syarikat dari Korea Selatan." },
        { q: "Berapakah jumlah pemain bagi sebuah pasukan bola sepak?", options: ["9", "10", "11", "12"], answer: 2, explain: "Satu pasukan bola sepak mempunyai 11 pemain di padang." },
        { q: "Salim ingin membeli sebuah komputer riba berharga RM6000. Beliau menggunakan kupon potongan harga 6%. Berapakah jumlah yang perlu dibayar Salim?", options: ["RM7540", "RM5640", "RM4640", "RM5460"], answer: 1, explain: "RM6000 × (100% − 6%) = RM6000 × 0.94 = RM5640." },
        { q: "Ranjit memerlukan 1 meter tali untuk mengikat 4 buah kotak. Berapakah panjang tali yang diperlukannya untuk mengikat 350 buah kotak?", options: ["7.85 meter", "78.5 meter", "87.5 meter", "8.75 meter"], answer: 2, explain: "350 ÷ 4 = 87.5 meter." },
        { q: "Sekiranya harga petrol meningkat daripada RM2.72 kepada RM3.70 seliter, berapakah peratus peningkatan harga petrol tersebut?", options: ["42.3%", "35.5%", "40.3%", "36.0%"], answer: 3, explain: "(3.70 − 2.72) ÷ 2.72 × 100% = 0.98 ÷ 2.72 × 100% ≈ 36.0%." },
        { q: "Kelas 6 Jupiter ada 50 orang murid, 80% daripada murid-murid ini telah menduduki peperiksaan, dan ½ daripada mereka telah gagal. Berapakah bilangan murid yang lulus dalam peperiksaan ini?", options: ["25", "40", "20", "35"], answer: 2, explain: "80% × 50 = 40 murid menduduki; separuh gagal, maka 40 ÷ 2 = 20 murid lulus." },
        { q: "Ayah Azman akan bekerja di New York selama seminggu. Ayahnya berjanji akan menelefon Azman setiap jam 8 malam, waktu Malaysia. New York mempunyai perbezaan masa lebih awal 12 jam berbanding Malaysia. Pada pukul berapakah ayah Azman membuat panggilan dari New York?", options: ["12 tengah hari", "8 pagi", "6 petang", "4 petang"], answer: 1, explain: "8 malam waktu Malaysia tolak 12 jam = 8 pagi waktu New York." },
        { q: "Apakah jenis sel pada tumbuhan yang menjalankan proses fotosintesis?", options: ["Klorin", "Kloroplas", "Akar", "Mitokondria"], answer: 1, explain: "Fotosintesis berlaku di dalam kloroplas." },
        { q: "Seorang yang buta warna selalunya menghadapi kesukaran membezakan warna", options: ["Merah dan hijau", "Hitam dan putih", "Putih sahaja", "Kelabu sahaja"], answer: 0, explain: "Buta warna paling lazim ialah sukar membezakan warna merah dan hijau." },
        { q: "Seorang doktor pakar jantung juga dikenali sebagai", options: ["Pakar kardiologi", "Pakar ortopedik", "Pakar pediatrik", "Pakar urologi"], answer: 0, explain: "Doktor pakar jantung ialah pakar kardiologi." },
        { q: "Berapakah jumlah bilangan gigi orang dewasa?", options: ["30", "31", "32", "34"], answer: 2, explain: "Orang dewasa mempunyai 32 batang gigi." },
        { q: "Adik Samad berusia 2 tahun semasa Samad berusia 8 tahun. Berapakah usia Samad ketika adiknya berusia 25 tahun?", options: ["40", "32", "31", "42"], answer: 2, explain: "Beza usia ialah 6 tahun, maka 25 + 6 = 31 tahun." },
        { q: "Abang Halim sangat meminati bidang masakan dan bercita-cita menjadi seorang chef terkenal. Apakah bidang pengajian yang perlu diikuti Abang Halim untuk mencapai cita-citanya?", options: ["Bidang hospitaliti", "Bidang kulinari", "Bidang seni teater", "Bidang kejuruteraan"], answer: 1, explain: "Bidang kulinari ialah bidang pengajian seni masakan." },
        { q: "Apakah tujuan vaksin diberikan kepada kesemua rakyat Malaysia?", options: ["Untuk memberi penawar kepada wabak COVID-19", "Untuk mencapai imuniti kelompok dan mengurangkan risiko jangkitan", "Untuk memberi kuasa luar biasa kepada penerima vaksin", "Untuk membunuh kuman di dalam badan"], answer: 1, explain: "Vaksin bertujuan mencapai imuniti kelompok dan mengurangkan risiko jangkitan." },
        { q: "Apakah haiwan kebangsaan Malaysia?", options: ["Burung helang", "Singa", "Harimau", "Gajah"], answer: 2, explain: "Harimau Malaya ialah haiwan kebangsaan Malaysia." },
        { q: "Yang manakah syarikat yang tidak menawarkan perkhidmatan jalur internet di Malaysia?", options: ["TIMES", "TM", "PETRONAS", "MAXIS"], answer: 2, explain: "PETRONAS ialah syarikat minyak dan gas, bukan pembekal jalur internet." },
        { q: "Di manakah terletaknya Pulau Mabul?", options: ["Terengganu", "Perak", "Sabah", "Kedah"], answer: 2, explain: "Pulau Mabul terletak di Sabah." },
        { q: "Apakah nama bagi pawang Masyarakat Kadazan ketika itu?", options: ["Bobohina", "Bobohizan", "Bobohamas", "Bobalian"], answer: 1, explain: "Pawang (ketua ritual) Masyarakat Kadazan dikenali sebagai Bobohizan." },
        { q: "Etnik terbesar dari negeri Sarawak ialah", options: ["Murut", "Kadazan", "Iban", "Melanau"], answer: 2, explain: "Etnik terbesar di Sarawak ialah kaum Iban." },
        { q: "Tarian ___ terkenal di kalangan Masyarakat Kadazan Dusun", options: ["Kapit", "Sumazau", "Ngajat", "Ulik Mayang"], answer: 1, explain: "Tarian Sumazau ialah tarian terkenal masyarakat Kadazan Dusun." }
      ]
    },

    /* ================= CORAK & LOGIK (10 soalan) ================= */
    {
      id: "corak",
      title: "Corak & Logik",
      icon: "🧩",
      summary: "Penaakulan, corak nombor & huruf, dan pemikiran logik.",
      notes: [
        "Bahagian ini menguji pemikiran logik (penaakulan) — kemahiran penting untuk cabaran kemasukan sekolah khusus.",
        "Untuk soalan corak, cari BEZA atau HUBUNGAN antara nombor/huruf (tambah, darab, langkau).",
        "Untuk soalan 'yang berbeza', kenal pasti ciri sepunya kumpulan, kemudian cari yang tidak sepadan."
      ],
      questions: [
        { q: "Lengkapkan corak: 2, 4, 6, 8, ?", options: ["9", "10", "11", "12"], answer: 1, explain: "Tambah 2 setiap kali → 10." },
        { q: "Yang manakah berbeza daripada yang lain?", options: ["Mawar", "Melur", "Kucing", "Teratai"], answer: 2, explain: "Kucing bukan bunga." },
        { q: "Ali lebih tinggi daripada Abu. Abu lebih tinggi daripada Ahmad. Siapa paling rendah?", options: ["Ali", "Abu", "Ahmad", "Sama"], answer: 2, explain: "Ahmad paling rendah." },
        { q: "Lengkapkan corak: 1, 2, 4, 7, 11, ?", options: ["14", "15", "16", "18"], answer: 2, explain: "Beza naik 1, 2, 3, 4, 5 → 11 + 5 = 16." },
        { q: "Huruf \"b\" jika dilihat dalam cermin nampak seperti?", options: ["p", "d", "q", "a"], answer: 1, explain: "Pantulan cermin \"b\" kelihatan seperti d." },
        { q: "Lengkapkan corak: 5, 10, 15, 20, ?", options: ["22", "24", "25", "30"], answer: 2, explain: "Tambah 5 setiap kali → 25." },
        { q: "Yang manakah berbeza daripada yang lain?", options: ["Kereta", "Bas", "Basikal", "Meja"], answer: 3, explain: "Meja bukan kenderaan." },
        { q: "Lengkapkan corak huruf: A, C, E, G, ?", options: ["H", "I", "J", "K"], answer: 1, explain: "Langkau satu huruf setiap kali → I." },
        { q: "Jika hari ini Isnin, dua hari lagi ialah hari?", options: ["Selasa", "Rabu", "Khamis", "Ahad"], answer: 1, explain: "Isnin + 2 hari = Rabu." },
        { q: "Lengkapkan corak: 3, 6, 12, 24, ?", options: ["30", "36", "40", "48"], answer: 3, explain: "Darab 2 setiap kali → 48." }
      ]
    },

    /* ================= SAINS (10 soalan) ================= */
    {
      id: "sains",
      title: "Sains",
      icon: "🔬",
      summary: "Haiwan, tumbuhan, tubuh manusia dan sains asas.",
      notes: [
        "Sains menguji kefahaman asas tentang haiwan, tumbuhan, tubuh manusia dan alam sekitar.",
        "Ingat proses penting: fotosintesis (tumbuhan buat makanan), pernafasan dan sistem tubuh.",
        "Kaitkan setiap fakta dengan contoh dalam kehidupan seharian untuk lebih mudah diingati."
      ],
      questions: [
        { q: "Haiwan yang bernafas melalui insang ialah?", options: ["arnab", "ikan", "burung", "kucing"], answer: 1, explain: "Ikan bernafas melalui insang." },
        { q: "Deria yang digunakan untuk mendengar ialah?", options: ["mata", "telinga", "hidung", "lidah"], answer: 1, explain: "Kita mendengar menggunakan telinga." },
        { q: "Planet paling dekat dengan Matahari ialah?", options: ["Zuhrah", "Utarid", "Marikh", "Musytari"], answer: 1, explain: "Utarid (Mercury) paling dekat dengan Matahari." },
        { q: "Air akan bertukar menjadi ___ apabila sangat sejuk.", options: ["wap", "ais", "gas", "asap"], answer: 1, explain: "Air membeku menjadi ais." },
        { q: "Tumbuhan menghasilkan makanan melalui proses?", options: ["respirasi", "fotosintesis", "pencernaan", "perkumuhan"], answer: 1, explain: "Tumbuhan guna cahaya matahari dalam fotosintesis." },
        { q: "Berapakah bilangan kaki seekor labah-labah?", options: ["4", "6", "8", "10"], answer: 2, explain: "Labah-labah mempunyai 8 kaki." },
        { q: "Organ yang memompa darah ke seluruh badan ialah?", options: ["paru-paru", "jantung", "hati", "ginjal"], answer: 1, explain: "Jantung memompa darah ke seluruh badan." },
        { q: "Sumber cahaya semula jadi pada waktu siang ialah?", options: ["Bulan", "Matahari", "lampu", "bintang"], answer: 1, explain: "Matahari ialah sumber cahaya semula jadi." },
        { q: "Tumbuhan menyerap air dari tanah melalui?", options: ["daun", "akar", "bunga", "buah"], answer: 1, explain: "Air diserap melalui akar." },
        { q: "Air mendidih pada suhu kira-kira berapa darjah Celsius?", options: ["50", "80", "100", "120"], answer: 2, explain: "Air mendidih pada kira-kira 100°C." }
      ]
    },

    /* ================= ENGLISH (10 soalan) ================= */
    {
      id: "english",
      title: "English",
      icon: "🔤",
      summary: "Vocabulary, grammar and plurals — basic English.",
      notes: [
        "English menguji perbendaharaan kata (vocabulary), tatabahasa (grammar) dan bentuk jamak (plural).",
        "Ingat kata jamak tak sekata: child → children, mouse → mice.",
        "Padankan kata kerja dengan subjek: she goes, they are."
      ],
      questions: [
        { q: "The opposite of \"hot\" is ___", options: ["cold", "warm", "big", "fast"], answer: 0, explain: "The opposite of hot is cold." },
        { q: "She ___ to school every day.", options: ["go", "goes", "going", "gone"], answer: 1, explain: "Dengan \"she\", kita guna goes." },
        { q: "The plural of \"child\" is ___", options: ["childs", "childes", "children", "childrens"], answer: 2, explain: "Jamak tak sekata: children." },
        { q: "A baby dog is called a ___", options: ["kitten", "puppy", "cub", "calf"], answer: 1, explain: "Anak anjing dipanggil puppy." },
        { q: "Which one is a colour?", options: ["apple", "blue", "table", "run"], answer: 1, explain: "Blue ialah sejenis warna." },
        { q: "The opposite of \"big\" is ___", options: ["small", "tall", "long", "wide"], answer: 0, explain: "The opposite of big is small." },
        { q: "They ___ playing football now.", options: ["is", "am", "are", "be"], answer: 2, explain: "Dengan \"they\", kita guna are." },
        { q: "The plural of \"mouse\" (the animal) is ___", options: ["mouses", "mice", "mouse", "mices"], answer: 1, explain: "Jamak tak sekata: mice." },
        { q: "Which one is an animal?", options: ["chair", "tiger", "spoon", "river"], answer: 1, explain: "A tiger is an animal." },
        { q: "\"I have two ___.\" Choose the correct word.", options: ["cat", "cats", "cates", "catz"], answer: 1, explain: "Lebih daripada satu = cats." }
      ]
    },

    /* ================= MATEMATIK (5 soalan) ================= */
    {
      id: "matematik",
      title: "Matematik",
      icon: "➗",
      summary: "Operasi asas, nombor genap dan pecahan mudah.",
      notes: [
        "Matematik menguji operasi asas: tambah, tolak, darab dan bahagi.",
        "Nombor genap boleh dibahagi dengan 2 tanpa baki.",
        "Untuk pecahan: ½ bermaksud separuh (bahagi dengan 2)."
      ],
      questions: [
        { q: "7 + 5 = ?", options: ["10", "11", "12", "13"], answer: 2, explain: "Tujuh tambah lima jadi 12." },
        { q: "Berapakah hasil 9 × 3?", options: ["18", "24", "27", "29"], answer: 2, explain: "9 didarab 3 ialah 27." },
        { q: "100 − 45 = ?", options: ["45", "55", "60", "65"], answer: 1, explain: "100 tolak 45 tinggal 55." },
        { q: "Yang manakah nombor genap?", options: ["7", "13", "18", "21"], answer: 2, explain: "Nombor genap boleh dibahagi 2. 18 ÷ 2 = 9." },
        { q: "½ daripada 20 ialah?", options: ["5", "10", "15", "40"], answer: 1, explain: "Separuh daripada 20 ialah 10." }
      ]
    }
  ]
};

// Dedahkan data secara global untuk app.js
window.PKSK_DATA = PKSK_DATA;
