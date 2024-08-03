CREATE TABLE `person` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text,
	`block` text DEFAULT 'NA',
	`unit` text DEFAULT 'NA',
	`street` text DEFAULT 'NA',
	`contact` text,
	`category` text DEFAULT 'CA',
	`remarks` text,
	`date` text,
	`latitude` real DEFAULT 0,
	`longitude` real DEFAULT 0
);
