// external interfaces

// https://help.kagi.com/kagi/api/summarizer.html#summarize-document
export interface KagiSummaryRequest {
  url?: string; // URL to a document to summarize. Exclusive with text.
  text?: string; // Text to summarize. Exclusive with url.
  engine?: string; // Summarization engine
  summary_type?: string; // Type of summary
  target_language?: string; // Desired output language
  cache?: boolean; // Whether to allow cached requests & responses. Default is true.
}

// https://help.kagi.com/kagi/api/summarizer.html#summarize-document
export interface KagiSummary {
  meta: {
    id: string;
    node: string;
    ms: number;
  };
  data: {
    output: string;
    tokens: number;
  };
}

// https://github.com/sissbruecker/linkding/blob/bb6c5ca29e3b66a70c2ff1751ea6183c7011d4ae/docs/API.md#bookmarks
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

// https://github.com/sissbruecker/linkding/blob/bb6c5ca29e3b66a70c2ff1751ea6183c7011d4ae/docs/API.md#bookmarks
export interface LinkdingBookmarks {
  count: number;
  results: LinkdingBookmark[];
}

// https://miniflux.app/docs/api.html#endpoint-get-entries
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
  status: MinifluxEntryStatus;
  share_code: string;
  starred: boolean;
  reading_time: number;
  enclosures: unknown;
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

// https://miniflux.app/docs/api.html#endpoint-get-entries
export interface MinifluxEntries {
  total: number;
  entries: MinifluxEntry[];
}

// https://miniflux.app/docs/api.html#endpoint-counters
export interface MinifluxUnreadCounters {
  reads: {
    [key: string]: number;
  };
  unreads: {
    [key: string]: number;
  };
}

// internal interfaces

export type MinifluxEntryStatus = "read" | "unread";

export interface KagiSummarizeResponse {
  summary: string;
  tokens: number;
}

export type CompactLinkdingBookmark = Pick<
  LinkdingBookmark,
  | "date_added"
  | "description"
  | "id"
  | "title"
  | "url"
  | "website_description"
  | "website_title"
>;
export interface LinkdingBookmarksResponse {
  bookmarks: CompactLinkdingBookmark[];
  count: number;
}

export type CompactMinifluxCategory = Pick<
  MinifluxEntry["feed"]["category"],
  "id" | "title"
>;
export type CompactMinifluxFeed = Pick<
  MinifluxEntry["feed"],
  "id" | "title"
> & { category: CompactMinifluxCategory };
export type CompactMinifluxEntry = Pick<
  MinifluxEntry,
  "content" | "id" | "status" | "title" | "url"
> & { feed: CompactMinifluxFeed };
export interface MinifluxEntriesResponse {
  entries: CompactMinifluxEntry[];
  counters: { unreads: Record<string, number> };
}

export interface ReadabilityResponse {
  content: string;
  length: number;
  textContent: string;
}

export enum OptionNames {
  ReadabilityContent = "readability-content",
  ReadabilityBeforeSummarization = "readability-before-summarization",
}

export enum ReadabilityContent {
  Content = "content",
  TextContent = "textContent",
}
