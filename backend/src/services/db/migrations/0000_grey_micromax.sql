CREATE TABLE `feeds` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`created_at` text NOT NULL,
	`updated_at` text
);
--> statement-breakpoint
CREATE TABLE `moderation_history` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`tweet_id` text NOT NULL,
	`admin_id` text NOT NULL,
	`action` text NOT NULL,
	`note` text,
	`created_at` text NOT NULL,
	`updated_at` text,
	FOREIGN KEY (`tweet_id`) REFERENCES `submissions`(`tweet_id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `moderation_history_tweet_idx` ON `moderation_history` (`tweet_id`);--> statement-breakpoint
CREATE INDEX `moderation_history_admin_idx` ON `moderation_history` (`admin_id`);--> statement-breakpoint
CREATE TABLE `submission_counts` (
	`user_id` text PRIMARY KEY NOT NULL,
	`count` integer DEFAULT 0 NOT NULL,
	`last_reset_date` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text
);
--> statement-breakpoint
CREATE INDEX `submission_counts_date_idx` ON `submission_counts` (`last_reset_date`);--> statement-breakpoint
CREATE TABLE `submission_feeds` (
	`submission_id` text NOT NULL,
	`feed_id` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text,
	PRIMARY KEY(`submission_id`, `feed_id`),
	FOREIGN KEY (`submission_id`) REFERENCES `submissions`(`tweet_id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`feed_id`) REFERENCES `feeds`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `submission_feeds_feed_idx` ON `submission_feeds` (`feed_id`);--> statement-breakpoint
CREATE TABLE `submissions` (
	`tweet_id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`username` text NOT NULL,
	`content` text NOT NULL,
	`description` text,
	`status` text DEFAULT 'pending' NOT NULL,
	`acknowledgment_tweet_id` text,
	`moderation_response_tweet_id` text,
	`submitted_at` text,
	`created_at` text NOT NULL,
	`updated_at` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `submissions_acknowledgment_tweet_id_unique` ON `submissions` (`acknowledgment_tweet_id`);--> statement-breakpoint
CREATE INDEX `submissions_user_id_idx` ON `submissions` (`user_id`);--> statement-breakpoint
CREATE INDEX `submissions_status_idx` ON `submissions` (`status`);--> statement-breakpoint
CREATE INDEX `submissions_acknowledgment_idx` ON `submissions` (`acknowledgment_tweet_id`);--> statement-breakpoint
CREATE INDEX `submissions_submitted_at_idx` ON `submissions` (`submitted_at`);