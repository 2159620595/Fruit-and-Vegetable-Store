-- ============================================
-- 检查关键字段 - 修复版（使用完全限定表名）
-- ============================================

-- 强制使用 fresh_harvest 数据库
USE `fresh_harvest`;

SELECT '========================================' AS 'INFO';
SELECT '🔍 开始检查数据库字段...' AS 'INFO';
SELECT '========================================' AS 'INFO';

-- 1. 检查 users 表的 avatar 字段
SELECT '1️⃣ 检查 users.avatar 字段' AS 'INFO';

SELECT 
  COLUMN_NAME AS '字段名',
  DATA_TYPE AS '数据类型',
  COLUMN_TYPE AS '完整类型',
  IS_NULLABLE AS '允许NULL',
  COLUMN_DEFAULT AS '默认值',
  CASE 
    WHEN DATA_TYPE IN ('text', 'mediumtext', 'longtext') THEN '✅ 类型正确'
    WHEN DATA_TYPE = 'varchar' AND CHARACTER_MAXIMUM_LENGTH >= 5000 THEN '✅ 长度足够'
    ELSE '❌ 需要修改为TEXT类型'
  END AS '状态'
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = 'fresh_harvest'
  AND TABLE_NAME = 'users'
  AND COLUMN_NAME = 'avatar';

-- 2. 检查 cart 表的 selected 字段
SELECT '' AS 'INFO';
SELECT '2️⃣ 检查 cart.selected 字段' AS 'INFO';

SELECT 
  COLUMN_NAME AS '字段名',
  DATA_TYPE AS '数据类型',
  COLUMN_TYPE AS '完整类型',
  COLUMN_DEFAULT AS '默认值',
  '✅ 字段存在' AS '状态'
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = 'fresh_harvest'
  AND TABLE_NAME = 'cart'
  AND COLUMN_NAME = 'selected'
LIMIT 1;

-- 如果上面没有结果，说明字段不存在
SELECT 
  COUNT(*) AS '字段存在数量',
  CASE 
    WHEN COUNT(*) > 0 THEN '✅ selected 字段存在'
    ELSE '❌ selected 字段不存在，需要添加'
  END AS '结果'
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = 'fresh_harvest'
  AND TABLE_NAME = 'cart'
  AND COLUMN_NAME = 'selected';

-- 3. 检查 reviews 表的 likes 和 dislikes 字段
SELECT '' AS 'INFO';
SELECT '3️⃣ 检查 reviews 表的 likes 和 dislikes 字段' AS 'INFO';

SELECT 
  COLUMN_NAME AS '字段名',
  DATA_TYPE AS '数据类型',
  COLUMN_TYPE AS '完整类型',
  IS_NULLABLE AS '允许NULL',
  COLUMN_DEFAULT AS '默认值',
  CASE 
    WHEN IS_NULLABLE = 'NO' AND COLUMN_DEFAULT = '0' THEN '✅ 配置正确'
    WHEN IS_NULLABLE = 'YES' THEN '⚠️ 允许NULL，需要修改'
    ELSE '⚠️ 需要调整默认值'
  END AS '状态'
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = 'fresh_harvest'
  AND TABLE_NAME = 'reviews'
  AND COLUMN_NAME IN ('likes', 'dislikes')
ORDER BY COLUMN_NAME;

-- 4. 检查 orders 表的 tracking_number 字段
SELECT '' AS 'INFO';
SELECT '4️⃣ 检查 orders.tracking_number 字段' AS 'INFO';

SELECT 
  COUNT(*) AS '字段存在数量',
  CASE 
    WHEN COUNT(*) > 0 THEN '✅ tracking_number 字段存在'
    ELSE '❌ tracking_number 字段不存在，需要添加'
  END AS '结果'
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = 'fresh_harvest'
  AND TABLE_NAME = 'orders'
  AND COLUMN_NAME = 'tracking_number';

-- 5. 检查 review_likes 表是否存在
SELECT '' AS 'INFO';
SELECT '5️⃣ 检查 review_likes 表' AS 'INFO';

SELECT 
  COUNT(*) AS '表存在',
  CASE 
    WHEN COUNT(*) > 0 THEN '✅ review_likes 表存在'
    ELSE '❌ review_likes 表不存在'
  END AS '结果'
FROM information_schema.TABLES
WHERE TABLE_SCHEMA = 'fresh_harvest'
  AND TABLE_NAME = 'review_likes';

