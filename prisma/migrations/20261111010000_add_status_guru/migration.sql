-- Tambah nilai enum baru NONAKTIF dan AKTIF ke Status
-- Harus di luar transaksi agar bisa langsung dipakai
ALTER TYPE "Status" ADD VALUE IF NOT EXISTS 'NONAKTIF';
ALTER TYPE "Status" ADD VALUE IF NOT EXISTS 'AKTIF';
