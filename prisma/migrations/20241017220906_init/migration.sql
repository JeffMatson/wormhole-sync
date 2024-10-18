/*
  Warnings:

  - Made the column `uuid` on table `DownloadLink` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "DownloadLink" ALTER COLUMN "uuid" SET NOT NULL;

-- AlterTable
ALTER TABLE "FileInfo" ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;
