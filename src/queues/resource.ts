import PQueue from "p-queue";
import config from "../config";
import CLI from "../cli";

let completed = 0;

const ResourceQueue = new PQueue({
  concurrency: config.concurrency.plugins,
});

CLI.trackQueue("resource");

ResourceQueue.on("add", () => {
  const info = {
    pending: ResourceQueue.size,
    active: ResourceQueue.pending,
    total: ResourceQueue.size + ResourceQueue.pending + completed,
    completed: completed,
  };

  CLI.updateQueue("resource", info);
});

ResourceQueue.on("next", () => {
  completed++;

  CLI.updateQueue("resource", { completed });
});

export default ResourceQueue;
