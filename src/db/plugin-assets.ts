import { Prisma, type Source } from "@prisma/client";
import prismaClient from "./client";
import { isPrismaError } from "~/utils/db";

export async function createPluginAssets() {}

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
    if (isPrismaError(error)) {
      if (error.code === "P2025") {
        return null;
      }
    }
    console.error(error);
    throw error;
  }
}

export async function createPluginBanner(
  pluginId: number,
  banner: { slug: string; url: string; source: string }
) {
  try {
    const created = await prismaClient.pluginBanner.create({
      data: {
        pluginId: pluginId,
        slug: banner.slug,
        url: banner.url,
        source: banner.source as Source,
      },
    });
    return created;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function deletePluginBanner(bannerId: number) {
  try {
    const result = await prismaClient.pluginBanner.delete({
      where: {
        id: bannerId,
      },
    });
    return result;
  } catch (error) {
    if (isPrismaError(error)) {
      if (error.code === "P2025") {
        return null;
      }
    }
    console.error(error);
    throw error;
  }
}

export async function createPluginScreenshot(
  pluginId: number,
  screenshot: { slug: string; url: string; source: string; caption?: string }
) {
  try {
    const created = await prismaClient.pluginScreenshot.create({
      data: {
        pluginId: pluginId,
        slug: screenshot.slug,
        url: screenshot.url,
        source: screenshot.source as Source,
        caption: screenshot.caption,
      },
    });
    return created;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function deletePluginScreenshot(screenshotId: number) {
  try {
    const result = await prismaClient.pluginScreenshot.delete({
      where: {
        id: screenshotId,
      },
    });
    return result;
  } catch (error) {
    if (isPrismaError(error)) {
      if (error.code === "P2025") {
        return null;
      }
    }
    console.error(error);
    throw error;
  }
}
