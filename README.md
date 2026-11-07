# Sigap

Sigap adalah platform pelaporan masalah publik untuk Bali. Warga melaporkan masalah (jalan rusak, sampah, lampu mati, dll.) lengkap dengan foto dan lokasi. Petugas memverifikasi dan menindaklanjuti laporan, dan semua pihak dapat memantau statusnya secara terbuka. Dibuat untuk demo Bali DigiFest 2026.

## Stack

- Backend: Django + Django REST Framework, PostgreSQL dengan PostGIS dan pgvector
- Frontend: React + Vite (folder `frontend/`)
- Penyimpanan gambar: Supabase Storage (S3-compatible) atau disk lokal
- AI: OpenAI (atau provider `fake` untuk pengembangan dan tes)
- Paket Python: uv

## Arsitektur

Modular monolith: satu proyek Django dengan aplikasi terpisah per domain.

| App | Tanggung jawab |
|-----|----------------|
| `accounts` | Pengguna, peran (public, officer, admin), autentikasi |
| `reports` | Laporan, kategori, gambar, Master Report |
| `locations` | Validasi wilayah Bali, kabupaten/kota, reverse geocoding |
| `tracking` | Perubahan status dan riwayatnya |
| `duplicates` | Embedding, deteksi dan penautan laporan duplikat |
| `ai_services` | Analisis gambar/teks dan provider AI |
| `community` | Komentar dan dukungan warga |
| `notifications` | Notifikasi pengguna |
| `dashboard` | Statistik dan insight untuk petugas, perintah `seed_demo` |

## Prasyarat

- [uv](https://docs.astral.sh/uv/)
- Node.js (untuk frontend)
- Docker (untuk database lokal/tes)

## Pengaturan Supabase

1. Buat proyek Supabase.
2. Di SQL editor / Database > Extensions, aktifkan ekstensi `postgis` dan `vector`.
3. Di Storage, buat bucket **public** (mis. `sigap`).
4. Di Storage > S3 Connection, buat S3 access key dan secret key.
5. Ambil connection string database dan isi `DATABASE_URL` dengan `?sslmode=require` di akhir, contoh: `postgres://postgres:PASSWORD@db.PROJECT.supabase.co:5432/postgres?sslmode=require`.
6. Set `STORAGE_BACKEND=s3` dan isi variabel `SUPABASE_S3_*`.

## Variabel lingkungan

Salin `backend/.env.example` ke `backend/.env`.

| Variabel | Contoh / default | Keterangan |
|----------|------------------|------------|
| `SECRET_KEY` | `change-me` | Kunci rahasia Django |
| `DEBUG` | `True` | Mode debug |
| `ALLOWED_HOSTS` | `localhost,127.0.0.1` | Host yang diizinkan |
| `DATABASE_URL` | `postgres://sigap:sigap@localhost:54329/sigap` | Koneksi database (pakai `sslmode=require` untuk Supabase) |
| `CORS_ALLOWED_ORIGINS` | `http://localhost:5173` | Origin frontend |
| `STORAGE_BACKEND` | `local` | `local` atau `s3` |
| `SUPABASE_S3_ENDPOINT` | `https://PROJECT.supabase.co/storage/v1/s3` | Endpoint S3 Supabase |
| `SUPABASE_S3_REGION` | `ap-southeast-1` | Region |
| `SUPABASE_S3_ACCESS_KEY` | `dummy-access-key` | Access key S3 |
| `SUPABASE_S3_SECRET_KEY` | `dummy-secret-key` | Secret key S3 |
| `SUPABASE_BUCKET` | `sigap` | Nama bucket publik |
| `AI_PROVIDER` | `fake` | `fake` atau `openai` |
| `OPENAI_API_KEY` | (kosong) | Kunci OpenAI, wajib bila `AI_PROVIDER=openai` |
| `OPENAI_VISION_MODEL` | `gpt-4o-mini` | Model analisis gambar |
| `OPENAI_TEXT_MODEL` | `gpt-4o-mini` | Model teks |
| `OPENAI_EMBEDDING_MODEL` | `text-embedding-3-small` | Model embedding |
| `NOMINATIM_URL` | `https://nominatim.openstreetmap.org` | Reverse geocoding |
| `NOMINATIM_USER_AGENT` | `Sigap/0.1 (...)` | User agent Nominatim |
| `DEMO_PASSWORD` | `SigapDemo2026!` | Password akun demo untuk `seed_demo` |

## Setup .env + migrasi (Supabase)

```bash
backend/scripts/setup_env.sh --database-url 'postgres://postgres.<ref>:<password>@aws-0-<region>.pooler.supabase.com:5432/postgres?sslmode=require' --seed
```

Skrip membuat `backend/.env` dari `.env.example` (dengan `SECRET_KEY` baru), mengisi `DATABASE_URL`, lalu menjalankan `migrate`. Gunakan Session pooler (port 5432) atau koneksi langsung, bukan Transaction pooler (6543).

| Flag | Fungsi |
|------|--------|
| `--database-url URL` | Set/ganti `DATABASE_URL` di `.env` |
| `--seed` | Jalankan `seed_demo` setelah migrasi |
| `--skip-migrate` | Lewati migrasi |
| `--force` | Buat ulang `.env` dari `.env.example` |

`.env` yang sudah ada tidak diubah tanpa `--force`.

## Perintah

```bash
# Database tes/lokal
docker compose -f docker-compose.test.yml up -d --wait

# Backend
cd backend
uv sync
uv run python manage.py migrate
uv run python manage.py seed_demo          # tambah --reset untuk mengisi ulang
uv run python manage.py runserver

# Frontend
cd frontend
npm install
npm run dev

# Tes
cd backend && uv run pytest -q
```

`seed_demo` membuat 4 akun (`warga1@sigap.test`, `warga2@sigap.test`, `petugas@sigap.test`, `admin@sigap.test`) dan 30 laporan. Semua deskripsi diawali "[DATA UJI]" dan gambar berlabel "DATA UJI". `--reset` hanya menghapus pengguna `@sigap.test` beserta datanya.

## Skenario demo

1. Buka aplikasi dan lihat peta laporan publik (data uji dari `seed_demo`).
2. Login sebagai `warga1@sigap.test`.
3. Buat laporan baru: unggah foto.
4. AI menganalisis foto dan menyarankan kategori serta deskripsi; warga mengoreksi dan mengonfirmasi.
5. Pilih lokasi di peta; kabupaten/kota terisi otomatis.
6. Kirim laporan; sistem mengecek kemungkinan duplikat.
7. Lihat detail laporan dan riwayat statusnya.
8. Login sebagai `warga2@sigap.test`, beri komentar atau dukungan pada laporan.
9. Login sebagai `petugas@sigap.test`, buka dasbor petugas.
10. Tinjau laporan, tautkan duplikat ke Master Report.
11. Ubah status: Dalam Peninjauan, Terverifikasi, Dalam Proses, Selesai (dengan catatan).
12. Warga menerima notifikasi; admin (`admin@sigap.test`) melihat statistik dan insight.

## AI yang bertanggung jawab

AI membantu. Warga mengonfirmasi. Petugas memverifikasi. Hasil AI hanya saran dan tidak pernah menjadi keputusan akhir.

## Batasan dan keputusan terbuka

- Deployment belum diputuskan (hosting backend dan frontend).
- Ambang kemiripan duplikat perlu disetel dengan data berlabel; nilai saat ini bersifat perkiraan.
- Belum ada pengaburan wajah atau plat nomor pada foto.
- Seluruh data demo adalah data uji ("[DATA UJI]") dan bukan laporan nyata.
