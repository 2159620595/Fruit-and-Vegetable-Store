-- ============================================
-- 购物车表添加 selected 字段
-- ============================================

USE `fresh_harvest`;

-- 添加 selected 字段（如果已存在会报错，忽略即可）
ALTER TABLE `cart`
ADD COLUMN `selected` TINYINT(1) NOT NULL DEFAULT 1
COMMENT '是否选中（0=未选中，1=选中）'
AFTER `quantity`;

-- 将现有数据的 selected 字段设置为 1（选中）
UPDATE `cart` SET `selected` = 1;

-- 显示成功消息
SELECT '✅ cart 表的 selected 字段已成功添加！' AS '状态';

