-- ============================================
-- 更新葡萄汁和有机羽衣甘蓝商品图片链接
-- ============================================

USE `fresh_harvest`;

-- 更新葡萄汁商品图片
UPDATE `products` 
SET `image_url` = 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=800&h=600&fit=crop'
WHERE `name` LIKE '%葡萄汁%' OR `name` LIKE '%Grape Juice%';

-- 更新有机羽衣甘蓝商品图片
UPDATE `products` 
SET `image_url` = 'https://www.tengbenyueji.com/tsmm/d/file/202303/1678706565286804.jpg'
WHERE `name` LIKE '%羽衣甘蓝%' OR `name` LIKE '%Kale%';

-- 查看更新结果
SELECT '============================================' AS '';
SELECT '✅ 商品图片更新完成' AS '状态';
SELECT '============================================' AS '';

-- 显示更新后的葡萄汁商品信息
SELECT 
  id, 
  name, 
  image_url,
  '葡萄汁' AS '类型'
FROM `products` 
WHERE `name` LIKE '%葡萄汁%' OR `name` LIKE '%Grape Juice%';

-- 显示更新后的羽衣甘蓝商品信息
SELECT 
  id, 
  name, 
  image_url,
  '羽衣甘蓝' AS '类型'
FROM `products` 
WHERE `name` LIKE '%羽衣甘蓝%' OR `name` LIKE '%Kale%';

SELECT '============================================' AS '';
SELECT '✅ 完成！请检查上方的商品信息' AS '提示';
SELECT '============================================' AS '';

-- 备选图片链接（如果上面的链接不合适，可以手动替换）
-- 
-- 葡萄汁备选（紫色果汁）:
-- https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=800&h=600&fit=crop
-- https://images.unsplash.com/photo-1610970881699-44a5587cabec?w=800&h=600&fit=crop
-- https://images.unsplash.com/photo-1581636625402-29b2a704ef13?w=800&h=600&fit=crop
-- 
-- 羽衣甘蓝备选（深绿色叶菜）:
-- https://images.unsplash.com/photo-1515437045-ec0761032308?w=800&h=600&fit=crop
-- https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=800&h=600&fit=crop
-- https://images.unsplash.com/photo-1557844352-761f2565b576?w=800&h=600&fit=crop


