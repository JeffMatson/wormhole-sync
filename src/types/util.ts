import { z } from "zod";

export const VersionStringSchema = z.string();
export type VersionString = z.infer<typeof VersionStringSchema>;

export const SlugSchema = z.string();
export type Slug = z.infer<typeof SlugSchema>;

export const PositiveNumberSchema = z.number().int().min(0);
export type PositiveNumber = z.infer<typeof PositiveNumberSchema>;

export const StringOrBooleanSchema = z.union([z.string(), z.boolean()]);
export type StringOrBoolean = z.infer<typeof StringOrBooleanSchema>;

export const EmptyArraySchema = z.tuple([]);
export type EmptyArray = z.infer<typeof EmptyArraySchema>;
