-- Update default kolom status siswa dari MENUNGGU_VALIDASI ke BELUM_MAGANG
-- (nilai BELUM_MAGANG sudah di-commit pada migration sebelumnya)
ALTER TABLE "siswa" ALTER COLUMN "status" SET DEFAULT 'BELUM_MAGANG';
