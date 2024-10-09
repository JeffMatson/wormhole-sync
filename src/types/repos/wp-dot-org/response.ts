import { z } from "zod";
import { PositiveNumberSchema } from "~/types/util";
import { DotOrgPluginSchema } from "~/types/repos/wp-dot-org/plugin";

export const RequestInfoSchema = z.object({
  page: PositiveNumberSchema,
  pages: PositiveNumberSchema,
  results: PositiveNumberSchema,
});

export const PluginsApiResponseSchema = z.object({
  info: RequestInfoSchema,
  plugins: z.array(DotOrgPluginSchema),
});
export type PluginsApiResponse = z.infer<typeof PluginsApiResponseSchema>;
