-- ============================================
-- Fresh Harvest 完整数据库检查脚本
-- 用于检测数据库是否完整配置
-- ============================================

USE `fresh_harvest`;

SELECT '========================================' AS '';
SELECT '🔍 开始检查数据库结构...' AS '状态';
SELECT '========================================' AS '';

-- ============================================
-- 1. 检查核心表是否存在
-- ============================================

SELECT '1️⃣ 检查核心表是否存在' AS '检查项';

SELECT 
  CASE 
    WHEN COUNT(*) >= 12 THEN '✅ 通过'
    ELSE '❌ 失败 - 缺少必要的表'
  END AS '结果',
  GROUP_CONCAT(table_name) AS '已存在的表'
FROM information_schema.TABLES
WHERE table_schema = 'fresh_harvest'
  AND table_name IN (
    'users', 'products', 'categories', 'orders', 'order_items',
    'cart', 'favorites', 'reviews', 'addresses',
    'order_status_history', 'review_likes', 'banners'
  );

-- ============================================
-- 2. 检查 users 表 avatar 字段
-- ============================================

SELECT '' AS '';
SELECT '2️⃣ 检查 users 表 avatar 字段类型' AS '检查项';

SELECT 
  CASE 
    WHEN DATA_TYPE IN ('TEXT', 'MEDIUMTEXT', 'LONGTEXT') THEN '✅ 通过 - avatar 字段类型正确'
    WHEN DATA_TYPE = 'VARCHAR' AND CHARACTER_MAXIMUM_LENGTH >= 5000 THEN '✅ 通过 - avatar 字段类型正确'
    ELSE CONCAT('❌ 失败 - avatar 字段类型为 ', DATA_TYPE, '，需要改为 TEXT 类型')
  END AS '结果',
  COLUMN_NAME AS '字段名',
  DATA_TYPE AS '当前类型',
  CHARACTER_MAXIMUM_LENGTH AS '最大长度'
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = 'fresh_harvest'
  AND TABLE_NAME = 'users'
  AND COLUMN_NAME = 'avatar';

-- ============================================
-- 3. 检查 cart 表 selected 字段
-- ============================================

SELECT '' AS '';
SELECT '3️⃣ 检查 cart 表 selected 字段' AS '检查项';

SELECT 
  CASE 
    WHEN COUNT(*) > 0 THEN '✅ 通过 - selected 字段存在'
    ELSE '❌ 失败 - 缺少 selected 字段'
  END AS '结果'
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = 'fresh_harvest'
  AND TABLE_NAME = 'cart'
  AND COLUMN_NAME = 'selected';

-- ============================================
-- 4. 检查 reviews 表 likes 和 dislikes 字段
-- ============================================

SELECT '' AS '';
SELECT '4️⃣ 检查 reviews 表 likes 和 dislikes 字段' AS '检查项';

SELECT 
  CASE 
    WHEN COUNT(*) = 2 THEN '✅ 通过 - likes 和 dislikes 字段存在'
    ELSE '❌ 失败 - 缺少 likes 或 dislikes 字段'
  END AS '结果',
  GROUP_CONCAT(COLUMN_NAME) AS '已存在的字段'
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = 'fresh_harvest'
  AND TABLE_NAME = 'reviews'
  AND COLUMN_NAME IN ('likes', 'dislikes');

-- ============================================
-- 5. 检查 review_likes 表
-- ============================================

SELECT '' AS '';
SELECT '5️⃣ 检查 review_likes 表' AS '检查项';

SELECT 
  CASE 
    WHEN COUNT(*) > 0 THEN '✅ 通过 - review_likes 表存在'
    ELSE '❌ 失败 - review_likes 表不存在'
  END AS '结果'
FROM information_schema.TABLES
WHERE TABLE_SCHEMA = 'fresh_harvest'
  AND TABLE_NAME = 'review_likes';

-- ============================================
-- 6. 检查 orders 表 tracking_number 字段
-- ============================================

SELECT '' AS '';
SELECT '6️⃣ 检查 orders 表 tracking_number 字段' AS '检查项';

SELECT 
  CASE 
    WHEN COUNT(*) > 0 THEN '✅ 通过 - tracking_number 字段存在'
    ELSE '❌ 失败 - tracking_number 字段不存在'
  END AS '结果'
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = 'fresh_harvest'
  AND TABLE_NAME = 'orders'
  AND COLUMN_NAME = 'tracking_number';

-- ============================================
-- 7. 检查重要索引
-- ============================================

SELECT '' AS '';
SELECT '7️⃣ 检查重要索引' AS '检查项';

SELECT 
  TABLE_NAME AS '表名',
  INDEX_NAME AS '索引名',
  GROUP_CONCAT(COLUMN_NAME ORDER BY SEQ_IN_INDEX) AS '索引字段'
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
GROUP BY TABLE_NAME, INDEX_NAME
ORDER BY TABLE_NAME, INDEX_NAME;

-- ============================================
-- 8. 检查数据完整性
-- ============================================

SELECT '' AS '';
SELECT '8️⃣ 检查基础数据' AS '检查项';

SELECT '用户数据' AS '类型', COUNT(*) AS '数量' FROM users
UNION ALL
SELECT '商品数据' AS '类型', COUNT(*) AS '数量' FROM products
UNION ALL
SELECT '分类数据' AS '类型', COUNT(*) AS '数量' FROM categories
UNION ALL
SELECT '订单数据' AS '类型', COUNT(*) AS '数量' FROM orders
UNION ALL
SELECT '评价数据' AS '类型', COUNT(*) AS '数量' FROM reviews
UNION ALL
SELECT '购物车数据' AS '类型', COUNT(*) AS '数量' FROM cart
UNION ALL
SELECT '收藏数据' AS '类型', COUNT(*) AS '数量' FROM favorites
UNION ALL
SELECT '轮播图数据' AS '类型', COUNT(*) AS '数量' FROM banners;

-- ============================================
-- 9. 检查 products 表的图片链接
-- ============================================

SELECT '' AS '';
SELECT '9️⃣ 检查商品图片数据' AS '检查项';

SELECT 
  name AS '商品名',
  CASE 
    WHEN image_url IS NULL OR image_url = '' THEN '❌ 缺少图片'
    WHEN image_url LIKE 'http%' THEN '✅ 有效链接'
    ELSE '⚠️  本地路径'
  END AS '图片状态',
  image_url AS '图片链接'
FROM products
WHERE name IN ('葡萄汁', '有机羽衣甘蓝', '新鲜芒果', '有机草莓', '新鲜蓝莓')
ORDER BY name;

-- ============================================
-- 10. 总结报告
-- ============================================

SELECT '' AS '';
SELECT '========================================' AS '';
SELECT '📊 检查完成！' AS '状态';
SELECT '========================================' AS '';

