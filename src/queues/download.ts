import PQueue from "p-queue";
import { WormholeSyncConfig } from "~/config";
import CLI from "../cli";

let completed = 0;

const DownloadQueue = new PQueue({
  concurrency: WormholeSyncConfig.concurrency.downloads,
});

CLI.trackQueue("download");

DownloadQueue.on("add", () => {
  const info = {
    pending: DownloadQueue.size,
    active: DownloadQueue.pending,
    total: DownloadQueue.size + DownloadQueue.pending + completed,
    completed: completed,
  };

  CLI.updateQueue("download", info);
});

DownloadQueue.on("next", () => {
  completed++;

  CLI.updateQueue("download", { completed });
});

DownloadQueue.on("error", (error) => {
  console.error(`Download error: ${error}`);
});

export default DownloadQueue;
