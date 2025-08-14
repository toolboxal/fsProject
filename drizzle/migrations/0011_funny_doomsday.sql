CREATE TABLE `marker_annotation` (
	`id` integer PRIMARY KEY NOT NULL,
	`latitude` real DEFAULT 0,
	`longitude` real DEFAULT 0,
	`annotation` text
);
