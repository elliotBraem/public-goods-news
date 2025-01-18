PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_submissions` (
	`tweet_id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`username` text NOT NULL,
	`curator_id` text NOT NULL,
	`curator_username` text NOT NULL,
	`curator_tweet_id` text NOT NULL,
	`content` text NOT NULL,
	`curator_notes` text,
	`submitted_at` text,
	`created_at` text NOT NULL,
	`updated_at` text
);
--> statement-breakpoint
INSERT INTO `__new_submissions`("tweet_id", "user_id", "username", "curator_id", "curator_username", "curator_tweet_id", "content", "curator_notes", "submitted_at", "created_at", "updated_at") SELECT "tweet_id", "user_id", "username", "curator_id", "curator_username", "curator_tweet_id", "content", "curator_notes", "submitted_at", "created_at", "updated_at" FROM `submissions`;--> statement-breakpoint
DROP TABLE `submissions`;--> statement-breakpoint
ALTER TABLE `__new_submissions` RENAME TO `submissions`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
UPDATE INDEX `submissions_user_id_idx` ON `submissions` (`user_id`);--> statement-breakpoint
CREATE INDEX `submissions_submitted_at_idx` ON `submissions` (`submitted_at`);--> statement-breakpoint
ALTER TABLE `moderation_history` ADD `feed_id` text NOT NULL REFERENCES feeds(id);--> statement-breakpoint
CREATE INDEX `moderation_history_feed_idx` ON `moderation_history` (`feed_id`);--> statement-breakpoint
ALTER TABLE `submission_feeds` ADD `status` text DEFAULT 'pending' NOT NULL;--> statement-breakpoint
ALTER TABLE `submission_feeds` ADD `moderation_response_tweet_id` text;