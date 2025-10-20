-- ============================================
-- Fresh Harvest 完整数据库修复脚本
-- 用于修复数据库缺失的表、字段和索引
-- ============================================

USE `fresh_harvest`;

SELECT '========================================' AS '';
SELECT '🔧 开始修复数据库...' AS '状态';
SELECT '========================================' AS '';

-- ============================================
-- 1. 修复 users 表 avatar 字段
-- ============================================

SELECT '1️⃣ 修复 users 表 avatar 字段...' AS '操作';

ALTER TABLE `users` 
MODIFY COLUMN `avatar` TEXT DEFAULT NULL 
COMMENT '用户头像（base64 或 URL）';

SELECT '✅ users.avatar 字段已修改为 TEXT 类型' AS '结果';

-- ============================================
-- 2. 修复 cart 表 selected 字段
-- ============================================

SELECT '' AS '';
SELECT '2️⃣ 修复 cart 表 selected 字段...' AS '操作';

-- 检查字段是否存在
SET @column_exists = (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = 'fresh_harvest'
    AND TABLE_NAME = 'cart'
    AND COLUMN_NAME = 'selected'
);

SET @sql = IF(
  @column_exists = 0,
  'ALTER TABLE `cart` ADD COLUMN `selected` TINYINT(1) NOT NULL DEFAULT 1 COMMENT ''是否选中'' AFTER `quantity`',
  'SELECT ''selected 字段已存在'' AS message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 确保现有数据的 selected 字段为 1
UPDATE `cart` SET `selected` = 1 WHERE `selected` IS NULL;

SELECT '✅ cart.selected 字段已添加/更新' AS '结果';

-- ============================================
-- 3. 修复 reviews 表 likes 和 dislikes 字段
-- ============================================

SELECT '' AS '';
SELECT '3️⃣ 修复 reviews 表 likes 和 dislikes 字段...' AS '操作';

-- 修改 likes 字段
ALTER TABLE `reviews` 
MODIFY COLUMN `likes` INT NOT NULL DEFAULT 0 COMMENT '点赞数';

-- 检查 dislikes 字段是否存在
SET @column_exists = (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = 'fresh_harvest'
    AND TABLE_NAME = 'reviews'
    AND COLUMN_NAME = 'dislikes'
);

SET @sql = IF(
  @column_exists = 0,
  'ALTER TABLE `reviews` ADD COLUMN `dislikes` INT NOT NULL DEFAULT 0 COMMENT ''踩数'' AFTER `likes`',
  'ALTER TABLE `reviews` MODIFY COLUMN `dislikes` INT NOT NULL DEFAULT 0 COMMENT ''踩数'''
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 确保没有 NULL 值
UPDATE `reviews` SET `likes` = 0 WHERE `likes` IS NULL;
UPDATE `reviews` SET `dislikes` = 0 WHERE `dislikes` IS NULL;

SELECT '✅ reviews 表的 likes 和 dislikes 字段已修复' AS '结果';

-- ============================================
-- 4. 创建/修复 review_likes 表
-- ============================================

SELECT '' AS '';
SELECT '4️⃣ 创建/修复 review_likes 表...' AS '操作';

-- 删除旧表（如果存在）
DROP TABLE IF EXISTS `review_likes`;

-- 创建评价点赞表
CREATE TABLE `review_likes` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `review_id` INT NOT NULL COMMENT '评价ID',
  `user_id` INT NOT NULL COMMENT '用户ID',
  `type` TINYINT NOT NULL COMMENT '类型：1=点赞，-1=踩',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_review` (`review_id`, `user_id`),
  KEY `idx_review_id` (`review_id`),
  KEY `idx_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='评价点赞记录表';

SELECT '✅ review_likes 表已创建' AS '结果';

-- ============================================
-- 5. 修复 orders 表 tracking_number 字段
-- ============================================

SELECT '' AS '';
SELECT '5️⃣ 修复 orders 表 tracking_number 字段...' AS '操作';

-- 检查字段是否存在
SET @column_exists = (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = 'fresh_harvest'
    AND TABLE_NAME = 'orders'
    AND COLUMN_NAME = 'tracking_number'
);

SET @sql = IF(
  @column_exists = 0,
  'ALTER TABLE `orders` ADD COLUMN `tracking_number` VARCHAR(50) DEFAULT NULL COMMENT ''物流单号'' AFTER `shipping_address`',
  'SELECT ''tracking_number 字段已存在'' AS message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SELECT '✅ orders.tracking_number 字段已添加' AS '结果';

-- ============================================
-- 6. 添加重要索引
-- ============================================

SELECT '' AS '';
SELECT '6️⃣ 添加重要索引...' AS '操作';

-- orders 表索引
SET @index_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS WHERE TABLE_SCHEMA = 'fresh_harvest' AND TABLE_NAME = 'orders' AND INDEX_NAME = 'idx_tracking_number');
SET @sql = IF(@index_exists = 0, 'ALTER TABLE `orders` ADD INDEX `idx_tracking_number` (`tracking_number`)', 'SELECT ''idx_tracking_number 已存在'' AS msg');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @index_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS WHERE TABLE_SCHEMA = 'fresh_harvest' AND TABLE_NAME = 'orders' AND INDEX_NAME = 'idx_user_status');
SET @sql = IF(@index_exists = 0, 'ALTER TABLE `orders` ADD INDEX `idx_user_status` (`user_id`, `status`)', 'SELECT ''idx_user_status 已存在'' AS msg');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @index_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS WHERE TABLE_SCHEMA = 'fresh_harvest' AND TABLE_NAME = 'orders' AND INDEX_NAME = 'idx_user_status_created');
SET @sql = IF(@index_exists = 0, 'ALTER TABLE `orders` ADD INDEX `idx_user_status_created` (`user_id`, `status`, `created_at`)', 'SELECT ''idx_user_status_created 已存在'' AS msg');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- cart 表索引
SET @index_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS WHERE TABLE_SCHEMA = 'fresh_harvest' AND TABLE_NAME = 'cart' AND INDEX_NAME = 'idx_user_product');
SET @sql = IF(@index_exists = 0, 'ALTER TABLE `cart` ADD INDEX `idx_user_product` (`user_id`, `product_id`)', 'SELECT ''idx_user_product 已存在'' AS msg');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- favorites 表索引
SET @index_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS WHERE TABLE_SCHEMA = 'fresh_harvest' AND TABLE_NAME = 'favorites' AND INDEX_NAME = 'idx_user_product_fav');
SET @sql = IF(@index_exists = 0, 'ALTER TABLE `favorites` ADD INDEX `idx_user_product_fav` (`user_id`, `product_id`)', 'SELECT ''idx_user_product_fav 已存在'' AS msg');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- products 表索引
SET @index_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS WHERE TABLE_SCHEMA = 'fresh_harvest' AND TABLE_NAME = 'products' AND INDEX_NAME = 'idx_sales_count');
SET @sql = IF(@index_exists = 0, 'ALTER TABLE `products` ADD INDEX `idx_sales_count` (`sales_count`)', 'SELECT ''idx_sales_count 已存在'' AS msg');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- order_items 表索引
SET @index_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS WHERE TABLE_SCHEMA = 'fresh_harvest' AND TABLE_NAME = 'order_items' AND INDEX_NAME = 'idx_product_name');
SET @sql = IF(@index_exists = 0, 'ALTER TABLE `order_items` ADD INDEX `idx_product_name` (`product_name`)', 'SELECT ''idx_product_name 已存在'' AS msg');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- order_status_history 表索引
SET @index_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS WHERE TABLE_SCHEMA = 'fresh_harvest' AND TABLE_NAME = 'order_status_history' AND INDEX_NAME = 'idx_order_created');
SET @sql = IF(@index_exists = 0, 'ALTER TABLE `order_status_history` ADD INDEX `idx_order_created` (`order_id`, `created_at`)', 'SELECT ''idx_order_created 已存在'' AS msg');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SELECT '✅ 所有索引已添加' AS '结果';

