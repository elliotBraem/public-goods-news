-- Drop existing indexes first
DROP INDEX IF EXISTS `submissions_user_id_idx`;--> statement-breakpoint
DROP INDEX IF EXISTS `submissions_submitted_at_idx`;--> statement-breakpoint
DROP INDEX IF EXISTS `submissions_status_idx`;--> statement-breakpoint
DROP INDEX IF EXISTS `submissions_acknowledgment_idx`;--> statement-breakpoint
DROP INDEX IF EXISTS `submissions_acknowledgment_tweet_id_unique`;--> statement-breakpoint

-- Create new submissions table with updated schema
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
);--> statement-breakpoint

-- Copy data to new table
INSERT INTO `__new_submissions` (
    `tweet_id`,
    `user_id`,
    `username`,
    `curator_id`,
    `curator_username`,
    `curator_tweet_id`,
    `content`,
    `curator_notes`,
    `submitted_at`,
    `created_at`,
    `updated_at`
)
SELECT 
    `tweet_id`,
    `user_id`,
    `username`,
    `curator_id`,
    `curator_username`,
    `content`,
    `description`,
    `submitted_at`,
    `created_at`,
    `updated_at`
FROM `submissions`;--> statement-breakpoint

-- Add columns to submission_feeds
ALTER TABLE `submission_feeds` ADD COLUMN `status` text DEFAULT 'pending' NOT NULL;--> statement-breakpoint
ALTER TABLE `submission_feeds` ADD COLUMN `moderation_response_tweet_id` text;--> statement-breakpoint

-- Copy status from submissions to submission_feeds
UPDATE submission_feeds 
SET status = (
    SELECT status 
    FROM submissions 
    WHERE submissions.tweet_id = submission_feeds.submission_id
);--> statement-breakpoint

-- Drop old submissions table and rename new one
DROP TABLE `submissions`;--> statement-breakpoint
ALTER TABLE `__new_submissions` RENAME TO `submissions`;--> statement-breakpoint

-- Add feed_id to moderation_history
ALTER TABLE `moderation_history` ADD COLUMN `feed_id` text NOT NULL REFERENCES feeds(id);--> statement-breakpoint

-- Recreate indexes
CREATE INDEX IF NOT EXISTS `submissions_user_id_idx` ON `submissions` (`user_id`);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `submissions_submitted_at_idx` ON `submissions` (`submitted_at`);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `moderation_history_feed_idx` ON `moderation_history` (`feed_id`);--> statement-breakpoint

PRAGMA foreign_keys=ON;
