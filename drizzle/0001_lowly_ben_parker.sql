CREATE TABLE `downloads` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sessionId` varchar(128) NOT NULL,
	`url` text NOT NULL,
	`title` text,
	`thumbnail` text,
	`platform` varchar(64),
	`format` varchar(32),
	`duration` int,
	`status` enum('pending','completed','error') NOT NULL DEFAULT 'completed',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `downloads_id` PRIMARY KEY(`id`)
);
