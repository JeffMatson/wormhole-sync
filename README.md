# Wormhole Sync

This tool will parse through WordPress plugin/theme resources, saving files and any associated meta.

**This tool is in active development. You may experience bugs (please file an issue if you do). Use at your own risk.**

While it's perfectly functional as a standalone tool, it's primary purpose is to be used with the Wormhole API (COMING SOON).

Current features include:

- Syncing plugin info from WordPress.org
- Syncing plugin releases from WordPress.org
- Response caching
- Skipping existing resources
- Configurable paths, queues, limits, etc. for fine-tuning parallel sync tasks

Coming soon:

- The Wormhole API
- Syncing themes
- Syncing from other sources
- Local file support
- SQLite support

## Requirements

- Bun
- PostgreSQL
- S3

### Why Bun?

It's faster than Node and makes some things easier, such as native TypeScript support. The only real downsides that it presents for this project are lack of support for some serverless platforms.

If you have a reason to run it in another runtime, feel free to adapt it and submit a pull request.

### Storage Requirements

Storage requirements are going to depend a lot on runtime arguments. At the time of writing, a full sync of plugin release zips will take about 600-700GB. **I recommend at least 1TB of storage**. An S3 compatible object store is required for now, but local storage is coming soon.

Depending on your network speeds and available RAM, you may want to increase or decrease simultaneous threads (see runtime arguments).

## Installation/Setup

1. Install dependencies:
   ```
   bun install
   ```
2. Rename `.env.example` to `.env` and update the values accordingly (See: [Environment Variables](#environment-variables)).
3. Run Prisma migrations and type gen:
   ```
   bun run prisma-migrate
   bun run prisma-generate
   ```

## Running

**After configuring**, just run `bun start` or `bun start [ARGS]`.

## Environment Variables

### DATABASE_URL (required)

Just a PostgreSQL connection string.

Example (PostgreSQL):

```
DATABASE_URL="postgresql://USER:PASS@HOST/REPO"
```

### DIRECT_URL

If you're not using a connection pooler, set this to your `DATABASE_URL`.

If you're using a connection pooler in your `DATABASE_URL`, set this to the direct connection URL.

### CONCURRENT_DOWNLOADS (optional, default: 1)

Controls the number of plugin zip files to process at once. Also controls uploads, since they're immediately processed afterwards.

_(Can be overridden at runtime using `--concurrent-downloads`. See: [runtime arguments](#runtime-arguments))_

Example:

```
CONCURRENT_DOWNLOADS=1
```

### CONCURRENT_PLUGINS (optional, default: 1)

Controls how many plugins are processed simultaneously.

_(Can be overridden at runtime using `--concurrent-plugins`. See: [runtime arguments](#runtime-arguments))_

Example:

```
CONCURRENT_PLUGINS=1
```

### CONCURRENT_PLUGIN_VERSIONS (options, default: 1)

Controls how many different versions of each plugin are processed simultaneously. Note that this compounds with `CONCURRENT_PLUGINS`. For example, if you're processing 5 plugins at a time, and 10 versions, you would be processing up to a total of 50 items simultaneously.

_(Can be overridden at runtime using `--concurrent-plugin-versions`. See: [runtime arguments](#runtime-arguments))_

Example:

```
CONCURRENT_PLUGIN_VERSIONS=1
```

### PLUGIN_PATH (optional, default: 'plugins')

This is the relative path where plugins will be stored.

- If using an S3 bucket, the resulting object key will be `$PLUGIN_PATH/$SLUG/$FILENAME`
- If using local storage, files will be saved to `./dist/$PLUGIN_PATH/$SLUG/$FILENAME`

### AWS_ACCESS_KEY_ID (required for S3)

Your AWS access key ID. See: [@aws-sdk/client-s3](https://www.npmjs.com/package/@aws-sdk/client-s3) for more info.

Example:

```
AWS_ACCESS_KEY_ID="BLAHBLAHBLAH"
```

### AWS_SECRET_ACCESS_KEY (required for S3)

Your AWS secret key. See: [@aws-sdk/client-s3](https://www.npmjs.com/package/@aws-sdk/client-s3) for more info.

Example:

```
AWS_SECRET_ACCESS_KEY="BLAHBLAHBLAH"
```

### BUCKET_NAME (required for S3)

The S3 bucket to use.

Example:

```
BUCKET_NAME="wp-repo-sync"
```

## Runtime Arguments

Most environment variables can be easily overridden at runtime. If a runtime argument is provided, it will always take precedence over the associated environment variable.

### no-files

Skips downloading files. Use this if you just want to sync up the database without downloading anything.

Example:

```
bun start --no-files
```

### no-versions

Skips processing of non-current plugin versions. Only processes the main plugin information and current plugin version.

Example:

```
bun start --no-versions
```

### concurrent-plugins

Sets the number of concurrent plugins. Environment variable will be ignored. See the `CONCURRENT_PLUGINS` [environment variable](#environment-variables) for more information.

### concurrent-plugin-versions

Sets the number of concurrent plugin versions. Environment variable will be ignored. See the `CONCURRENT_PLUGIN_VERSIONS` [environment variable](#environment-variables) for more information.

### concurrent-downloads

Sets the number of concurrent downloads. Environment variable will be ignored. See the `CONCURRENT_DOWNLOADS` [environment variable](#environment-variables) for more information.
