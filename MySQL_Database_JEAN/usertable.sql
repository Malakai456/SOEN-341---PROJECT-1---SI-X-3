USE 341_project_sara;

ALTER TABLE users
ADD COLUMN address VARCHAR(70)
ADD COLUMN user_role ENUM('admin','event organizer','user') NOT NULL DEFAULT user;