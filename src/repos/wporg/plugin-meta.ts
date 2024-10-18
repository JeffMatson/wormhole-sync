import {
  createPluginTag,
  disconnectPluginTag,
  getPlugin,
  getPluginId,
  syncPluginEssentials,
  updatePluginAuthor,
  updatePluginCurrentVersion,
  updatePluginDescription,
  updatePluginName,
  updatePluginTestedVersion,
} from "../../db/plugin";
import { WormholeSyncConfig } from "~/config";
import CLI from "../../cli";
import type { Plugin, PluginVersionProps } from "../../types/plugin";
import type { Prisma, Source } from "@prisma/client";
import { difference, isEqual } from "es-toolkit";
import {
  updateDotOrgPluginStats,
  upsertDotOrgPluginStats,
} from "~/db/plugin-stats";
import { upsertPluginRequirements } from "~/db/plugin-requirements";
import {
  createPluginBanner,
  createPluginIcon,
  createPluginScreenshot,
  deletePluginBanner,
  deletePluginIcon,
  deletePluginScreenshot,
} from "~/db/plugin-assets";
import { v5 as uuidv5 } from "uuid";
import {
  createPluginVersion,
  deletePluginVersion,
  getPluginVersions,
  updatePluginVersion,
} from "~/db/plugin-version";
import type { Uuid } from "~/types/util";
import { getLinkUuid } from "~/utils";

export async function processPluginMeta(plugin: Plugin) {
  if (!WormholeSyncConfig.syncDb) {
    CLI.log(["info"], `Skipping DB sync for ${plugin.slug}`);
    return;
  }

  plugin.id = await getPluginId({ slug: plugin.slug, source: "DOTORG" });
  if (!plugin.id) {
    CLI.log(["info"], `Creating plugin: ${plugin.slug}`);
    const created = await syncPluginEssentials(
      plugin.slug,
      plugin.source as Source
    );
    plugin.id = created.id;
  }

  CLI.log(["info"], `Updating plugin: ${plugin.slug}`);
  const updated = await syncPluginMeta(plugin);

  return updated;
}

async function syncPluginMeta(plugin: Plugin) {
  const pluginId = plugin.id;
  if (!pluginId) {
    CLI.log(["error"], `Plugin ID is required to sync plugin meta!`);
    throw new Error("Plugin ID is required to sync plugin meta!", {
      cause: plugin,
    });
  }

  const include: Prisma.PluginInclude = {
    author: true,
    requirements: true,
    description: true,
    tags: true,
    versions: true,
    icons: true,
    banners: true,
    screenshots: true,
    dotOrgStats: true,
  };

  const existing = (await getPlugin(
    pluginId,
    include
  )) as Prisma.PluginGetPayload<{
    include: typeof include;
  }> | null;

  if (!existing) {
    throw new Error(`Plugin not found: ${pluginId}`);
  }

  const synced = {
    author: syncAuthor(plugin, existing.author),
    name: syncName(plugin, existing.name),
    requirements: syncRequirements(plugin, existing.requirements),
    tested: syncTestedVersion(plugin, existing),
    versions: syncVersions(plugin),
    description: syncDescriptions(plugin, existing.description),
    tags: syncTags(plugin, existing.tags),
    stats: syncStats(plugin),
    icons: syncIcons(plugin, existing.icons),
    screenshots: syncScreenshots(plugin, existing.screenshots),
    banners: syncBanners(plugin, existing.banners),
    version: syncCurrentVersion(plugin, plugin.version),
  };

  return await Promise.all(Object.values(synced));
}

async function syncName(
  plugin: Plugin,
  existing: Prisma.PluginGetPayload<Prisma.PluginDefaultArgs>["name"]
) {
  const pluginId = plugin.id;
  if (!pluginId) {
    throw new Error("Plugin ID is required to sync name");
  }

  if (plugin.name === existing) {
    CLI.log(["info"], "Name is already in sync! Skipping...");
    return Promise.resolve(true);
  }

  CLI.log(["info"], "Name changes detected. Updating...");
  return updatePluginName(pluginId, plugin.name);
}

