export interface KaigSummary {
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

export interface LinkdingBookmarks {
  count: number;
  results: LinkdingBookmark[];
}

export interface LinkdingBookmark {
  description: string;
  id: number;
  title: string;
  url: string;
  website_description: string;
  website_title: string;
}

export type MinifluxEntryStatus = "read" | "unread";

export interface MinifluxEntry {
  content: string;
  id: number;
  title: string;
  url: string;
  status: MinifluxEntryStatus;
}

export interface MinifluxEntries {
  entries: MinifluxEntry[];
}

export interface MinifluxUnreadCounters {
  reads: {
    [key: string]: number;
  };
  unreads: {
    [key: string]: number;
  };
}
