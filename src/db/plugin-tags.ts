import prismaClient from "./client";
import { z } from "zod";

export const PluginTagSchema = z.object({
  slug: z.string(),
  name: z.string(),
});
export type PluginTag = z.infer<typeof PluginTagSchema>;

export async function createPluginTag(tag: PluginTag) {
  const parsed = PluginTagSchema.parse(tag);
  const created = await prismaClient.tag.create({
    data: parsed,
  });

  return created;
}

export async function updatePluginTags(id: number, tags: PluginTag[]) {
  const parsed = tags.map((tag) => PluginTagSchema.parse(tag));

  const updated = await prismaClient.plugin.update({
    where: {
      id: id,
    },
    data: {
      tags: {
        connectOrCreate: [
          ...parsed.map((tag) => ({
            where: {
              slug: tag.slug,
            },
            create: {
              slug: tag.slug,
              name: tag.name,
            },
          })),
        ],
      },
    },
  });

  return updated;
}
