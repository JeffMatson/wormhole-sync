/*
  Warnings:

  - Made the column `uuid` on table `FileInfo` required. This step will fail if there are existing NULL values in that column.
  - Made the column `uuid` on table `Plugin` required. This step will fail if there are existing NULL values in that column.
  - Made the column `uuid` on table `PluginBanner` required. This step will fail if there are existing NULL values in that column.
  - Made the column `uuid` on table `PluginIcon` required. This step will fail if there are existing NULL values in that column.
  - Made the column `uuid` on table `PluginScreenshot` required. This step will fail if there are existing NULL values in that column.
  - Made the column `uuid` on table `PluginVersion` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "FileInfo" ALTER COLUMN "uuid" SET NOT NULL;

-- AlterTable
ALTER TABLE "Plugin" ALTER COLUMN "uuid" SET NOT NULL;

-- AlterTable
ALTER TABLE "PluginBanner" ALTER COLUMN "uuid" SET NOT NULL;

-- AlterTable
ALTER TABLE "PluginIcon" ALTER COLUMN "uuid" SET NOT NULL;

-- AlterTable
ALTER TABLE "PluginScreenshot" ALTER COLUMN "uuid" SET NOT NULL;

-- AlterTable
ALTER TABLE "PluginVersion" ALTER COLUMN "uuid" SET NOT NULL;
