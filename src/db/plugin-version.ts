import prismaClient from "./client";

export async function pluginVersionExists(slug: string, version: string) {
  const pluginVersion = await prismaClient.pluginVersion.findFirst({
    where: {
      slug,
      version,
    },
  });

  return !!pluginVersion;
}

export async function createPluginVersion({
  slug,
  version,
  downloadLink,
}: {
  slug: string;
  version: string;
  downloadLink: string;
}) {
  const pluginVersion = await prismaClient.pluginVersion.create({
    data: {
      slug,
      version,
      downloadLink,
    },
  });

  return pluginVersion;
}
