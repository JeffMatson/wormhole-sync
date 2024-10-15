import prismaClient from "./client";

// @TODO: dodge that any
export async function updateDotOrgPluginStats(pluginId: number, stats: any) {
  try {
    const result = await prismaClient.dotOrgPluginStats.upsert({
      where: { pluginId },
      update: stats,
      create: {
        pluginId,
        ...stats,
      },
    });
    return result;
  } catch (error) {
    console.error(error);
    throw error;
  }
}
