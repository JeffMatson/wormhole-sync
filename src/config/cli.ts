import { parseArgs } from "util";

const storageTypes = ["local", "s3"] as const;

interface CliConfig {
  verbose?: boolean;
  syncDb?: boolean;
  syncFiles?: boolean;
  syncVersions?: boolean;
  syncAssets?: boolean;
  storage?: (typeof storageTypes)[number];
}

const { values, positionals } = parseArgs({
  args: Bun.argv,
  options: {
    "no-files": {
      type: "boolean",
    },
    verbose: {
      type: "boolean",
    },
    "no-versions": {
      type: "boolean",
    },
    "no-db": {
      type: "boolean",
    },
    "no-assets": {
      type: "boolean",
    },
    storage: {
      type: "string",
    },
    "s3-endpoint": {
      type: "string",
    },
    "s3-region": {
      type: "string",
    },
    "bucket-name": {
      type: "string",
    },
    "plugin-path": {
      type: "string",
    },
    "asset-path": {
      type: "string",
    },
    "current-only": {
      type: "boolean",
    },
    "db-only": {
      type: "boolean",
    },
    "concurrent-plugins": {
      type: "string",
    },
    "concurrent-plugin-versions": {
      type: "string",
    },
    "concurrent-downloads": {
      type: "string",
    },
    "concurrent-files": {
      type: "string",
    },
    limit: {
      type: "string",
    },
  },
  strict: true,
  allowPositionals: true,
});

const cliConfig: CliConfig = {
  verbose: values.verbose,
};

if (values["no-db"]) {
  cliConfig.syncDb = false;
}

if (values["no-files"]) {
  cliConfig.syncFiles = false;
}

if (values["no-versions"]) {
  cliConfig.syncVersions = false;
}

if (values["no-assets"]) {
  cliConfig.syncAssets = false;
}

if (
  values["storage"] &&
  storageTypes.includes(values["storage"] as (typeof storageTypes)[number])
) {
  cliConfig.storage = values["storage"] as (typeof storageTypes)[number];
}

export default cliConfig;
