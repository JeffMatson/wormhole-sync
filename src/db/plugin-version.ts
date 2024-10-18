import { Prisma, Source } from "@prisma/client";
import prismaClient from "./client";
import CLI from "../cli";
import type { Uuid } from "~/types/util";

type PluginVersionUniqueBy = {
  versionId?: Uuid;
  pluginId?: Uuid;
  version?: string;
} & (
  | { versionId: Uuid }
  | {
      pluginId: Uuid;
      version: string;
    }
);

export async function getPluginVersions(
  pluginId: Uuid,
  args: {
    include?: Prisma.PluginVersionInclude;
    where?: Prisma.PluginVersionWhereInput;
    select?: Prisma.PluginVersionSelect;
  } = {}
) {
  if (!args.include) {
    args.include = {};
  }

  if (!args.where) {
    args.where = {};
  }

  if (!args.where.pluginId) {
    args.where.pluginId = pluginId;
  }

  try {
    const pluginVersions = await prismaClient.pluginVersion.findMany({
      where: args.where,
      include: args.include,
    });

    return pluginVersions;
  } catch (error) {
    CLI.log(["debug"], error);
    throw error;
  }
}

export async function createPluginVersion(
  pluginId: Uuid,
  version: string,
  data?: {
    downloadLinks?: { source: Source; url: string; id: string }[];
  }
) {
  try {
    const pluginVersion = await prismaClient.pluginVersion.create({
      data: {
        plugin: {
          connect: {
            id: pluginId,
          },
        },
        version: version,
        downloadLinks: {
          connectOrCreate: data?.downloadLinks?.map((link) => ({
            where: {
              id: link.id,
            },
            create: {
              source: link.source,
              url: link.url,
              id: link.id,
              fileInfo: {},
            },
          })),
        },
      },
    });

    return pluginVersion;
  } catch (error) {
    CLI.log(["debug"], error);
    throw error;
  }
}

export async function updatePluginVersion(
  args: PluginVersionUniqueBy,
  data: Prisma.PluginVersionUpdateInput
) {
  const { pluginId, versionId, version } = args;
  const errors = [];

  if (versionId) {
    try {
      const pluginVersion = await prismaClient.pluginVersion.update({
        where: {
          id: versionId,
        },
        data,
      });

      return pluginVersion;
    } catch (error) {
      CLI.log(["debug"], error);
      errors.push(error);
    }
  }

  if (pluginId && version) {
    try {
      const pluginVersion = await prismaClient.pluginVersion.update({
        where: {
          pluginId_version: {
            pluginId,
            version,
          },
        },
        data,
      });

      return pluginVersion;
    } catch (error) {
      CLI.log(["debug"], error);
      errors.push(error);
    }
  }

  if (errors.length) {
    throw errors;
  }

  throw new Error("Invalid arguments");
}

export async function deletePluginVersion(args: PluginVersionUniqueBy) {
  const { pluginId, version, versionId } = args;
  const errors = [];

  if (versionId) {
    try {
      const deleted = await prismaClient.pluginVersion.delete({
        where: {
          id: versionId,
        },
      });
      return deleted;
    } catch (error) {
      errors.push(error);
    }
  }

  if (pluginId && version) {
    try {
      const deleted = await prismaClient.pluginVersion.delete({
        where: {
          pluginId_version: {
            pluginId,
            version,
          },
        },
      });
      return deleted;
    } catch (error) {
      errors.push(error);
    }
  }

  if (errors.length) {
    throw errors;
  }

  throw new Error("Invalid arguments");
}
