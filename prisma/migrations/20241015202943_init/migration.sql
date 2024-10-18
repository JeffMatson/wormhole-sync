/*
  Warnings:

  - A unique constraint covering the columns `[url]` on the table `DownloadLink` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "DownloadLink_url_key" ON "DownloadLink"("url");
