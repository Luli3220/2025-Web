-- 简化专业表结构，只保留必要字段
ALTER TABLE majors
DROP COLUMN IF EXISTS job_prospects,
DROP COLUMN IF EXISTS admission_guide,
DROP COLUMN IF EXISTS full_content,
DROP COLUMN IF EXISTS major_code;

-- 确保source_url字段存在
ALTER TABLE majors
ADD COLUMN IF NOT EXISTS source_url VARCHAR(255) COMMENT '外部链接';

-- 更新source_url字段，将zylj字段的值转换为完整URL
UPDATE majors m
JOIN (
    SELECT major_name, CONCAT('https://gaokao.chsi.com.cn', zylj) AS full_url
    FROM url_json_data
) u ON m.major_name = u.major_name
SET m.source_url = u.full_url
WHERE m.source_url IS NULL OR m.source_url = '';

-- 注意：此脚本假设已经将url.json中的数据导入到名为url_json_data的临时表中
-- 实际使用时，需要先创建临时表并导入数据，或者直接在应用程序中处理