PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_person` (
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
	`longitude` real DEFAULT 0,
	`publications` text DEFAULT '',
	`status` text DEFAULT 'frequent'
);
--> statement-breakpoint
INSERT INTO `__new_person`("id", "name", "block", "unit", "street", "contact", "category", "remarks", "date", "latitude", "longitude", "publications", "status") SELECT "id", "name", "block", "unit", "street", "contact", "category", "remarks", "date", "latitude", "longitude", "publications", "status" FROM `person`;--> statement-breakpoint
DROP TABLE `person`;--> statement-breakpoint
ALTER TABLE `__new_person` RENAME TO `person`;--> statement-breakpoint
PRAGMA foreign_keys=ON;