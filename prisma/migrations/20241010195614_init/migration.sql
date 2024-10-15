/*
  Warnings:

  - A unique constraint covering the columns `[fileId]` on the table `DownloadLink` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "DownloadLink" ADD COLUMN     "fileId" INTEGER;

-- CreateTable
CREATE TABLE "FileInfo" (
    "id" SERIAL NOT NULL,
    "name" TEXT,
    "size" INTEGER,
    "md5" TEXT,
    "sha1" TEXT,
    "sha256" TEXT,
    "sha512" TEXT,
    "mime" TEXT,
    "ext" TEXT,
    "path" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FileInfo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DownloadLink_fileId_key" ON "DownloadLink"("fileId");

-- AddForeignKey
ALTER TABLE "DownloadLink" ADD CONSTRAINT "DownloadLink_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "FileInfo"("id") ON DELETE SET NULL ON UPDATE CASCADE;
