import type { FileProps, ResourceProps } from ".";
import StorageProvider from "./storage-provider";

class LocalStorageProvider implements StorageProvider {
  config: any;

  constructor(config: any) {
    this.config = config;
  }

  async fileExists(fileKey: string) {
    // Not implemented
  }

  generateResourcePath(resource: ResourceProps) {
    return "";
    // Not implemented
  }

  async generateKey(resource: ResourceProps, file: FileProps) {
    return "";
    // Not implemented
  }

  async savePluginZip(slug: string, version: string, payload: Uint8Array) {
    // Not implemented
  }

  async saveResourceFile(
    resource: ResourceProps,
    file: FileProps,
    payload: Uint8Array
  ) {
    // Not implemented
  }

  async savePluginIcon(
    payload: Uint8Array,
    props: { type: string; pluginSlug: string },
    force = false
  ) {
    // Not implemented
  }

  async savePluginBanner(
    payload: Uint8Array,
    props: { size: string; pluginSlug: string },
    force = false
  ) {
    // Not implemented
  }

  async savePluginScreenshot(
    payload: Uint8Array,
    props: { slug: string; pluginSlug: string },
    force = false
  ) {
    // Not implemented
  }

  static checkConfig(config: any) {
    const errors = [];

    if (!config.path) {
      errors.push(
        "Local path is required to use local storage! Please set it."
      );
    }

    return errors;
  }

  async getFilesInPath(path: string) {
    return [];
    // Not implemented
  }
}

export default LocalStorageProvider;
