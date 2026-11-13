-- CreateEnum
CREATE TYPE "Role" AS ENUM ('SISWA', 'SUPERADMIN', 'GURU');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "nama" TEXT NOT NULL,
    "nis" TEXT NOT NULL,
    "kelas" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'SISWA',

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_nis_key" ON "User"("nis");
