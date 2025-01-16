CREATE TABLE `report` (
	`id` integer PRIMARY KEY NOT NULL,
	`date` text,
	`hrs` real DEFAULT 0,
	`bs` integer DEFAULT 0,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL
);
