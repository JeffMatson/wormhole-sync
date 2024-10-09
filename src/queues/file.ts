import PQueue from "p-queue";
import config from "../config";
import CLI from "../cli";

let completed = 0;

const FileQueue = new PQueue({
  concurrency: config.concurrency.files,
});

CLI.trackQueue("file");

FileQueue.on("add", () => {
  const info = {
    pending: FileQueue.size,
    active: FileQueue.pending,
    total: FileQueue.size + FileQueue.pending + completed,
    completed: completed,
  };

  CLI.updateQueue("file", info);
});

FileQueue.on("next", () => {
  completed++;

  CLI.updateQueue("file", { completed });
});

FileQueue.on("error", (error) => {
  console.error(`File error: ${error}`);
});

export default FileQueue;
