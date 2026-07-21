/**
 * server.js — Menjalankan aplikasi secara lokal (`npm start`)
 * =====================================================================
 * Di Vercel, file ini TIDAK dipakai — Vercel langsung menjalankan
 * `api/index.js` sebagai serverless function (lihat vercel.json).
 * File ini hanya pembungkus tipis supaya kamu tetap bisa menjalankan
 * `npm start` di komputer sendiri untuk development/testing.
 */

const app = require("./api/index.js");
const CONFIG = require("./lib/config");

const PORT = CONFIG.PORT || 3000;
app.listen(PORT, () => {
  console.log(`FALZ TopUp server berjalan di http://localhost:${PORT}`);
  console.log(`Panel admin: http://localhost:${PORT}/admin.html`);
  console.log(
    CONFIG.isGithubStoreConfigured()
      ? "[store] Menyimpan data ke GitHub repo (ghp_token terdeteksi)."
      : "[store] Menyimpan data ke file lokal data/db.json (ghp_token belum diisi)."
  );
});
