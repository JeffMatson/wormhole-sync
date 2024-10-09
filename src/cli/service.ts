import { EventEmitter } from "events";
import type { QueueActionProps, Queues } from "./types";
import { getQueueTitle } from "./utils";

class CLIService extends EventEmitter {
  queues: Queues = {};

  constructor() {
    super();
  }

  start() {
    this.emit("start");
  }

  log(levels: string[], message: string) {
    if (levels.includes("info")) {
      this.emit("logInfo", message);
    }

    if (levels.includes("error")) {
      this.emit("logError", message);
    }

    if (levels.includes("warn")) {
      this.emit("logWarn", message);
    }

    if (levels.includes("debug")) {
      this.emit("logDebug", message);
    }

    if (levels.includes("trace")) {
      this.emit("logTrace", message);
    }

    if (levels.includes("start")) {
      this.emit("logStart", message);
    }

    if (levels.includes("success")) {
      this.emit("logSuccess", message);
    }
  }

  trackProgress(type: string, info: any) {
    this.emit("progressChanged", type, info);
  }

  queueCreated(key: string) {
    this.queues[key] = {
      total: 0,
      active: 0,
      pending: 0,
      completed: 0,
    };

    this.emit("queueCreated", key);
  }

  trackQueue(key: string) {
    if (!(key in this.queues)) {
      this.queues[key] = {
        total: 0,
        active: 0,
        pending: 0,
        completed: 0,
        title: getQueueTitle(key),
      };
    }
  }

  updateQueue(
    key: string,
    changed: {
      active?: number;
      pending?: number;
      total?: number;
      completed?: number;
    }
  ) {
    this.trackQueue(key);
    this.emit("queueChanged", key, changed);
  }

  queueTaskAdded(key: string) {
    this.updateQueue(key, { pending: this.queues[key].pending++ });
  }

  queueTaskComplete(key: string) {
    this.updateQueue(key, { completed: this.queues[key].completed++ });
  }

  fetchingDotOrgPlugins(totalPlugins: number, totalPages: number) {
    this.log(["info"], "Fetching plugins from WordPress.org");
    this.emit("startedDotOrgPluginFetch", totalPlugins, totalPages);
  }

  downloadQueued() {}

  pluginQueued() {
    console.log("Plugin Queued");
  }
}

const service = new CLIService();

export default service;
