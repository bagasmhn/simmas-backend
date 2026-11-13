-- Tambah kolom email ke tabel guru dan siswa
ALTER TABLE "guru" ADD COLUMN IF NOT EXISTS "email" TEXT;
ALTER TABLE "siswa" ADD COLUMN IF NOT EXISTS "email" TEXT;

-- Generate email sementara untuk data yang sudah ada berdasarkan nama/namalengkap agar tidak null
UPDATE "guru" SET "email" = LOWER(REPLACE(namalengkap, ' ', '')) || '@simmas.sch.id' WHERE "email" IS NULL;
UPDATE "siswa" SET "email" = LOWER(REPLACE(nama, ' ', '')) || '@simmas.sch.id' WHERE "email" IS NULL;

-- Jadikan NOT NULL dan UNIQUE
ALTER TABLE "guru" ALTER COLUMN "email" SET NOT NULL;
ALTER TABLE "siswa" ALTER COLUMN "email" SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS "guru_email_key" ON "guru"("email");
CREATE UNIQUE INDEX IF NOT EXISTS "siswa_email_key" ON "siswa"("email");
