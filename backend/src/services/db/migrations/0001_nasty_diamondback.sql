CREATE TABLE `feed_plugins` (
	`feed_id` text NOT NULL,
	`plugin_id` text NOT NULL,
	`config` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text,
	PRIMARY KEY(`feed_id`, `plugin_id`),
	FOREIGN KEY (`feed_id`) REFERENCES `feeds`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `feed_plugins_feed_idx` ON `feed_plugins` (`feed_id`);--> statement-breakpoint
CREATE INDEX `feed_plugins_plugin_idx` ON `feed_plugins` (`plugin_id`);--> statement-breakpoint
CREATE TABLE `twitter_cache` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text
);
--> statement-breakpoint
CREATE TABLE `twitter_cookies` (
	`username` text PRIMARY KEY NOT NULL,
	`cookies` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text
);
--> statement-breakpoint
CREATE TABLE `rss_items` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`feed_id` text NOT NULL,
	`title` text,
	`content` text NOT NULL,
	`link` text,
	`guid` text,
	`published_at` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text,
	FOREIGN KEY (`feed_id`) REFERENCES `feeds`(`id`) ON UPDATE no action ON DELETE cascade
);
