<template>
  <div class="logistics-tracking">
   

    <!-- Breadcrumbs -->
    <div class="breadcrumbs">
      <a href="#" class="breadcrumb-link">订单</a>
      <span class="breadcrumb-separator">/</span>
      <span class="breadcrumb-current">订单详情</span>
    </div>

    <!-- Main Content -->
    <div class="main-content">
      <!-- Order Information -->
      <div class="order-info">
        <h1 class="order-number">订单号 #123456789</h1>
        <p class="shipping-info">通过快速配送发货</p>
      </div>

      <!-- Tracking Timeline -->
      <div class="tracking-timeline">
        <div class="timeline-item" :class="{ completed: true }">
          <div class="timeline-icon">
            <div class="icon-circle">📅</div>
          </div>
          <div class="timeline-content">
            <div class="timeline-status">已下订单</div>
            <div class="timeline-date">2024年7月10日上午10:00</div>
          </div>
        </div>

        <div class="timeline-item" :class="{ completed: true }">
          <div class="timeline-icon">
            <div class="icon-circle">📦</div>
          </div>
          <div class="timeline-content">
            <div class="timeline-status">订单已处理</div>
            <div class="timeline-date">2024年7月10日 下午12:00</div>
          </div>
        </div>

        <div class="timeline-item" :class="{ completed: true }">
          <div class="timeline-icon">
            <div class="icon-circle">🚚</div>
          </div>
          <div class="timeline-content">
            <div class="timeline-status">已发货</div>
            <div class="timeline-date">2024年7月11日下午2:00</div>
          </div>
        </div>

        <div class="timeline-item" :class="{ completed: true }">
          <div class="timeline-icon">
            <div class="icon-circle">📍</div>
          </div>
          <div class="timeline-content">
            <div class="timeline-status">在途中</div>
            <div class="timeline-date">2024年7月12日上午9:00</div>
          </div>
        </div>

        <div class="timeline-item" :class="{ completed: true, current: true }">
          <div class="timeline-icon">
            <div class="icon-circle completed">✓</div>
          </div>
          <div class="timeline-content">
            <div class="timeline-status">已送达</div>
            <div class="timeline-date">2024年7月12日下午1:00</div>
          </div>
        </div>
      </div>

      <!-- Estimated Delivery -->
      <div class="delivery-estimate">
        <h3 class="estimate-title">预计送达时间</h3>
        <p class="estimate-text">
          您的订单预计将于 2024 年 7 月 12 日下午 1:00 至 3:00 之间到达。
        </p>
      </div>

      <!-- Action Buttons -->
      <div class="action-buttons">
        <button class="btn btn-secondary">联系配送员</button>
        <button class="btn btn-primary">查看订单详情</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "LogisticsTracking",
  data() {
    return {
      // Component data can be added here if needed
    };
  },
};
</script>

<style scoped>
.logistics-tracking {
  min-height: 100vh;
  background-color: #ffffff;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}

/* Header Styles */
.header {
  background-color: #ffffff;
  border-bottom: 1px solid #e5e5e5;
  padding: 16px 0;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 8px;
}

.leaf-icon {
  font-size: 16px;
  color: #2d5a27;
}

.brand-name {
  font-size: 18px;
  font-weight: 600;
  color: #000000;
}

.nav-links {
  display: flex;
  gap: 32px;
}

.nav-link {
  color: #000000;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  transition: color 0.2s;
}

.nav-link:hover {
  color: #2d5a27;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.action-btn {
  width: 40px;
  height: 40px;
  border: none;
  background-color: #f5f5f5;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.2s;
}

.action-btn:hover {
  background-color: #e5e5e5;
}

/* Breadcrumbs */
.breadcrumbs {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px 24px 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.breadcrumb-link {
  color: #2d5a27;
  text-decoration: none;
  font-size: 14px;
}

.breadcrumb-separator {
  color: #000000;
  font-size: 14px;
}

.breadcrumb-current {
  color: #000000;
  font-size: 14px;
}

/* Main Content */
.main-content {
  max-width: 1200px;
  display: flex;
  flex-direction: column;
  align-items: self-start;
  margin: 0 auto;
  padding: 24px;
}

/* Order Information */
.order-info {
  text-align: center;
  margin-bottom: 48px;
}

.order-number {
  font-size: 32px;
  font-weight: 700;
  color: #000000;
  margin: 0 0 8px 0;
}

.shipping-info {
  font-size: 16px;
  color: #666666;
  margin: 0;
}

/* Tracking Timeline */
.tracking-timeline {
  position: relative;
  margin-bottom: 48px;
}

.tracking-timeline::before {
  content: "";
  position: absolute;
  left: 20px;
  top: 0;
  bottom: 0;
  width: 2px;
  background-color: #e5e5e5;
}

.timeline-item {
  position: relative;
  display: flex;
  align-items: flex-start;
  margin-bottom: 32px;
  padding-left: 60px;
}

.timeline-item:last-child {
  margin-bottom: 0;
}

.timeline-icon {
  position: absolute;
  left: 0;
  top: 0;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
}

.icon-circle {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #ffffff;
  border: 2px solid #e5e5e5;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  color: #666666;
}

.timeline-item.completed .icon-circle {
  border-color: #2d5a27;
  color: #2d5a27;
}

.timeline-item.current .icon-circle {
  background-color: #2d5a27;
  color: #ffffff;
  border-color: #2d5a27;
}

.timeline-content {
  flex: 1;
}

.timeline-status {
  font-size: 16px;
  font-weight: 500;
  color: #000000;
  margin-bottom: 4px;
}

.timeline-date {
  font-size: 14px;
  color: #2d5a27;
  font-weight: 500;
}

/* Delivery Estimate */
.delivery-estimate {
  margin-bottom: 48px;
  text-align: center;
}

.estimate-title {
  font-size: 20px;
  font-weight: 600;
  color: #000000;
  margin: 0 0 12px 0;
}

.estimate-text {
  font-size: 16px;
  color: #000000;
  margin: 0;
  line-height: 1.5;
}

/* Action Buttons */
.action-buttons {
  display: flex;
  gap: 16px;
  justify-content: center;
}

.btn {
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  min-width: 160px;
}

.btn-secondary {
  background-color: #f5f5f5;
  color: #666666;
  border: 1px solid #e5e5e5;
}

.btn-secondary:hover {
  background-color: #e5e5e5;
}

.btn-primary {
  background-color: #2d5a27;
  color: #ffffff;
}

.btn-primary:hover {
  background-color: #1e3d1a;
}

/* Responsive Design */
@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    gap: 16px;
  }

  .nav-links {
    gap: 16px;
  }

  .main-content {
    padding: 16px;
  }

  .order-number {
    font-size: 24px;
  }

  .action-buttons {
    flex-direction: column;
    align-items: center;
  }

  .btn {
    width: 100%;
    max-width: 300px;
  }
}
</style>
