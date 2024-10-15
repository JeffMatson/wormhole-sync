import path from "path";
import { LocalPathConfigSchema, type Config } from "../types";

function generateLocalPaths() {
  const localPaths: any = {
    base: process.cwd(),
    cache: {},
  };

  const cacheBase = path.join(localPaths.base, ".cache");
  localPaths.cache = {
    base: cacheBase,
    responses: {
      base: path.join(cacheBase, "responses"),
      dotOrgPlugins: path.join(cacheBase, "responses", "plugins-api"),
    },
  };

  return LocalPathConfigSchema.parse(localPaths);
}

const defaultConfig: Partial<Config> = {
  syncDb: true,
  syncFiles: true,
  syncVersions: true,
  syncAssets: true,
  verbose: false,
  debug: true,
  exhaustive: false,
  storage: "local" as const,
  concurrency: {
    plugins: 1,
    pluginVersions: 1,
    downloads: 1,
    files: 1,
    queries: 500,
  },
  paths: {
    local: generateLocalPaths(),
    s3: {
      base: "",
      plugins: "plugins",
      themes: "themes",
    },
  },
  s3: {
    bucket: undefined,
    endpoint: undefined,
    region: undefined,
  },
};

export default defaultConfig;
