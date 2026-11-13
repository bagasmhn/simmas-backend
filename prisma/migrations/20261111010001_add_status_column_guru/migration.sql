-- Tambah kolom status ke tabel guru dengan default NONAKTIF
ALTER TABLE "guru"
    ADD COLUMN IF NOT EXISTS "status" "Status" NOT NULL DEFAULT 'NONAKTIF';
