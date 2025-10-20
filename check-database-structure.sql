-- 检查数据库结构脚本
-- 用于检查充值系统相关表和字段是否存在

-- 1. 检查用户表结构
SELECT 
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

-- 2. 检查充值相关表是否存在
SELECT 
    TABLE_NAME as '表名',
    TABLE_COMMENT as '表注释',
    CREATE_TIME as '创建时间'
FROM INFORMATION_SCHEMA.TABLES 
WHERE TABLE_SCHEMA = DATABASE() 
AND TABLE_NAME IN ('recharge_records', 'balance_transactions', 'membership_levels', 'recharge_amounts')
ORDER BY TABLE_NAME;

-- 3. 检查视图是否存在
SELECT 
    TABLE_NAME as '视图名',
    VIEW_DEFINITION as '视图定义'
FROM INFORMATION_SCHEMA.VIEWS 
WHERE TABLE_SCHEMA = DATABASE() 
AND TABLE_NAME = 'v_user_balance_info';

-- 4. 检查存储过程是否存在
SELECT 
    ROUTINE_NAME as '存储过程名',
    ROUTINE_TYPE as '类型',
    CREATED as '创建时间'
FROM INFORMATION_SCHEMA.ROUTINES 
WHERE ROUTINE_SCHEMA = DATABASE() 
AND ROUTINE_NAME IN ('sp_process_recharge', 'sp_process_balance_payment')
ORDER BY ROUTINE_NAME;

-- 5. 检查触发器是否存在
SELECT 
    TRIGGER_NAME as '触发器名',
    EVENT_MANIPULATION as '触发事件',
    ACTION_TIMING as '触发时机',
    CREATED as '创建时间'
FROM INFORMATION_SCHEMA.TRIGGERS 
WHERE TRIGGER_SCHEMA = DATABASE() 
AND TRIGGER_NAME = 'tr_recharge_success';

-- 6. 检查索引是否存在
SELECT 
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
