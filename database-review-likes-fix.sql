-- ============================================
-- 评价表添加踩字段
-- ============================================

USE `fresh_harvest`;

-- 添加 dislikes 字段
ALTER TABLE `reviews`
ADD COLUMN `dislikes` INT NOT NULL DEFAULT 0
COMMENT '踩数'
AFTER `likes`;

-- 显示成功消息
SELECT '✅ reviews 表的 dislikes 字段已成功添加！' AS '状态';

