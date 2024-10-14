import type { Source } from "@prisma/client";
import prismaClient from "./client";

export async function createPluginAssets() {}

export async function createPluginBanner() {}

export async function createPluginScreenshot() {}

export async function createPluginIcon(
  pluginId: number,
  icon: { slug: string; url: string; source: string }
) {
  try {
    const updated = await prismaClient.pluginIcon.create({
      data: {
        pluginId: pluginId,
        slug: icon.slug,
        url: icon.url,
        source: icon.source as Source,
      },
    });

    return updated;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function deletePluginIcon(iconId: number) {
  try {
    const result = await prismaClient.pluginIcon.delete({
      where: {
        id: iconId,
      },
    });
    return result;
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
}
