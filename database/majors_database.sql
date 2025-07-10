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

-- 插入部分示例专业数据
INSERT INTO majors (category_id, major_name, major_code, summary, employment_prospects, application_guide) VALUES
(8, '计算机科学与技术', '080901', 
'计算机科学与技术专业培养具备计算机系统设计、开发与应用能力的高级专门人才。学习内容包括计算机硬件、软件、网络等方面的基础理论和专业知识。', 
'毕业生可在IT企业、互联网公司、科研机构等单位从事软件开发、系统维护、技术支持等工作。就业前景广阔，薪资水平较高。', 
'适合对计算机和编程有浓厚兴趣的学生报考，需要较强的逻辑思维能力和数学基础。'),

(8, '软件工程', '080902', 
'软件工程专业培养能够从事软件开发、测试、维护和项目管理的专业人才。学习内容包括软件设计方法、开发技术、质量保证等。', 
'毕业生可在软件公司、互联网企业、金融机构等从事软件开发、测试、项目管理等工作。就业前景良好，人才需求量大。', 
'适合对编程有兴趣且具备一定逻辑思维能力的学生，需要具备团队协作精神。'),

(2, '金融学', '020301', 
'金融学专业培养具备金融理论知识和实践技能，能在金融机构和企业从事相关工作的专门人才。学习内容包括货币银行学、国际金融、证券投资等。', 
'毕业生可在银行、证券公司、保险公司、投资机构等金融单位工作，也可在企事业单位财务部门就业。', 
'适合数学基础好、对金融市场有兴趣的学生，需要较强的分析能力和抗压能力。'),

(10, '临床医学', '100201', 
'临床医学专业培养具有扎实医学理论知识和临床实践能力的医学专门人才。学习内容包括基础医学、临床医学各学科的基本理论和技能。', 
'毕业生主要在医院、卫生机构、医学院校等单位工作，从事医疗、教学、科研等工作。就业稳定，社会地位较高。', 
'学制较长（一般5-8年），需要有较强的学习能力和责任心，适合对医学有热情且愿意长期投入的学生。'),

(7, '数学与应用数学', '070101', 
'数学与应用数学专业培养具备扎实数学基础和应用能力的专业人才。学习内容包括数学分析、高等代数、概率论等理论及其应用。', 
'毕业生可在科研机构、高校、IT企业、金融机构等单位从事科研、教学、软件开发、数据分析等工作。', 
'需要较强的抽象思维能力和逻辑推理能力，适合数学基础好且有兴趣的学生。'),

(3, '法学', '030101', 
'法学专业培养具备法律专业知识，能在司法机关、行政机关和企事业单位从事法律工作的专门人才。学习内容包括法理学、宪法学、民商法学等。', 
'毕业生可在法院、检察院、律师事务所、政府机关、企事业单位法务部门等就业。就业范围广泛，发展空间大。', 
'需要较强的语言表达能力和逻辑思维能力，适合对法律有兴趣且具有正义感的学生。');