-- 显示 review_likes 表结构（如果存在）
SELECT 
  COLUMN_NAME AS '字段名',
  DATA_TYPE AS '数据类型',
  COLUMN_TYPE AS '完整类型',
  COLUMN_KEY AS '键',
  EXTRA AS '额外属性'
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = 'fresh_harvest'
  AND TABLE_NAME = 'review_likes'
ORDER BY ORDINAL_POSITION;

-- 6. 检查 products 表的关键字段
SELECT '' AS 'INFO';
SELECT '6️⃣ 检查 products 表的关键字段' AS 'INFO';

SELECT 
  COLUMN_NAME AS '字段名',
  DATA_TYPE AS '数据类型',
  COLUMN_TYPE AS '完整类型',
  CASE 
    WHEN COLUMN_NAME = 'image_url' THEN '✅ 正确（不是image）'
    WHEN COLUMN_NAME IN ('id', 'name', 'price', 'stock') THEN '✅ 核心字段'
    ELSE '✅ 存在'
  END AS '状态'
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = 'fresh_harvest'
  AND TABLE_NAME = 'products'
  AND COLUMN_NAME IN ('id', 'name', 'image_url', 'price', 'stock', 'category_id', 'description', 'sales_count')
ORDER BY 
  FIELD(COLUMN_NAME, 'id', 'name', 'image_url', 'price', 'stock', 'category_id', 'description', 'sales_count');

-- 7. 检查重要索引
SELECT '' AS 'INFO';
SELECT '7️⃣ 检查重要索引' AS 'INFO';

SELECT 
  TABLE_NAME AS '表名',
  INDEX_NAME AS '索引名',
  GROUP_CONCAT(COLUMN_NAME ORDER BY SEQ_IN_INDEX SEPARATOR ', ') AS '字段',
  CASE NON_UNIQUE WHEN 0 THEN '唯一' ELSE '非唯一' END AS '类型'
FROM information_schema.STATISTICS
WHERE TABLE_SCHEMA = 'fresh_harvest'
  AND INDEX_NAME IN (
    'idx_tracking_number',
    'idx_user_status',
    'idx_user_product',
    'unique_user_review',
    'idx_review_id',
    'idx_user_id'
  )
GROUP BY TABLE_NAME, INDEX_NAME, NON_UNIQUE
ORDER BY TABLE_NAME, INDEX_NAME;

-- 8. 检查数据量（使用完全限定表名）
SELECT '' AS 'INFO';
SELECT '8️⃣ 检查基础数据量' AS 'INFO';

SELECT 
  'users' AS '表名',
  COUNT(*) AS '数据量',
  CASE WHEN COUNT(*) > 0 THEN '✅ 有数据' ELSE '⚠️ 无数据' END AS '状态'
FROM `fresh_harvest`.`users`
UNION ALL
SELECT 'products', COUNT(*), CASE WHEN COUNT(*) > 0 THEN '✅ 有数据' ELSE '⚠️ 无数据' END 
FROM `fresh_harvest`.`products`
UNION ALL
SELECT 'categories', COUNT(*), CASE WHEN COUNT(*) > 0 THEN '✅ 有数据' ELSE '⚠️ 无数据' END 
FROM `fresh_harvest`.`categories`
UNION ALL
SELECT 'orders', COUNT(*), CASE WHEN COUNT(*) > 0 THEN '✅ 有数据' ELSE '⚠️ 无数据' END 
FROM `fresh_harvest`.`orders`
UNION ALL
SELECT 'reviews', COUNT(*), CASE WHEN COUNT(*) > 0 THEN '✅ 有数据' ELSE '⚠️ 无数据' END 
FROM `fresh_harvest`.`reviews`
UNION ALL
SELECT 'cart', COUNT(*), CASE WHEN COUNT(*) > 0 THEN '✅ 有数据' ELSE '⚠️ 无数据' END 
FROM `fresh_harvest`.`cart`
UNION ALL
SELECT 'banners', COUNT(*), CASE WHEN COUNT(*) > 0 THEN '✅ 有数据' ELSE '⚠️ 无数据' END 
FROM `fresh_harvest`.`banners`;

-- 9. 总结
SELECT '' AS 'INFO';
SELECT '========================================' AS 'INFO';
SELECT '✅ 检查完成！' AS 'INFO';
SELECT '========================================' AS 'INFO';

SELECT '
📋 检查项目：
  1. users.avatar 字段类型
  2. cart.selected 字段
  3. reviews.likes/dislikes 字段
  4. orders.tracking_number 字段
  5. review_likes 表
  6. products 表关键字段
  7. 重要索引
  8. 数据量统计

💡 如果有 ❌ 标记的项目，需要运行 database-complete-fix.sql 修复
' AS '说明';

