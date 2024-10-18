import { formatISO, isValid, parse } from "date-fns";
import { isPlainObject, isString } from "es-toolkit";
import { type Plugin } from "~/types/plugin";
import type { DotOrgPlugin } from "~/types/repos/wp-dot-org/plugin";
import { getLinkUuid } from "~/utils";

function transformDotOrgAuthor(plugin: DotOrgPlugin): Plugin["author"] {
  return {
    name: plugin.author,
    profiles: {
      dotOrg: isString(plugin.author_profile)
        ? plugin.author_profile
        : undefined,
    },
  };
}

function transformRequirements(plugin: DotOrgPlugin): Plugin["requirements"] {
  const requirements: Partial<Plugin["requirements"]> = {};

  if (isString(plugin.requires_php)) {
    requirements.php = plugin.requires_php;
  }

  if (isString(plugin.requires)) {
    requirements.wp = plugin.requires;
  }

  requirements.plugins = plugin.requires_plugins;

  return requirements;
}

function transformRatings(plugin: DotOrgPlugin): Plugin["ratings"] {
  return {
    dotOrg: {
      ratings: {
        "1": plugin.ratings["1"],
        "2": plugin.ratings["2"],
        "3": plugin.ratings["3"],
        "4": plugin.ratings["4"],
        "5": plugin.ratings["5"],
      },
      count: plugin.num_ratings,
      rating: plugin.rating,
    },
  };
}

function transformSupport(plugin: DotOrgPlugin): Plugin["support"] {
  return {
    dotOrg: {
      threads: {
        total: plugin.support_threads,
        resolved: plugin.support_threads_resolved,
      },
    },
  };
}

function transformDescriptions(plugin: DotOrgPlugin): Plugin["descriptions"] {
  return {
    short: plugin.short_description,
    full: plugin.description,
  };
}

function transformPluginUpdatedDate(
  lastUpdated: DotOrgPlugin["last_updated"]
): Plugin["stats"]["dotOrg"]["lastUpdated"] {
  if (isValid(lastUpdated)) {
    return formatISO(lastUpdated);
  }

  const parsed = parse(lastUpdated, "yyyy-MM-dd hh:mmaa 'GMT'", new Date());
  if (isValid(parsed)) {
    return parsed.toISOString();
  }

  return undefined;
}

function transformPluginAddedDate(
  dateAdded: DotOrgPlugin["added"]
): Plugin["stats"]["dotOrg"]["added"] {
  if (isValid(dateAdded)) {
    return formatISO(dateAdded);
  }

  const parsed = parse(dateAdded, "yyyy-MM-dd", new Date());
  if (isValid(parsed)) {
    return parsed.toISOString();
  }

  return undefined;
}

function transformStats(plugin: DotOrgPlugin): Plugin["stats"] {
  return {
    dotOrg: {
      activeInstalls: plugin.active_installs,
      downloads: plugin.downloaded,
      lastUpdated: transformPluginUpdatedDate(plugin.last_updated),
      added: transformPluginAddedDate(plugin.added),
    },
  };
}

function transformPluginVersions(plugin: DotOrgPlugin): Plugin["versions"] {
  const { versions } = plugin;
  const transformed: Plugin["versions"] = {};

  if (!isPlainObject(versions) || Array.isArray(versions)) {
    return transformed;
  }

  for (const version in versions) {
    if (!isString(version)) {
      continue;
    }

    const url = versions[version];
    transformed[version] = [
      {
        id: getLinkUuid(url),
        url: url,
        source: "DOTORG",
      },
    ];
  }

  return transformed;
}

function transformPluginDownloadLinks(
  plugin: DotOrgPlugin
): Plugin["downloadLinks"] {
  return {
    dotOrg: plugin.download_link,
  };
}

function transformIcons(
  icons: DotOrgPlugin["icons"]
): Plugin["assets"]["icons"] {
  const transformed: Plugin["assets"]["icons"] = [];

  if (Array.isArray(icons) || !isPlainObject(icons)) {
    return transformed;
  }

  let slug: keyof typeof icons;
  for (slug in icons) {
    if (isString(icons[slug]))
      transformed.push({
        slug: slug,
        sources: {
          dotOrg: icons[slug],
        },
      });
  }

  return transformed;
}

function transformScreenshots(
  screenshots: DotOrgPlugin["screenshots"]
): Plugin["assets"]["screenshots"] {
  const transformed: Plugin["assets"]["screenshots"] = [];

  if (Array.isArray(screenshots)) {
    return transformed;
  }

  if (isPlainObject(screenshots)) {
    let slug: keyof typeof screenshots;
    for (slug in screenshots) {
      const { src, caption } = screenshots[slug];

      if (isString(src)) {
        transformed.push({
          slug: slug,
          caption: caption,
          sources: {
            dotOrg: src,
          },
        });
      }
    }
  }

  return transformed;
}

function transformBanners(
  banners: DotOrgPlugin["banners"]
): Plugin["assets"]["banners"] {
  const transformed: Plugin["assets"]["banners"] = [];

  if (Array.isArray(banners)) {
    return transformed;
  }

  if (isPlainObject(banners)) {
    let slug: keyof typeof banners;
    for (slug in banners) {
      const src = banners[slug];

      if (isString(src)) {
        transformed.push({
          slug: slug,
          sources: {
            dotOrg: src,
          },
        });
      }
    }
  }

  return transformed;
}

function transformPluginAssets(plugin: DotOrgPlugin): Plugin["assets"] {
  const { icons, screenshots, banners } = plugin;

  return {
    icons: transformIcons(icons),
    screenshots: transformScreenshots(screenshots),
    banners: transformBanners(banners),
  };
}

function transformPluginTested(plugin: DotOrgPlugin): Plugin["tested"] {
  if (!isString(plugin.tested)) {
    return undefined;
  }

  return plugin.tested;
}

function transformPluginTags(tags: DotOrgPlugin["tags"]): Plugin["tags"] {
  const found: { slug: string; name: string }[] = [];

  if (!tags || Array.isArray(tags)) {
    return found;
  }

  for (const tag in tags) {
    if (isString(tag) && isString(tags[tag])) {
      found.push({ slug: tag, name: tags[tag] });
    }
  }

  return found;
}

export function transformPlugin(plugin: DotOrgPlugin): Plugin {
  const transformed = {
    slug: plugin.slug,
    name: plugin.name,
    version: plugin.version,
    source: "DOTORG" as const,
    author: transformDotOrgAuthor(plugin),
    requirements: transformRequirements(plugin),
    ratings: transformRatings(plugin),
    support: transformSupport(plugin),
    descriptions: transformDescriptions(plugin),
    stats: transformStats(plugin),
    tested: transformPluginTested(plugin),
    homepage: plugin.homepage,
    downloadLinks: transformPluginDownloadLinks(plugin),
    tags: transformPluginTags(plugin.tags),
    versions: transformPluginVersions(plugin),
    assets: transformPluginAssets(plugin),
  };

  return transformed;
}
