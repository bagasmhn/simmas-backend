CREATE TABLE IF NOT EXISTS "dudi" (
    "id" SERIAL NOT NULL,
    "nama_perusahaan" TEXT NOT NULL,
    "alamat" TEXT NOT NULL,
    "bidang_usaha" TEXT NOT NULL,
    "kuota_peserta" BOOLEAN NOT NULL,
    "penanggung_jawab" TEXT NOT NULL,
    "kontak" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "dudi_pkey" PRIMARY KEY ("id")
);