-- ============================================
-- 7. 为已发货订单生成物流单号（可选）
-- ============================================

SELECT '' AS '';
SELECT '7️⃣ 为已发货订单生成物流单号...' AS '操作';

UPDATE `orders` 
SET `tracking_number` = CONCAT('SF', UNIX_TIMESTAMP(), LPAD(id, 5, '0'))
WHERE `status` IN ('shipped', 'in_transit', 'delivered')
  AND (`tracking_number` IS NULL OR `tracking_number` = '');

SELECT '✅ 物流单号已生成' AS '结果';

-- ============================================
-- 8. 完成
-- ============================================

SELECT '' AS '';
SELECT '========================================' AS '';
SELECT '✅ 数据库修复完成！' AS '状态';
SELECT '========================================' AS '';

SELECT '
📋 修复内容:
  ✅ users.avatar 字段改为 TEXT 类型
  ✅ cart.selected 字段已添加
  ✅ reviews.likes 和 dislikes 字段已添加/修复
  ✅ review_likes 表已创建
  ✅ orders.tracking_number 字段已添加
  ✅ 所有重要索引已添加
  ✅ 已发货订单的物流单号已生成

💡 下一步:
  1. 运行检查脚本: database-complete-check.sql
  2. 重启后端服务: node app.js
  3. 测试所有功能
' AS '修复说明';

COMMIT;

