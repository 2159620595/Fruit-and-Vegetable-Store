-- ============================================
-- Fresh Harvest 数据库优化 SQL
-- ============================================

-- 1. 为 orders 表添加物流单号字段
ALTER TABLE orders 
ADD COLUMN tracking_number VARCHAR(50) DEFAULT NULL 
COMMENT '物流单号';

-- 2. 为 orders 表添加索引以提升查询性能
ALTER TABLE orders ADD INDEX idx_tracking_number (tracking_number);
ALTER TABLE orders ADD INDEX idx_user_status (user_id, status);
ALTER TABLE orders ADD INDEX idx_order_number (order_number);
ALTER TABLE orders ADD INDEX idx_created_at (created_at);

-- 3. 为 order_items 表添加商品名称索引（支持商品搜索）
ALTER TABLE order_items ADD INDEX idx_product_name (product_name);
ALTER TABLE order_items ADD INDEX idx_order_id (order_id);
ALTER TABLE order_items ADD INDEX idx_product_id (product_id);

-- 4. 为 products 表添加索引
ALTER TABLE products ADD INDEX idx_category_id (category_id);
ALTER TABLE products ADD INDEX idx_price (price);
ALTER TABLE products ADD INDEX idx_rating (rating);
ALTER TABLE products ADD INDEX idx_sales_count (sales_count);

-- 5. 为 cart 表添加索引
ALTER TABLE cart ADD INDEX idx_user_product (user_id, product_id);

-- 6. 为 favorites 表添加索引
ALTER TABLE favorites ADD INDEX idx_user_product (user_id, product_id);

-- 7. 为 reviews 表添加索引
ALTER TABLE reviews ADD INDEX idx_product_id (product_id);
ALTER TABLE reviews ADD INDEX idx_user_id (user_id);
ALTER TABLE reviews ADD INDEX idx_order_id (order_id);

-- 8. 为 addresses 表添加索引
ALTER TABLE addresses ADD INDEX idx_user_id (user_id);
ALTER TABLE addresses ADD INDEX idx_is_default (is_default);

-- 9. 为 order_status_history 表添加索引
ALTER TABLE order_status_history ADD INDEX idx_order_id (order_id);

-- 10. 优化查询性能 - 添加复合索引
ALTER TABLE orders ADD INDEX idx_user_status_created (user_id, status, created_at);

-- ============================================
-- 查看索引创建情况
-- ============================================

-- 查看 orders 表的所有索引
SHOW INDEX FROM orders;

-- 查看 order_items 表的所有索引
SHOW INDEX FROM order_items;

-- ============================================
-- 性能分析查询
-- ============================================

-- 分析订单列表查询性能
EXPLAIN SELECT * FROM orders 
WHERE user_id = 6 
ORDER BY created_at DESC 
LIMIT 10;

-- 分析订单搜索查询性能
EXPLAIN SELECT DISTINCT o.* 
FROM orders o
LEFT JOIN order_items oi ON o.id = oi.order_id
WHERE o.user_id = 6
  AND (
    o.order_number LIKE '%芒果%'
    OR oi.product_name LIKE '%芒果%'
  )
ORDER BY o.created_at DESC
LIMIT 10;

-- ============================================
-- 数据完整性检查
-- ============================================

-- 检查是否有孤立的订单项（订单已删除但订单项未删除）
SELECT oi.* 
FROM order_items oi
LEFT JOIN orders o ON oi.order_id = o.id
WHERE o.id IS NULL;

-- 检查是否有库存异常的商品（库存为负数）
SELECT * FROM products WHERE stock < 0;

-- 检查订单统计是否准确
SELECT 
  o.user_id,
  COUNT(*) as total_orders,
  SUM(CASE WHEN o.status = 'pending' THEN 1 ELSE 0 END) as pending,
  SUM(CASE WHEN o.status = 'processing' THEN 1 ELSE 0 END) as processing,
  SUM(CASE WHEN o.status = 'shipped' THEN 1 ELSE 0 END) as shipped,
  SUM(CASE WHEN o.status = 'in_transit' THEN 1 ELSE 0 END) as in_transit,
  SUM(CASE WHEN o.status = 'delivered' THEN 1 ELSE 0 END) as delivered,
  SUM(CASE WHEN o.status = 'cancelled' THEN 1 ELSE 0 END) as cancelled
FROM orders o
GROUP BY o.user_id;

-- ============================================
-- 清理脚本（谨慎使用）
-- ============================================

-- 清理已取消订单的历史记录（可选）
-- DELETE FROM order_status_history 
-- WHERE order_id IN (
--   SELECT id FROM orders WHERE status = 'cancelled' AND updated_at < DATE_SUB(NOW(), INTERVAL 30 DAY)
-- );

-- 清理测试数据（开发环境使用）
-- DELETE FROM orders WHERE order_number LIKE 'TEST%';

-- ============================================
-- 数据备份建议
-- ============================================

/*
定期备份数据库：

# 完整备份
mysqldump -u root -p fresh_harvest > fresh_harvest_backup_$(date +%Y%m%d).sql

# 只备份结构
mysqldump -u root -p --no-data fresh_harvest > fresh_harvest_structure.sql

# 只备份数据
mysqldump -u root -p --no-create-info fresh_harvest > fresh_harvest_data.sql

# 恢复数据库
mysql -u root -p fresh_harvest < fresh_harvest_backup_20251020.sql
*/

-- ============================================
-- 监控查询
-- ============================================

-- 慢查询日志启用
-- SET GLOBAL slow_query_log = 'ON';
-- SET GLOBAL long_query_time = 2;

-- 查看当前连接数
-- SHOW PROCESSLIST;

-- 查看表大小
SELECT 
  table_name AS 'Table',
  ROUND(((data_length + index_length) / 1024 / 1024), 2) AS 'Size (MB)'
FROM information_schema.TABLES
WHERE table_schema = 'fresh_harvest'
ORDER BY (data_length + index_length) DESC;

-- ============================================
-- 执行完成
-- ============================================

SELECT '✅ 数据库优化完成！' AS status;

