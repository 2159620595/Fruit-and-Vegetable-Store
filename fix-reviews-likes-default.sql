USE `fresh_harvest`;

-- 确保 reviews 表有 likes 和 dislikes 字段，并设置默认值
ALTER TABLE `reviews` 
MODIFY COLUMN `likes` INT NOT NULL DEFAULT 0 COMMENT '点赞数';

ALTER TABLE `reviews` 
MODIFY COLUMN `dislikes` INT NOT NULL DEFAULT 0 COMMENT '踩数';

-- 将现有的 NULL 值更新为 0
UPDATE `reviews` SET `likes` = 0 WHERE `likes` IS NULL;
UPDATE `reviews` SET `dislikes` = 0 WHERE `dislikes` IS NULL;

SELECT '✅ reviews 表的 likes 和 dislikes 字段已修复！' AS '状态';

