/*
  Warnings:

  - You are about to drop the column `versionId` on the `DownloadLink` table. All the data in the column will be lost.
  - You are about to drop the column `hash` on the `PluginVersion` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[downloadLinkIds]` on the table `PluginVersion` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[pluginId,version]` on the table `PluginVersion` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "DownloadLink" DROP CONSTRAINT "DownloadLink_versionId_fkey";

-- AlterTable
ALTER TABLE "DownloadLink" DROP COLUMN "versionId",
ADD COLUMN     "pluginVersionId" INTEGER;

-- AlterTable
ALTER TABLE "PluginVersion" DROP COLUMN "hash",
ADD COLUMN     "downloadLinkIds" INTEGER[],
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE UNIQUE INDEX "PluginVersion_downloadLinkIds_key" ON "PluginVersion"("downloadLinkIds");

-- CreateIndex
CREATE UNIQUE INDEX "PluginVersion_pluginId_version_key" ON "PluginVersion"("pluginId", "version");

-- AddForeignKey
ALTER TABLE "DownloadLink" ADD CONSTRAINT "DownloadLink_pluginVersionId_fkey" FOREIGN KEY ("pluginVersionId") REFERENCES "PluginVersion"("id") ON DELETE CASCADE ON UPDATE CASCADE;
