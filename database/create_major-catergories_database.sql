-- majors_db.major_categories definition

CREATE TABLE `major_categories` (
  `category_id` int NOT NULL AUTO_INCREMENT,
  `category_name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '专业大类名称，如工学、理学等',
  `description` text COLLATE utf8mb4_unicode_ci COMMENT '专业大类的简要描述',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`category_id`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 插入13个专业大类数据
INSERT INTO major_categories (category_name, description) VALUES
('哲学', '哲学类专业主要研究人与世界的根本关系，探讨真理、价值等基本问题'),
('经济学', '经济学类专业主要研究经济现象和经济关系的发生、发展规律'),
('法学', '法学类专业主要研究法律规范、法律现象和法律制度'),
('教育学', '教育学类专业主要研究教育规律和教育实践'),
('文学', '文学类专业主要研究语言、文学、新闻传播等人文学科'),
('历史学', '历史学类专业主要研究人类社会的历史发展规律'),
('理学', '理学类专业主要研究自然科学的基本理论和方法'),
('工学', '工学类专业主要研究工程技术的理论与应用'),
('农学', '农学类专业主要研究农业生产的理论与技术'),
('医学', '医学类专业主要研究人体健康与疾病防治'),
('管理学', '管理学类专业主要研究组织管理的规律和方法'),
('艺术学', '艺术学类专业主要研究艺术创作和艺术理论'),
('军事学', '军事学类专业主要研究国防和军队建设的理论与实践');

