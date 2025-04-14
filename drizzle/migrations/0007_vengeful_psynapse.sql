CREATE TABLE `tags` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`tagname` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `tags_tagname_unique` ON `tags` (`tagname`);--> statement-breakpoint
CREATE TABLE `persons_to_tags` (
	`person_id` integer NOT NULL,
	`tag_id` integer NOT NULL,
	PRIMARY KEY(`person_id`, `tag_id`),
	FOREIGN KEY (`person_id`) REFERENCES `person`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`tag_id`) REFERENCES `tags`(`id`) ON UPDATE no action ON DELETE restrict
);
