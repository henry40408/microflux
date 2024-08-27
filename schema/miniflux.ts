import { z } from "zod";

const MinifluxCategoryScheme = z.object({
  id: z.number().int(),
  title: z.string(),
});

const MinifluxFeedScheme = z.object({
  id: z.number().int(),
  user_id: z.number().int(),
  feed_url: z.string(),
  site_url: z.string(),
  title: z.string(),
  checked_at: z.string().optional(),
  etag_header: z.string().optional(),
  last_modified_header: z.string().optional(),
  parsing_error_message: z.string().optional(),
  parsing_error_count: z.number().int().optional(),
  disabled: z.boolean(),
  ignore_http_cache: z.boolean(),
  allow_self_signed_certificates: z.boolean(),
  fetch_via_proxy: z.boolean(),
  scraper_rules: z.string(),
  rewrite_rules: z.string(),
  blocklist_rules: z.string(),
  keeplist_rules: z.string(),
  crawler: z.boolean(),
  user_agent: z.string(),
  cookie: z.string(),
  username: z.string(),
  password: z.string(),
  category: MinifluxCategoryScheme.optional(),
  hide_globally: z.boolean(),
  disable_http2: z.boolean(),
});

const MinifluxFeedIconScheme = z.object({
  id: z.number().int(),
  mime_type: z.string(),
  data: z.string(),
});

const MinifluxEnclosureScheme = z.object({
  id: z.number().int(),
  user_id: z.number().int(),
  entry_id: z.number().int(),
  url: z.string(),
  mime_type: z.string(),
  size: z.number().int(),
  media_progression: z.number().int(),
});

const MinifluxEntryScheme = z.object({
  id: z.number().int(),
  user_id: z.number().int(),
  feed_id: z.number().int(),
  title: z.string(),
  url: z.string(),
  comments_url: z.string(),
  author: z.string(),
  content: z.string(),
  hash: z.string(),
  published_at: z.string(),
  created_at: z.string(),
  changed_at: z.string(),
  status: z.string(),
  share_code: z.string(),
  starred: z.boolean(),
  reading_time: z.number().int(),
  enclosures: z.array(MinifluxEnclosureScheme).optional(),
  feed: MinifluxFeedScheme,
  tags: z.union([z.null(), z.array(z.string())]),
});

const MinifluxEntryResultSetScheme = z.object({
  total: z.number().int(),
  entries: z.array(MinifluxEntryScheme),
});

const MinifluxFetchContentScheme = z.object({
  content: z.string(),
});

type MinifluxCategory = z.infer<typeof MinifluxCategoryScheme>;
type MinifluxFeed = z.infer<typeof MinifluxFeedScheme>;
type MinifluxFeedIcon = z.infer<typeof MinifluxFeedIconScheme>;
type MinifluxEnclosure = z.infer<typeof MinifluxEnclosureScheme>;
type MinifluxEntry = z.infer<typeof MinifluxEntryScheme>;
type MinifluxEntryResultSet = z.infer<typeof MinifluxEntryResultSetScheme>;
type MinifluxFetchContent = z.infer<typeof MinifluxFetchContentScheme>;

export {
  MinifluxCategoryScheme,
  MinifluxFeedScheme,
  MinifluxFeedIconScheme,
  MinifluxEnclosureScheme,
  MinifluxEntryScheme,
  MinifluxEntryResultSetScheme,
  MinifluxFetchContentScheme,
};

export type {
  MinifluxCategory,
  MinifluxFeed,
  MinifluxFeedIcon,
  MinifluxEnclosure,
  MinifluxEntry,
  MinifluxEntryResultSet,
  MinifluxFetchContent,
};
