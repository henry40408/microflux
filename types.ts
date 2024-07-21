export interface MinifluxGetFeedEntriesResponse {
  total: number;
  entries: MinifluxEntry[];
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
  status: string;
  share_code: string;
  starred: boolean;
  reading_time: number;
  enclosures: null | any[]; // Assuming it could be an array if not null
  feed: MinifluxFeed;
}

export interface MinifluxFeed {
  id: number;
  user_id: number;
  title: string;
  site_url: string;
  feed_url: string;
  checked_at: string;
  etag_header: string;
  last_modified_header: string;
  parsing_error_message: string;
  parsing_error_count: number;
  scraper_rules: string;
  rewrite_rules: string;
  crawler: boolean;
  blocklist_rules: string;
  keeplist_rules: string;
  user_agent: string;
  username: string;
  password: string;
  disabled: boolean;
  ignore_http_cache: boolean;
  fetch_via_proxy: boolean;
  category: MinifluxCategory;
  icon: MinifluxIcon;
}

export interface MinifluxCategory {
  id: number;
  user_id: number;
  title: string;
}

export interface MinifluxIcon {
  feed_id: number;
  icon_id: number;
}
