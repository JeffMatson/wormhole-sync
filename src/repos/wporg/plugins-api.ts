import qs from "qs";
import path from "path";
import CLI from "~/cli";
import { WormholeSyncConfig } from "~/config";
import { PluginsApiResponseSchema } from "~/types/repos/wp-dot-org/response";
import { DotOrgPluginListSchema } from "~/types/repos/wp-dot-org/plugin";

const baseUrl = "http://api.wordpress.org/plugins/info/1.2/";

export async function fetchFromCache(page: number) {
  const cacheFile = Bun.file(
    `${WormholeSyncConfig.paths.local.cache.responses.dotOrgPlugins}/${page}.json`
  );

  try {
    const cache = await cacheFile.json();

    CLI.log(["success"], `Plugin list page ${page} found in cache.`);
    const data = PluginsApiResponseSchema.parse(cache);
    return data;
  } catch (e) {
    CLI.log(
      ["start"],
      `Plugin list page ${page} not found in cache. Fetching...`
    );

    return false;
  }
}

function buildFetchQueryString(perPage: number, page: number) {
  const query = {
    action: "query_plugins",
    request: {
      per_page: perPage,
      page: page,
      fields: {
        versions: true,
        banners: true,
        screenshots: true,
      },
    },
  };

  return qs.stringify(query);
}

async function fetchPluginListPage(perPage: number, page: number) {
  const cached = await fetchFromCache(page);
  if (cached) {
    return cached;
  }

  const url = `${baseUrl}?${buildFetchQueryString(perPage, page)}`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(
        `Error fetching plugin list page ${page}: ${response.statusText}`
      );
    }

    const dataRaw = await response.json();
    const data = PluginsApiResponseSchema.parse(dataRaw);
    CLI.log(
      ["success"],
      `Fetched plugin list page ${page} of ${data.info.pages}.`
    );

    const cacheFilePath = path.join(
      WormholeSyncConfig.paths.local.cache.responses.dotOrgPlugins,
      `${page}.json`
    );
    const cacheFile = Bun.file(cacheFilePath);
    const written = await Bun.write(cacheFile, JSON.stringify(data));

    if (written === 0) {
      throw new Error(
        `Error caching plugin list page ${page}: 0 bytes written.`
      );
    }

    return data;
  } catch (e) {
    console.error(e);
    return null;
  }
}

async function fetchAllPluginListPages() {
  const perPage = 250;
  const firstPage = await fetchPluginListPage(perPage, 1);

  if (!firstPage) {
    const message = "Error fetching plugin list page 1. Bailing.";
    CLI.log(["error"], message);
    throw new Error(message);
  }

  const totalPages = firstPage.info.pages;

  const allPages = [];

  for (let page = 1; page <= totalPages; page++) {
    let pageResponse = await fetchPluginListPage(perPage, page);
    if (pageResponse === null) {
      console.error(`Error fetching plugin list page ${page}. Skipping.`);
      continue;
    }

    allPages.push(pageResponse);

    CLI.trackProgress("dotOrgPluginList", {
      total: totalPages,
      current: page,
    });

    setTimeout(() => {}, 100);
  }

  return allPages;
}

export async function fetchPluginList() {
  const allPages = await fetchAllPluginListPages();

  const allPlugins = [];

  for (const page of allPages) {
    if (page?.plugins) {
      allPlugins.push(...page.plugins);
    }
  }

  return DotOrgPluginListSchema.parse(allPlugins);
}
