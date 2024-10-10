import S3StorageProvider from "./s3";
import LocalStorageProvider from "./local";
import B2StorageProvider from "./b2";
import config from "../config";

function getStorageConfig(storageType: string) {
  switch (storageType) {
    case "s3":
      return {
        type: "s3",
        endpoint: config.s3.endpoint,
        region: config.s3.region,
        bucket: config.s3.bucket,
      };
    case "local":
      return {
        type: "local",
        path: config.paths.local.base,
      };
    default:
      throw new Error("Invalid storage provider");
  }
}

export function getStorageProvider() {
  const providerType = config.storage;
  const storageConfig = getStorageConfig(providerType);

  switch (providerType) {
    case "s3":
      return new S3StorageProvider(storageConfig);
    case "b2":
      return new B2StorageProvider(storageConfig);
    case "local":
      return new LocalStorageProvider(storageConfig);
    default:
      throw new Error("Invalid storage provider");
  }
}