async function syncBanners(
  plugin: Plugin,
  existing:
    | Prisma.PluginBannerGetPayload<Prisma.PluginBannerDefaultArgs>[]
    | null
) {
  const pluginId = plugin.id;
  if (!pluginId) {
    throw new Error("Plugin ID is required to sync banners");
  }

  const newBanners = plugin.assets.banners.map((banner) => {
    return {
      slug: banner.slug,
      source: "DOTORG",
      url: banner.sources.dotOrg,
    };
  });
  const existingBanners =
    existing?.map((banner) => {
      return {
        slug: banner.slug,
        source: banner.source,
        url: banner.url,
      };
    }) || [];

  if (isEqual(newBanners, existingBanners)) {
    CLI.log(["info"], "Banners are already in sync! Skipping...");
    return Promise.resolve(true);
  }
  const toCreate = difference(newBanners, existingBanners);
  const toDelete = difference(existingBanners, newBanners);

  const updated: any = [];

  if (toCreate.length) {
    CLI.log(["info"], "New banners found! Creating banners...");
    for (const banner of toCreate) {
      const created = await createPluginBanner(pluginId, banner);
      updated.push(created);
    }
  }

  if (toDelete.length) {
    CLI.log(["info"], "Old banners found! Removing banners...");
    for (const banner of toDelete) {
      const bannerId = existing?.find((b) => b.slug === banner.slug)?.id;
      if (!bannerId) {
        continue;
      }

      const removed = await deletePluginBanner(bannerId);
      updated.push(removed);
    }
  }

  return updated;
}

async function syncScreenshots(
  plugin: Plugin,
  existing:
    | Prisma.PluginScreenshotGetPayload<Prisma.PluginScreenshotDefaultArgs>[]
    | null
) {
  const pluginId = plugin.id;
  if (!pluginId) {
    throw new Error("Plugin ID is required to sync screenshots");
  }

  const newScreenshots = plugin.assets.screenshots.map((screenshot) => {
    return {
      slug: screenshot.slug,
      source: "DOTORG",
      url: screenshot.sources.dotOrg,
      caption: screenshot.caption,
    };
  });
  const existingScreenshots =
    existing?.map((screenshot) => {
      return {
        slug: screenshot.slug,
        source: screenshot.source,
        url: screenshot.url,
        caption: screenshot.caption ?? undefined,
      };
    }) || [];

  if (isEqual(newScreenshots, existingScreenshots)) {
    CLI.log(["info"], "Screenshots are already in sync! Skipping...");
    return Promise.resolve(true);
  }

  const toCreate = newScreenshots.filter((screenshot) => {
    return !existingScreenshots.find((s) => s.slug === screenshot.slug);
  });

  const toDelete = existingScreenshots.filter((screenshot) => {
    return !newScreenshots.find((s) => s.slug === screenshot.slug);
  });

  const updated: any[] = [];
  if (toCreate.length) {
    CLI.log(["info"], "New screenshots found! Creating screenshots...");
    for (const screenshot of toCreate) {
      const created = await createPluginScreenshot(pluginId, screenshot);
      updated.push(created);
    }
  }

  if (toDelete.length) {
    CLI.log(["info"], "Old screenshots found! Removing screenshots...");
    for (const screenshot of toDelete) {
      const screenshotId = existing?.find(
        (s) => s.slug === screenshot.slug
      )?.id;
      if (!screenshotId) {
        continue;
      }

      const removed = await deletePluginScreenshot(screenshotId);
      updated.push(removed);
    }
  }

  return updated;
}

async function syncIcons(
  plugin: Plugin,
  existing: Prisma.PluginIconGetPayload<Prisma.PluginIconDefaultArgs>[] | null
) {
  const pluginId = plugin.id;
  if (!pluginId) {
    throw new Error("Plugin ID is required to sync icons");
  }

  const newIcons = plugin.assets.icons.map((icon) => {
    return {
      slug: icon.slug,
      source: "DOTORG",
      url: icon.sources.dotOrg,
    };
  });
  const existingIcons =
    existing?.map((icon) => {
      return {
        slug: icon.slug,
        source: icon.source,
        url: icon.url,
      };
    }) || [];

  const toCreate = difference(newIcons, existingIcons);
  const toDelete = difference(existingIcons, newIcons);

  if (!toCreate.length && !toDelete.length) {
    CLI.log(["info"], "Icons are already in sync! Skipping...");
    return null;
  }

  const updated = [];

  if (toCreate.length) {
    CLI.log(["info"], "New icons found! Creating icons...");
    for (const icon of toCreate) {
      const created = await createPluginIcon(pluginId, icon);
      updated.push(created);
    }
  }

  if (toDelete.length) {
    CLI.log(["info"], "Old icons found! Removing icons...");
    for (const icon of toDelete) {
      const iconId = existing?.find((i) => i.slug === icon.slug)?.id;
      if (!iconId) {
        continue;
      }

      const removed = await deletePluginIcon(iconId);
      updated.push(removed);
    }
  }

  return updated;
}

