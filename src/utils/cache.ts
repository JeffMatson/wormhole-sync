import fs from "fs";
import config from "~/config";

const cachePaths = config.paths.local.cache;

/**
 * Initializes the cache directories.
 *
 * This could probably be a lot more readable, but it works fine for now. Just fix it if it gets weird.
 *
 * @throws {Error} If the cache directory is not writable.
 */
export function initCache() {
  // Checks and creates c
  if (!fs.existsSync(cachePaths.base)) {
    fs.mkdirSync(cachePaths.base, { recursive: true });
  }

  try {
    fs.accessSync(cachePaths.base, fs.constants.W_OK | fs.constants.R_OK);
  } catch (err) {
    throw new Error(`Cache directory is not writable: ${cachePaths.base}`);
  }

  // Check and create the responses cache directory.
  if (!fs.existsSync(cachePaths.responses.base)) {
    fs.mkdirSync(cachePaths.responses.base, { recursive: true });
  }

  try {
    fs.accessSync(
      cachePaths.responses.base,
      fs.constants.W_OK | fs.constants.R_OK
    );
  } catch (err) {
    throw new Error(
      `Response cache directory is not writable: ${cachePaths.base}`
    );
  }

  // Check and create the plugins-api cache directory.
  if (!fs.existsSync(cachePaths.responses.dotOrgPlugins)) {
    fs.mkdirSync(cachePaths.responses.dotOrgPlugins, { recursive: true });
  }

  try {
    fs.accessSync(
      cachePaths.responses.dotOrgPlugins,
      fs.constants.W_OK | fs.constants.R_OK
    );
  } catch (err) {
    throw new Error(
      `Response cache directory is not writable: ${cachePaths.base}`
    );
  }
}
