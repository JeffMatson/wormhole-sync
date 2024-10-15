import { merge } from "es-toolkit";
import defaultConfig from "./defaults";
import envConfig from "./env";
import cliConfig from "./cli";
import { ConfigSchema } from "../types";

function mergeConfigs(...configs: any[]) {
  const merged = configs.reduce((acc, config) => {
    return merge(acc, config);
  }, {});

  return ConfigSchema.parse(merged);
}

const WormholeSyncConfig = mergeConfigs(defaultConfig, envConfig, cliConfig);

export { WormholeSyncConfig };
