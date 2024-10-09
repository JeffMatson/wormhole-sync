import { isString } from "es-toolkit";
import { z } from "zod";
import type { Config } from "../types";

function toBool(value: string | undefined): boolean | undefined {
  if (value === "true" || value === "false") {
    return value === "true";
  }

  return undefined;
}

function toNumber(value: string | undefined): number | undefined {
  if (value && !isNaN(parseInt(value))) {
    return parseInt(value);
  }

  return undefined;
}

function toString(value: string | undefined): string | undefined {
  if (isString(value)) {
    return value;
  }

  return undefined;
}

const EnvBooleanSchema = z.string().transform(toBool);
const EnvNumberSchema = z.string().transform(toNumber);
const EnvStringSchema = z.string().transform(toString);

const EnvSchema = z
  .object({
    SYNC_DB: EnvBooleanSchema,
    SYNC_FILES: EnvBooleanSchema,
    SYNC_VERSIONS: EnvBooleanSchema,
    SYNC_ASSETS: EnvBooleanSchema,
    VERBOSE: EnvBooleanSchema,
    STORAGE: EnvStringSchema,
    CONCURRENT_PLUGINS: EnvNumberSchema,
    CONCURRENT_PLUGIN_VERSIONS: EnvNumberSchema,
    CONCURRENT_DOWNLOADS: EnvNumberSchema,
    CONCURRENT_FILES: EnvNumberSchema,
    BASE_PATH: EnvStringSchema,
    PLUGINS_PATH: EnvStringSchema,
    THEMES_PATH: EnvStringSchema,
    ASSETS_PATH: EnvStringSchema,
    RELEASES_PATH: EnvStringSchema,
    S3_BUCKET: EnvStringSchema,
    S3_ENDPOINT: EnvStringSchema,
    S3_REGION: EnvStringSchema,
  })
  .partial();

const envValues = EnvSchema.parse(process.env);

const envConfig = {
  syncDb: envValues.SYNC_DB,
  syncFiles: envValues.SYNC_FILES,
  syncVersions: envValues.SYNC_VERSIONS,
  syncAssets: envValues.SYNC_ASSETS,
  verbose: envValues.VERBOSE,
  storage: envValues.STORAGE as Config["storage"],
  concurrency: {
    plugins: envValues.CONCURRENT_PLUGINS,
    pluginVersions: envValues.CONCURRENT_PLUGIN_VERSIONS,
    downloads: envValues.CONCURRENT_DOWNLOADS,
    files: envValues.CONCURRENT_FILES,
  } as Partial<Config>["concurrency"],
  paths: {
    local: {
      base: envValues.BASE_PATH,
      cache: {
        base: undefined,
        responses: {
          base: undefined,
          dotOrgPlugins: undefined,
        },
      },
    },
    s3: {
      base: undefined,
      plugins: envValues.PLUGINS_PATH,
      themes: envValues.THEMES_PATH,
    },
  },
  s3: {
    bucket: envValues.S3_BUCKET,
    endpoint: envValues.S3_ENDPOINT,
    region: envValues.S3_REGION,
  },
};

export default envConfig;
