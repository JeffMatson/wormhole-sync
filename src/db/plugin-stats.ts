import type { Uuid } from "~/types/util";
import prismaClient from "./client";
import type { Prisma } from "@prisma/client";
import CLI from "~/cli";

export async function upsertDotOrgPluginStats(
  id: Uuid,
  stats: Prisma.DotOrgPluginStatsCreateWithoutPluginInput
) {
  try {
    const result = await prismaClient.dotOrgPluginStats.upsert({
      where: { id },
      create: {
        ...stats,
        plugin: {
          connect: {
            id,
          },
        },
      },
      update: stats,
    });
    return result;
  } catch (error) {
    CLI.log(["error"], `Failed to upsert plugin stats`);
    throw error;
  }
}

export async function updateDotOrgPluginStats(
  id: Uuid,
  stats: Prisma.DotOrgPluginStatsUpdateInput
) {
  try {
    const result = await prismaClient.dotOrgPluginStats.update({
      where: { id },
      data: stats,
    });
    return result;
  } catch (error) {
    console.error(error);
    CLI.log(["error"], new Error(`Failed to update plugin stats for ${id}`));
    CLI.log(["debug"], error);
    CLI.log(["debug"], stats);
    throw error;
  }
}

export async function createDotOrgPluginStats(
  id: Uuid,
  stats: Prisma.DotOrgPluginStatsCreateWithoutPluginInput
) {
  try {
    const result = await prismaClient.plugin.update({
      where: { id },
      data: {
        dotOrgStats: {
          connectOrCreate: {
            where: { id },
            create: stats,
          },
        },
      },
    });
    return result;
  } catch (error) {
    CLI.log(["error"], `Failed to create plugin stats`);
    throw error;
  }
}
