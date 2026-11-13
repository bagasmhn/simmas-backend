CREATE TABLE "guru_pembimbing_pengajuan" (
    "pengajuanId" INTEGER NOT NULL,
    "guruId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "guru_pembimbing_pengajuan_pkey" PRIMARY KEY ("pengajuanId", "guruId")
);

CREATE INDEX "guru_pembimbing_pengajuan_guruId_idx"
    ON "guru_pembimbing_pengajuan"("guruId");

ALTER TABLE "guru_pembimbing_pengajuan"
    ADD CONSTRAINT "guru_pembimbing_pengajuan_pengajuanId_fkey"
    FOREIGN KEY ("pengajuanId") REFERENCES "pengajuan_magang"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "guru_pembimbing_pengajuan"
    ADD CONSTRAINT "guru_pembimbing_pengajuan_guruId_fkey"
    FOREIGN KEY ("guruId") REFERENCES "guru"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
