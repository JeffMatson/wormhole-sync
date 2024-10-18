/*
  Warnings:

  - A unique constraint covering the columns `[id]` on the table `Author` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id]` on the table `DotOrgPluginStats` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id]` on the table `DownloadLink` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[uuid]` on the table `FileInfo` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id]` on the table `Plugin` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id]` on the table `PluginBanner` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id]` on the table `PluginDescription` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id]` on the table `PluginIcon` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id]` on the table `PluginRequirements` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id]` on the table `PluginScreenshot` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id]` on the table `PluginVersion` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Author_id_key" ON "Author"("id");

-- CreateIndex
CREATE UNIQUE INDEX "DotOrgPluginStats_id_key" ON "DotOrgPluginStats"("id");

-- CreateIndex
CREATE UNIQUE INDEX "DownloadLink_id_key" ON "DownloadLink"("id");

-- CreateIndex
CREATE UNIQUE INDEX "FileInfo_uuid_key" ON "FileInfo"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "Plugin_id_key" ON "Plugin"("id");

-- CreateIndex
CREATE UNIQUE INDEX "PluginBanner_id_key" ON "PluginBanner"("id");

-- CreateIndex
CREATE UNIQUE INDEX "PluginDescription_id_key" ON "PluginDescription"("id");

-- CreateIndex
CREATE UNIQUE INDEX "PluginIcon_id_key" ON "PluginIcon"("id");

-- CreateIndex
CREATE UNIQUE INDEX "PluginRequirements_id_key" ON "PluginRequirements"("id");

-- CreateIndex
CREATE UNIQUE INDEX "PluginScreenshot_id_key" ON "PluginScreenshot"("id");

-- CreateIndex
CREATE UNIQUE INDEX "PluginVersion_id_key" ON "PluginVersion"("id");
