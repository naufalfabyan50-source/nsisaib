# FALZ TopUp — Website Top Up Diamond Free Fire (Siap Deploy ke Vercel)

Website top up dengan backend Node.js/Express yang **siap dipakai jualan**:
- Notifikasi **real-time ke Telegram** setiap ada orderan baru DAN setiap
  buyer sedang memproses/verifikasi pembayaran (lengkap dengan foto bukti).
- Buyer bisa **upload foto bukti pembayaran** lalu menekan tombol
  **"Verifikasi Pesanan"** — otomatis diteruskan ke bot Telegram admin,
  lengkap dengan tombol **✅ Verifikasi** / **❌ Tolak** yang langsung
  mengubah status transaksi tanpa perlu buka panel admin.
- Data (produk, transaksi, pengaturan, log) disimpan **permanen di repo
  GitHub** lewat GitHub API — cocok untuk Vercel, karena filesystem Vercel
  bersifat sementara/read-only saat runtime.

## Struktur File
```
api/index.js        -> Seluruh REST API (dipakai Vercel sebagai serverless function)
server.js            -> Menjalankan api/index.js secara lokal (npm start)
lib/config.js         -> Loader konfigurasi (Environment Variable / config.json)
lib/store.js          -> Penyimpanan data: GitHub Contents API (production) / file lokal (dev)
lib/telegram.js        -> Helper Telegram Bot API (kirim pesan, foto, webhook, tombol)
data/seed.json         -> Data awal (produk & pengaturan default)
config.json.example    -> Contoh config untuk development lokal (copy jadi config.json)
vercel.json            -> Routing Vercel (static public/ + serverless api/)
public/
  index.html            -> Halaman utama (katalog, form order, pembayaran, upload bukti)
  admin.html            -> Panel admin
  app.js                -> Logic halaman utama
  admin.js               -> Logic panel admin
  config.js               -> Jembatan ke REST API (aman dilihat publik, tanpa rahasia)
  style.css
```

## Konfigurasi yang Perlu Diisi

| Key                | Fungsi                                                                 |
|---------------------|--------------------------------------------------------------------------|
| `telegram_token`    | Token bot dari @BotFather — untuk kirim notifikasi & tombol verifikasi   |
| `telegram_id`       | Chat ID tujuan notifikasi (akun/grup admin)                              |
| `ghp_token`         | GitHub Personal Access Token — supaya data tersimpan permanen di repo    |
| `qris_jpg`          | URL gambar QRIS (atau path seperti `/qris.jpg` jika taruh di `public/`)  |

Opsional: `admin_username`, `admin_password`, `ghp_owner`, `ghp_repo`,
`ghp_branch`, `email_user`, `email_app_password`, `email_notify_to`,
`site_url`.

### 1. Membuat Bot Telegram
1. Chat **@BotFather** di Telegram → kirim `/newbot` → ikuti instruksinya → salin **token** yang diberikan → itu nilai `telegram_token`.
2. Untuk **chat id**: chat bot kamu (atau tambahkan ke grup), kirim 1 pesan apa saja, lalu buka di browser:
   `https://api.telegram.org/bot<TOKEN>/getUpdates` — cari nilai `"chat":{"id": ...}` → itu nilai `telegram_id`.

### 2. Membuat GitHub Personal Access Token (`ghp_token`)
1. Buka GitHub → **Settings → Developer settings → Personal access tokens → Fine-grained tokens** (atau classic token).
2. Beri akses **Contents: Read and write** khusus ke repo project ini.
3. Salin token (diawali `ghp_...` atau `github_pat_...`) → itu nilai `ghp_token`.
4. `ghp_owner` & `ghp_repo` **TIDAK PERLU diisi manual** kalau project sudah terhubung ke GitHub lewat Vercel — otomatis terdeteksi. Isi manual hanya jika dijalankan di luar Vercel.

### 3. Gambar QRIS (`qris_jpg`)
Pilih salah satu:
- Upload gambar QRIS ke hosting gambar (imgur, dsb) → isi `qris_jpg` dengan URL-nya.
- Atau taruh file `qris.jpg` di folder `public/` (commit ke repo) → isi `qris_jpg` dengan `/qris.jpg`.

