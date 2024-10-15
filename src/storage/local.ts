import type { StorageFileInfo, StorageResourceInfo } from "~/types/storage";
import StorageProvider from "./storage-provider";

class LocalStorageProvider implements StorageProvider {
  config: any;

  constructor(config: any) {
    this.config = config;
  }

  async fileExists(fileKey: string) {
    // Not implemented
  }

  generateResourcePath(resource: StorageResourceInfo) {
    return "";
    // Not implemented
  }

  async generateKey(resource: StorageResourceInfo, file: StorageFileInfo) {
    return "";
    // Not implemented
  }

  async savePluginZip(slug: string, version: string, payload: Uint8Array) {
    // Not implemented
  }

  async saveResourceFile(
    resource: StorageResourceInfo,
    file: StorageFileInfo,
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

  async getFileInfo(fileKey: string, attributes?: {}) {
    return null;
  }
}

export default LocalStorageProvider;
