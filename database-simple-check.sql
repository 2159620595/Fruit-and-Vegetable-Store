-- ============================================
-- 简单的数据库检查脚本
-- ============================================

-- 首先检查数据库是否存在
SHOW DATABASES LIKE 'fresh_harvest';

-- 切换到数据库
USE `fresh_harvest`;

-- 显示所有表
SHOW TABLES;

-- 统计表的数量
SELECT COUNT(*) AS '表数量'
FROM information_schema.TABLES
WHERE table_schema = 'fresh_harvest';

-- 列出所有表名
SELECT table_name AS '表名'
FROM information_schema.TABLES
WHERE table_schema = 'fresh_harvest'
ORDER BY table_name;