async function syncStats(plugin: Plugin) {
  const pluginId = plugin.id;
  if (!pluginId) {
    throw new Error("Plugin ID is required to sync stats");
  }

  // Since stats are likely to change more often, we'll always update them.
  // Maybe skip in the future if there's a lot of inactive plugins causing unnecessary writes.
  // Just mapping to DB fields for now.
  const stats = {
    added: plugin.stats.dotOrg.added,
    updated: plugin.stats.dotOrg.lastUpdated,
    activeInstalls: plugin.stats.dotOrg.activeInstalls,
    downloads: plugin.stats.dotOrg.downloads,
    rating: plugin.ratings.dotOrg.rating,
    ratingCount: plugin.ratings.dotOrg.count,
    ratingStars1: plugin.ratings.dotOrg.ratings["1"],
    ratingStars2: plugin.ratings.dotOrg.ratings["2"],
    ratingStars3: plugin.ratings.dotOrg.ratings["3"],
    ratingStars4: plugin.ratings.dotOrg.ratings["4"],
    ratingStars5: plugin.ratings.dotOrg.ratings["5"],
    supportThreads: plugin.support.dotOrg.threads.total,
    supportThreadsResolved: plugin.support.dotOrg.threads.resolved,
  };

  CLI.log(["info"], "Updating stats from WordPress.org...");
  return await upsertDotOrgPluginStats(pluginId, stats);
}

async function syncTags(
  plugin: Plugin,
  existing: Prisma.TagGetPayload<Prisma.TagDefaultArgs>[] | null
) {
  const pluginId = plugin.id;
  if (!pluginId) {
    throw new Error("Plugin ID is required to sync tags");
  }

  const newTags = plugin.tags;
  const existingTags = existing || [];

  if (isEqual(newTags, existingTags)) {
    CLI.log(["info"], "Tags are already in sync! Skipping...");
    return Promise.resolve(true);
  }

  const toCreate = difference(newTags, existingTags);
  const toDelete = difference(existingTags, newTags);

  const updated: any[] = [];

  if (toCreate.length) {
    CLI.log(["info"], "New tags found! Creating tags...");
    for (const tag of toCreate) {
      const created = await createPluginTag(pluginId, tag);
      updated.push(created);
    }
  }

  if (toDelete.length) {
    CLI.log(["info"], "Old tags found! Removing tags...");
    for (const tag of toDelete) {
      const removed = await disconnectPluginTag(pluginId, tag.slug);
      updated.push(removed);
    }
  }

  return updated;
}

async function syncDescriptions(
  plugin: Plugin,
  existing: Prisma.PluginDescriptionGetPayload<Prisma.PluginDescriptionDefaultArgs> | null
) {
  const pluginId = plugin.id;
  if (!pluginId) {
    throw new Error("Plugin ID is required to sync description");
  }

  const isCurrent = isEqual(
    { full: plugin.descriptions.full, short: plugin.descriptions.short },
    { full: existing?.full, short: existing?.short }
  );

  if (!isCurrent) {
    CLI.log(["info"], "Description changes detected. Updating...");
    return updatePluginDescription(pluginId, plugin.descriptions);
  }

  return null;
}

async function getExistingVersions(pluginId: Uuid) {
  try {
    const found = await getPluginVersions(pluginId, {
      include: {
        downloadLinks: {
          where: {
            source: "DOTORG",
          },
        },
      },
    });

    const parsed: Record<string, PluginVersionProps> = {};
    for (const version of found) {
      if (!version.downloadLinks?.length) {
        continue;
      }

      for (const link of version.downloadLinks) {
        parsed[version.version] = {
          url: link.url,
          source: link.source,
          id: link.id ? link.id : undefined,
        };
      }
    }

    return parsed;
  } catch (error) {
    CLI.log(["debug"], error);
    return {};
  }
}

function getIncomingVersions(plugin: Plugin) {
  const incoming: Record<string, Required<PluginVersionProps>> = {};
  for (const version in plugin.versions) {
    const sources = plugin.versions[version];
    for (const source of sources) {
      incoming[version] = {
        ...source,
        id: source.id ?? uuidv5(source.url, uuidv5.URL),
      };
    }
  }

  return incoming;
}

