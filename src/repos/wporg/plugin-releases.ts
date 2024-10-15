import { getStorageProvider } from "../../storage";
import { DownloadQueue, FileQueue } from "../../queues";
import config from "../../config";
import CLI from "../../cli";
import type { Plugin } from "../../types/plugin";
import { getPluginIdBySlugAndSource } from "~/db/plugin";
import { getDownloadLinkInfo, upsertLinkInfo } from "~/db/download-link";
import { getFileInfo } from "~/utils";

const storageProvider = getStorageProvider();

export async function fetchRelease(downloadLink: string) {
  const response = await fetch(downloadLink);
  if (!response.ok) {
    CLI.log(
      ["error"],
      `Failed to fetch release from: ${downloadLink} | ${response.status} | ${response.statusText}`
    );
    throw new Error(`Failed to fetch release: ${response.statusText}`);
  }

  const file = new Uint8Array(await response.arrayBuffer());
  CLI.log(["success"], `Fetched release from: ${downloadLink}`);

  return file;
}

function getDownloadLink(plugin: Plugin, version: string) {
  if (!(version in plugin.versions)) {
    throw new Error("Unknown version");
  }

  return plugin.versions[version];
}

async function downloadRelease(plugin: Plugin, version: string) {
  const url = getDownloadLink(plugin, version);

  const downloaded = await DownloadQueue.add(async () => {
    const fetched = await fetchRelease(url);
    return fetched;
  });

  if (!downloaded) {
    throw new Error("Failed to download release");
  }

  return downloaded;
}

export async function syncLinkInfo(payload: Uint8Array, downloadLink: string) {
  const existingLinkInfo = await getDownloadLinkInfo(
    { url: downloadLink },
    { fileInfo: true }
  );

  const toSync = {
    ext: true,
    mime: true,
    size: true,
    sha1: true,
    sha256: true,
    md5: true,
  };

  const payloadInfo = await getFileInfo(payload, toSync);

  const result = await upsertLinkInfo({
    url: downloadLink,
    fileInfo: {
      create: {
        ...payloadInfo,
      },
    },
  });

  return result;
}

export async function processRelease(plugin: Plugin, version: string) {
  if (!config.syncFiles) {
    CLI.log(["info"], `Skipping file sync for ${plugin.slug} ${version}`);
    return;
  }

  if (!plugin.id) {
    const pluginId = await getPluginIdBySlugAndSource(plugin.slug, "DOTORG");
    if (!pluginId) {
      throw new Error("Plugin not found in database");
    }
    plugin.id = pluginId;
  }

  const resourceProps = {
    source: "dotorg",
    type: "plugin",
    subType: "release",
    slug: plugin.slug,
  };

  const fileProps = {
    slug: `${plugin.slug}.${version}`,
    ext: "zip",
    mime: "application/zip",
  };

  const fileKey = await storageProvider.generateKey(resourceProps, fileProps);
  const fileExists = await storageProvider.fileExists(fileKey);

  if (fileExists) {
    CLI.log(
      ["info"],
      `Release already exists for ${plugin.slug} ${version}. Skipping.`
    );
    return;
  }

  const downloaded = await downloadRelease(plugin, version);
  // const fileInfo = await syncLinkInfo(downloaded, plugin.versions[version]);

  const written = await FileQueue.add(async () => {
    const resourceProps = {
      source: "dotorg",
      type: "plugin",
      subType: "release",
      slug: plugin.slug,
    };

    return storageProvider.saveResourceFile(
      resourceProps,
      fileProps,
      downloaded
    );
  });

  if (!written) {
    throw new Error("Failed to write release to storage");
  }

  CLI.log(["success"], `Processed release for ${plugin.slug} ${version}`);

  return written;
}

async function checkExistingFiles(plugin: Plugin) {
  const resourceProps = {
    source: "dotorg",
    type: "plugin",
    subType: "release",
    slug: plugin.slug,
  };

  const path = storageProvider.generateResourcePath(resourceProps);
  const existing = await storageProvider.getFilesInPath(path);

  for (const version in plugin.versions) {
    const fileProps = {
      slug: `${plugin.slug}.${version}`,
      ext: "zip",
      mime: "application/zip",
    };

    const fileKey = await storageProvider.generateKey(resourceProps, fileProps);
    if (!existing.includes(fileKey)) {
      return false;
    }
  }

  return true;
}

export async function processPluginReleases(plugin: Plugin) {
  if (!config.exhaustive) {
    const allFilesExist = await checkExistingFiles(plugin);
    if (allFilesExist) {
      CLI.log(["info"], `All files exist for ${plugin.slug}. Skipping.`);
      return [];
    }
  }

  const processed = [];
  for (const version in plugin.versions) {
    if (!config.syncVersions && version !== plugin.version) {
      continue;
    }

    processed.push(processRelease(plugin, version));
  }

  const results = await Promise.allSettled(processed);

  return results;
}
