ALTER TABLE "pengajuan_magang"
    ADD COLUMN "guruPembimbingId" INTEGER;

UPDATE "pengajuan_magang" AS pengajuan
SET "guruPembimbingId" = pembimbing."guruId"
FROM (
    SELECT DISTINCT ON ("pengajuanId") "pengajuanId", "guruId"
    FROM "guru_pembimbing_pengajuan"
    ORDER BY "pengajuanId", "createdAt", "guruId"
) AS pembimbing
WHERE pengajuan."id" = pembimbing."pengajuanId";

DROP TABLE "guru_pembimbing_pengajuan";

CREATE INDEX "pengajuan_magang_guruPembimbingId_idx"
    ON "pengajuan_magang"("guruPembimbingId");

ALTER TABLE "pengajuan_magang"
    ADD CONSTRAINT "pengajuan_magang_guruPembimbingId_fkey"
    FOREIGN KEY ("guruPembimbingId") REFERENCES "guru"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;
