CREATE TABLE `assignments` (
	`id` integer PRIMARY KEY NOT NULL,
	`publisher` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `reminders` (
	`id` integer PRIMARY KEY NOT NULL,
	`reminder` text NOT NULL,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL
);
