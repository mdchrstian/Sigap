# Panduan Deploy Sigap

Panduan ini membawa Sigap online langkah demi langkah.

- Database dan foto: Supabase
- Backend: Render (paket gratis)
- Frontend: Vercel

Jangan pernah menempel password atau kunci asli ke GitHub. Tanda `<...>` di bawah berarti: ganti dengan nilai milik Anda.

## 1. Push repo ke GitHub

Repo ini belum punya remote. Kita buat dulu.

1. Buka https://github.com/new.
2. Isi nama repo, misalnya `sigap`. Pilih Private atau Public. Klik **Create repository**.
3. Salin URL repo, misalnya `https://github.com/<username>/sigap.git`.
4. Di terminal, dari folder proyek, jalankan:

```bash
git remote add origin https://github.com/<username>/sigap.git
git push -u origin main
```

## 2. Supabase (database dan foto)

1. Buka https://supabase.com, login, klik **New project**. Simpan database password Anda.
2. Tunggu proyek selesai dibuat. Catat **Project ref** (potongan acak di URL dashboard).

### 2a. Connection string database

1. Klik tombol **Connect** di bagian atas dashboard.
2. Pilih **Session pooler** (port `5432`).
3. Salin URL-nya. Bentuknya:
   `postgresql://postgres.<ref>:<password>@aws-0-<region>.pooler.supabase.com:5432/postgres`
4. Ganti `[YOUR-PASSWORD]` dengan password database Anda.
5. Tambahkan di akhir: `?sslmode=require`.

Hasil akhir, simpan sebagai **DATABASE_URL**:

```
postgresql://postgres.<ref>:<password>@aws-0-<region>.pooler.supabase.com:5432/postgres?sslmode=require
```

### 2b. Bucket foto

1. Menu **Storage** -> **New bucket**.
2. Nama: `report-images`.
3. Aktifkan **Public bucket**. Klik **Create**.

### 2c. Kunci S3

1. Menu **Storage** -> **Settings** -> **S3 Connection**.
2. Salin **Endpoint** (contoh: `https://<ref>.supabase.co/storage/v1/s3`) dan **Region** (contoh: `ap-southeast-1`).
3. Klik **New access key**. Salin **Access key ID** dan **Secret access key**. Secret hanya tampil sekali.
4. URL publik foto adalah:
   `https://<ref>.supabase.co/storage/v1/object/public/report-images`

## 3. Migrasi pertama dari laptop

Langkah ini membuat tabel dan data demo di Supabase. Ekstensi `postgis` dan `vector` dibuat otomatis oleh migrasi.

```bash
backend/scripts/setup_env.sh --database-url '<DATABASE_URL dari langkah 2a>' --seed
```

Tunggu sampai selesai tanpa error.

## 4. Render (backend)

1. Buka https://render.com, login dengan GitHub.
2. Klik **New** -> **Blueprint**.
3. Pilih repo `sigap`. Render membaca file `render.yaml`.
4. Isi semua variabel yang diminta (tabel di bawah). Klik **Apply**.
5. Tunggu build selesai. Catat URL backend, misalnya `https://sigap-backend.onrender.com`.

