import S3StorageProvider from "./s3";

class B2StorageProvider extends S3StorageProvider {
  constructor(config: any) {
    super(config);
  }
}

export default B2StorageProvider;
