ALTER TABLE `submissions` ADD `curator_id` text DEFAULT 'system' NOT NULL;--> statement-breakpoint
ALTER TABLE `submissions` ADD `curator_username` text DEFAULT 'system' NOT NULL;