import { Prisma, Source } from "@prisma/client";
import prismaClient from "./client";
import CLI from "../cli";
import type { Plugin } from "../types/plugin";
import { isPrismaError } from "~/utils/db";
import type { Uuid } from "~/types/util";

export async function syncPluginEssentials(slug: string, source: Source) {
  const result = await prismaClient.plugin.upsert({
    select: {
      id: true,
      slug: true,
      source: true,
    },
    where: {
      source_slug: {
        source: source,
        slug: slug,
      },
    },
    create: {
      source: source,
      slug: slug,
    },
    update: {},
  });

  return result;
}

export async function getPluginId(args: { slug: string; source: Source }) {
  const { slug, source } = args;

  if (slug && source) {
    try {
      const plugin = await prismaClient.plugin.findUnique({
        where: {
          source_slug: {
            slug,
            source,
          },
        },
        select: {
          id: true,
        },
      });

      return plugin?.id;
    } catch (error) {
      CLI.log(["debug"], new Error(`Failed to get plugin ID: ${slug}`));
      throw error;
    }
  }

  if (slug) {
    try {
      const plugin = await prismaClient.plugin.findFirst({
        where: {
          slug,
        },
        select: {
          id: true,
        },
      });

      return plugin?.id;
    } catch (error) {
      CLI.log(["debug"], new Error(`Failed to get plugin ID: ${slug}`));
      throw error;
    }
  }
}

export async function getPlugin(id: Uuid, include?: Prisma.PluginInclude) {
  const plugin = await prismaClient.plugin.findFirst({
    include,
    where: {
      id,
    },
  });

  return plugin;
}

export async function updatePluginAuthor(id: Uuid, author: Plugin["author"]) {
  const updatedAuthor = await prismaClient.plugin.update({
    where: {
      id,
    },
    select: {
      author: true,
    },
    data: {
      author: {
        connectOrCreate: {
          where: {
            dotOrgProfileUrl: author.profiles.dotOrg,
          },
          create: {
            name: author.name,
            dotOrgProfileUrl: author.profiles.dotOrg,
          },
        },
      },
    },
  });

  return updatedAuthor;
}

export async function updatePluginTestedVersion(id: Uuid, tested?: string) {
  return prismaClient.plugin.update({
    where: {
      id,
    },
    data: {
      tested,
    },
  });
}

export async function updatePluginCurrentVersion(
  pluginId: Uuid,
  version: string
) {
  return prismaClient.plugin.update({
    where: {
      id: pluginId,
    },
    data: {
      version: version,
    },
  });
}

export async function createVersion(
  pluginId: Uuid,
  versionInfo: { version: string; source: Source },
  downloadLinks: { url: string; source: Source; id: Uuid }[]
) {
  try {
    const created = await prismaClient.pluginVersion.upsert({
      where: {
        pluginId_version: {
          pluginId: pluginId,
          version: versionInfo.version,
        },
      },
      create: {
        pluginId: pluginId,
        version: versionInfo.version,
        downloadLinks: {
          connectOrCreate: downloadLinks.map((link) => ({
            where: {
              id: link.id,
            },
            create: {
              url: link.url,
              source: link.source,
              id: link.id,
              fileInfo: {
                create: {},
              },
            },
          })),
        },
      },
      update: {
        downloadLinks: {
          connectOrCreate: downloadLinks.map((link) => ({
            where: {
              id: link.id,
            },
            create: {
              url: link.url,
              source: link.source,
              id: link.id,
              fileInfo: {
                create: {},
              },
            },
          })),
        },
      },
    });
    return created;
  } catch (error) {
    if (isPrismaError(error)) {
      // Unique constraint error
      if (error.code === "P2002") {
        CLI.log(["debug"], new Error(error.message));
        CLI.log(["debug"], error);
        return false;
      }
    }
    CLI.log(["debug"], error);
    throw error;
  }
}

export async function updatePluginDescription(
  pluginId: Uuid,
  descriptions: Plugin["descriptions"]
) {
  return prismaClient.plugin.update({
    where: {
      id: pluginId,
    },
    data: {
      description: {
        upsert: {
          create: {
            short: descriptions.short,
            full: descriptions.full,
          },
          update: {
            short: descriptions.short,
            full: descriptions.full,
          },
        },
      },
    },
  });
}

export async function createPluginTag(
  pluginId: Uuid,
  tag: { slug: string; name: string }
) {
  return prismaClient.plugin.update({
    where: {
      id: pluginId,
    },
    data: {
      tags: {
        connectOrCreate: {
          where: {
            slug: tag.slug,
          },
          create: {
            slug: tag.slug,
            name: tag.name,
          },
        },
      },
    },
  });
}

export async function disconnectPluginTag(pluginId: Uuid, tag: string) {
  return prismaClient.plugin.update({
    where: {
      id: pluginId,
    },
    data: {
      tags: {
        disconnect: {
          slug: tag,
        },
      },
    },
  });
}

export async function updatePluginName(id: Uuid, name: string) {
  return prismaClient.plugin.update({
    where: {
      id,
    },
    data: {
      name,
    },
  });
}
