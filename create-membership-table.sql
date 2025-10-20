-- 创建 membership_levels 表
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

-- 插入默认会员等级配置
INSERT IGNORE INTO membership_levels (level_name, level_icon, min_amount, discount_rate, benefits) VALUES
('普通会员', '🥉', 0.00, 1.00, '基础购物体验'),
('白银会员', '🥈', 500.00, 0.95, '享受9.5折优惠'),
('黄金会员', '🥇', 2000.00, 0.90, '享受9折优惠，专属客服'),
('钻石会员', '💎', 5000.00, 0.85, '享受8.5折优惠，优先发货');
