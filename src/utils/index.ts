import type { SupportedCryptoAlgorithms } from "bun";
import { fileTypeFromBuffer } from "file-type";
import isSvg from "is-svg";

type ReleaseCheckOptions = {
  md5?: boolean;
  sha1?: boolean;
  sha256?: boolean;
};

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

export function getFileHash(
  buffer: Uint8Array,
  algorithm: SupportedCryptoAlgorithms
) {
  const hasher = new Bun.CryptoHasher(algorithm);
  hasher.update(buffer);
  return hasher.digest("hex");
}

export async function checkRelease(
  buffer: Uint8Array,
  options: ReleaseCheckOptions
) {
  const results: {
    md5?: string;
    sha1?: string;
    sha256?: string;
  } = {};

  if (options.md5) {
    results.md5 = getFileHash(buffer, "md5");
  }

  if (options.sha1) {
    results.sha1 = getFileHash(buffer, "sha1");
  }

  if (options.sha256) {
    results.sha256 = getFileHash(buffer, "sha256");
  }
}
