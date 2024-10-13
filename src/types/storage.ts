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

export const FileCheckOptionsSchema = z.object({
  md5: z.union([z.enum(["hex", "base64"]), z.boolean()]).optional(),
  sha1: z.union([z.enum(["hex", "base64"]), z.boolean()]).optional(),
  sha256: z.union([z.enum(["hex", "base64"]), z.boolean()]).optional(),
  ext: z.boolean().optional(),
  mime: z.boolean().optional(),
});
export type FileCheckOptions = z.infer<typeof FileCheckOptionsSchema>;

export const FileCheckResultsSchema = z.object({
  md5: z.string().optional(),
  sha1: z.string().optional(),
  sha256: z.string().optional(),
  ext: z.string().optional(),
  mime: z.string().optional(),
});
export type FileCheckResults = z.infer<typeof FileCheckResultsSchema>;

// @TODO: This should be a union of the keys of FileCheckResultsSchema
export const FileChecksPassedSchema = z.object({
  md5: z.boolean().optional(),
  sha1: z.boolean().optional(),
  sha256: z.boolean().optional(),
  ext: z.boolean().optional(),
  mime: z.boolean().optional(),
});
export type FileChecksPassed = z.infer<typeof FileChecksPassedSchema>;

export const FileHashEncodingSchema = z
  .enum(["hex", "base64"])
  .catch((ctx) => "hex");
export type FileHashEncoding = z.infer<typeof FileHashEncodingSchema>;
