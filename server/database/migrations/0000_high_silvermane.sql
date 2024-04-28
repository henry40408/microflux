CREATE TABLE `keywords` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`keyword` text NOT NULL,
	`feed_id` integer,
	`category_id` integer,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL
);
