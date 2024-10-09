export function getQueueTitle(key: string) {
  switch (key) {
    case "resource":
      return "Resources";
    case "download":
      return "Downloads";
    case "file":
      return "Files";
    default:
      return key;
  }
}
