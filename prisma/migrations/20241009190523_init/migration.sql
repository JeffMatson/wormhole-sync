-- CreateEnum
CREATE TYPE "Source" AS ENUM ('GITHUB', 'DOTORG', 'CUSTOM', 'UNKNOWN');

-- CreateTable
CREATE TABLE "Plugin" (
    "id" SERIAL NOT NULL,
    "source" "Source" NOT NULL DEFAULT 'UNKNOWN',
    "slug" TEXT NOT NULL,
    "name" TEXT,
    "authorId" INTEGER,
    "authorProfile" TEXT,
    "tested" TEXT,
    "homepage" TEXT,
    "donateLink" TEXT,
    "version" TEXT,

    CONSTRAINT "Plugin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PluginRequirements" (
    "id" SERIAL NOT NULL,
    "pluginId" INTEGER NOT NULL,
    "pluginSlugs" TEXT[],
    "phpVersion" TEXT,
    "wpVersion" TEXT,

    CONSTRAINT "PluginRequirements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PluginDescription" (
    "id" SERIAL NOT NULL,
    "pluginId" INTEGER NOT NULL,
    "full" TEXT,
    "short" TEXT,

    CONSTRAINT "PluginDescription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DotOrgPluginStats" (
    "id" SERIAL NOT NULL,
    "pluginId" INTEGER NOT NULL,
    "added" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updated" TIMESTAMP(3),
    "activeInstalls" INTEGER,
    "downloads" INTEGER,
    "rating" INTEGER,
    "ratingCount" INTEGER,
    "ratingStars1" INTEGER,
    "ratingStars2" INTEGER,
    "ratingStars3" INTEGER,
    "ratingStars4" INTEGER,
    "ratingStars5" INTEGER,
    "supportThreads" INTEGER,
    "supportThreadsResolved" INTEGER,

    CONSTRAINT "DotOrgPluginStats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Author" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "dotOrgProfileUrl" TEXT,

    CONSTRAINT "Author_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tag" (
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("slug")
);

-- CreateTable
CREATE TABLE "PluginVersion" (
    "id" SERIAL NOT NULL,
    "version" TEXT NOT NULL,
    "hash" TEXT,
    "added" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "pluginId" INTEGER NOT NULL,

    CONSTRAINT "PluginVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DownloadLink" (
    "id" SERIAL NOT NULL,
    "versionId" INTEGER NOT NULL,
    "source" "Source" NOT NULL DEFAULT 'UNKNOWN',
    "url" TEXT NOT NULL,

    CONSTRAINT "DownloadLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PluginIcon" (
    "id" SERIAL NOT NULL,
    "pluginId" INTEGER NOT NULL,
    "source" "Source" NOT NULL DEFAULT 'UNKNOWN',
    "slug" TEXT NOT NULL,
    "url" TEXT NOT NULL,

    CONSTRAINT "PluginIcon_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PluginBanner" (
    "id" SERIAL NOT NULL,
    "pluginId" INTEGER NOT NULL,
    "source" "Source" NOT NULL DEFAULT 'UNKNOWN',
    "slug" TEXT NOT NULL,
    "url" TEXT NOT NULL,

    CONSTRAINT "PluginBanner_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PluginScreenshot" (
    "id" SERIAL NOT NULL,
    "pluginId" INTEGER NOT NULL,
    "source" "Source" NOT NULL DEFAULT 'UNKNOWN',
    "url" TEXT NOT NULL,
    "caption" TEXT,
    "slug" TEXT NOT NULL,

    CONSTRAINT "PluginScreenshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_PluginToTag" (
    "A" INTEGER NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Plugin_source_slug_key" ON "Plugin"("source", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "PluginRequirements_pluginId_key" ON "PluginRequirements"("pluginId");

-- CreateIndex
CREATE UNIQUE INDEX "PluginDescription_pluginId_key" ON "PluginDescription"("pluginId");

-- CreateIndex
CREATE UNIQUE INDEX "DotOrgPluginStats_pluginId_key" ON "DotOrgPluginStats"("pluginId");

-- CreateIndex
CREATE UNIQUE INDEX "Author_dotOrgProfileUrl_key" ON "Author"("dotOrgProfileUrl");

-- CreateIndex
CREATE UNIQUE INDEX "Tag_slug_key" ON "Tag"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "_PluginToTag_AB_unique" ON "_PluginToTag"("A", "B");

-- CreateIndex
CREATE INDEX "_PluginToTag_B_index" ON "_PluginToTag"("B");

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
ALTER TABLE "DownloadLink" ADD CONSTRAINT "DownloadLink_versionId_fkey" FOREIGN KEY ("versionId") REFERENCES "PluginVersion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PluginIcon" ADD CONSTRAINT "PluginIcon_pluginId_fkey" FOREIGN KEY ("pluginId") REFERENCES "Plugin"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PluginBanner" ADD CONSTRAINT "PluginBanner_pluginId_fkey" FOREIGN KEY ("pluginId") REFERENCES "Plugin"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PluginScreenshot" ADD CONSTRAINT "PluginScreenshot_pluginId_fkey" FOREIGN KEY ("pluginId") REFERENCES "Plugin"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PluginToTag" ADD CONSTRAINT "_PluginToTag_A_fkey" FOREIGN KEY ("A") REFERENCES "Plugin"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PluginToTag" ADD CONSTRAINT "_PluginToTag_B_fkey" FOREIGN KEY ("B") REFERENCES "Tag"("slug") ON DELETE CASCADE ON UPDATE CASCADE;
