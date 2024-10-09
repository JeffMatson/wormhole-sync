import { initCache } from "~/utils/cache";
import { syncDotOrgPlugins } from "./repos/wporg";

function bootstrap() {
  initCache();
}

bootstrap();
await syncDotOrgPlugins();