| Variabel | Dari mana | Contoh |
|----------|-----------|--------|
| `DATABASE_URL` | Langkah 2a | `postgresql://postgres.<ref>:<password>@aws-0-<region>.pooler.supabase.com:5432/postgres?sslmode=require` |
| `ALLOWED_HOSTS` | Hostname Render (tanpa https). Isi sementara `sigap-backend.onrender.com`, cek lagi di langkah 6 | `sigap-backend.onrender.com` |
| `CORS_ALLOWED_ORIGINS` | URL Vercel. Isi sementara `https://example.com`, ganti di langkah 6 | `https://sigap.vercel.app` |
| `CSRF_TRUSTED_ORIGINS` | URL Vercel, sama seperti di atas | `https://sigap.vercel.app` |
| `SUPABASE_S3_ENDPOINT` | Langkah 2c | `https://<ref>.supabase.co/storage/v1/s3` |
| `SUPABASE_S3_REGION` | Langkah 2c | `ap-southeast-1` |
| `SUPABASE_S3_ACCESS_KEY` | Langkah 2c | `<access-key-id>` |
| `SUPABASE_S3_SECRET_KEY` | Langkah 2c | `<secret-access-key>` |
| `SUPABASE_BUCKET` | Nama bucket langkah 2b | `report-images` |
| `SUPABASE_PUBLIC_URL` | Langkah 2c, poin 4 | `https://<ref>.supabase.co/storage/v1/object/public/report-images` |
| `NUSAROUTER_API_KEY` | Dashboard NusaRouter Anda | `<nusarouter-api-key>` |
| `NUSAROUTER_BASE_URL` | Dokumentasi NusaRouter | `<url-api-nusarouter>` |
| `NUSAROUTER_VISION_MODEL` | Nama model gambar di NusaRouter | `<nama-model-vision>` |
| `NUSAROUTER_TEXT_MODEL` | Nama model teks di NusaRouter | `<nama-model-teks>` |

Fitur AI memakai NusaRouter dan butuh ticket 21 sudah di-merge ke repo.

Catatan paket gratis: server Render tidur setelah lama tidak dipakai. Permintaan pertama bisa makan waktu sekitar 1 menit. Ini normal.

## 5. Vercel (frontend)

1. Buka https://vercel.com, login dengan GitHub.
2. Klik **Add New** -> **Project**, lalu **Import** repo `sigap`.
3. Di **Root Directory**, klik **Edit** dan pilih `frontend`.
4. Buka **Environment Variables**. Tambahkan:
   - Name: `VITE_API_URL`
   - Value: URL Render dari langkah 4, misalnya `https://sigap-backend.onrender.com`
5. Klik **Deploy**. Catat URL Vercel, misalnya `https://sigap.vercel.app`.

## 6. Kembali ke Render

1. Buka service `sigap-backend` -> **Environment**.
2. Set `CORS_ALLOWED_ORIGINS` = URL Vercel (contoh `https://sigap.vercel.app`, tanpa garis miring di akhir).
3. Set `CSRF_TRUSTED_ORIGINS` = URL Vercel yang sama.
4. Set `ALLOWED_HOSTS` = hostname Render (contoh `sigap-backend.onrender.com`).
5. Klik **Save changes**. Lalu **Manual Deploy** -> **Deploy latest commit**.

## 7. Cek hasilnya

1. Buka `<URL Render>/api/health`. Harus tampil status OK.
2. Buka URL Vercel. Halaman login harus muncul.
3. Login dengan akun demo. Password-nya adalah nilai `DEMO_PASSWORD` (lihat `backend/.env.example`).
4. Buat laporan baru dan unggah satu foto. Foto harus tampil setelah disimpan.

## 8. Troubleshooting

| Gejala | Penyebab umum | Solusi |
|--------|---------------|--------|
| Error CORS di browser | `CORS_ALLOWED_ORIGINS` salah atau belum diisi | Isi dengan URL Vercel persis (https, tanpa `/` di akhir). Deploy ulang. |
| `400 Bad Request` | `ALLOWED_HOSTS` tidak cocok dengan hostname Render | Isi dengan hostname Render saja, tanpa `https://`. Deploy ulang. |
| Error koneksi database | Bukan Session pooler, port bukan `5432`, atau tanpa `sslmode` | Pakai Session pooler, port `5432`, dan akhiri URL dengan `?sslmode=require`. Cek password. |
| Foto tidak tampil | Bucket tidak public, atau `SUPABASE_PUBLIC_URL` salah | Jadikan bucket `report-images` public. Cek `SUPABASE_PUBLIC_URL` sesuai langkah 2c. |
| AI mengembalikan 503 | Variabel `NUSAROUTER_*` kosong, atau ticket 21 belum di-merge | Isi semua `NUSAROUTER_*` dan pastikan ticket 21 sudah ada di branch yang di-deploy. |
| Login gagal dengan error CSRF | `CSRF_TRUSTED_ORIGINS` salah | Isi dengan URL Vercel. Deploy ulang. |
