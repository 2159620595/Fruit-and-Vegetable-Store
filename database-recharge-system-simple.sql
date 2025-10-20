-- 充值系统数据库表结构 - 简化版
-- 创建时间: 2024-01-20
-- 只添加缺失的字段和表

-- 1. 检查并添加用户表字段
-- 添加 membership_level 字段（如果不存在）
ALTER TABLE users ADD COLUMN membership_level VARCHAR(20) DEFAULT '普通会员' COMMENT '会员等级';

-- 添加 total_recharge 字段（如果不存在）
ALTER TABLE users ADD COLUMN total_recharge DECIMAL(10,2) DEFAULT 0.00 COMMENT '累计充值金额';

-- 2. 创建充值记录表
CREATE TABLE IF NOT EXISTS recharge_records (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL COMMENT '充值金额',
    bonus_amount DECIMAL(10,2) DEFAULT 0.00 COMMENT '赠送金额',
    total_amount DECIMAL(10,2) NOT NULL COMMENT '实际到账金额',
    payment_method VARCHAR(20) NOT NULL COMMENT '支付方式: alipay, wechat, bank',
    payment_status ENUM('pending', 'success', 'failed', 'cancelled') DEFAULT 'pending' COMMENT '支付状态',
    transaction_id VARCHAR(100) COMMENT '第三方交易ID',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_payment_status (payment_status),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='充值记录表';

-- 3. 创建余额变动记录表
CREATE TABLE IF NOT EXISTS balance_transactions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    transaction_type ENUM('recharge', 'purchase', 'refund', 'bonus', 'deduction') NOT NULL COMMENT '交易类型',
    amount DECIMAL(10,2) NOT NULL COMMENT '变动金额(正数为增加，负数为减少)',
    balance_before DECIMAL(10,2) NOT NULL COMMENT '变动前余额',
    balance_after DECIMAL(10,2) NOT NULL COMMENT '变动后余额',
    related_id INT COMMENT '关联记录ID(如订单ID、充值记录ID等)',
    description VARCHAR(255) COMMENT '交易描述',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_transaction_type (transaction_type),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='余额变动记录表';

-- 4. 创建会员等级配置表
CREATE TABLE IF NOT EXISTS membership_levels (
    id INT PRIMARY KEY AUTO_INCREMENT,
    level_name VARCHAR(20) NOT NULL COMMENT '等级名称',
    level_icon VARCHAR(10) COMMENT '等级图标',
    min_amount DECIMAL(10,2) NOT NULL COMMENT '最低消费金额',
    discount_rate DECIMAL(3,2) DEFAULT 1.00 COMMENT '折扣率(1.00为无折扣)',
    benefits TEXT COMMENT '会员特权描述',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_level_name (level_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='会员等级配置表';

-- 5. 插入默认会员等级配置
INSERT IGNORE INTO membership_levels (level_name, level_icon, min_amount, discount_rate, benefits) VALUES
('普通会员', '🥉', 0.00, 1.00, '基础购物体验'),
('白银会员', '🥈', 500.00, 0.95, '享受9.5折优惠'),
('黄金会员', '🥇', 2000.00, 0.90, '享受9折优惠，专属客服'),
('钻石会员', '💎', 5000.00, 0.85, '享受8.5折优惠，优先发货');

-- 6. 创建充值金额配置表
CREATE TABLE IF NOT EXISTS recharge_amounts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    amount DECIMAL(10,2) NOT NULL COMMENT '充值金额',
    bonus_amount DECIMAL(10,2) DEFAULT 0.00 COMMENT '赠送金额',
    is_active BOOLEAN DEFAULT TRUE COMMENT '是否启用',
    sort_order INT DEFAULT 0 COMMENT '排序',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_amount (amount)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='充值金额配置表';

-- 7. 插入默认充值金额配置
INSERT IGNORE INTO recharge_amounts (amount, bonus_amount, sort_order) VALUES
(100.00, 0.00, 1),
(300.00, 30.00, 2),
(500.00, 80.00, 3),
(1000.00, 200.00, 4),
(2000.00, 500.00, 5),
(5000.00, 1500.00, 6);

-- 8. 更新现有用户的会员等级
UPDATE users 
SET membership_level = CASE 
    WHEN (order_stats->>'$.total_spent' + 0) >= 5000 THEN '钻石会员'
    WHEN (order_stats->>'$.total_spent' + 0) >= 2000 THEN '黄金会员'
    WHEN (order_stats->>'$.total_spent' + 0) >= 500 THEN '白银会员'
    ELSE '普通会员'
END
WHERE membership_level IS NULL OR membership_level = '';

-- 9. 创建触发器：充值成功后自动更新用户余额
DROP TRIGGER IF EXISTS tr_recharge_success;

DELIMITER //
CREATE TRIGGER tr_recharge_success 
AFTER UPDATE ON recharge_records
FOR EACH ROW
BEGIN
    IF NEW.payment_status = 'success' AND OLD.payment_status != 'success' THEN
        -- 更新用户余额
        UPDATE users 
        SET balance = balance + NEW.total_amount,
            total_recharge = total_recharge + NEW.amount
        WHERE id = NEW.user_id;
        
        -- 记录余额变动
        INSERT INTO balance_transactions (
            user_id, transaction_type, amount, 
            balance_before, balance_after, 
            related_id, description
        ) VALUES (
            NEW.user_id, 'recharge', NEW.total_amount,
            (SELECT balance - NEW.total_amount FROM users WHERE id = NEW.user_id),
            (SELECT balance FROM users WHERE id = NEW.user_id),
            NEW.id, CONCAT('充值到账 ¥', NEW.total_amount)
        );
        
        -- 更新会员等级
        UPDATE users 
        SET membership_level = (
            SELECT level_name 
            FROM membership_levels 
            WHERE min_amount <= (order_stats->>'$.total_spent' + 0) + NEW.amount
            ORDER BY min_amount DESC 
            LIMIT 1
        )
        WHERE id = NEW.user_id;
    END IF;
END//
DELIMITER ;

-- 10. 创建视图：用户余额和会员信息
DROP VIEW IF EXISTS v_user_balance_info;
CREATE VIEW v_user_balance_info AS
SELECT 
    u.id,
    u.username,
    COALESCE(u.balance, 0) as balance,
    COALESCE(u.membership_level, '普通会员') as membership_level,
    COALESCE(u.total_recharge, 0) as total_recharge,
    COALESCE(ml.discount_rate, 1.00) as discount_rate,
    COALESCE(ml.benefits, '基础购物体验') as benefits,
    COALESCE(SUM(CASE WHEN bt.transaction_type = 'recharge' THEN bt.amount ELSE 0 END), 0) as total_recharge_amount,
    COALESCE(SUM(CASE WHEN bt.transaction_type = 'purchase' THEN ABS(bt.amount) ELSE 0 END), 0) as total_consumed_amount
FROM users u
LEFT JOIN membership_levels ml ON u.membership_level = ml.level_name
LEFT JOIN balance_transactions bt ON u.id = bt.user_id
GROUP BY u.id, u.username, u.balance, u.membership_level, u.total_recharge, ml.discount_rate, ml.benefits;

-- 11. 创建存储过程：处理充值
DROP PROCEDURE IF EXISTS sp_process_recharge;

DELIMITER //
CREATE PROCEDURE sp_process_recharge(
    IN p_user_id INT,
    IN p_amount DECIMAL(10,2),
    IN p_payment_method VARCHAR(20),
    IN p_transaction_id VARCHAR(100)
)
BEGIN
    DECLARE v_bonus_amount DECIMAL(10,2) DEFAULT 0.00;
    DECLARE v_total_amount DECIMAL(10,2);
    DECLARE v_recharge_id INT;
    
    -- 计算赠送金额
    SELECT bonus_amount INTO v_bonus_amount
    FROM recharge_amounts 
    WHERE amount = p_amount AND is_active = TRUE;
    
    SET v_total_amount = p_amount + IFNULL(v_bonus_amount, 0.00);
    
    -- 插入充值记录
    INSERT INTO recharge_records (
        user_id, amount, bonus_amount, total_amount, 
        payment_method, transaction_id, payment_status
    ) VALUES (
        p_user_id, p_amount, v_bonus_amount, v_total_amount,
        p_payment_method, p_transaction_id, 'success'
    );
    
    SET v_recharge_id = LAST_INSERT_ID();
    
    -- 返回充值信息
    SELECT 
        v_recharge_id as recharge_id,
        p_amount as recharge_amount,
        v_bonus_amount as bonus_amount,
        v_total_amount as total_amount,
        'success' as status;
END//
DELIMITER ;

-- 12. 创建存储过程：处理余额支付
DROP PROCEDURE IF EXISTS sp_process_balance_payment;

DELIMITER //
CREATE PROCEDURE sp_process_balance_payment(
    IN p_user_id INT,
    IN p_amount DECIMAL(10,2),
    IN p_order_id INT,
    IN p_description VARCHAR(255)
)
BEGIN
    DECLARE v_current_balance DECIMAL(10,2);
    DECLARE v_new_balance DECIMAL(10,2);
    
    -- 获取当前余额
    SELECT COALESCE(balance, 0) INTO v_current_balance FROM users WHERE id = p_user_id;
    
    -- 检查余额是否足够
    IF v_current_balance < p_amount THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = '余额不足';
    END IF;
    
    -- 计算新余额
    SET v_new_balance = v_current_balance - p_amount;
    
    -- 更新用户余额
    UPDATE users SET balance = v_new_balance WHERE id = p_user_id;
    
    -- 记录余额变动
    INSERT INTO balance_transactions (
        user_id, transaction_type, amount, 
        balance_before, balance_after, 
        related_id, description
    ) VALUES (
        p_user_id, 'purchase', -p_amount,
        v_current_balance, v_new_balance,
        p_order_id, p_description
    );
    
    -- 返回支付结果
    SELECT 
        'success' as status,
        v_current_balance as balance_before,
        v_new_balance as balance_after,
        p_amount as paid_amount;
END//
DELIMITER ;

-- 13. 创建索引优化查询性能
CREATE INDEX IF NOT EXISTS idx_users_balance ON users(balance);
CREATE INDEX IF NOT EXISTS idx_users_membership_level ON users(membership_level);
CREATE INDEX IF NOT EXISTS idx_balance_transactions_user_type ON balance_transactions(user_id, transaction_type);

COMMIT;
