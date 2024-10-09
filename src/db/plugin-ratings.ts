import type { PluginInfo } from "../types";
import prismaClient from "./client";

export async function updatePluginRatings(
  pluginId: number,
  ratings: PluginInfo["ratings"]
) {
  const updated = await prismaClient.plugin.update({
    where: {
      id: pluginId,
    },
    data: {
      ratings: {
        update: {
          stars1: ratings["1"],
          stars2: ratings["2"],
          stars3: ratings["3"],
          stars4: ratings["4"],
          stars5: ratings["5"],
        },
      },
    },
  });

  return updated;
}
