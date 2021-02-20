CREATE DATABASE IF NOT EXISTS `guess_the_author` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE `guess_the_author`;

CREATE TABLE `guild` (
  `id` char(18) NOT NULL,
  `prefix` varchar(5) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `message` (
  `id` char(18) NOT NULL,
  `author_id` char(18) NOT NULL,
  `content` text NOT NULL,
  `channel_id` char(18) NOT NULL,
  `time` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
COMMIT;

