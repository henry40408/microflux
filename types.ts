// kagi

export interface KagiSummarizeResponse {
  output_text: string;
  output_data: KagiSummarizeOutputData;
  tokens: number;
  type: string;
}

export interface KagiSummarizeOutputData {
  status: string;
  word_stats: KagiSummarizeWordStats;
  elapsed_seconds: number;
  markdown: string;
  // citations_json: any[]; // Assuming it's an array, but it's empty in the example
  citation_snippets: string;
  // references: any[]; // Assuming it's an array, but it's empty in the example
  md_references: string;
  references_text: string;
  response_metadata: KagiSummarizeResponseMetadata;
  // images: any[]; // Assuming it's an array, but it's empty in the example
}

export interface KagiSummarizeWordStats {
  n_tokens: number;
  n_words: number;
  n_pages: number;
  time_saved: number;
  length: null; // Assuming it's always null based on the example
}

export interface KagiSummarizeResponseMetadata {
  speed: number;
  tokens: number;
  total_time_second: number;
  model: string;
}

// linkding

export interface LinkdingPaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
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
  favicon_url: string;
  preview_image_url: string;
  is_archived: boolean;
  unread: boolean;
  shared: boolean;
  tag_names: string[];
  date_added: string;
  date_modified: string;
}

export type LinkdingBookmarkResponse =
  LinkdingPaginatedResponse<LinkdingBookmark>;

// miniflux

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
  // enclosures: null | any[]; // Assuming it could be an array if not null
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

export interface MinifluxFetchContentResponse {
  content: string;
}
