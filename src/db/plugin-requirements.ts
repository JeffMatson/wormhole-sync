import type { Plugin } from "~/types/plugin";
import prismaClient from "./client";
import type { Uuid } from "~/types/util";

export async function upsertPluginRequirements(
  pluginId: Uuid,
  requirements: Plugin["requirements"]
) {
  try {
    const props = {
      pluginSlugs: requirements?.plugins,
      phpVersion: requirements?.php,
      wpVersion: requirements?.wp,
    };

    const result = await prismaClient.pluginRequirements.upsert({
      where: { pluginId },
      update: props,
      create: {
        pluginId,
        ...props,
      },
    });
    return result;
  } catch (error) {
    console.error(error);
    throw error;
  }
}
