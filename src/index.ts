import { fetchPluginList } from "~/repos/wporg/plugins-api";
// import { processPluginAssets } from "~/repos/wporg/plugin-assets";
import { initCache } from "~/utils/cache";
import { ResourceQueue } from "~/queues";
import { processPluginMeta } from "~/repos/wporg/plugin-meta";
import CLI from "~/cli";
import { transformPlugin } from "~/repos/wporg/plugin";
import type { DotOrgPlugin } from "~/types/repos/wp-dot-org/plugin";
import type { Plugin } from "~/types/plugin";
import { processPluginReleases } from "~/repos/wporg/plugin-releases";
import { syncDotOrgPlugins } from "./repos/wporg";

function bootstrap() {
  initCache();
}

bootstrap();
await syncDotOrgPlugins();
