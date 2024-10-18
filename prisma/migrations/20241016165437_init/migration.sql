/*
  Warnings:

  - A unique constraint covering the columns `[uuid]` on the table `DownloadLink` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[uuid]` on the table `FileInfo` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[uuid]` on the table `Plugin` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[uuid]` on the table `PluginBanner` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[uuid]` on the table `PluginIcon` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[uuid]` on the table `PluginScreenshot` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[uuid]` on the table `PluginVersion` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "DownloadLink" ADD COLUMN     "uuid" TEXT;

-- AlterTable
ALTER TABLE "FileInfo" ADD COLUMN     "uuid" TEXT;

-- AlterTable
ALTER TABLE "Plugin" ADD COLUMN     "uuid" TEXT;

-- AlterTable
ALTER TABLE "PluginBanner" ADD COLUMN     "uuid" TEXT;

-- AlterTable
ALTER TABLE "PluginIcon" ADD COLUMN     "uuid" TEXT;

-- AlterTable
ALTER TABLE "PluginScreenshot" ADD COLUMN     "uuid" TEXT;

-- AlterTable
ALTER TABLE "PluginVersion" ADD COLUMN     "uuid" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "DownloadLink_uuid_key" ON "DownloadLink"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "FileInfo_uuid_key" ON "FileInfo"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "Plugin_uuid_key" ON "Plugin"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "PluginBanner_uuid_key" ON "PluginBanner"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "PluginIcon_uuid_key" ON "PluginIcon"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "PluginScreenshot_uuid_key" ON "PluginScreenshot"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "PluginVersion_uuid_key" ON "PluginVersion"("uuid");
