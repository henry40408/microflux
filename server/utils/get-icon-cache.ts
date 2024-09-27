import QuickLRU from "quick-lru";

export interface IconBlob {
  id: number;
  icon: Buffer;
  mimeType: string;
}

const iconCache = new QuickLRU<string, IconBlob>({ maxSize: 2000 });

export function getIconCache() {
  return iconCache;
}
