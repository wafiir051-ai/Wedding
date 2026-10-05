# Undangan Agus & Sinta

Website statis (HTML/CSS/JS) + database **Supabase**. Tidak perlu `npm install`.

## 1. Siapkan database (sekali saja)
1. Supabase Dashboard → **SQL Editor** → tempel isi `supabase/schema.sql` → **Run**.
2. **Authentication → Users → Add user** (email + password admin, centang Auto Confirm).
3. **Authentication → Sign In / Providers** → matikan *Allow new users to sign up*.
4. Jalankan di SQL Editor (ganti email):
   `insert into public.admins (user_id) select id from auth.users where email = 'EMAIL_ADMIN';`

## 2. Isi data undangan
Edit `public/js/site-config.js` (nama lengkap, orang tua, Instagram, rekening hadiah, titik peta).
Field kosong otomatis disembunyikan.

## 3. Jalankan / deploy
- Lokal: `npm start` → http://localhost:3000 (admin: `/admin`)
- Produksi: upload folder `public/` ke hosting statis (Netlify, Vercel, Cloudflare Pages, GitHub Pages).

## Cara pakai
- Admin login di `/admin` → tab **Daftar Tamu & Link**: tempel nama tamu (satu per baris), lalu
  "Salin pesan" / "WhatsApp" untuk kirim undangan personal (`/?to=Nama&c=KODE`).
- Link umum tanpa kode (`/?to=Nama`) juga bisa; RSVP-nya masuk sebagai tamu umum.
