/*
  Warnings:

  - A unique constraint covering the columns `[linkUuid]` on the table `FileInfo` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "DownloadLink" DROP CONSTRAINT "DownloadLink_fileId_fkey";

-- AlterTable
ALTER TABLE "FileInfo" ADD COLUMN     "linkUuid" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "FileInfo_linkUuid_key" ON "FileInfo"("linkUuid");

-- AddForeignKey
ALTER TABLE "FileInfo" ADD CONSTRAINT "FileInfo_linkUuid_fkey" FOREIGN KEY ("linkUuid") REFERENCES "DownloadLink"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;
