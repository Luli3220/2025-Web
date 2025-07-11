-- 创建专业大类表
CREATE TABLE major_categories (
    category_id INT PRIMARY KEY AUTO_INCREMENT,
    category_name VARCHAR(50) NOT NULL COMMENT '专业大类名称，如工学、理学等',
    description TEXT COMMENT '专业大类的简要描述',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 创建具体专业表
CREATE TABLE majors (
    major_id INT PRIMARY KEY AUTO_INCREMENT,
    category_id INT NOT NULL COMMENT '所属专业大类ID',
    major_name VARCHAR(100) NOT NULL COMMENT '专业名称',
    major_code VARCHAR(20) COMMENT '专业代码',
    summary TEXT COMMENT '专业解析（简要介绍）',
    employment_prospects TEXT COMMENT '就业前景',
    application_guide TEXT COMMENT '报考指南',
    full_content LONGTEXT COMMENT '完整内容（详细介绍）',
    external_link VARCHAR(255) COMMENT '外部链接',
    popularity INT DEFAULT 0 COMMENT '热度指数',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES major_categories(category_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 创建专业课程表（可选，用于存储每个专业的主要课程）
CREATE TABLE major_courses (
    course_id INT PRIMARY KEY AUTO_INCREMENT,
    major_id INT NOT NULL,
    course_name VARCHAR(100) NOT NULL COMMENT '课程名称',
    course_description TEXT COMMENT '课程描述',
    is_core BOOLEAN DEFAULT FALSE COMMENT '是否核心课程',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (major_id) REFERENCES majors(major_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 创建就业方向表（可选，用于存储每个专业的具体就业方向）
CREATE TABLE career_directions (
    direction_id INT PRIMARY KEY AUTO_INCREMENT,
    major_id INT NOT NULL,
    direction_name VARCHAR(100) NOT NULL COMMENT '就业方向名称',
    direction_description TEXT COMMENT '就业方向描述',
    salary_range VARCHAR(50) COMMENT '薪资范围',
    demand_level ENUM('高', '中', '低') COMMENT '人才需求程度',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (major_id) REFERENCES majors(major_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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

