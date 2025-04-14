CREATE TABLE `follow_up` (
	`id` integer PRIMARY KEY NOT NULL,
	`person_id` integer NOT NULL,
	`date` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`notes` text NOT NULL,
	FOREIGN KEY (`person_id`) REFERENCES `person`(`id`) ON UPDATE no action ON DELETE cascade
);
