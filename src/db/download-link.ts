import type { Prisma } from "@prisma/client";
import prismaClient from "./client";

export async function getDownloadLinkInfo(
  props: { url?: string; id?: number },
  include?: { fileInfo: boolean }
) {
  if (props.id) {
    const downloadLink = await prismaClient.downloadLink.findUnique({
      include: {
        fileInfo: include?.fileInfo,
      },
      where: {
        id: props.id,
      },
    });

    return downloadLink;
  }

  if (props.url) {
    const downloadLink = await prismaClient.downloadLink.findUnique({
      include: {
        fileInfo: include?.fileInfo,
      },
      where: {
        url: props.url,
      },
    });

    return downloadLink;
  }

  throw new Error("Invalid props");
}

export async function upsertLinkInfo(linkInfo: Prisma.DownloadLinkCreateInput) {
  try {
    const updatedLink = await prismaClient.downloadLink.upsert({
      where: { url: linkInfo.url },
      create: linkInfo,
      update: linkInfo,
    });

    return updatedLink;
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
}
