# Super Agent Hemat Token untuk Claude Code

Implementasi pola router dan worker (DeepSeek super agent) dengan tiga tingkat model:
Opus 5.5 untuk koordinasi, Sonnet 5.5 untuk mengerjakan tiket, Haiku 5.5 untuk pencarian
dan testing. Bagian yang di setup asli memakai LLM tetapi sebenarnya mekanis (watchdog,
merger, board) diganti shell script, jadi biayanya nol token.

## Arsitektur

| Komponen | Model | Effort | Tugas |
|---|---|---|---|
| `router` | Opus 5.5 | medium | Bicara dengan kamu, membagi tiket, membaca `eval-result.md`, memanggil merge |
| `worker` | Sonnet 5.5 | medium | Mengerjakan satu tiket di worktree sendiri |
| `reproducer` | Sonnet 5.5 | medium | Mereproduksi bug, memperbaiki kalau kecil |
| `Explore` | Haiku 5.5 | high | grep, find, mencari simbol (menimpa Explore bawaan) |
| `tester` | Haiku 5.5 | high | Menjalankan cek di `eval.md`, hanya melaporkan yang gagal |
| `watchdog.sh` | tanpa LLM | - | Mendeteksi worker macet atau terlalu lama |
| `merge.sh` | tanpa LLM | - | Merge branch tiket, deteksi konflik |
| `board.sh` | tanpa LLM | - | Baca dan ubah status di `board.md` |

Alur: `/ticket` membuat tiket → kamu tandai `ready` → router membagi ke worker → worker
memanggil tester → router membaca hasil eval → `merge.sh` → tester post-merge (jika UI).

## Instalasi

1. Salin folder `.claude/` ke root proyek (gabungkan dengan `settings.json` yang sudah ada).
2. `chmod +x .claude/scripts/*.sh`
3. Proyek harus repo git, dan router dijalankan dari default branch (worktree dibuat dari
   default branch, jadi tiket harus sudah di-commit ke sana; `board.sh commit` mengurus itu).
4. Opsional untuk tiket UI: pasang `agent-browser` (Vercel). Tanpa itu tester memakai
   Playwright/Cypress proyek, atau menandai cek UI sebagai SKIP.

## Pemakaian

```bash
# 1. Tulis tiket (sekali per batch fitur). Opus dipakai karena kualitas tiket
#    menentukan kualitas semua worker.
claude --model claude-opus-5-5
> /ticket ubah PRD.md menjadi tiket

# 2. Pilih tiket yang mau dikerjakan
.claude/scripts/board.sh set 01 ready
.claude/scripts/board.sh set 02 ready

# 3. Jalankan router di sesi baru
claude --agent router --permission-mode auto
> kerjakan tiket yang ready
```

Router hanya datang ke kamu kalau worker butuh keputusan, tiket gagal dua kali, atau
batch selesai. Setelah `Batch selesai.`, jalankan `/clear`. Semua status ada di `board.md`.

## Strategi hemat token

1. **Router tidak pernah membaca kode.** Konteks Opus paling mahal per token, jadi router
   hanya melihat output `board.sh` (beberapa baris) dan `eval-result.md` (satu tabel).
   Diff, log, dan isi tiket tidak pernah masuk ke konteksnya.
2. **Opus medium, bukan high.** Pekerjaan router adalah dispatch berbasis aturan yang
   sudah ditulis eksplisit di prompt. Effort tinggi hanya menambah token thinking.
3. **Pekerjaan mekanis dijadikan script.** Watchdog di video adalah agent Sonnet yang
   aktif tiap 10 menit; di sini `watchdog.sh` lewat Monitor tidak memakan token sama
   sekali dan baru membangunkan router saat ada anomali. Merger dan board juga script.
4. **Format laporan tetap.** Worker membalas 6 baris, tester maksimal 10 baris, Explore
   maksimal 15 baris. Laporan subagent masuk ke konteks pemanggil, jadi ini batas paling
   efektif untuk mencegah konteks router dan worker membengkak.
