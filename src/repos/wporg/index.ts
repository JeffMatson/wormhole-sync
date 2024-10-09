import type { Plugin } from "~/types/plugin";
import { fetchPluginList } from "./plugins-api";
import CLI from "~/cli";
import type { DotOrgPlugin } from "~/types/repos/wp-dot-org/plugin";
import { transformPlugin } from "./plugin";
import { syncPluginEssentials } from "~/db/plugin";
import { ResourceQueue } from "~/queues";
import { processPluginMeta } from "./plugin-meta";
import { processPluginReleases } from "./plugin-releases";

async function runPluginTasks(plugin: Plugin) {
  CLI.log(["start"], `Processing ${plugin.slug}...`);

  const tasks = [
    processPluginMeta(plugin),
    processPluginReleases(plugin),
    // processPluginAssets(plugin),
  ];

  const results = await Promise.allSettled(tasks);
  CLI.log(["success"], `Processed ${plugin.slug}.`);

  return results;
}

async function syncEssentials(plugins: DotOrgPlugin[]) {
  const synced = [];

  for (const plugin of plugins) {
    const result = await syncPluginEssentials(plugin.slug, "DOTORG");
    synced.push(result);
    CLI.log(
      ["success"],
      `[${synced.length}/${plugins.length}] Synced basic data for ${plugin.slug}.`
    );
  }

  return synced;
}

async function processPlugins(pluginList: DotOrgPlugin[]) {
  CLI.log(["start"], `Processing ${pluginList.length} plugins...`);

  CLI.log(["start"], "Syncing basic plugin data. This may take a while...");
  const synced = await syncEssentials(pluginList);
  CLI.log(["success"], `Synced basic data for ${synced.length} plugins.`);

  for (const plugin of pluginList) {
    const parsed = transformPlugin(plugin);

    ResourceQueue.add(() => {
      return runPluginTasks(parsed);
    }).catch((error) => CLI.log(["error"], error));
  }
}

export async function syncDotOrgPlugins() {
  CLI.log(["start"], "Fetching plugin list from WP.org...");
  const pluginList = await fetchPluginList();
  CLI.log(["success"], "Fetched plugin list from WP.org.");

  CLI.log(["start"], "Processing plugins from WP.org...");
  const processed = await processPlugins(pluginList);
  CLI.log(["success"], "Finished processing plugins from WP.org!");

  return processed;
}
