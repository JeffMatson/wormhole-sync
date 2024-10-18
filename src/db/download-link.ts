import type { Prisma } from "@prisma/client";
import prismaClient from "./client";
import type { Uuid } from "~/types/util";
import CLI from "~/cli";

export async function getDownloadLinkInfo(
  id: Uuid,
  include?: { fileInfo: boolean }
) {
  try {
    const downloadLink = await prismaClient.downloadLink.findUnique({
      include: {
        fileInfo: include?.fileInfo,
      },
      where: {
        id: id,
      },
    });

    return downloadLink;
  } catch (error) {
    CLI.log(["error"], new Error(`Failed to get download link: ${id}`));
    throw error;
  }
}

export async function upsertLinkInfo(linkInfo: Prisma.DownloadLinkCreateInput) {
  try {
    const updatedLink = await prismaClient.downloadLink.upsert({
      where: { id: linkInfo.id },
      create: linkInfo,
      update: linkInfo,
    });

    return updatedLink;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function upsertDownloadLink(
  link: Prisma.DownloadLinkCreateInput,
  fileInfo: Prisma.FileInfoCreateInput = {}
) {
  if (!fileInfo.id) {
    fileInfo.id = link.id;
  }

  try {
    const updatedLink = await prismaClient.downloadLink.upsert({
      where: { id: link.id },
      create: { ...link, fileInfo: { create: fileInfo } },
      update: link,
    });

    return updatedLink;
  } catch (error) {
    CLI.log(["debug"], error);
    throw error;
  }
}
