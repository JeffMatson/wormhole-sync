import CLIService from "./service";
import { dotOrgPluginFetchProgressBar, queueProgressBar } from "./progress-bar";
import type { SingleBar } from "cli-progress";
import { WormholeSyncConfig } from "~/config";
import chalk from "chalk";
import type { QueueUpdate } from "./types";
import { getQueueTitle } from "./utils";
import { consola } from "consola";

const bars: Record<string, SingleBar> = {};

CLIService.on("logDebug", (message) => {
  if (WormholeSyncConfig.verbose) {
    consola.debug(message);
  }
});

CLIService.on("logInfo", (message) => {
  if (WormholeSyncConfig.verbose) {
    consola.info(message);
  }
});

CLIService.on("logError", (message) => {
  consola.error(message);
});

CLIService.on("logWarn", (message) => {
  consola.warn(message);
});

CLIService.on("logStart", (message) => {
  consola.start(message);
});

CLIService.on("logSuccess", (message) => {
  consola.success(message);
});

// CLIService.on("progressChanged", (type, info) => {
//   if (type === "dotOrgPluginList") {
//     if (!bars[type]) {
//       bars[type] = dotOrgPluginFetchProgressBar;
//     }

//     bars[type].setTotal(info.total);
//     bars[type].update(info.current);
//   } else {
//     if (!bars[type]) {
//       bars[type] = queueProgressBar.create(info.total, 0);
//     }

//     bars[type].update(info.current);
//   }
// });

// CLIService.on("queueChanged", (key: string, info: QueueUpdate) => {
//   const payload: any = info;
//   payload.title = getQueueTitle(key);

//   if (!bars[key]) {
//     bars[key] = queueProgressBar.create(0, 0);
//   }

//   if (info.total) {
//     bars[key].setTotal(info.total);
//   }

//   if (info.completed) {
//     bars[key].update(info.completed, info);
//   }

//   bars[key].update(info);
// });

export default CLIService;
