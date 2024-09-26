export interface MinifluxCategory {
  id: number;
  title: string;
}

export interface MinifluxFeed {
  id: number;
  user_id: number;
  feed_url: string;
  site_url: string;
  title: string;
  checked_at?: string;
  etag_header?: string;
  last_modified_header?: string;
  parsing_error_message?: string;
  parsing_error_count?: number;
  disabled: boolean;
  ignore_http_cache: boolean;
  allow_self_signed_certificates: boolean;
  fetch_via_proxy: boolean;
  scraper_rules: string;
  rewrite_rules: string;
  blocklist_rules: string;
  keeplist_rules: string;
  crawler: boolean;
  user_agent: string;
  cookie: string;
  username: string;
  password: string;
  category?: MinifluxCategory;
  hide_globally: boolean;
  disable_http2: boolean;
  icon: { feed_id: number; icon_id: number } | null;
}

export interface MinifluxIcon {
  id: number;
  mime_type: string;
  data: string;
}

export interface MinifluxEnclosure {
  id: number;
  user_id: number;
  entry_id: number;
  url: string;
  mime_type: string;
  size: number;
  media_progression: number;
}

export interface MinifluxEntry {
  id: number;
  user_id: number;
  feed_id: number;
  title: string;
  url: string;
  comments_url: string;
  author: string;
  content: string;
  hash: string;
  published_at: string;
  created_at: string;
  changed_at: string;
  status: string;
  share_code: string;
  starred: boolean;
  reading_time: number;
  enclosures?: MinifluxEnclosure[];
  feed: MinifluxFeed;
  tags: null | string[];
}

export interface MinifluxEntryResultSet {
  total: number;
  entries: MinifluxEntry[];
}

export interface MinifluxFetchContent {
  content: string;
}
