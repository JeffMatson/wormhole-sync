import {
  createPlugin,
  createPluginBanner,
  createPluginIcon,
  createPluginScreenshot,
  createPluginTag,
  createVersion,
  deletePluginBanner,
  deletePluginIcon,
  deletePluginScreenshot,
  deleteVersion,
  disconnectPluginTag,
  getPlugin,
  getPluginId,
  getVersionIds,
  updatePluginAuthor,
  updatePluginCurrentVersion,
  updatePluginDescription,
  updatePluginName,
  updatePluginRequirements,
  updatePluginStats,
  updatePluginTestedVersion,
} from "../../db/plugin";
import config from "../../config";
import CLI from "../../cli";
import type { Plugin } from "../../types/plugin";
import type { Prisma, Source } from "@prisma/client";
import { difference, isEqual } from "es-toolkit";
import { updateDotOrgPluginStats } from "~/db/plugin-stats";

export async function processPluginMeta(plugin: Plugin) {
  if (!config.syncDb) {
    CLI.log(["info"], `Skipping DB sync for ${plugin.slug}`);
    return;
  }

  plugin.id = await getPluginId(plugin.slug, "DOTORG");
  if (!plugin.id) {
    CLI.log(["info"], `Creating plugin: ${plugin.slug}`);
    const created = await createPlugin(plugin);
    return created;
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
    versions: syncVersions(plugin, existing.versions),
    description: syncDescriptions(plugin, existing.description),
    tags: syncTags(plugin, existing.tags),
    stats: syncStats(plugin),
    icons: syncIcons(plugin, existing.icons),
    screenshots: syncScreenshots(plugin, existing.screenshots),
    banners: syncBanners(plugin, existing.banners),
    version: syncCurrentVersion(pluginId, plugin.version),
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
        source: banner.source as Source,
        url: banner.url,
      };
    }) || [];

  if (isEqual(newBanners, existingBanners)) {
    CLI.log(["info"], "Banners are already in sync! Skipping...");
    return Promise.resolve(true);
  }
  const toCreate = difference(newBanners, existingBanners);
  const toDelete = difference(existingBanners, newBanners);

  const updated: Promise<any>[] = [];

  if (toCreate.length) {
    CLI.log(["info"], "New banners found! Creating banners...");
    const created = toCreate.map((banner) => {
      return createPluginBanner(pluginId, banner);
    });

    updated.push(...created);
  }

  if (toDelete.length) {
    CLI.log(["info"], "Old banners found! Removing banners...");
    const removed = toDelete.map((banner) => {
      const bannerId = existing?.find((b) => b.slug === banner.slug)?.id;
      if (!bannerId) {
        return Promise.reject();
      }

      return deletePluginBanner(pluginId, bannerId);
    });

    updated.push(...removed);
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
        source: screenshot.source as Source,
        url: screenshot.url,
        caption: screenshot.caption === null ? undefined : screenshot.caption,
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

  const updated: Promise<any>[] = [];

  if (toCreate.length) {
    CLI.log(["info"], "New screenshots found! Creating screenshots...");
    const created = toCreate.map((screenshot) => {
      return createPluginScreenshot(pluginId, screenshot);
    });

    updated.push(...created);
  }

  if (toDelete.length) {
    CLI.log(["info"], "Old screenshots found! Removing screenshots...");
    const removed = toDelete.map((screenshot) => {
      const screenshotId = existing?.find(
        (s) => s.slug === screenshot.slug
      )?.id;
      if (!screenshotId) {
        return Promise.reject();
      }

      return deletePluginScreenshot(pluginId, screenshotId);
    });

    updated.push(...removed);
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
        source: icon.source as Source,
        url: icon.url,
      };
    }) || [];

  const toCreate = difference(newIcons, existingIcons);
  const toDelete = difference(existingIcons, newIcons);

  if (!toCreate.length && !toDelete.length) {
    CLI.log(["info"], "Icons are already in sync! Skipping...");
    return null;
  }

  const updated: Promise<any>[] = [];

  if (toCreate.length) {
    CLI.log(["info"], "New icons found! Creating icons...");
    const created = toCreate.map((icon) => {
      return createPluginIcon(pluginId, icon);
    });

    updated.push(...created);
  }

  if (toDelete.length) {
    CLI.log(["info"], "Old icons found! Removing icons...");
    const removed = toDelete.map((icon) => {
      const iconId = existing?.find((i) => i.slug === icon.slug)?.id;
      if (!iconId) {
        return Promise.reject();
      }

      return deletePluginIcon(pluginId, iconId);
    });

    updated.push(...removed);
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
  const pluginStats = {
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
  return updateDotOrgPluginStats(pluginId, pluginStats);
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

  const updated: Promise<any>[] = [];

  if (toCreate.length) {
    CLI.log(["info"], "New tags found! Creating tags...");
    const created = toCreate.map((tag) => {
      return createPluginTag(pluginId, tag);
    });

    updated.push(...created);
  }

  if (toDelete.length) {
    CLI.log(["info"], "Old tags found! Removing tags...");
    const removed = toDelete.map((tag) => {
      return disconnectPluginTag(pluginId, tag.slug);
    });

    updated.push(...removed);
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

async function syncVersions(
  plugin: Plugin,
  existingVersions:
    | Prisma.PluginVersionGetPayload<Prisma.PluginVersionDefaultArgs>[]
    | null
) {
  const pluginId = plugin.id;
  if (!pluginId) {
    throw new Error("Plugin ID is required to sync versions");
  }

  const updated: Promise<any>[] = [];

  const existingVersionNames = existingVersions
    ? existingVersions.map((v) => v.version)
    : [];
  const newVersionNames = Object.keys(plugin.versions);

  const toCreate = difference(newVersionNames, existingVersionNames);
  const toDelete = difference(existingVersionNames, newVersionNames);

  if (!toCreate.length && !toDelete.length) {
    CLI.log(["info"], "Versions are already in sync! Skipping...");
    return null;
  }

  // Create new versions
  if (toCreate.length) {
    CLI.log(["info"], `New versions found! Creating versions...`);

    const newVersions = toCreate.map(async (version) => {
      const created = await createVersion(pluginId, {
        version,
        url: plugin.versions[version],
        source: plugin.source,
      });

      return created;
    });

    updated.push(...newVersions);
  }

  // Delete old versions if unpublished.
  if (toDelete.length) {
    CLI.log(["info"], `Old versions found! Removing versions...`);

    const versionIdsToDelete = await getVersionIds(pluginId, toDelete);
    const removed = versionIdsToDelete.map((version) => {
      return deleteVersion(version);
    });

    updated.push(...removed);
  }

  return updated;
}

async function syncCurrentVersion(pluginId: number, version: string) {
  return updatePluginCurrentVersion(pluginId, version);
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
  return updatePluginRequirements(pluginId, plugin.requirements);
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
