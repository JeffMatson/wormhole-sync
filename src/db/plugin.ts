import { isString } from "es-toolkit";
import { Prisma, Source } from "@prisma/client";
import prismaClient from "./client";
import CLI from "../cli";
import type { Plugin } from "../types/plugin";

export async function pluginExists(slug: string, source: string = "DOTORG") {
  if (source !== "DOTORG" && source !== "GITHUB") {
    CLI.log(["error"], `Invalid plugin source: ${source}`);
    return false;
  }

  try {
    const plugin = await prismaClient.plugin.findFirst({
      where: {
        slug,
        source,
      },
    });

    return !!plugin;
  } catch (error) {
    CLI.log(["error"], `Failed to check plugin: ${slug}`);
    return false;
  }
}

export async function getDotOrgPluginId(slug: string) {
  try {
    const plugin = await prismaClient.plugin.findFirst({
      where: {
        slug,
        source: "DOTORG",
      },
      select: {
        id: true,
      },
    });

    return plugin?.id;
  } catch (error) {
    CLI.log(["error"], `Failed to get plugin ID: ${slug}`);
    return undefined;
  }
}

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

export async function getPluginId(slug: string, source: string = "DOTORG") {
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
    CLI.log(["error"], `Failed to get plugin ID: ${slug}`);
    return undefined;
  }
}