function diffVersions(
  existing: Record<string, PluginVersionProps>,
  incoming: Record<string, Required<PluginVersionProps>>
) {
  const toCreate: Record<string, PluginVersionProps> = {};
  const toDelete: Record<string, PluginVersionProps> = {};
  const toUpdate: Record<string, PluginVersionProps> = {};

  for (const version in incoming) {
    if (!existing[version]) {
      toCreate[version] = incoming[version];
    }
  }

  for (const version in existing) {
    if (!incoming[version]) {
      toDelete[version] = existing[version];
    }
  }

  for (const version in incoming) {
    if (existing[version]) {
      const existingVersion = existing[version];
      const incomingVersion = incoming[version];

      for (const key of [
        "url",
        "source",
        "uuid",
      ] as (keyof PluginVersionProps)[]) {
        if (existingVersion[key] !== incomingVersion[key]) {
          toUpdate[version] = incomingVersion;
        }
      }
    }
  }

  return { toCreate, toDelete, toUpdate };
}

async function syncVersions(plugin: Plugin) {
  const pluginId = plugin.id;
  if (!pluginId) {
    throw new Error("Plugin ID is required to sync versions");
  }

  const existing = await getExistingVersions(pluginId);
  const incoming = getIncomingVersions(plugin);

  const { toCreate, toDelete, toUpdate } = diffVersions(existing, incoming);

  if (
    !Object.keys(toCreate).length &&
    !Object.keys(toDelete).length &&
    !Object.keys(toUpdate).length
  ) {
    CLI.log(["info"], "Versions are already in sync! Skipping...");
    return null;
  }

  const synced: any[] = [];

  // Create new versions
  if (Object.keys(toCreate).length) {
    CLI.log(["info"], `New versions found! Creating versions...`);
    for (const version in toCreate) {
      const created = await createPluginVersion(pluginId, version, {
        downloadLinks: [
          {
            source: toCreate[version].source,
            url: toCreate[version].url,
            id: toCreate[version].id ?? getLinkUuid(toCreate[version].url),
          },
        ],
      });

      synced.push(created);
    }
  }

  // Delete old versions if unpublished.
  if (Object.keys(toDelete).length) {
    CLI.log(["info"], `Old versions found! Removing versions...`);
    for (const version in toDelete) {
      const deleted = await deletePluginVersion({
        pluginId: pluginId,
        version: version,
      });
      synced.push(deleted);
    }
  }

  // Update existing versions.
  if (Object.keys(toUpdate).length) {
    CLI.log(["info"], `Version changes detected! Updating versions...`);
    for (const version in toUpdate) {
      const updated = await updatePluginVersion(
        { pluginId, version },
        {
          downloadLinks: {
            connect: {
              id: toUpdate[version].id,
            },
          },
        }
      );

      synced.push(updated);
    }
  }

  return synced;
}

async function syncCurrentVersion(plugin: Plugin, version: string) {
  if (!plugin.id) {
    throw new Error("Plugin ID is required to sync current version");
  }

  return updatePluginCurrentVersion(plugin.id, version);
}

async function syncTestedVersion(
  plugin: Plugin,
  existing: Prisma.PluginGetPayload<Prisma.PluginDefaultArgs> | null
) {
  const pluginId = plugin.id;
  if (!pluginId) {
    throw new Error("Plugin ID is required to sync tested version");
  }

  if (plugin.tested !== existing?.tested) {
    CLI.log(
      ["info"],
      `Tested version does not match! Updating tested version...`
    );
    return updatePluginTestedVersion(pluginId, plugin.tested);
  }

  return null;
}

async function syncRequirements(
  plugin: Plugin,
  existing: Prisma.PluginRequirementsGetPayload<Prisma.PluginRequirementsDefaultArgs> | null
) {
  const pluginId = plugin.id;
  if (!pluginId) {
    throw new Error("Plugin ID is required to sync requirements");
  }

  const existingRequirements = {
    wp: existing?.wpVersion,
    php: existing?.phpVersion,
    plugins: existing?.pluginSlugs,
  };

  const isCurrent = isEqual(existingRequirements, plugin.requirements);
  if (isCurrent) {
    CLI.log(["info"], `Requirements are already in sync! Skipping...`);
    return null;
  }

  CLI.log(
    ["info"],
    `Existing requirements do not match! Updating requirements...`
  );

  return await upsertPluginRequirements(pluginId, plugin.requirements);
}

async function syncAuthor(
  plugin: Plugin,
  existingAuthor: Prisma.AuthorGetPayload<{
    include: { plugins: false };
  }> | null
) {
  const pluginId = plugin.id;
  if (!pluginId) {
    throw new Error("Plugin ID is required to sync author");
  }

  if (plugin.author.profiles.dotOrg !== existingAuthor?.dotOrgProfileUrl) {
    CLI.log(
      ["info"],
      `Existing author profile URL does not match! Updating author...`
    );

    return updatePluginAuthor(pluginId, plugin.author);
  }

  return null;
}
