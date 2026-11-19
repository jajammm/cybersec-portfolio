# Portofolio Pentester — Panduan untuk Claude Code

Baca dulu `docs/superpowers/specs/2026-11-19-pentest-portfolio-design.md`. Itu adalah desain yang disepakati dengan pemilik di percakapan sebelumnya.

## Ringkas
- Situs portofolio Red Team/pentester untuk melamar kerja sebagai pentester, dibangun dari template **astro-erudite** (https://github.com/jktrn/astro-erudite, Astro + Bun), kode disimpan di GitHub dan dideploy ke **Vercel** (keputusan pemilik 2026-11-19, menggantikan GitHub Pages). Bahasa situs: Inggris.
- **Satu laporan komprehensif** dari laporan lab bootcamp, mengikuti struktur PDF (keputusan pemilik 2026-11-19, menggantikan rencana "dua case study"). Semua **10 temuan dicantumkan berurutan dari Critical ke Moderate** (urutan report card §4.2 PDF; PDF tidak punya Low), dengan kedalaman seragam per temuan: Deskripsi, Severity/CVSS, Evidence, Remediation.
- Subposts: Introduction (exec summary + scope/methodology), Reconnaissance & Scanning, Findings (10 temuan urut severity), Conclusion. **Tidak ada** bagian Post-Exploitation & Privilege Escalation (di PDF §4.3 hanya placeholder kosong).

## Aturan yang tidak boleh dilanggar
1. Jangan pernah commit isi `docs/source/` (laporan asli, teks ekstraksi, screenshot mentah). Pastikan ada di `.gitignore`.
2. **Revisi kebijakan anonimisasi (2026-11-19, keputusan pemilik):** identitas target lab yang sah **boleh ditampilkan** — nama aplikasi (Dibimbing-Shop), host (bimbycart.duckdns.org), IP (188.166.209.84), dan nama bootcamp (Dibimbing). Yang **tetap wajib disamarkan** (izin menguji ≠ izin menyebarkan): kredensial/password, cookie/session ID, PII pelanggan, dan **identitas pihak ketiga** (pemilik repo `.git` yang terekspos, handle committer, email admin). Pakai placeholder `<REDACTED>`/`<SESSION_ID>` untuk yang disamarkan.
3. Hanya konten dari environment lab yang diizinkan. Jangan menambahkan payload untuk sistem nyata.
4. Hapus semua konten contoh dan identitas bawaan template (post demo, penulis, sosial).
5. Sebelum commit, jalankan `bun run check:sensitive`. Scanner sekarang menjaring **hanya Kelompok 2** (kredensial, session, PII, pihak ketiga) via `docs/source/denylist.txt` (tidak di-commit) + pola generik. Host/IP target yang sengaja dipublikasikan ada di allowlist `ALLOW` dalam `scripts/check-sensitive.mjs` (tetap menjaring host/IP LAIN).

## Catatan teknis template
- Konten: `src/content/blog/`, `src/content/authors/`, `src/content/projects/`. Konfigurasi: `src/consts.ts`, `astro.config.ts`, `src/styles/color.css`.
- Frontmatter blog: `title` ≤60 karakter, `description` ≤155 karakter, `date` `YYYY-MM-DD`, `authors` merujuk ID penulis.
- Subposts: file di samping `index.md` pada folder post (hanya satu tingkat). Callout memakai `:::note|tip|warning|caution|important`.
- Template hanya mendukung Markdown (tanpa MDX). Cek README upstream untuk perintah terbaru.
- Vercel melayani di root domain, jadi tidak perlu `base`. `site` di `astro.config.ts` diisi URL Vercel final. Tautan profil sementara memakai placeholder `YOUR-...`.
- Rencana implementasi: `docs/superpowers/plans/2026-11-19-pentest-portfolio.md`.

## Alur kerja
- Mulai dengan rencana implementasi dari desain, minta persetujuan pemilik, lalu bangun bertahap: clone template dan deploy kosong, bersihkan konten contoh, profil dan halaman depan, case study 1, case study 2, lalu sanitasi dan pemeriksaan akhir.
- Tandai setiap keputusan yang diambil sendiri (bahasa, warna, struktur) agar pemilik bisa memeriksa.
