-- ============================================
-- 检查关键字段是否存在
-- ============================================

USE `fresh_harvest`;

SELECT '========================================' AS '';
SELECT '🔍 检查关键字段...' AS '状态';
SELECT '========================================' AS '';

-- 1. 检查 users 表的 avatar 字段
SELECT '1️⃣ 检查 users.avatar 字段' AS '检查项';
SELECT 
  COLUMN_NAME AS '字段名',
  DATA_TYPE AS '数据类型',
  COLUMN_TYPE AS '完整类型',
  IS_NULLABLE AS '允许NULL',
  COLUMN_DEFAULT AS '默认值',
  CASE 
    WHEN DATA_TYPE IN ('TEXT', 'MEDIUMTEXT', 'LONGTEXT') THEN '✅ 类型正确'
    WHEN DATA_TYPE = 'VARCHAR' AND CHARACTER_MAXIMUM_LENGTH >= 5000 THEN '✅ 长度足够'
    ELSE '❌ 需要修改为TEXT类型'
  END AS '状态'
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = 'fresh_harvest'
  AND TABLE_NAME = 'users'
  AND COLUMN_NAME = 'avatar';

-- 2. 检查 cart 表的 selected 字段
SELECT '' AS '';
SELECT '2️⃣ 检查 cart.selected 字段' AS '检查项';
SELECT 
  COLUMN_NAME AS '字段名',
  DATA_TYPE AS '数据类型',
  COLUMN_TYPE AS '完整类型',
  COLUMN_DEFAULT AS '默认值',
  CASE 
    WHEN COLUMN_NAME = 'selected' THEN '✅ 字段存在'
    ELSE '❌ 字段不存在'
  END AS '状态'
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = 'fresh_harvest'
  AND TABLE_NAME = 'cart'
  AND COLUMN_NAME = 'selected'
UNION ALL
SELECT 
  '❌ selected 字段不存在' AS '字段名',
  '' AS '数据类型',
  '' AS '完整类型',
  '' AS '默认值',
  '需要添加' AS '状态'
FROM dual
WHERE NOT EXISTS (
  SELECT 1 FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = 'fresh_harvest'
    AND TABLE_NAME = 'cart'
    AND COLUMN_NAME = 'selected'
);

-- 3. 检查 reviews 表的 likes 和 dislikes 字段
SELECT '' AS '';
SELECT '3️⃣ 检查 reviews 表的 likes 和 dislikes 字段' AS '检查项';
SELECT 
  COLUMN_NAME AS '字段名',
  DATA_TYPE AS '数据类型',
  COLUMN_TYPE AS '完整类型',
  IS_NULLABLE AS '允许NULL',
  COLUMN_DEFAULT AS '默认值',
  CASE 
    WHEN IS_NULLABLE = 'NO' AND COLUMN_DEFAULT = '0' THEN '✅ 配置正确'
    ELSE '⚠️ 需要调整'
  END AS '状态'
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = 'fresh_harvest'
  AND TABLE_NAME = 'reviews'
  AND COLUMN_NAME IN ('likes', 'dislikes')
ORDER BY COLUMN_NAME;

-- 4. 检查 orders 表的 tracking_number 字段
SELECT '' AS '';
SELECT '4️⃣ 检查 orders.tracking_number 字段' AS '检查项';
SELECT 
  COLUMN_NAME AS '字段名',
  DATA_TYPE AS '数据类型',
  COLUMN_TYPE AS '完整类型',
  IS_NULLABLE AS '允许NULL',
  CASE 
    WHEN COLUMN_NAME = 'tracking_number' THEN '✅ 字段存在'
    ELSE '❌ 字段不存在'
  END AS '状态'
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = 'fresh_harvest'
  AND TABLE_NAME = 'orders'
  AND COLUMN_NAME = 'tracking_number'
UNION ALL
SELECT 
  '❌ tracking_number 字段不存在' AS '字段名',
  '' AS '数据类型',
  '' AS '完整类型',
  '' AS '允许NULL',
  '需要添加' AS '状态'
FROM dual
WHERE NOT EXISTS (
  SELECT 1 FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = 'fresh_harvest'
    AND TABLE_NAME = 'orders'
    AND COLUMN_NAME = 'tracking_number'
);

-- 5. 检查 review_likes 表结构
SELECT '' AS '';
SELECT '5️⃣ 检查 review_likes 表结构' AS '检查项';
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
SELECT '' AS '';
SELECT '6️⃣ 检查 products 表的关键字段' AS '检查项';
SELECT 
  COLUMN_NAME AS '字段名',
  DATA_TYPE AS '数据类型',
  COLUMN_TYPE AS '完整类型'
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = 'fresh_harvest'
  AND TABLE_NAME = 'products'
  AND COLUMN_NAME IN ('id', 'name', 'image_url', 'price', 'stock', 'category_id', 'description', 'sales_count')
ORDER BY ORDINAL_POSITION;

-- 7. 检查重要索引
SELECT '' AS '';
SELECT '7️⃣ 检查重要索引' AS '检查项';
SELECT 
  TABLE_NAME AS '表名',
  INDEX_NAME AS '索引名',
  COLUMN_NAME AS '字段',
  NON_UNIQUE AS '非唯一',
  INDEX_TYPE AS '索引类型'
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
ORDER BY TABLE_NAME, INDEX_NAME, SEQ_IN_INDEX;

-- 8. 检查数据量
SELECT '' AS '';
SELECT '8️⃣ 检查基础数据量' AS '检查项';
SELECT 
  'users' AS '表名',
  COUNT(*) AS '数据量',
  CASE WHEN COUNT(*) > 0 THEN '✅' ELSE '⚠️ 无数据' END AS '状态'
FROM users
UNION ALL
SELECT 'products', COUNT(*), CASE WHEN COUNT(*) > 0 THEN '✅' ELSE '⚠️ 无数据' END FROM products
UNION ALL
SELECT 'categories', COUNT(*), CASE WHEN COUNT(*) > 0 THEN '✅' ELSE '⚠️ 无数据' END FROM categories
UNION ALL
SELECT 'orders', COUNT(*), CASE WHEN COUNT(*) > 0 THEN '✅' ELSE '⚠️ 无数据' END FROM orders
UNION ALL
SELECT 'reviews', COUNT(*), CASE WHEN COUNT(*) > 0 THEN '✅' ELSE '⚠️ 无数据' END FROM reviews
UNION ALL
SELECT 'cart', COUNT(*), CASE WHEN COUNT(*) > 0 THEN '✅' ELSE '⚠️ 无数据' END FROM cart
UNION ALL
SELECT 'banners', COUNT(*), CASE WHEN COUNT(*) > 0 THEN '✅' ELSE '⚠️ 无数据' END FROM banners;

SELECT '' AS '';
SELECT '========================================' AS '';
SELECT '✅ 检查完成！' AS '状态';
SELECT '========================================' AS '';

