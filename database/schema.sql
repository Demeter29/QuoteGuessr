CREATE DATABASE IF NOT EXISTS `quote_guessr` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE `quote_guessr`;

CREATE TABLE `channel` (
  `id` varchar(18) NOT NULL,
  `guild_id` varchar(18) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `guild` (
  `id` char(18) NOT NULL,
  `prefix` varchar(5) NOT NULL DEFAULT '==',
  `is_setup` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `message` (
  `id` char(18) NOT NULL,
  `author_id` char(18) NOT NULL,
  `content` text NOT NULL,
  `channel_id` char(18) NOT NULL,
  `guild_id` char(18) NOT NULL,
  `time` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `user` (
  `id` int(11) NOT NULL,
  `user_id` char(18) NOT NULL,
  `guild_id` char(18) NOT NULL,
  `single_games_played` int(11) NOT NULL DEFAULT 0,
  `single_games_won` int(11) NOT NULL DEFAULT 0,
  `current_winstreak` int(11) NOT NULL DEFAULT 0,
  `highest_winstreak` int(11) NOT NULL DEFAULT 0,
  `points` int(11) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


ALTER TABLE `channel`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `guild`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `message`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `user`
  ADD PRIMARY KEY (`id`);


ALTER TABLE `user`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
COMMIT;