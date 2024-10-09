import { fileTypeFromBuffer } from "file-type";
import isSvg from "is-svg";

export async function getImageType(buffer: Uint8Array) {
  const type = await fileTypeFromBuffer(buffer);

  const allowed = [
    "image/png",
    "image/jpeg",
    "image/gif",
    "image/webp",
    "image/svg+xml",
    "image/apng",
    "application/xml",
  ];

  if (type) {
    if (!allowed.includes(type.mime)) {
      console.error(`Invalid image type: ${type.mime}`);
      return false;
    }

    if (type.mime !== "application/xml") {
      return { mime: type.mime, ext: type.ext };
    }
  }

  const decoded = new TextDecoder().decode(buffer);
  if (isSvg(decoded)) {
    return { mime: "image/svg+xml", ext: "svg" };
  }

  console.error("Failed to determine image type");
  return false;
}
