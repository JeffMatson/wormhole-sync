import { getStorageProvider } from "../../storage";
import { DownloadQueue, FileQueue } from "../../queues";
import { fileTypeFromBuffer } from "file-type";
import config from "../../config";
import CLI from "../../cli";
import type { Plugin } from "../../types/plugin";

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

export async function processRelease(plugin: Plugin, version: string) {
  if (!config.syncFiles) {
    CLI.log(["info"], `Skipping file sync for ${plugin.slug} ${version}`);
    return;
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

  const payload = await DownloadQueue.add(async () => {
    const url = getDownloadLink(plugin, version);
    const fetched = await fetchRelease(url);
    return fetched;
  });

  if (!payload) {
    throw new Error("Failed to fetch release");
  }

  const info = await fileTypeFromBuffer(payload);
  if (!info || info.ext !== "zip" || info.mime !== "application/zip") {
    throw new Error("Invalid file type");
  }

  const written = await FileQueue.add(async () => {
    const resourceProps = {
      source: "dotorg",
      type: "plugin",
      subType: "release",
      slug: plugin.slug,
    };

    const fileProps = {
      slug: `${plugin.slug}.${version}`,
      ext: info.ext,
      mime: info.mime,
    };

    return storageProvider.saveResourceFile(resourceProps, fileProps, payload);
  });

  if (!written) {
    throw new Error("Failed to write release to storage");
  }

  CLI.log(["success"], `Processed release for ${plugin.slug} ${version}`);

  return written;
}

export function processPluginReleases(plugin: Plugin) {
  const processed = [];

  for (const version in plugin.versions) {
    if (!config.syncVersions && version !== plugin.version) {
      continue;
    }

    processed.push(processRelease(plugin, version));
  }

  return Promise.allSettled(processed);
}
