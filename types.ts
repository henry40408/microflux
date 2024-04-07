export interface KagiSummaryRequest {
  target_language?: string;
  text?: string;
  url?: string;
}

export interface KagiSummary {
  meta: {
    id: string;
    ms: number;
    node: string;
  };
  data: {
    output: string;
    tokens: number;
  };
}

export interface KagiSummarizeResponse {
  summary: string;
  tokens: number;
}

export interface LinkdingBookmark {
  id: number;
  url: string;
  title: string;
  description: string;
  notes: string;
  website_title: string;
  website_description: string;
  web_archive_snapshot_url: string;
  is_archived: boolean;
  unread: boolean;
  shared: boolean;
  tag_names: string[];
  date_added: string;
  date_modified: string;
}

export interface LinkdingBookmarks {
  count: number;
  results: LinkdingBookmark[];
}

export interface LinkdingBookmarksResponse {
  bookmarks: LinkdingBookmark[];
  count: number;
}

export type MinifluxEntryStatus = "read" | "unread";

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
  enclosures: any;
  feed: {
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
    category: {
      id: number;
      user_id: number;
      title: string;
    };
    icon: {
      feed_id: number;
      icon_id: number;
    };
  };
}

export interface MinifluxEntries {
  entries: MinifluxEntry[];
}

export interface MinifluxEntriesResponse {
  entries: MinifluxEntry[];
  counters: { unreads: Record<string, number> };
}

export interface MinifluxUnreadCounters {
  reads: {
    [key: string]: number;
  };
  unreads: {
    [key: string]: number;
  };
}

export interface ReadabilityResponse {
  content: string;
  length: number;
  textContent: string;
}
