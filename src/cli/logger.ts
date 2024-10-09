import chalk from "chalk";
import config from "../config";
import { EventEmitter } from "events";

export function startLogger(CLIService: EventEmitter) {
  CLIService.on("logDebug", (message) => {
    if (config.verbose) {
      console.log(chalk.gray(`[DEBUG] ${message}`));
    }
  });

  CLIService.on("logInfo", (message) => {
    if (config.verbose) {
      console.log(chalk.blue(`[INFO] ${message}`));
    }
  });

  CLIService.on("logError", (message) => {
    console.error(chalk.red(`[ERROR] ${message}`));
  });

  CLIService.on("logWarn", (message) => {
    console.warn(chalk.yellow(`[WARN] ${message}`));
  });
}
