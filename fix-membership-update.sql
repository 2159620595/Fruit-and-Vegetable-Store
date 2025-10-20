-- 修复会员等级更新语句
-- 根据实际的用户表结构调整

-- 方案1：如果用户表有order_stats JSON字段
-- UPDATE users 
-- SET membership_level = CASE 
--     WHEN (order_stats->>'$.total_spent' + 0) >= 5000 THEN '钻石会员'
--     WHEN (order_stats->>'$.total_spent' + 0) >= 2000 THEN '黄金会员'
--     WHEN (order_stats->>'$.total_spent' + 0) >= 500 THEN '白银会员'
--     ELSE '普通会员'
-- END
-- WHERE membership_level IS NULL OR membership_level = '';

-- 方案2：如果用户表没有order_stats字段，使用订单表计算总消费
UPDATE users 
SET membership_level = CASE 
    WHEN (
        SELECT COALESCE(SUM(total_amount), 0) 
        FROM orders 
        WHERE user_id = users.id 
        AND status != 'cancelled'
    ) >= 5000 THEN '钻石会员'
    WHEN (
        SELECT COALESCE(SUM(total_amount), 0) 
        FROM orders 
        WHERE user_id = users.id 
        AND status != 'cancelled'
    ) >= 2000 THEN '黄金会员'
    WHEN (
        SELECT COALESCE(SUM(total_amount), 0) 
        FROM orders 
        WHERE user_id = users.id 
        AND status != 'cancelled'
    ) >= 500 THEN '白银会员'
    ELSE '普通会员'
END
WHERE membership_level IS NULL OR membership_level = '';

-- 方案3：如果上述方案太慢，可以先设置所有用户为普通会员
-- UPDATE users SET membership_level = '普通会员' WHERE membership_level IS NULL OR membership_level = '';

-- 验证更新结果
SELECT 
    membership_level as '会员等级',
    COUNT(*) as '用户数量'
FROM users 
GROUP BY membership_level
ORDER BY 
    CASE membership_level
        WHEN '普通会员' THEN 1
        WHEN '白银会员' THEN 2
        WHEN '黄金会员' THEN 3
        WHEN '钻石会员' THEN 4
    END;