export async function createPlugin(pluginInfo: Plugin) {
  try {
    const created = await prismaClient.plugin.create({
      data: {
        source: pluginInfo.source,
        slug: pluginInfo.slug,
        name: pluginInfo.name,
        author: {
          connectOrCreate: {
            where: {
              dotOrgProfileUrl: pluginInfo.author.profiles.dotOrg,
            },
            create: {
              name: pluginInfo.author.name,
              dotOrgProfileUrl: pluginInfo.author.profiles.dotOrg,
            },
          },
        },
        requirements: {
          create: {
            wpVersion: pluginInfo.requirements?.wp,
            phpVersion: pluginInfo.requirements?.php,
            pluginSlugs: pluginInfo.requirements?.plugins,
          },
        },
        tested: isString(pluginInfo.tested) ? pluginInfo.tested : undefined,
        description: {
          create: {
            short: pluginInfo.descriptions.short,
            full: pluginInfo.descriptions.full,
          },
        },
        tags: {
          connectOrCreate: pluginInfo.tags.map((tag) => ({
            where: {
              slug: tag.slug,
            },
            create: {
              slug: tag.slug,
              name: tag.name,
            },
          })),
        },
        versions: {
          create: Object.keys(pluginInfo.versions).map((version) => ({
            version: version,
            downloadLinks: {
              create: {
                url: pluginInfo.versions[version],
                source: pluginInfo.source,
              },
            },
          })),
        },
        icons: {
          create: pluginInfo.assets.icons.map((icon) => ({
            source: pluginInfo.source,
            slug: icon.slug,
            url: icon.sources.dotOrg,
          })),
        },
        banners: {
          create: pluginInfo.assets.banners.map((banner) => ({
            source: pluginInfo.source,
            slug: banner.slug,
            url: banner.sources.dotOrg,
          })),
        },
        screenshots: {
          create: pluginInfo.assets.screenshots.map((screenshot) => ({
            source: pluginInfo.source,
            slug: screenshot.slug,
            url: screenshot.sources.dotOrg,
          })),
        },
        dotOrgStats: {
          create: {
            activeInstalls: pluginInfo.stats.dotOrg.activeInstalls,
            updated: pluginInfo.stats.dotOrg.lastUpdated,
            added: pluginInfo.stats.dotOrg.added,
            downloads: pluginInfo.stats.dotOrg.downloads,
            ratingCount: pluginInfo.ratings.dotOrg.count,
            ratingStars1: pluginInfo.ratings.dotOrg.ratings["1"],
            ratingStars2: pluginInfo.ratings.dotOrg.ratings["2"],
            ratingStars3: pluginInfo.ratings.dotOrg.ratings["3"],
            ratingStars4: pluginInfo.ratings.dotOrg.ratings["4"],
            ratingStars5: pluginInfo.ratings.dotOrg.ratings["5"],
            rating: pluginInfo.ratings.dotOrg.rating,
            supportThreads: pluginInfo.support.dotOrg.threads.total,
            supportThreadsResolved: pluginInfo.support.dotOrg.threads.resolved,
          },
        },
      },
    });

    return created;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function getPlugin(id: number, include?: Prisma.PluginInclude) {
  const plugin = await prismaClient.plugin.findFirst({
    include,
    where: {
      id,
    },
  });

  return plugin;
}

export async function updatePluginAuthor(id: number, author: Plugin["author"]) {
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

export async function updatePluginTestedVersion(id: number, tested?: string) {
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
  pluginId: number,
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

export async function getVersionIds(pluginId: number, versionSlugs?: string[]) {
  let where: Prisma.PluginVersionWhereInput = {
    pluginId,
  };

  if (
    versionSlugs &&
    Array.isArray(versionSlugs) &&
    versionSlugs.length === 0
  ) {
    where = {
      pluginId,
      version: {
        in: versionSlugs,
      },
    };
  }

  const found = await prismaClient.pluginVersion.findMany({
    where,
    select: {
      id: true,
    },
  });

  return found.map((v) => v.id);
}

export async function deleteVersion(id: number) {
  return prismaClient.pluginVersion.delete({
    where: {
      id,
    },
  });
}

export async function createVersion(
  pluginId: number,
  props: { version: string; url: string; source: Source }
) {
  const { version, url, source } = props;

  try {
    const created = await prismaClient.pluginVersion.create({
      data: {
        pluginId,
        version,
        downloadLinks: {
          connectOrCreate: {
            where: {
              url,
              source,
            },
            create: {
              url,
              source,
              fileInfo: {
                create: {},
              },
            },
          },
        },
      },
    });
    return created;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function updatePluginDescription(
  pluginId: number,
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
  pluginId: number,
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

export async function disconnectPluginTag(pluginId: number, tag: string) {
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

export async function setPluginTags(
  pluginId: number,
  tags: { slug: string }[]
) {
  return prismaClient.plugin.update({
    where: {
      id: pluginId,
    },
    data: {
      tags: {
        set: tags.map((tag) => ({
          slug: tag.slug,
        })),
      },
    },
  });
}

export async function createPluginScreenshot(
  pluginId: number,
  screenshot: { slug: string; url: string; source: string; caption?: string }
) {
  return prismaClient.plugin.update({
    where: {
      id: pluginId,
    },
    data: {
      screenshots: {
        create: {
          slug: screenshot.slug,
          url: screenshot.url,
          source: screenshot.source as Source,
          caption: screenshot.caption,
        },
      },
    },
  });
}

export async function deletePluginScreenshot(
  pluginId: number,
  screenshotId: number
) {
  console.log(pluginId, screenshotId);
  return prismaClient.plugin.update({
    where: {
      id: pluginId,
    },
    data: {
      screenshots: {
        delete: {
          id: screenshotId,
        },
      },
    },
  });
}

export async function createPluginBanner(
  pluginId: number,
  banner: { slug: string; url: string; source: string }
) {
  return prismaClient.plugin.update({
    where: {
      id: pluginId,
    },
    data: {
      banners: {
        create: {
          slug: banner.slug,
          url: banner.url,
          source: banner.source as Source,
        },
      },
    },
  });
}

export async function deletePluginBanner(pluginId: number, bannerId: number) {
  return prismaClient.plugin.update({
    where: {
      id: pluginId,
    },
    data: {
      banners: {
        delete: {
          id: bannerId,
        },
      },
    },
  });
}

export async function updatePluginName(id: number, name: string) {
  return prismaClient.plugin.update({
    where: {
      id,
    },
    data: {
      name,
    },
  });
}

// async function updatePluginRatings(id: number, ratings: Plugin["ratings"]) {
//   const pluginRatingsUpdated = await prismaClient.plugin.update({
//     where: {
//       id,
//     },
//     data: {
//       ratings: {
//         update: {
//           stars1: ratings["1"],
//           stars2: ratings["2"],
//           stars3: ratings["3"],
//           stars4: ratings["4"],
//           stars5: ratings["5"],
//         },
//       },
//     },
//   });

//   return pluginRatingsUpdated;
// }

async function getPluginAssets(id: number) {
  const assets = await prismaClient.plugin.findFirst({
    where: {
      id: id,
    },
    select: {
      icons: true,
      banners: true,
      screenshots: true,
    },
  });

  if (!assets) {
    return {
      icons: [],
      banners: [],
      screenshots: [],
    };
  }

  if (!assets.icons) {
    assets.icons = [];
  }

  if (!assets.banners) {
    assets.banners = [];
  }

  if (!assets.screenshots) {
    assets.screenshots = [];
  }

  return assets;
}

// async function updatePluginAssets(id: number, pluginInfo: Plugin) {
//   const toCheck = getAssets(pluginInfo);
//   const existingAssets = await getPluginAssets(id);

//   if (existingAssets) {
//     // Check existing icons
//     for (const icon of existingAssets.icons) {
//       const exists = toCheck.icons.find((i) => i.slug === icon.slug);

//       if (!exists) {
//         await prismaClient.pluginIcon.delete({
//           where: {
//             id: icon.id,
//           },
//         });
//       }

//       if (exists && exists.src !== icon.src) {
//         await prismaClient.pluginIcon.update({
//           where: {
//             id: icon.id,
//           },
//           data: {
//             src: icon.src,
//           },
//         });
//       }
//     }

//     // Check existing banners
//     for (const banner of existingAssets.banners) {
//       const exists = toCheck.banners.find((i) => i.slug === banner.slug);

//       if (!exists) {
//         await prismaClient.pluginBanner.delete({
//           where: {
//             id: banner.id,
//           },
//         });
//       }

//       if (exists && exists.src !== banner.src) {
//         await prismaClient.pluginBanner.update({
//           where: {
//             id: banner.id,
//           },
//           data: {
//             src: banner.src,
//           },
//         });
//       }
//     }

//     // Check existing screenshots
//     for (const screenshot of existingAssets.screenshots) {
//       const exists = toCheck.screenshots.find(
//         (i) => i.slug === screenshot.slug
//       );

//       if (!exists) {
//         await prismaClient.pluginScreenshot.delete({
//           where: {
//             id: screenshot.id,
//           },
//         });
//       }

//       if (exists && exists.src !== screenshot.src) {
//         await prismaClient.pluginScreenshot.update({
//           where: {
//             id: screenshot.id,
//           },
//           data: {
//             src: screenshot.src,
//           },
//         });
//       }
//     }
//   }

//   // Create new assets
//   for (const icon of toCheck.icons) {
//     const exists = existingAssets.icons.find((i) => i.slug === icon.slug);

//     if (!exists) {
//       await prismaClient.pluginIcon.create({
//         data: {
//           pluginId: id,
//           src: icon.src,
//           slug: icon.slug,
//         },
//       });
//     }
//   }

//   for (const banner of toCheck.banners) {
//     const exists = existingAssets.banners.find((i) => i.slug === banner.slug);
//     if (!exists && typeof banner.src === "string") {
//       await prismaClient.pluginBanner.create({
//         data: {
//           pluginId: id,
//           src: banner.src,
//           slug: banner.slug,
//         },
//       });
//     }
//   }

//   for (const screenshot of toCheck.screenshots) {
//     const exists = existingAssets.screenshots.find(
//       (i) => i.slug === screenshot.slug
//     );
//     if (!exists) {
//       await prismaClient.pluginScreenshot.create({
//         data: {
//           pluginId: id,
//           src: screenshot.src,
//           slug: screenshot.slug,
//         },
//       });
//     }
//   }

//   return true;
// }

// function getAssets(plugin: PluginInfo) {
//   const icons = getIcons(plugin.icons);
//   const banners = getBanners(plugin.banners);
//   const screenshots = getScreenshots(plugin.screenshots);

//   return {
//     icons,
//     banners,
//     screenshots,
//   };
// }

// export async function updatePlugin(pluginInfo: Plugin) {
//   const synced: any = {
//     plugin: null,
//     tags: null,
//     ratings: null,
//     assets: null,
//   };

//   synced.plugin = await prismaClient.plugin.update({
//     where: {
//       slug: pluginInfo.slug,
//     },
//     include: {
//       tags: true,
//       ratings: true,
//     },
//     data: {
//       slug: pluginInfo.slug,
//       name: pluginInfo.name,
//       version: pluginInfo.version,
//       author: pluginInfo.author,
//       authorProfile: pluginInfo.author_profile,
//       requires: pluginInfo.requires,
//       tested: pluginInfo.tested,
//       requiresPHP: pluginInfo.requires_php,
//       requiresPlugins: pluginInfo.requires_plugins,
//       numRatings: pluginInfo.num_ratings,
//       supportThreads: pluginInfo.support_threads,
//       supportThreadsResolved: pluginInfo.support_threads_resolved,
//       activeInstalls: pluginInfo.active_installs,
//       downloaded: pluginInfo.downloaded,
//       lastUpdated: pluginInfo.last_updated,
//       added: pluginInfo.added,
//       homepage: pluginInfo.homepage,
//       shortDescription: pluginInfo.short_description,
//       description: pluginInfo.description,
//       downloadLink: pluginInfo.download_link,
//       rating: pluginInfo.rating,
//     },
//   });

//   const pluginId = await getPluginId(pluginInfo.slug);

//   if (pluginId === undefined) {
//     throw new Error("Plugin not found");
//   }

//   if (pluginInfo.tags && !Array.isArray(pluginInfo.tags)) {
//     const foundTags = getTags(pluginInfo.tags);
//     if (foundTags) {
//       synced.tags = await updatePluginTags(pluginId, foundTags);
//     }
//   }

//   if (pluginInfo.ratings) {
//     synced.ratings = await updatePluginRatings(pluginId, pluginInfo.ratings);
//   }

//   if (config.syncAssets) {
//     synced.assets = await updatePluginAssets(pluginId, pluginInfo);
//   }

//   return synced;
// }

export async function deletePlugin(id: number) {
  const plugin = await prismaClient.plugin.delete({
    where: {
      id,
    },
  });

  return plugin;
}

export async function getPlugins() {
  const plugins = await prismaClient.plugin.findMany();

  return plugins;
}

export async function getPluginIdBySlugAndSource(slug: string, source: Source) {
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
}
