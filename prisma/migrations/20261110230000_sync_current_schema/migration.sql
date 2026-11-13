-- The earlier migration created a legacy "User" table and a different Role
-- enum. Keep that data intact while introducing the tables required by the
-- current Prisma schema.
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_type t
        JOIN pg_enum e ON e.enumtypid = t.oid
        WHERE t.typname = 'Role' AND e.enumlabel = 'SUPER_ADMIN'
    ) THEN
        IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'Role') THEN
            ALTER TYPE "Role" RENAME TO "Role_legacy";
        END IF;
        CREATE TYPE "Role" AS ENUM ('SUPER_ADMIN', 'ADMIN', 'GURU', 'SISWA');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'Jurusan') THEN
        CREATE TYPE "Jurusan" AS ENUM ('RPL', 'TKJ', 'MM');
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS "users" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

CREATE TABLE IF NOT EXISTS "guru" (
    "id" SERIAL NOT NULL,
    "namalengkap" TEXT NOT NULL,
    "nip" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "jurusan" "Jurusan" NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'GURU',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "guru_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "guru_nip_key" ON "guru"("nip");

CREATE TABLE IF NOT EXISTS "siswa" (
    "id" SERIAL NOT NULL,
    "nama" TEXT NOT NULL,
    "nis" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "kelas" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'SISWA',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "siswa_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "siswa_nis_key" ON "siswa"("nis");
