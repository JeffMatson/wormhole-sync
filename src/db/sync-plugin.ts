import type { PluginInfo } from "../types";
import {
  createPlugin,
  getPluginId,
  pluginExists,
  updatePlugin,
} from "./plugin";
import { createPluginVersion, pluginVersionExists } from "./plugin-version";

export async function syncPluginDetails(plugin: PluginInfo) {
  const exists = await pluginExists(plugin.slug);
  if (!exists) {
    const created = await createPlugin(plugin);
    return created;
  }

  const updated = await updatePlugin(plugin);

  return updated;
}

export async function syncPluginAssets(plugin: PluginInfo) {
  const id = await getPluginId(plugin.slug);
  if (!id) {
    console.error(
      `Failed to sync assets for ${plugin.name}: plugin does not exist!`
    );
    return false;
  }

  const updated = await updatePlugin(plugin);

  return updated;
}

export async function syncPluginVersion(plugin: PluginInfo, version: string) {
  const exists = await pluginVersionExists(plugin.slug, version);
  if (exists) {
    return exists;
  }

  if (!Array.isArray(plugin.versions) && version in plugin.versions) {
    const created = await createPluginVersion({
      slug: plugin.slug,
      version,
      downloadLink: plugin.versions[version],
    });

    if (!created) {
      console.error(
        `Failed to create plugin version: ${plugin.name} ${version}`
      );
    }

    return created;
  }

  return false;
}
