/*
  Warnings:

  - The primary key for the `Author` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `DotOrgPluginStats` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `DownloadLink` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `uuid` on the `DownloadLink` table. All the data in the column will be lost.
  - The primary key for the `FileInfo` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `FileInfo` table. All the data in the column will be lost.
  - You are about to drop the column `linkUuid` on the `FileInfo` table. All the data in the column will be lost.
  - The primary key for the `Plugin` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `uuid` on the `Plugin` table. All the data in the column will be lost.
  - The primary key for the `PluginBanner` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `uuid` on the `PluginBanner` table. All the data in the column will be lost.
  - The primary key for the `PluginDescription` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `PluginIcon` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `uuid` on the `PluginIcon` table. All the data in the column will be lost.
  - The primary key for the `PluginRequirements` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `PluginScreenshot` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `uuid` on the `PluginScreenshot` table. All the data in the column will be lost.
  - The primary key for the `PluginVersion` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `uuid` on the `PluginVersion` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[linkId]` on the table `FileInfo` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "DotOrgPluginStats" DROP CONSTRAINT "DotOrgPluginStats_pluginId_fkey";

-- DropForeignKey
ALTER TABLE "DownloadLink" DROP CONSTRAINT "DownloadLink_pluginVersionId_fkey";

-- DropForeignKey
ALTER TABLE "FileInfo" DROP CONSTRAINT "FileInfo_linkUuid_fkey";

-- DropForeignKey
ALTER TABLE "Plugin" DROP CONSTRAINT "Plugin_authorId_fkey";

-- DropForeignKey
ALTER TABLE "PluginBanner" DROP CONSTRAINT "PluginBanner_pluginId_fkey";

-- DropForeignKey
ALTER TABLE "PluginDescription" DROP CONSTRAINT "PluginDescription_pluginId_fkey";

-- DropForeignKey
ALTER TABLE "PluginIcon" DROP CONSTRAINT "PluginIcon_pluginId_fkey";

-- DropForeignKey
ALTER TABLE "PluginRequirements" DROP CONSTRAINT "PluginRequirements_pluginId_fkey";

-- DropForeignKey
ALTER TABLE "PluginScreenshot" DROP CONSTRAINT "PluginScreenshot_pluginId_fkey";

-- DropForeignKey
ALTER TABLE "PluginVersion" DROP CONSTRAINT "PluginVersion_pluginId_fkey";

-- DropForeignKey
ALTER TABLE "_PluginToTag" DROP CONSTRAINT "_PluginToTag_A_fkey";

-- DropIndex
DROP INDEX "DownloadLink_uuid_key";

-- DropIndex
DROP INDEX "FileInfo_linkUuid_key";

-- DropIndex
DROP INDEX "FileInfo_uuid_key";

-- DropIndex
DROP INDEX "Plugin_uuid_key";

-- DropIndex
DROP INDEX "PluginBanner_uuid_key";

-- DropIndex
DROP INDEX "PluginIcon_uuid_key";

-- DropIndex
DROP INDEX "PluginScreenshot_uuid_key";

-- DropIndex
DROP INDEX "PluginVersion_uuid_key";

-- AlterTable
ALTER TABLE "Author" DROP CONSTRAINT "Author_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Author_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Author_id_seq";

-- AlterTable
ALTER TABLE "DotOrgPluginStats" DROP CONSTRAINT "DotOrgPluginStats_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "pluginId" SET DATA TYPE TEXT,
ADD CONSTRAINT "DotOrgPluginStats_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "DotOrgPluginStats_id_seq";

-- AlterTable
ALTER TABLE "DownloadLink" DROP CONSTRAINT "DownloadLink_pkey",
DROP COLUMN "uuid",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "pluginVersionId" SET DATA TYPE TEXT,
ADD CONSTRAINT "DownloadLink_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "DownloadLink_id_seq";

-- AlterTable
ALTER TABLE "FileInfo" DROP CONSTRAINT "FileInfo_pkey",
DROP COLUMN "id",
DROP COLUMN "linkUuid",
ADD COLUMN     "linkId" TEXT,
ADD CONSTRAINT "FileInfo_pkey" PRIMARY KEY ("uuid");

-- AlterTable
ALTER TABLE "Plugin" DROP CONSTRAINT "Plugin_pkey",
DROP COLUMN "uuid",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "authorId" SET DATA TYPE TEXT,
ADD CONSTRAINT "Plugin_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Plugin_id_seq";

-- AlterTable
ALTER TABLE "PluginBanner" DROP CONSTRAINT "PluginBanner_pkey",
DROP COLUMN "uuid",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "pluginId" SET DATA TYPE TEXT,
ADD CONSTRAINT "PluginBanner_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "PluginBanner_id_seq";

-- AlterTable
ALTER TABLE "PluginDescription" DROP CONSTRAINT "PluginDescription_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "pluginId" SET DATA TYPE TEXT,
ADD CONSTRAINT "PluginDescription_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "PluginDescription_id_seq";

-- AlterTable
ALTER TABLE "PluginIcon" DROP CONSTRAINT "PluginIcon_pkey",
DROP COLUMN "uuid",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "pluginId" SET DATA TYPE TEXT,
ADD CONSTRAINT "PluginIcon_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "PluginIcon_id_seq";

-- AlterTable
ALTER TABLE "PluginRequirements" DROP CONSTRAINT "PluginRequirements_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "pluginId" SET DATA TYPE TEXT,
ADD CONSTRAINT "PluginRequirements_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "PluginRequirements_id_seq";

-- AlterTable
ALTER TABLE "PluginScreenshot" DROP CONSTRAINT "PluginScreenshot_pkey",
DROP COLUMN "uuid",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "pluginId" SET DATA TYPE TEXT,
ADD CONSTRAINT "PluginScreenshot_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "PluginScreenshot_id_seq";

-- AlterTable
ALTER TABLE "PluginVersion" DROP CONSTRAINT "PluginVersion_pkey",
DROP COLUMN "uuid",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "pluginId" SET DATA TYPE TEXT,
ALTER COLUMN "downloadLinkIds" SET DATA TYPE TEXT[],
ADD CONSTRAINT "PluginVersion_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "PluginVersion_id_seq";

-- AlterTable
ALTER TABLE "_PluginToTag" ALTER COLUMN "A" SET DATA TYPE TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "FileInfo_linkId_key" ON "FileInfo"("linkId");

-- AddForeignKey
ALTER TABLE "Plugin" ADD CONSTRAINT "Plugin_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "Author"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PluginRequirements" ADD CONSTRAINT "PluginRequirements_pluginId_fkey" FOREIGN KEY ("pluginId") REFERENCES "Plugin"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PluginDescription" ADD CONSTRAINT "PluginDescription_pluginId_fkey" FOREIGN KEY ("pluginId") REFERENCES "Plugin"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DotOrgPluginStats" ADD CONSTRAINT "DotOrgPluginStats_pluginId_fkey" FOREIGN KEY ("pluginId") REFERENCES "Plugin"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PluginVersion" ADD CONSTRAINT "PluginVersion_pluginId_fkey" FOREIGN KEY ("pluginId") REFERENCES "Plugin"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DownloadLink" ADD CONSTRAINT "DownloadLink_pluginVersionId_fkey" FOREIGN KEY ("pluginVersionId") REFERENCES "PluginVersion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FileInfo" ADD CONSTRAINT "FileInfo_linkId_fkey" FOREIGN KEY ("linkId") REFERENCES "DownloadLink"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PluginIcon" ADD CONSTRAINT "PluginIcon_pluginId_fkey" FOREIGN KEY ("pluginId") REFERENCES "Plugin"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PluginBanner" ADD CONSTRAINT "PluginBanner_pluginId_fkey" FOREIGN KEY ("pluginId") REFERENCES "Plugin"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PluginScreenshot" ADD CONSTRAINT "PluginScreenshot_pluginId_fkey" FOREIGN KEY ("pluginId") REFERENCES "Plugin"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PluginToTag" ADD CONSTRAINT "_PluginToTag_A_fkey" FOREIGN KEY ("A") REFERENCES "Plugin"("id") ON DELETE CASCADE ON UPDATE CASCADE;
