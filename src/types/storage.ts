import { z } from "zod";

export const S3StorageConfigSchema = z.object({
  endpoint: z.string(),
  region: z.string(),
  bucket: z.string(),
  path: z.string(),
  assetPath: z.string(),
});
export type S3Config = z.infer<typeof S3StorageConfigSchema>;

export const StorageConfigSchema = z.union([
  S3StorageConfigSchema,
  z.object({
    type: z.literal("local"),
  }),
]);
export type StorageConfig = z.infer<typeof StorageConfigSchema>;
