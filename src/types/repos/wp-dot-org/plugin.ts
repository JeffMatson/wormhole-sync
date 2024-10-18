import { z } from "zod";
import {
  EmptyArraySchema,
  PositiveNumberSchema,
  SlugSchema,
  StringOrBooleanSchema,
  VersionStringSchema,
} from "../../util";

const DotOrgPluginNameSchema = z.string();

const DotOrgRatingCountSchema = PositiveNumberSchema.max(1000000);

const DotOrgRatingCountsSchema = z.object({
  "1": DotOrgRatingCountSchema,
  "2": DotOrgRatingCountSchema,
  "3": DotOrgRatingCountSchema,
  "4": DotOrgRatingCountSchema,
  "5": DotOrgRatingCountSchema,
});

const DotOrgPluginVersionsSchema = z.union([
  z.record(VersionStringSchema, z.string().url()),
  EmptyArraySchema,
]);

const DotOrgPluginTagsSchema = z.union([
  z.record(SlugSchema, z.string()),
  EmptyArraySchema,
]);

const DotOrgIconsSchema = z.record(z.string(), z.string());

const DotOrgScreenshotPropsSchema = z.object({
  src: z.string(),
  caption: z.string().optional(),
});

const DotOrgScreenshotSchema = z.record(
  z.string(),
  DotOrgScreenshotPropsSchema
);

const DotOrgScreenshotsSchema = z.union([
  DotOrgScreenshotSchema,
  z.array(DotOrgScreenshotPropsSchema),
]);

const DotOrgBannerSchema = z.record(
  z.string(),
  z.union([z.string().url(), z.literal(false)])
);

const DotOrgBannersSchema = z.union([DotOrgBannerSchema, EmptyArraySchema]);

export const DotOrgPluginSchema = z.object({
  name: DotOrgPluginNameSchema,
  slug: SlugSchema,
  version: VersionStringSchema,
  author: z.string(),
  author_profile: StringOrBooleanSchema.optional(),
  requires: StringOrBooleanSchema.optional(),
  tested: StringOrBooleanSchema.optional(),
  requires_php: StringOrBooleanSchema.optional(),
  requires_plugins: z.array(SlugSchema).optional(),
  rating: PositiveNumberSchema,
  ratings: DotOrgRatingCountsSchema,
  num_ratings: PositiveNumberSchema,
  support_threads: PositiveNumberSchema,
  support_threads_resolved: PositiveNumberSchema,
  active_installs: PositiveNumberSchema,
  downloaded: PositiveNumberSchema,
  last_updated: z.string(),
  added: z.string(),
  homepage: z.string().optional(),
  short_description: z.string(),
  description: z.string(),
  download_link: z.string().url(),
  versions: DotOrgPluginVersionsSchema.optional(),
  tags: DotOrgPluginTagsSchema.optional(),
  icons: z.union([DotOrgIconsSchema, EmptyArraySchema]),
  screenshots: DotOrgScreenshotsSchema.optional(),
  banners: DotOrgBannersSchema.optional(),
});
export type DotOrgPlugin = z.infer<typeof DotOrgPluginSchema>;

export const DotOrgPluginListSchema = z.array(DotOrgPluginSchema);