## Deploy ke Vercel (lewat GitHub)
1. Push seluruh folder project ini ke sebuah repository GitHub (config.json
   **tidak perlu** ikut di-push — sudah masuk `.gitignore`).
2. Buka [vercel.com](https://vercel.com) → **Add New Project** → pilih repo GitHub tadi → Import.
3. Sebelum klik Deploy, buka **Environment Variables** dan tambahkan:
   - `TELEGRAM_TOKEN` = token bot Telegram
   - `TELEGRAM_ID` = chat id tujuan notifikasi
   - `GHP_TOKEN` = GitHub Personal Access Token
   - `QRIS_JPG` = URL/path gambar QRIS
   - `ADMIN_USERNAME` & `ADMIN_PASSWORD` = ganti dari default `admin`/`admin123`
4. Klik **Deploy**. Setelah selesai, situs bisa diakses di `https://nama-project.vercel.app`.
5. **Aktifkan webhook Telegram** (wajib, sekali saja): login ke `/admin.html` →
   menu **Pengaturan** → bagian **Webhook Telegram** → klik **Aktifkan Webhook Telegram**.
   Setelah ini, tombol ✅/❌ di pesan Telegram akan berfungsi otomatis.
6. Login ke panel admin → menu **Pengaturan** → klik **Kirim Test Notifikasi** untuk memastikan Telegram sudah tersambung.

## Menjalankan di Komputer Sendiri (opsional, untuk development)
```bash
cp config.json.example config.json
# lalu isi telegram_token, telegram_id, ghp_token, qris_jpg di config.json
npm install
npm start
```
Situs jalan di `http://localhost:3000`, panel admin di `http://localhost:3000/admin.html`.
Kalau `ghp_token` belum diisi, data otomatis disimpan ke file lokal `data/db.json` (tidak permanen di Vercel, tapi cukup untuk uji coba di laptop).

> Webhook Telegram (`/api/telegram-webhook`) butuh URL publik (HTTPS), jadi
> tombol ✅/❌ hanya bisa diuji setelah situs sudah online (bukan saat
> `localhost`). Gunakan tombol **Test Notifikasi** untuk uji kirim pesan saat development lokal.

## Alur Verifikasi Pembayaran
1. Buyer checkout → dapat kode transaksi & QRIS → status **Menunggu Pembayaran**.
   Admin langsung dapat notifikasi Telegram "Orderan Baru".
2. Setelah transfer, buyer **upload foto bukti** di halaman pembayaran lalu
   menekan **"Verifikasi Pesanan"** → status berubah jadi **Menunggu
   Verifikasi Admin**, dan admin langsung menerima notifikasi Telegram
   berisi **foto bukti + detail order + tombol ✅ Verifikasi / ❌ Tolak**.
3. Admin tinggal menekan tombol di Telegram:
   - **✅ Verifikasi** → status otomatis jadi **Berhasil**, halaman buyer ikut ter-update otomatis (polling tiap 4 detik).
   - **❌ Tolak** → status kembali ke **Menunggu Pembayaran**, buyer diminta upload ulang bukti yang benar.
4. Semua perubahan status juga tetap bisa dilakukan manual lewat panel admin (`/admin.html` → Kelola Transaksi).

## Catatan Keamanan & Keterbatasan
- `config.json` hanya untuk development lokal — **jangan pernah** di-commit berisi kredensial asli (sudah ada di `.gitignore`).
- Di production (Vercel), semua rahasia **wajib** lewat Environment Variables, bukan file.
- Penyimpanan data via GitHub Contents API cocok untuk skala toko kecil–menengah (tiap perubahan = 1 commit). Untuk trafik sangat tinggi/paralel, pertimbangkan database sungguhan (mis. Postgres/Redis).
- **Verifikasi pembayaran QRIS sepenuhnya otomatis** (cek mutasi bank/e-wallet real-time) tetap memerlukan integrasi payment gateway resmi (mis. Midtrans/Xendit) — alur di project ini adalah verifikasi **semi-otomatis**: buyer upload bukti → admin tinggal 1x tap tombol di Telegram untuk approve/reject.
- **Pengiriman Diamond ke akun Free Fire** memerlukan API resmi Garena/reseller yang tidak bisa disambungkan tanpa kredensial & izin resmi dari pihak terkait.