5. **Pencarian lebar diserahkan ke Haiku.** Worker boleh grep langsung maksimal 2 kali;
   lebih dari itu memanggil `Explore` (Haiku) dan hanya menerima ringkasan path:line.
   Hasil grep panjang tidak menumpuk di konteks Sonnet.
6. **Testing di Haiku dengan output terpotong.** Tester memotong log dengan `tail`/`grep`
   dan hanya mengembalikan baris FAIL. Worker dilarang menjalankan seluruh test suite.
7. **Perbaikan dikirim ke worker yang sama** lewat SendMessage. Worker lama sudah punya
   konteks tiket dan cache prompt yang masih hangat, jauh lebih murah daripada worker
   baru yang harus membaca ulang semuanya.
8. **Tiket pendek dengan daftar file.** spec.md maksimal 80 baris dengan bagian Touch dan
   Do not touch, sehingga worker tidak perlu menjelajah repo untuk tahu harus mengubah apa.
9. **Mode team lewat kontrak, bukan agent teams.** Agent teams eksperimental membuat
   teammate saling mengirim pesan, dan setiap pesan menambah token di dua konteks.
   Di sini antarmuka ditetapkan dulu di `contract.md`, lalu tiap part bekerja paralel
   tanpa obrolan. Default tetap `solo`.
10. **Batas yang keras.** Maksimal 3 worker paralel, 2 putaran perbaikan per tiket, 3
    kali jalan tester per worker, `maxTurns` di setiap agent, dan `autoCompactWindow`
    100k sampai 150k agar tidak ada agent yang memakai jendela konteks penuh.
11. **Model mahal yang tidak sengaja diblokir.** `settings.json` menolak subagent bawaan
    `general-purpose` dan `Plan` (keduanya mewarisi model sesi, yaitu Opus) dan mengatur
    `CLAUDE_CODE_SUBAGENT_MODEL` ke Sonnet sebagai default.
12. **Agent ringan tanpa CLAUDE.md.** `tester` dan `Explore` memakai `omitClaudeMd: true`,
    jadi CLAUDE.md tidak ikut dimuat di setiap pemanggilan Haiku.
13. **Cache 1 jam untuk router.** Router sering diam lama menunggu worker. Dengan TTL 5
    menit, setiap laporan yang datang setelah jeda membuat seluruh konteks router dibaca
    ulang tanpa cache. `cacheTtl: 1h` mencegah itu.
14. **Sesi pendek.** Setelah satu batch, `/clear`. Router tidak menyimpan state di
    percakapan, jadi konteks bisa dibuang tanpa kehilangan apa pun.

Tambahan di sisi kamu: jaga `CLAUDE.md` proyek tetap pendek (di bawah 50 baris), karena
dimuat oleh setiap worker. Pindahkan dokumentasi panjang ke file terpisah dan rujuk path-nya.

## Perbedaan dengan setup di video

| Video | Versi ini | Alasan |
|---|---|---|
| Router Opus high | Opus medium | Dispatch tidak butuh reasoning dalam |
| Watchdog agent Sonnet | `watchdog.sh` | Nol token |
| Merger dan checker agent | `merge.sh` + tester Haiku post-merge | Merge adalah perintah git |
| Team mode dengan agent teams | Kontrak tetap, part paralel | Tanpa token untuk pesan antar agent |
| Router membuka hasil kerja | Router hanya membaca tabel eval | Konteks Opus tetap kecil |

## Hal yang perlu kamu cek

- Field `effort` pada Haiku: level yang tersedia tergantung model. Jalankan `/tasks` saat
  agent berjalan untuk memastikan model dan effort yang terpakai.
- `experimental.cacheTtl: 1h` diabaikan saat langganan sedang memakai usage credits.
- Pembatasan tools di router sengaja tetap memuat Edit dan Write agar subagent tidak
  kehilangan tool tersebut. Larangan menulis untuk router diatur lewat instruksi.
- Ubah ambang watchdog lewat env: `STALE_MIN` (default 15), `LONG_MIN` (45),
  `INTERVAL` (600 detik).
- Kalau `--permission-mode auto` belum tersedia di akunmu, pakai `acceptEdits`; izin
  untuk ketiga script sudah ada di `settings.json`.
