import prisma from "./client";

export async function getPluginTags(slug: string) {
  const tags = await prisma.tag.findMany({
    where: {
      plugins: {
        some: {
          slug,
        },
      },
    },
  });

  return tags;
}

export async function setPluginTags(
  slug: string,
  tags: { slug: string; name: string }[]
) {
  const updatedTags = await prisma.plugin.update({
    where: {
      slug,
    },
    data: {
      tags: {
        connectOrCreate: tags.map((tag) => ({
          where: {
            slug: tag.slug,
          },
          create: {
            slug: tag.slug,
            name: tag.name,
          },
        })),
      },
    },
  });

  return updatedTags;
}
