-- Tambah nilai enum baru untuk status siswa
-- ALTER TYPE ADD VALUE harus berdiri sendiri (tidak bisa dipakai dalam transaksi yang sama)
ALTER TYPE "Status" ADD VALUE IF NOT EXISTS 'BELUM_MAGANG';
ALTER TYPE "Status" ADD VALUE IF NOT EXISTS 'SEDANG_MAGANG';
ALTER TYPE "Status" ADD VALUE IF NOT EXISTS 'LULUS';
