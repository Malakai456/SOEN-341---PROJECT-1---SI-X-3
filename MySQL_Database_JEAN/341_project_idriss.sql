-- 1. Add a price column to the events table (Requirement 4.3.3)
ALTER TABLE `events` 
ADD COLUMN `price` DECIMAL(10, 2) NOT NULL DEFAULT 0.00 AFTER `ticket_policy`;

-- 2. Create the purchases table with Foreign Keys (Requirements 4.3.5 & 4.3.6)
CREATE TABLE `purchases` (
  `purchase_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `event_id` bigint(20) UNSIGNED NOT NULL,
  `price_paid` decimal(10,2) NOT NULL,
  `purchase_date` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`purchase_id`),
  KEY `user_id` (`user_id`),
  KEY `event_id` (`event_id`),
  CONSTRAINT `purchases_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `purchases_ibfk_2` FOREIGN KEY (`event_id`) REFERENCES `events` (`event_id`) ON DELETE CASCADE ON UPDATE CASCADE
) 