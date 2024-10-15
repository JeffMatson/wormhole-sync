import {
  S3Client,
  PutObjectCommand,
  HeadObjectCommand,
  type PutObjectCommandInput,
  type S3ServiceException,
  ListObjectsV2Command,
  GetObjectCommand,
  GetObjectAttributesCommand,
} from "@aws-sdk/client-s3";
import StorageProvider from "./storage-provider";
import { WormholeSyncConfig } from "~/config";
import type {
  S3Config,
  StorageFileInfo,
  StorageResourceInfo,
} from "../types/storage";
import CLI from "../cli";

class S3StorageProvider implements StorageProvider {
  config: S3Config;
  client: S3Client;

  constructor(config: any) {
    this.config = config;

    this.client = new S3Client({
      endpoint: this.config.endpoint,
      region: this.config.region,
    });
  }

  static checkConfig(config: S3Config) {
    const errors = [];

    if (!config.bucket) {
      errors.push("S3 bucket name is required to use S3! Please set it.");
    }

    if (!config.endpoint) {
      errors.push("S3 endpoint is required to use S3! Please set it.");
    }

    if (!config.region) {
      errors.push("S3 region is required to use S3! Please set it.");
    }

    return errors;
  }

  mapTypeToDir(type: string) {
    const s3Paths = WormholeSyncConfig.paths.s3;

    switch (type) {
      case "plugin":
        return s3Paths.plugins;
      case "theme":
        return s3Paths.themes;
      default:
        throw new Error("Invalid resource type");
    }
  }

  mapSubTypeToDir(subType: string) {
    switch (subType) {
      case "release":
        return "releases";
      case "icon":
        return "icons";
      case "banner":
        return "banners";
      case "screenshot":
        return "screenshots";
      default:
        throw new Error("Invalid resource sub-type");
    }
  }

  generateResourcePath(resource: StorageResourceInfo) {
    const { source, type, subType, slug } = resource;

    const typeDir = this.mapTypeToDir(type);
    const subTypeDir = this.mapSubTypeToDir(subType);

    return `${source}/${typeDir}/${slug}/${subTypeDir}`;
  }

  generateKey(resource: StorageResourceInfo, file: StorageFileInfo) {
    const { type, subType, slug, source } = resource;
    const fileName = `${file.slug}.${file.ext}`;

    const filePath = this.generateResourcePath({ source, type, subType, slug });

    return `${filePath}/${fileName}`;
  }

  async getFile(key: string) {
    try {
      const response = await this.client.send(
        new GetObjectCommand({
          Bucket: WormholeSyncConfig.s3.bucket,
          Key: key,
        })
      );

      return response;
    } catch (err: any) {
      throw err;
    }
  }

  async getFileInfo(fileKey: string, attributes?: {}) {
    try {
      const exists = await this.client.send(
        new GetObjectAttributesCommand({
          Bucket: WormholeSyncConfig.s3.bucket,
          Key: fileKey,
          ObjectAttributes: ["ETag"],
        })
      );

      return exists;
    } catch (err: any) {
      console.error("Error: ", err.$response.data);
      // throw err;
    }
  }

  generatePluginReleaseKey(
    pluginSlug: string,
    version: string,
    source: string
  ) {
    const key = this.generateKey(
      { source, type: "plugin", subType: "release", slug: pluginSlug },
      { slug: version, ext: "zip" }
    );

    return key;
  }

  async uploadFile(
    key: string,
    payload: Uint8Array,
    props: { mime?: string; sha1?: string } = {}
  ) {
    const commandArgs: PutObjectCommandInput = {
      Bucket: WormholeSyncConfig.s3.bucket,
      Key: key,
      Body: payload,
    };

    if (props.mime) {
      commandArgs.ContentType = props.mime;
    }

    try {
      const sent = await this.client.send(new PutObjectCommand(commandArgs));
      CLI.log(
        ["success"],
        `Uploaded ${key} to ${WormholeSyncConfig.s3.bucket}`
      );
      return sent;
    } catch (err: S3ServiceException | any) {
      CLI.log(["debug"], err.$metadata);
      CLI.log(["debug"], err.$response);
      CLI.log(
        ["error"],
        `Failed to upload ${key} to ${WormholeSyncConfig.s3.bucket}`
      );
      throw new Error(
        `Failed to upload ${key} to ${WormholeSyncConfig.s3.bucket}`
      );
    }
  }

  async saveResourceFile(
    resource: StorageResourceInfo,
    file: StorageFileInfo,
    payload: Uint8Array
  ) {
    const key = this.generateKey(resource, file);

    return await this.uploadFile(key, payload, file);
  }

  async getFilesInPath(path: string) {
    try {
      const response = await this.client.send(
        new ListObjectsV2Command({
          Bucket: WormholeSyncConfig.s3.bucket,
          Prefix: path,
        })
      );

      const files = response.Contents?.map((file) => file.Key) || [];

      return files;
    } catch (err: any) {
      CLI.log(["error"], err);
      throw err;
    }
  }

  is404Response(err: any) {
    return err?.$metadata?.httpStatusCode === 404;
  }

  is200Response(err: any) {
    return err?.$metadata?.httpStatusCode === 200;
  }

  async fileExists(key: string) {
    try {
      const exists = await this.client.send(
        new HeadObjectCommand({
          Bucket: WormholeSyncConfig.s3.bucket,
          Key: key,
        })
      );

      const success = this.is200Response(exists);
      if (success) {
        CLI.log(
          ["info"],
          `File ${key} exists in ${WormholeSyncConfig.s3.bucket}`
        );
      }
      return success;
    } catch (err: any) {
      if (this.is404Response(err)) {
        CLI.log(
          ["info"],
          `File ${key} does not exist in ${WormholeSyncConfig.s3.bucket}`
        );
        return false;
      }

      CLI.log(["debug"], err);
      throw err;
    }
  }
}

export default S3StorageProvider;
