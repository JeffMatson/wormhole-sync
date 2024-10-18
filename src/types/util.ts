import { z } from "zod";

export const VersionStringSchema = z.string();

export const SlugSchema = z.string();

export const PositiveNumberSchema = z.number().int().min(0);

export const StringOrBooleanSchema = z.union([z.string(), z.boolean()]);

export const EmptyArraySchema = z.tuple([]);

export const UuidSchema = z.string().uuid();
export type Uuid = z.infer<typeof UuidSchema>;
