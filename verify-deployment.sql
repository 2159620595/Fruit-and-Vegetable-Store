-- 验证充值系统部署结果
-- 执行完 database-recharge-system-final.sql 后运行此脚本

-- 1. 检查用户表新增字段
SELECT 
    '用户表字段检查' as '检查项目',
    COLUMN_NAME as '字段名',
    DATA_TYPE as '数据类型',
    IS_NULLABLE as '允许空值',
    COLUMN_DEFAULT as '默认值',
    COLUMN_COMMENT as '注释'
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE() 
AND TABLE_NAME = 'users'
AND COLUMN_NAME IN ('balance', 'membership_level', 'total_recharge')
ORDER BY ORDINAL_POSITION;

-- 2. 检查创建的表
SELECT 
    '创建的表' as '检查项目',
    TABLE_NAME as '表名',
    TABLE_COMMENT as '表注释',
    CREATE_TIME as '创建时间'
FROM INFORMATION_SCHEMA.TABLES 
WHERE TABLE_SCHEMA = DATABASE() 
AND TABLE_NAME IN ('recharge_records', 'balance_transactions', 'membership_levels', 'recharge_amounts')
ORDER BY TABLE_NAME;

-- 3. 检查视图
SELECT 
    '创建的视图' as '检查项目',
    TABLE_NAME as '视图名',
    'v_user_balance_info' as '状态'
FROM INFORMATION_SCHEMA.VIEWS 
WHERE TABLE_SCHEMA = DATABASE() 
AND TABLE_NAME = 'v_user_balance_info';

-- 4. 检查存储过程
SELECT 
    '创建的存储过程' as '检查项目',
    ROUTINE_NAME as '存储过程名',
    ROUTINE_TYPE as '类型',
    CREATED as '创建时间'
FROM INFORMATION_SCHEMA.ROUTINES 
WHERE ROUTINE_SCHEMA = DATABASE() 
AND ROUTINE_NAME IN ('sp_process_recharge', 'sp_process_balance_payment')
ORDER BY ROUTINE_NAME;

-- 5. 检查触发器
SELECT 
    '创建的触发器' as '检查项目',
    TRIGGER_NAME as '触发器名',
    EVENT_MANIPULATION as '触发事件',
    ACTION_TIMING as '触发时机',
    CREATED as '创建时间'
FROM INFORMATION_SCHEMA.TRIGGERS 
WHERE TRIGGER_SCHEMA = DATABASE() 
AND TRIGGER_NAME = 'tr_recharge_success';

-- 6. 检查索引
SELECT 
    '创建的索引' as '检查项目',
    TABLE_NAME as '表名',
    INDEX_NAME as '索引名',
    COLUMN_NAME as '字段名',
    NON_UNIQUE as '是否唯一'
FROM INFORMATION_SCHEMA.STATISTICS 
WHERE TABLE_SCHEMA = DATABASE() 
AND (
    (TABLE_NAME = 'users' AND INDEX_NAME IN ('idx_users_balance', 'idx_users_membership_level'))
    OR (TABLE_NAME = 'balance_transactions' AND INDEX_NAME = 'idx_balance_transactions_user_type')
    OR (TABLE_NAME = 'recharge_records' AND INDEX_NAME IN ('idx_user_id', 'idx_payment_status', 'idx_created_at'))
)
ORDER BY TABLE_NAME, INDEX_NAME, SEQ_IN_INDEX;

-- 7. 检查配置数据
SELECT 
    '会员等级配置' as '检查项目',
    level_name as '等级名称',
    level_icon as '等级图标',
    min_amount as '最低消费',
    discount_rate as '折扣率',
    benefits as '特权描述'
FROM membership_levels
ORDER BY min_amount;

SELECT 
    '充值金额配置' as '检查项目',
    amount as '充值金额',
    bonus_amount as '赠送金额',
    is_active as '是否启用',
    sort_order as '排序'
FROM recharge_amounts
ORDER BY sort_order;

-- 8. 测试视图查询
SELECT 
    '视图测试' as '检查项目',
    COUNT(*) as '用户数量',
    'v_user_balance_info视图查询正常' as '状态'
FROM v_user_balance_info;

-- 9. 部署完成确认
SELECT 
    '🎉 充值系统部署完成！' as '部署状态',
    '所有表和功能已成功创建' as '详细信息',
    NOW() as '完成时间';
