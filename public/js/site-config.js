// ============================================================
//  DATA UNDANGAN — edit di sini, lalu simpan & refresh.
//  Field yang dikosongkan ('') otomatis disembunyikan di website.
// ============================================================
window.SITE = {
  supabase: {
    url: 'https://djhvxpxxudswhwtkeivx.supabase.co',
    // anon key memang publik; keamanan data dijaga RLS (lihat supabase/schema.sql)
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRqaHZ4cHh4dWRzd2h3dGtlaXZ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTExNzcyODYsImV4cCI6MjEwNjc1MzI4Nn0.rVPRWb84p25amD3kf4_d3MwTS5M7QQLc1ookC0k0sMw',
  },
  groom: {
    nickname: 'Agus',
    fullName: 'Agus Kurniawan',        // TODO: isi nama lengkap + gelar
    parents: '',               // contoh: 'Putra dari Bapak ... dan Ibu ...'
    instagram: '',             // contoh: 'https://instagram.com/username'
    whatsapp: '',              // contoh: '62812xxxxxxx'
    photo: 'img/groom.jpg',
  },
  bride: {
    nickname: 'Sinta',
    fullName: 'Sinta Juliani',
    parents: '',               // contoh: 'Putri dari Bapak ... dan Ibu ...'
    instagram: '',
    whatsapp: '',
    photo: 'img/bride.jpg',
  },
  event: {
    title: 'Pernikahan',
    date: '2026-11-19',        // YYYY-MM-DD
    start: '08:00',
    end: '12:00',
    timezone: '+07:00',        // WIB
    timezoneLabel: 'WIB',
    venue: 'Lingkungan Ciloa RT 02/RW 03',
    address: 'Lingkungan Ciloa RT 02/RW 03, Desa Sukajaya, Kabupaten Sumedang Selatan',
    // Kata kunci untuk peta Google Maps. Ganti dengan titik yang lebih akurat
    // (mis. "-6.xxxx,107.xxxx") kalau sudah ada koordinatnya.
    mapQuery: 'Lingkungan Ciloa RT 02/RW 03, Desa Sukajaya, Sumedang Selatan, Sumedang',
  },
  // Kirim hadiah / amplop digital. Kosong = section disembunyikan.
  // Contoh: { type: 'BRI', name: 'Nama Pemilik', number: '1234567890' }
  gifts: [
    { type: 'BNI', name: 'Agus Kurniawan', number: '2107365956' },   // TODO: pastikan bank Agus
    { type: 'BNI', name: 'Sinta Juliani', number: '2083931631' },
  ],
  // Awal mula bertemu (timeline). Kosongkan ([]) = bagian disembunyikan.
  // TODO: ganti semua teks CONTOH. Entri berawalan CONTOH tidak tampil di website live.
  story: [
    { date: 'CONTOH: bulan dan tahun', title: 'Pertama Bertemu', text: 'CONTOH: tulis di mana dan bagaimana Agus dan Sinta pertama kali bertemu.' },
    { date: 'CONTOH: bulan dan tahun', title: 'Mulai Dekat', text: 'CONTOH: tulis momen ketika mereka mulai dekat.' },
    { date: 'CONTOH: bulan dan tahun', title: 'Lamaran', text: 'CONTOH: tulis cerita lamaran atau keputusan menikah.' },
  ],
  giftAddress: '',             // alamat kirim kado (opsional)
  music: { src: 'audio/pernikahan-kita.mp3', title: 'Pernikahan Kita — Tiara Andini & Arsy Widianto' },
  // Template pesan WhatsApp untuk tombol "Salin pesan" di panel admin.
  // {nama} = nama tamu, {link} = link undangan personal.
  shareMessage:
`Assalamualaikum.

Yth. Bapak/Ibu/Saudara/i
{nama}
Di Tempat
-----------
Dengan segala kerendahan hati, kami mengundang Bapak/Ibu/Saudara/i dan teman-teman untuk menghadiri acara,
===========
The Wedding Of
Agus & Sinta
===========
Pada: Pernikahan
🗓 Tanggal: 19-11-2026
🕛 Pukul: 08:00 - 12:00
📍 Lokasi: Lingkungan Ciloa RT 02/RW 03, Desa Sukajaya, Kabupaten Sumedang Selatan

Link undangan bisa diakses lengkap di:
{link}

Merupakan suatu kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan untuk hadir di acara kami.
Mohon maaf perihal undangan hanya dibagikan melalui pesan ini.
Terima kasih banyak atas perhatiannya.

Note:
Untuk mendapatkan hasil yang bagus, harap buka melalui Google Chrome terbaru dan matikan mode gelap dari HP.

Wa'alaikumussalam 🙏`,
};
