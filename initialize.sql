CREATE DATABASE studyboard default CHARACTER SET utf8;
CREATE TABLE `user` (
	`id`	VARCHAR(255)	NOT NULL,
	`pw`	VARCHAR(255)	NOT NULL,
	`name`	VARCHAR(255)	NOT NULL,
	`email`	VARCHAR(255)	NOT NULL,
	`ip`	VARCHAR(255)	NOT NULL,
	`updated_at`	VARCHAR(255)	NOT NULL,
	`created_at`	VARCHAR(255)	NOT NULL
);

CREATE TABLE `studyroom` (
	`id`	VARCHAR(255)	NOT NULL,
	`name`	VARCHAR(255)	NOT NULL,
	`description`	VARCHAR(255)	NULL,
	`lesson`	json	NULL,
	`updated_at`	VARCHAR(255)	NOT NULL,
	`created_at`	VARCHAR(255)	NOT NULL
);

CREATE TABLE `user_room` (
	`id`	VARCHAR(255)	NOT NULL,
	`user_id`	VARCHAR(255)	NOT NULL,
	`studyroom_id`	VARCHAR(255)	NOT NULL,
	`role`	VARCHAR(255)	NOT NULL	COMMENT 'role: owner, admin, member, invited',
	`updated_at`	VARCHAR(255)	NOT NULL,
	`created_at`	VARCHAR(255)	NOT NULL
);

CREATE TABLE `resource` (
	`id`	VARCHAR(255)	NOT NULL,
	`studyroom_id`	VARCHAR(255)	NOT NULL,
	`name`	VARCHAR(255)	NOT NULL,
	`uri`	VARCHAR(255)	NOT NULL
);

ALTER TABLE `user` ADD CONSTRAINT `PK_USER` PRIMARY KEY (
	`id`
);

ALTER TABLE `studyroom` ADD CONSTRAINT `PK_STUDYROOM` PRIMARY KEY (
	`id`
);

ALTER TABLE `user_room` ADD CONSTRAINT `PK_USER_ROOM` PRIMARY KEY (
	`id`
);

ALTER TABLE `resource` ADD CONSTRAINT `PK_RESOURCE` PRIMARY KEY (
	`id`,
);

ALTER TABLE `user_room` ADD CONSTRAINT `FK_user_TO_user_room_1` FOREIGN KEY (
	`user_id`
)
REFERENCES `user` (
	`id`
);

ALTER TABLE `resource` ADD CONSTRAINT `FK_studyroom_TO_resource_1` FOREIGN KEY (
	`studyroom_id`
)
REFERENCES `studyroom` (
	`id`
);
