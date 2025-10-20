-- 检查充值金额配置
SELECT 
    amount as '充值金额',
    bonus_amount as '赠送金额',
    (amount + bonus_amount) as '实际到账',
    is_active as '是否启用',
    sort_order as '排序'
FROM recharge_amounts 
ORDER BY sort_order;

-- 检查最近的充值记录
SELECT 
    id,
    user_id,
    amount as '充值金额',
    bonus_amount as '赠送金额',
    total_amount as '实际到账',
    payment_status as '支付状态',
    created_at as '创建时间'
FROM recharge_records 
ORDER BY created_at DESC 
LIMIT 10;

-- 检查余额变动记录
SELECT 
    id,
    user_id,
    transaction_type as '交易类型',
    amount as '变动金额',
    balance_before as '变动前余额',
    balance_after as '变动后余额',
    description as '描述',
    created_at as '创建时间'
FROM balance_transactions 
WHERE transaction_type = 'recharge'
ORDER BY created_at DESC 
LIMIT 10;
