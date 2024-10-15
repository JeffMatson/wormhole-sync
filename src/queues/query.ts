import PQueue from "p-queue";
import { WormholeSyncConfig } from "~/config";
import CLI from "../cli";

let completed = 0;

const QueryQueue = new PQueue({
  concurrency: WormholeSyncConfig.concurrency.queries,
});

CLI.trackQueue("query");

QueryQueue.on("add", () => {
  const info = {
    pending: QueryQueue.size,
    active: QueryQueue.pending,
    total: QueryQueue.size + QueryQueue.pending + completed,
    completed: completed,
  };

  CLI.updateQueue("query", info);
});

QueryQueue.on("next", () => {
  completed++;

  CLI.updateQueue("query", { completed });
});

QueryQueue.on("error", (error) => {
  console.error(`Query error: ${error}`);
});

export default QueryQueue;
