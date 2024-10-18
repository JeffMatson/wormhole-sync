import { z } from "zod";
import {
  PositiveNumberSchema,
  SlugSchema,
  UuidSchema,
  VersionStringSchema,
} from "./util";

const DotOrgPluginNameSchema = z.string();

const DotOrgRatingCountSchema = PositiveNumberSchema.max(1000000);

const DotOrgRatingCountsSchema = z.object({
  "1": DotOrgRatingCountSchema,
  "2": DotOrgRatingCountSchema,
  "3": DotOrgRatingCountSchema,
  "4": DotOrgRatingCountSchema,
  "5": DotOrgRatingCountSchema,
});

const PluginRequirementsSchema = z.object({
  plugins: z.array(SlugSchema).optional(),
  php: z.string().optional(),
  wp: z.string().optional(),
});

const PluginRatingsSchema = z.object({
  dotOrg: z.object({
    rating: PositiveNumberSchema,
    ratings: DotOrgRatingCountsSchema,
    count: PositiveNumberSchema,
  }),
});

const PluginSupportSchema = z.object({
  dotOrg: z.object({
    threads: z.object({
      total: PositiveNumberSchema,
      resolved: PositiveNumberSchema,
    }),
  }),
});

const PluginStatsSchema = z.object({
  dotOrg: z.object({
    activeInstalls: PositiveNumberSchema,
    downloads: PositiveNumberSchema,
    lastUpdated: z.string().datetime().optional(),
    added: z.string().datetime().optional(),
  }),
});

const PluginDownloadLinksSchema = z.object({
  dotOrg: z.string().url(),
});

const PluginDescriptionsSchema = z.object({
  short: z.string(),
  full: z.string(),
});

const PluginAuthorSchema = z.object({
  name: z.string(),
  profiles: z.object({
    dotOrg: z.string().url().optional(),
    twitter: z.string().url().optional(),
    facebook: z.string().url().optional(),
    github: z.string().url().optional(),
    linkedin: z.string().url().optional(),
  }),
});

const PluginSourceSchema = z.enum(["DOTORG", "GITHUB", "CUSTOM", "UNKNOWN"]);

const PluginIconSchema = z.object({
  slug: SlugSchema,
  sources: z.object({
    dotOrg: z.string().url(),
    direct: z.string().url().optional(),
  }),
  alt: z.string().optional(),
});

const PluginScreenshotSchema = z.object({
  slug: SlugSchema,
  sources: z.object({
    dotOrg: z.string().url(),
    direct: z.string().url().optional(),
  }),
  caption: z.string().optional(),
});

const PluginBannerSchema = z.object({
  slug: SlugSchema,
  sources: z.object({
    dotOrg: z.string().url(),
    direct: z.string().url().optional(),
  }),
  alt: z.string().optional(),
});

const PluginAssetsSchema = z.object({
  icons: z.array(PluginIconSchema),
  screenshots: z.array(PluginScreenshotSchema),
  banners: z.array(PluginBannerSchema),
});

const PluginTagsSchema = z.array(
  z.object({ slug: SlugSchema, name: z.string() })
);

const PluginVersionPropsSchema = z.object({
  id: UuidSchema.optional(),
  url: z.string().url(),
  source: PluginSourceSchema,
});
export type PluginVersionProps = z.infer<typeof PluginVersionPropsSchema>;

const PluginVersionsSchema = z.record(
  VersionStringSchema,
  z.array(PluginVersionPropsSchema)
);

export const PluginSchema = z.object({
  id: UuidSchema.optional(),
  source: PluginSourceSchema,
  name: DotOrgPluginNameSchema,
  slug: SlugSchema,
  version: VersionStringSchema,
  requirements: PluginRequirementsSchema.optional(),
  author: PluginAuthorSchema,
  tested: z.string().optional(),
  ratings: PluginRatingsSchema,
  support: PluginSupportSchema,
  stats: PluginStatsSchema,
  homepage: z.string().optional(),
  descriptions: PluginDescriptionsSchema,
  downloadLinks: PluginDownloadLinksSchema,
  versions: PluginVersionsSchema,
  tags: PluginTagsSchema,
  assets: PluginAssetsSchema,
});
export type Plugin = z.infer<typeof PluginSchema>;

export const PluginListSchema = z.array(PluginSchema);
