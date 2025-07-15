-- majors_db.majors definition

CREATE TABLE `majors` (
  `major_id` int NOT NULL AUTO_INCREMENT,
  `category_id` int NOT NULL COMMENT '所属专业大类ID',
  `major_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '专业名称',
  `summary` text COLLATE utf8mb4_unicode_ci COMMENT '专业解析（简要介绍）',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `source_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`major_id`),
  KEY `category_id` (`category_id`),
  CONSTRAINT `majors_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `major_categories` (`category_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=102 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;