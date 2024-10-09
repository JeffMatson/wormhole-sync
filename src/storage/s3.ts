import {
  S3Client,
  PutObjectCommand,
  HeadObjectCommand,
  type PutObjectCommandInput,
  type S3ServiceException,
} from "@aws-sdk/client-s3";
import StorageProvider from "./storage-provider";
import runtimeConfig from "./../config";
import type { ResourceProps, FileProps } from "./index";
import type { S3Config } from "../types/storage";
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
    const s3Paths = runtimeConfig.paths.s3;

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

  generateResourcePath(resource: ResourceProps) {
    const { type, subType, slug } = resource;

    const typeDir = this.mapTypeToDir(type);
    const subTypeDir = this.mapSubTypeToDir(subType);

    return `${typeDir}/${slug}/${subTypeDir}`;
  }

  generateKey(resource: ResourceProps, file: FileProps) {
    const { type, subType, slug } = resource;
    const fileName = `${file.slug}.${file.ext}`;

    const filePath = this.generateResourcePath({ type, subType, slug });

    return `${filePath}/${fileName}`;
  }

  generatePluginReleaseKey(pluginSlug: string, version: string) {
    const key = this.generateKey(
      { type: "plugin", subType: "release", slug: pluginSlug },
      { slug: version, ext: "zip" }
    );

    return key;
  }

  async uploadFile(
    key: string,
    payload: Uint8Array,
    props: { mime?: string } = {}
  ) {
    const commandArgs: PutObjectCommandInput = {
      Bucket: runtimeConfig.s3.bucket,
      Key: key,
      Body: payload,
    };

    if (props.mime) {
      commandArgs.ContentType = props.mime;
    }

    try {
      const sent = await this.client.send(new PutObjectCommand(commandArgs));
      CLI.log(["success"], `Uploaded ${key} to ${runtimeConfig.s3.bucket}`);
      return sent;
    } catch (err: S3ServiceException | any) {
      console.error(err.$metadata);
      console.error(err.$response);
      CLI.log(
        ["error"],
        `Failed to upload ${key} to ${runtimeConfig.s3.bucket}`
      );
      throw new Error(`Failed to upload ${key} to ${runtimeConfig.s3.bucket}`);
    }
  }

  async saveResourceFile(
    resource: ResourceProps,
    file: FileProps,
    payload: Uint8Array
  ) {
    const key = this.generateKey(resource, file);

    return await this.uploadFile(key, payload, { mime: file.mime });
  }

  // async savePluginIcon(
  //   payload: Uint8Array,
  //   props: { type: string; pluginSlug: string },
  //   force = false
  // ) {
  //   const fileInfo = await getImageType(payload);
  //   if (!fileInfo) {
  //     throw new Error("Invalid image type");
  //   }

  //   const key = this.generateKey(
  //     { type: "plugin", subType: "icon", slug: props.pluginSlug },
  //     { slug: props.type, ext: fileInfo.ext }
  //   );

  //   if (!force) {
  //     const exists = await this.fileExists(key);
  //     if (exists) {
  //       return;
  //     }
  //   }

  //   return this.uploadFile(
  //     {
  //       type: props.type,
  //       pluginSlug: props.pluginSlug,
  //       key: key,
  //       mime: fileInfo.mime,
  //     },
  //     payload
  //   );
  // }

  // async savePluginBanner(
  //   payload: Uint8Array,
  //   props: { size: string; pluginSlug: string },
  //   force = false
  // ) {
  //   const fileInfo = await getImageType(payload);
  //   if (!fileInfo) {
  //     throw new Error("Invalid image type");
  //   }

  //   const key = `${this.assetPath}/plugins/${props.pluginSlug}/banner-${props.size}.${fileInfo.ext}`;

  //   if (!force) {
  //     const exists = await this.fileExists(key);
  //     if (exists) {
  //       return;
  //     }
  //   }

  //   return this.uploadFile(key, payload, { mime: fileInfo.mime });
  // }

  // async savePluginScreenshot(
  //   payload: Uint8Array,
  //   props: { slug: string; pluginSlug: string },
  //   force = false
  // ) {
  //   const fileInfo = await getImageType(payload);
  //   if (!fileInfo) {
  //     throw new Error("Invalid image type");
  //   }

  //   const key = `${this.assetPath}/plugins/${props.pluginSlug}/screenshot-${props.slug}.${fileInfo.ext}`;

  //   if (!force) {
  //     const exists = await this.fileExists(key);
  //     if (exists) {
  //       return;
  //     }
  //   }

  //   return this.uploadFile(key, payload, { mime: fileInfo.mime });
  // }

  async fileExists(key: string) {
    try {
      const exists = await this.client.send(
        new HeadObjectCommand({
          Bucket: runtimeConfig.s3.bucket,
          Key: key,
        })
      );

      const responseCode = exists.$metadata.httpStatusCode;
      if (responseCode === 200) {
        CLI.log(["info"], `File ${key} exists in ${runtimeConfig.s3.bucket}`);
      }

      return responseCode === 200;
    } catch (err: any) {
      if (err?.$metadata?.httpStatusCode === 404) {
        CLI.log(
          ["info"],
          `File ${key} does not exist in ${runtimeConfig.s3.bucket}`
        );
        return false;
      }

      console.error("Error: ", err);
      throw err;
    }
  }
}

export default S3StorageProvider;
