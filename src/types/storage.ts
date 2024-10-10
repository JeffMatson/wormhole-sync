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

export const StorageResourceInfoSchema = z.object({
  source: z.string(),
  type: z.string(),
  subType: z.string(),
  slug: z.string(),
});
export type StorageResourceInfo = z.infer<typeof StorageResourceInfoSchema>;

export const StorageFileInfoSchema = z.object({
  slug: z.string(),
  ext: z.string(),
  mime: z.string().optional(),
});
export type StorageFileInfo = z.infer<typeof StorageFileInfoSchema>;
