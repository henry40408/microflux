import pangu from "pangu";

import type { LinkdingBookmark } from "@/types";

export function getLinkdingTitle(bookmark: LinkdingBookmark): string {
  return bookmark.title || bookmark.website_title;
}

export function getLinkdingDescription(bookmark: LinkdingBookmark): string {
  return bookmark.description || bookmark.website_description;
}

export const { format: formatNumber } = Intl.NumberFormat("en-US");

export function formatDate(date: Date) {
  const formatter = new Intl.DateTimeFormat(navigator.language, {
    dateStyle: "medium",
    timeStyle: "medium",
  });
  return pangu.spacing(formatter.format(new Date(date)));
}
