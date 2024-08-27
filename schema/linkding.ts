import { z } from "zod";

const LinkdingBookmarkSchema = z.object({
  id: z.number(),
  url: z.string().url(),
  title: z.string(),
  description: z.string(),
  notes: z.string(),
  website_title: z.string().nullable(),
  website_description: z.string().nullable(),
  web_archive_snapshot_url: z.string().optional(),
  favicon_url: z.string().optional(),
  preview_image_url: z.string().optional(),
  is_archived: z.boolean(),
  unread: z.boolean(),
  shared: z.boolean(),
  tag_names: z.array(z.string()),
  date_added: z.string().datetime(),
  date_modified: z.string().datetime(),
});

const LinkdingBookmarkPaginationResponseSchema = z.object({
  count: z.number(),
  next: z.string().url().nullable(),
  previous: z.string().url().nullable(),
  results: z.array(LinkdingBookmarkSchema),
});

type LinkdingBookmark = z.infer<typeof LinkdingBookmarkSchema>;
type LinkdingBookmarkPaginationResponse = z.infer<
  typeof LinkdingBookmarkPaginationResponseSchema
>;

export { LinkdingBookmarkSchema, LinkdingBookmarkPaginationResponseSchema };

export type { LinkdingBookmark, LinkdingBookmarkPaginationResponse };
