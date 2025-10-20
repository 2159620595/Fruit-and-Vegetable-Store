-- ============================================
-- 快速诊断数据库问题
-- ============================================

-- 1. 检查数据库是否存在
SHOW DATABASES LIKE '%harvest%';

-- 2. 检查当前使用的数据库
SELECT DATABASE() AS '当前数据库';

-- 3. 尝试切换数据库
USE `fresh_harvest`;

-- 4. 查看所有表
SHOW TABLES;

-- 5. 查看表数量（如果上面的查询成功）
SELECT 
  COUNT(*) AS '表总数',
  GROUP_CONCAT(table_name SEPARATOR ', ') AS '表名列表'
FROM information_schema.TABLES
WHERE table_schema = DATABASE();

-- 6. 检查是否有用户表（注意大小写）
SELECT table_name AS '找到的用户相关表'
FROM information_schema.TABLES
WHERE table_schema = DATABASE()
  AND LOWER(table_name) LIKE '%user%';

-- 7. 显示数据库字符集
SHOW VARIABLES LIKE 'character_set%';

-- 8. 显示表名大小写敏感设置
SHOW VARIABLES LIKE 'lower_case_table_names';

