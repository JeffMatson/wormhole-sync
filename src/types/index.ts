import { z } from "zod";
import { PositiveNumberSchema } from "~/types/util";

export const LocalPathConfigSchema = z.object({
  base: z.string(),
  cache: z.object({
    base: z.string(),
    responses: z.object({
      base: z.string(),
      dotOrgPlugins: z.string(),
    }),
  }),
});
export type LocalPathConfig = z.infer<typeof LocalPathConfigSchema>;

export const ConfigSchema = z.object({
  syncDb: z.boolean(),
  syncFiles: z.boolean(),
  syncVersions: z.boolean(),
  syncAssets: z.boolean(),
  verbose: z.boolean(),
  storage: z.enum(["local", "s3", "b2"]),
  exhaustive: z.boolean(),
  concurrency: z.object({
    plugins: PositiveNumberSchema,
    pluginVersions: PositiveNumberSchema,
    downloads: PositiveNumberSchema,
    queries: PositiveNumberSchema,
    files: PositiveNumberSchema,
  }),
  paths: z.object({
    local: LocalPathConfigSchema,
    s3: z.object({
      base: z.string(),
      plugins: z.string(),
      themes: z.string(),
    }),
  }),
  s3: z.object({
    bucket: z.string().optional(),
    endpoint: z.string().optional(),
    region: z.string().optional(),
  }),
});
export type Config = z.infer<typeof ConfigSchema>;

const EnvConfigSchema = ConfigSchema.deepPartial();
export type EnvConfig = z.infer<typeof EnvConfigSchema>;

const CLIConfigSchema = ConfigSchema.deepPartial();
export type CLIConfig = z.infer<typeof CLIConfigSchema>;
