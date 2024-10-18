-- DropIndex
DROP INDEX "DotOrgPluginStats_id_key";

-- AlterTable
ALTER TABLE "DotOrgPluginStats" ADD CONSTRAINT "DotOrgPluginStats_pkey" PRIMARY KEY ("id");
