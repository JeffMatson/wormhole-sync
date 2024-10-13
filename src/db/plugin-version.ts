import { Prisma } from "@prisma/client";
import prismaClient from "./client";

export async function getPluginVersionById(id: number) {
  const pluginVersion = await prismaClient.pluginVersion.findUnique({
    where: {
      id,
    },
  });

  return pluginVersion;
}

export async function getPluginVersionByString(
  pluginId: number,
  version: string,
  include?: Prisma.PluginVersionInclude
) {
  const pluginVersion = await prismaClient.pluginVersion.findUnique({
    include,
    where: {
      pluginId_version: {
        pluginId,
        version,
      },
    },
  });

  return pluginVersion;
}

export async function pluginVersionExists(pluginId: number, version: string) {
  const pluginVersion = await prismaClient.pluginVersion.findUnique({
    where: {
      pluginId_version: {
        pluginId,
        version,
      },
    },
  });

  return pluginVersion;
}

export async function getPluginVersionDownloadLinks(pluginVersionId: number) {
  const downloadLinks = await prismaClient.downloadLink.findMany({
    where: {
      pluginVersionId,
    },
  });

  return downloadLinks;
}

export async function getOrCreatePluginVersion(
  pluginId: number,
  version: string
) {
  const pluginVersion = await prismaClient.pluginVersion.upsert({
    where: {
      pluginId_version: {
        pluginId,
        version,
      },
    },
    update: {},
    create: {
      pluginId,
      version,
    },
  });

  return pluginVersion;
}
