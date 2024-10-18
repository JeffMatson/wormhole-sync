import {
  FileHashEncodingSchema,
  type FileCheckOptions,
  type FileCheckResults,
  type FileChecksPassed,
  type FileHashEncoding,
} from "./../types/storage";
import type { SupportedCryptoAlgorithms } from "bun";
import { fileTypeFromBuffer } from "file-type";
import isSvg from "is-svg";
import { v5 as uuidv5 } from "uuid";

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
  algorithm: SupportedCryptoAlgorithms,
  encoding?: FileHashEncoding
) {
  if (!encoding) {
    encoding = "hex";
  }

  const hasher = new Bun.CryptoHasher(algorithm);
  hasher.update(buffer);
  return hasher.digest(encoding);
}

export async function getFileInfo(
  buffer: Uint8Array,
  options: FileCheckOptions
) {
  const fileInfo: FileCheckResults = {};

  if (options.md5) {
    const encoding = FileHashEncodingSchema.parse(options.md5);
    fileInfo.md5 = getFileHash(buffer, "md5", encoding);
  }

  if (options.sha1) {
    const encoding = FileHashEncodingSchema.parse(options.sha1);
    fileInfo.sha1 = getFileHash(buffer, "sha1", encoding);
  }

  if (options.sha256) {
    const encoding = FileHashEncodingSchema.parse(options.sha256);
    fileInfo.sha256 = getFileHash(buffer, "sha256", encoding);
  }

  if (options.ext || options.mime) {
    const info = await fileTypeFromBuffer(buffer);
    if (info) {
      fileInfo.ext = info.ext;
      fileInfo.mime = info.mime;
    }
  }

  return fileInfo;
}

// TODO: this has a lot of verbosity that could be added.
// Maybe check actual results too, even if they're not expected?
// Maybe a NOT operator for expected results?
export async function checkFile(
  buffer: Uint8Array,
  options: FileCheckOptions,
  expected?: FileCheckResults
) {
  const results = {
    expected: expected,
    found: {} as FileCheckResults,
    passed: {} as FileChecksPassed,
  };

  results.found = await getFileInfo(buffer, options);

  if (!results.expected) {
    return results;
  }

  for (const key in expected) {
    const fileProp = key as keyof FileCheckResults;

    const expectedResult = results.expected[fileProp];
    const actualResult = results.found[fileProp];

    // Just in case the expected result key is explicitly set to undefined, pass it.
    // Might need to revisit this later. Not sure what the side effects might be later.
    if (expectedResult === undefined) {
      results.passed[fileProp] = true;
      continue;
    }

    if (actualResult === expectedResult) {
      results.passed[fileProp] = true;
    } else {
      results.passed[fileProp] = false;
    }
  }

  return results;
}

export async function checkRelease(
  buffer: Uint8Array,
  options?: FileCheckOptions,
  expected?: FileCheckResults
) {
  const defaultOptions = {
    ext: true,
    mime: true,
  };

  options = { ...defaultOptions, ...options };

  const defaultExpected = {
    ext: "zip",
    mime: "application/zip",
  };

  expected = { ...defaultExpected, ...expected };

  const results = await checkFile(buffer, options, expected);

  return results;
}

export function allChecksPassed(checkResults: FileChecksPassed) {
  for (const key in checkResults) {
    if (!checkResults[key as keyof FileChecksPassed]) {
      return false;
    }
  }

  return true;
}

export function getLinkUuid(link: string) {
  return uuidv5(link, uuidv5.URL);
}
