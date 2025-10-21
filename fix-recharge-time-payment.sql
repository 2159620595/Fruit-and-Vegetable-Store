-- 修复充值记录的时间显示和支付方式问题
-- 创建时间: 2024-01-20

-- 1. 检查当前数据库的时区设置
SELECT @@global.time_zone, @@session.time_zone;

-- 2. 设置会话时区为东八区（中国标准时间）
SET time_zone = '+08:00';

-- 3. 检查充值记录表的时间字段和支付方式
SELECT 
    id,
    user_id,
    amount,
    payment_method,
    payment_status,
    created_at,
    updated_at,
    DATE_FORMAT(CONVERT_TZ(created_at, '+00:00', '+08:00'), '%Y-%m-%d %H:%i:%s') as created_at_cst,
    DATE_FORMAT(CONVERT_TZ(updated_at, '+00:00', '+08:00'), '%Y-%m-%d %H:%i:%s') as updated_at_cst
FROM recharge_records
ORDER BY created_at DESC
LIMIT 20;

-- 4. 检查是否有异常的支付方式值
SELECT 
    payment_method,
    COUNT(*) as count,
    GROUP_CONCAT(DISTINCT payment_status) as statuses
FROM recharge_records
GROUP BY payment_method
ORDER BY count DESC;

-- 5. 检查是否有空的或异常的时间字段
SELECT 
    COUNT(*) as total_records,
    SUM(CASE WHEN created_at IS NULL THEN 1 ELSE 0 END) as null_created_at,
    SUM(CASE WHEN updated_at IS NULL THEN 1 ELSE 0 END) as null_updated_at,
    SUM(CASE WHEN created_at > NOW() THEN 1 ELSE 0 END) as future_created_at,
    SUM(CASE WHEN created_at < '2020-01-01' THEN 1 ELSE 0 END) as old_created_at
FROM recharge_records;

-- 6. 如果发现支付方式有大小写不一致的问题，可以统一处理
-- 注意：执行前请先备份数据！
-- UPDATE recharge_records SET payment_method = LOWER(payment_method);

-- 7. 检查最近的充值记录详情（包括用户信息）
SELECT 
    r.id,
    r.user_id,
    u.username,
    r.amount,
    r.bonus_amount,
    r.total_amount,
    r.payment_method,
    r.payment_status,
    r.transaction_id,
    DATE_FORMAT(CONVERT_TZ(r.created_at, '+00:00', '+08:00'), '%Y-%m-%d %H:%i:%s') as created_at_local,
    DATE_FORMAT(CONVERT_TZ(r.updated_at, '+00:00', '+08:00'), '%Y-%m-%d %H:%i:%s') as updated_at_local,
    TIMESTAMPDIFF(MINUTE, r.created_at, r.updated_at) as time_diff_minutes
FROM recharge_records r
LEFT JOIN users u ON r.user_id = u.id
WHERE r.payment_status = 'success'
ORDER BY r.created_at DESC
LIMIT 10;

-- 8. 检查余额变动记录的时间
SELECT 
    id,
    user_id,
    transaction_type,
    amount,
    related_id,
    description,
    DATE_FORMAT(CONVERT_TZ(created_at, '+00:00', '+08:00'), '%Y-%m-%d %H:%i:%s') as created_at_local
FROM balance_transactions
WHERE transaction_type = 'recharge'
ORDER BY created_at DESC
LIMIT 10;

-- 9. 验证充值记录和余额变动记录的时间是否匹配
SELECT 
    r.id as recharge_id,
    r.payment_method,
    DATE_FORMAT(CONVERT_TZ(r.created_at, '+00:00', '+08:00'), '%Y-%m-%d %H:%i:%s') as recharge_time,
    DATE_FORMAT(CONVERT_TZ(r.updated_at, '+00:00', '+08:00'), '%Y-%m-%d %H:%i:%s') as recharge_updated,
    bt.id as transaction_id,
    DATE_FORMAT(CONVERT_TZ(bt.created_at, '+00:00', '+08:00'), '%Y-%m-%d %H:%i:%s') as transaction_time,
    TIMESTAMPDIFF(SECOND, r.updated_at, bt.created_at) as time_diff_seconds
FROM recharge_records r
LEFT JOIN balance_transactions bt ON r.id = bt.related_id AND bt.transaction_type = 'recharge'
WHERE r.payment_status = 'success'
ORDER BY r.created_at DESC
LIMIT 10;

-- 10. 如果需要修复支付方式的大小写问题（执行前请先确认！）
-- 备份：CREATE TABLE recharge_records_backup AS SELECT * FROM recharge_records;
-- 修复：UPDATE recharge_records SET payment_method = LOWER(TRIM(payment_method));

-- 11. 统计各支付方式的使用情况
SELECT 
    payment_method,
    payment_status,
    COUNT(*) as count,
    SUM(amount) as total_amount,
    SUM(total_amount) as total_received,
    AVG(amount) as avg_amount
FROM recharge_records
GROUP BY payment_method, payment_status
ORDER BY payment_method, payment_status;

-- 12. 查找可能存在时间异常的记录
SELECT 
    id,
    user_id,
    amount,
    payment_method,
    payment_status,
    created_at,
    updated_at,
    CASE 
        WHEN created_at > NOW() THEN '未来时间'
        WHEN created_at < '2020-01-01' THEN '过去时间过旧'
        WHEN updated_at < created_at THEN '更新时间早于创建时间'
        ELSE '正常'
    END as time_status
FROM recharge_records
WHERE 
    created_at > NOW() 
    OR created_at < '2020-01-01'
    OR updated_at < created_at
ORDER BY created_at DESC;

-- 13. 显示修复建议
SELECT 
    '数据库时区检查完成' as step,
    CONCAT('当前全局时区: ', @@global.time_zone) as global_tz,
    CONCAT('当前会话时区: ', @@session.time_zone) as session_tz;

-- 14. 确保数据库连接使用正确的时区
-- 在应用程序的数据库连接配置中添加：timezone='+08:00'
-- 例如：mysql://user:pass@host:3306/dbname?timezone=%2B08:00

COMMIT;

