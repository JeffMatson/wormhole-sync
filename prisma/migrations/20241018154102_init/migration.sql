/*
  Warnings:

  - The primary key for the `FileInfo` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `uuid` on the `FileInfo` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[id]` on the table `FileInfo` will be added. If there are existing duplicate values, this will fail.
  - The required column `id` was added to the `FileInfo` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- DropIndex
DROP INDEX "FileInfo_uuid_key";

-- AlterTable
ALTER TABLE "FileInfo" DROP CONSTRAINT "FileInfo_pkey",
DROP COLUMN "uuid",
ADD COLUMN     "id" TEXT NOT NULL,
ADD CONSTRAINT "FileInfo_pkey" PRIMARY KEY ("id");

-- CreateIndex
CREATE UNIQUE INDEX "FileInfo_id_key" ON "FileInfo"("id");
