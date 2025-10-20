-- 更新订单表，添加会员折扣相关字段
-- 执行时间: 2024-01-20

-- 1. 添加会员折扣相关字段到订单表
ALTER TABLE orders 
ADD COLUMN original_amount DECIMAL(10,2) DEFAULT 0.00 COMMENT '原始商品总价(未折扣)',
ADD COLUMN discount_rate DECIMAL(3,2) DEFAULT 1.00 COMMENT '会员折扣率',
ADD COLUMN membership_level VARCHAR(20) DEFAULT '普通会员' COMMENT '下单时的会员等级';

-- 2. 更新现有订单数据（可选）
-- 将现有订单的 original_amount 设置为 total_amount，discount_rate 设置为 1.00
UPDATE orders 
SET original_amount = total_amount, 
    discount_rate = 1.00, 
    membership_level = '普通会员'
WHERE original_amount IS NULL OR original_amount = 0;

-- 3. 验证更新结果
SELECT 
    '订单表字段更新完成' as '状态',
    COUNT(*) as '订单数量'
FROM orders;

-- 4. 查看订单折扣信息示例
SELECT 
    order_number as '订单号',
    original_amount as '原始金额',
    discount_rate as '折扣率',
    total_amount as '实付金额',
    membership_level as '会员等级',
    (original_amount - total_amount) as '节省金额'
FROM orders 
WHERE original_amount > 0 
ORDER BY created_at DESC 
LIMIT 5;


