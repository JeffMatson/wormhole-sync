import prismaClient from "./client";

export async function upsertFileInfo(file: any) {
  const fileInfo = await prismaClient.fileInfo.upsert({
    where: { id: file.id },
    update: file,
    create: file,
  });

  return fileInfo;
}

export function createFile(file: any) {
  const created = prismaClient.fileInfo.create({
    data: file,
  });
}

export function updateFile(file: any) {
  return prismaClient.fileInfo.update({
    where: { id: file.id },
    data: file,
  });
}

export function deleteFile(file: any) {
  return prismaClient.fileInfo.delete({
    where: { id: file.id },
  });
}

export function updateFileMd5(file: any) {
  return prismaClient.fileInfo.update({
    where: { id: file.id },
    data: { md5: file.md5 },
  });
}

export function updateFileSha1(file: any) {
  return prismaClient.fileInfo.update({
    where: { id: file.id },
    data: { sha1: file.sha1 },
  });
}

export function updateFileSha256(file: any) {
  return prismaClient.fileInfo.update({
    where: { id: file.id },
    data: { sha256: file.sha256 },
  });
}
