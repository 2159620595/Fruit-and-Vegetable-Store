USE `fresh_harvest`;

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

SELECT '✅ review_likes 表创建成功！' AS '状态';

