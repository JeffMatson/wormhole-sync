/*
  Warnings:

  - The primary key for the `DotOrgPluginStats` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `pluginId` on the `DotOrgPluginStats` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[id]` on the table `DotOrgPluginStats` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "DotOrgPluginStats" DROP CONSTRAINT "DotOrgPluginStats_pluginId_fkey";

-- DropIndex
DROP INDEX "DotOrgPluginStats_pluginId_key";

-- AlterTable
ALTER TABLE "DotOrgPluginStats" DROP CONSTRAINT "DotOrgPluginStats_pkey",
DROP COLUMN "pluginId";

-- CreateIndex
CREATE UNIQUE INDEX "DotOrgPluginStats_id_key" ON "DotOrgPluginStats"("id");

-- AddForeignKey
ALTER TABLE "DotOrgPluginStats" ADD CONSTRAINT "DotOrgPluginStats_id_fkey" FOREIGN KEY ("id") REFERENCES "Plugin"("id") ON DELETE CASCADE ON UPDATE CASCADE;
