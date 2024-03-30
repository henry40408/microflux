import type { LinkdingBookmark } from "@/types";

export function getLinkdingTitle(bookmark: LinkdingBookmark): string {
  return bookmark.title || bookmark.website_title;
}

export function getLinkdingDescription(bookmark: LinkdingBookmark): string {
  return bookmark.description || bookmark.website_description;
}
