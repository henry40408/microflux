export interface LinkdingBookmark {
  id: number;
  url: string;
  title: string;
  description: string;
  notes: string;
  website_title: string | null;
  website_description: string | null;
  web_archive_snapshot_url?: string;
  favicon_url?: string;
  preview_image_url?: string | null;
  is_archived: boolean;
  unread: boolean;
  shared: boolean;
  tag_names: string[];
  date_added: string;
  date_modified: string;
}

export interface LinkdingBookmarkPaginationResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: LinkdingBookmark[];
}
