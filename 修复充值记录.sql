-- 修复充值记录中的错误数据
-- 问题：total_amount 字段值异常，需要进行数值计算而不是字符串拼接

-- 1. 查看当前错误的充值记录
SELECT 
    id,
    user_id,
    amount,
    bonus_amount,
    total_amount,
    payment_status,
    created_at
FROM recharge_records 
WHERE total_amount != (amount + bonus_amount)
ORDER BY created_at DESC;

-- 2. 修复充值记录中的 total_amount 字段
UPDATE recharge_records 
SET total_amount = amount + bonus_amount
WHERE total_amount != (amount + bonus_amount);

-- 3. 修复余额变动记录中的错误金额
-- 先查看错误的余额变动记录
SELECT 
    bt.id,
    bt.user_id,
    bt.transaction_type,
    bt.amount,
    bt.balance_before,
    bt.balance_after,
    bt.description,
    rr.amount as recharge_amount,
    rr.bonus_amount as recharge_bonus,
    (rr.amount + rr.bonus_amount) as correct_total
FROM balance_transactions bt
JOIN recharge_records rr ON bt.related_id = rr.id
WHERE bt.transaction_type = 'recharge' 
AND bt.amount != (rr.amount + rr.bonus_amount);

-- 4. 修复余额变动记录
UPDATE balance_transactions bt
JOIN recharge_records rr ON bt.related_id = rr.id
SET bt.amount = rr.amount + rr.bonus_amount,
    bt.description = CONCAT('充值到账 ¥', rr.amount + rr.bonus_amount)
WHERE bt.transaction_type = 'recharge' 
AND bt.amount != (rr.amount + rr.bonus_amount);

-- 5. 重新计算用户余额
-- 先查看当前用户余额
SELECT 
    u.id,
    u.username,
    u.balance,
    u.total_recharge,
    COALESCE(SUM(CASE WHEN bt.transaction_type = 'recharge' THEN bt.amount ELSE 0 END), 0) as calculated_balance,
    COALESCE(SUM(CASE WHEN bt.transaction_type = 'purchase' THEN ABS(bt.amount) ELSE 0 END), 0) as total_consumed
FROM users u
LEFT JOIN balance_transactions bt ON u.id = bt.user_id
GROUP BY u.id, u.username, u.balance, u.total_recharge;

-- 6. 更新用户余额（基于正确的余额变动记录）
UPDATE users u
SET u.balance = (
    SELECT COALESCE(SUM(
        CASE 
            WHEN bt.transaction_type = 'recharge' THEN bt.amount
            WHEN bt.transaction_type = 'purchase' THEN -ABS(bt.amount)
            ELSE 0
        END
    ), 0)
    FROM balance_transactions bt
    WHERE bt.user_id = u.id
);

-- 7. 更新用户累计充值金额
UPDATE users u
SET u.total_recharge = (
    SELECT COALESCE(SUM(amount), 0)
    FROM recharge_records rr
    WHERE rr.user_id = u.id AND rr.payment_status = 'success'
);

-- 8. 验证修复结果
SELECT 
    '修复后的充值记录' as '检查项目',
    COUNT(*) as '记录数量'
FROM recharge_records 
WHERE total_amount = (amount + bonus_amount);

SELECT 
    '修复后的余额变动记录' as '检查项目',
    COUNT(*) as '记录数量'
FROM balance_transactions bt
JOIN recharge_records rr ON bt.related_id = rr.id
WHERE bt.transaction_type = 'recharge' 
AND bt.amount = (rr.amount + rr.bonus_amount);

-- 9. 显示修复后的用户余额
SELECT 
    u.id,
    u.username,
    u.balance as '当前余额',
    u.total_recharge as '累计充值',
    u.membership_level as '会员等级'
FROM users u
ORDER BY u.id;
