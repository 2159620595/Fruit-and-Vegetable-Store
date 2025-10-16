<template>
  <div class="product-detail-page">
    <!-- Header -->
    <Header />

    <!-- Toast Notification -->
    <Transition name="toast">
      <div v-if="showToast" class="toast-notification" :class="toastType">
        <span class="toast-icon">{{ toastIcon }}</span>
        <span class="toast-message">{{ toastMessage }}</span>
      </div>
    </Transition>

    <!-- Breadcrumbs -->
    <div class="breadcrumbs">
      <a href="#" class="breadcrumb-link" @click.prevent="router.push('/')">首页</a>
      <span class="breadcrumb-separator">/</span>
      <a href="#" class="breadcrumb-link" @click.prevent="router.push('/shop')">商城</a>
      <span class="breadcrumb-separator">/</span>
      <span class="breadcrumb-current">{{ product?.name || '商品详情' }}</span>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p class="loading-text">加载中...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-container">
      <div class="error-icon">⚠️</div>
      <h2 class="error-title">加载失败</h2>
      <p class="error-message">{{ error }}</p>
      <div class="error-actions">
        <button class="btn btn-primary" @click="loadProduct">重试</button>
        <button class="btn btn-secondary" @click="router.push('/shop')">返回商城</button>
      </div>
    </div>

    <!-- Main Product Section -->
    <div class="main-content" v-else-if="product">
      <div class="product-section">
        <!-- Product Image -->
        <div class="product-image-section">
          <!-- Main Image Display -->
          <div class="product-image-wrapper">
            <div class="product-image" :class="{ zoomed: isImageZoomed }">
              <div class="image-container" @click="toggleImageZoom">
                <!-- Placeholder (No Image) -->
                <div v-if="!product.image_url" class="placeholder-image">
                  <div class="placeholder-icon">{{ getProductIcon(product.category) }}</div>
                  <p class="placeholder-text">暂无图片</p>
                </div>

                <!-- Error State -->
                <div v-else-if="imageError" class="image-error">
                  <div class="error-icon">🖼️</div>
                  <p>图片加载失败</p>
                </div>

                <!-- Main Image (默认显示，无需等待imageLoaded) -->
                <img
                  v-else
                  :src="product.image_url"
                  :alt="product.name"
                  class="main-image"
                  @load="onImageLoad"
                  @error="onImageError"
                />

                <!-- Zoom Indicator -->
                <div
                  v-if="product.image_url && !imageError && !isImageZoomed"
                  class="zoom-indicator"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    fill="currentColor"
                    viewBox="0 0 256 256"
                  >
                    <path
                      d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Zm88,32a8,8,0,0,1-8,8H104v16a8,8,0,0,1-16,0V152H72a8,8,0,0,1,0-16H88V120a8,8,0,0,1,16,0v16h16A8,8,0,0,1,128,144Z"
                    ></path>
                  </svg>
                  <span>点击查看大图</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Product Features/Highlights -->
          <div class="product-highlights">
            <div class="highlight-item" v-if="product.is_organic">
              <div class="highlight-icon">🌱</div>
              <div class="highlight-text">
                <span class="highlight-title">有机认证</span>
                <span class="highlight-desc">天然无农药</span>
              </div>
            </div>
            <div class="highlight-item">
              <div class="highlight-icon">🚚</div>
              <div class="highlight-text">
                <span class="highlight-title">快速配送</span>
                <span class="highlight-desc">24小时内送达</span>
              </div>
            </div>
            <div class="highlight-item">
              <div class="highlight-icon">❄️</div>
              <div class="highlight-text">
                <span class="highlight-title">新鲜保障</span>
                <span class="highlight-desc">冷链保鲜配送</span>
              </div>
            </div>
            <div class="highlight-item">
              <div class="highlight-icon">✓</div>
              <div class="highlight-text">
                <span class="highlight-title">品质保证</span>
                <span class="highlight-desc">不满意可退换</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Product Details -->
        <div class="product-details-section">
          <!-- Product Title & Badges -->
          <div class="product-header">
            <h1 class="product-name">{{ product.name }}</h1>
            <div class="product-badges">
              <span v-if="product.is_new" class="badge badge-new">新品</span>
              <span v-if="product.is_hot" class="badge badge-hot">热卖</span>
              <span v-if="product.is_discount" class="badge badge-discount">促销</span>
            </div>
          </div>

          <p class="product-subtitle" v-if="product.name_en">{{ product.name_en }}</p>

          <!-- Rating Section -->
          <div class="rating-section">
            <div class="star-rating">
              <span class="stars">{{ renderStars(product.rating || 0) }}</span>
              <span class="rating-value">{{ formatRating(product.rating) }}</span>
            </div>
            <span class="review-count">{{ reviews.length }} 条评价</span>
            <span class="sales-count" v-if="product.sales_count"
              >已售 {{ product.sales_count }}</span
            >
          </div>

          <!-- Price Section -->
          <div class="price-section">
            <div class="price-wrapper">
              <div class="current-price">
                <span class="currency">¥</span>
                <span class="amount">{{ formatPrice(product.price) }}</span>
                <span class="unit">{{ product.unit || '/份' }}</span>
              </div>
              <div class="original-price" v-if="product.original_price">
                ¥{{ formatPrice(product.original_price) }}
              </div>
            </div>
            <div class="promotion-tag" v-if="product.is_discount && product.discount_rate">
              {{ product.discount_rate }}
            </div>
          </div>

          <!-- Stock Info -->
          <div class="stock-section">
            <span class="stock-label">库存:</span>
            <span class="stock-value" :class="stockClass">
              {{ stockText }}
            </span>
          </div>

          <!-- Quantity Selector -->
          <div class="quantity-section">
            <span class="quantity-label">数量:</span>
            <div class="quantity-selector">
              <button class="quantity-btn" :disabled="quantity <= 1" @click="decreaseQuantity">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  fill="currentColor"
                  viewBox="0 0 256 256"
                >
                  <path d="M224,128a8,8,0,0,1-8,8H40a8,8,0,0,1,0-16H216A8,8,0,0,1,224,128Z"></path>
                </svg>
              </button>
              <input
                type="number"
                class="quantity-input"
                v-model.number="quantity"
                :min="1"
                :max="maxQuantity"
                @blur="validateQuantity"
              />
              <button
                class="quantity-btn"
                :disabled="quantity >= maxQuantity"
                @click="increaseQuantity"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  fill="currentColor"
                  viewBox="0 0 256 256"
                >
                  <path
                    d="M224,128a8,8,0,0,1-8,8H136v80a8,8,0,0,1-16,0V136H40a8,8,0,0,1,0-16h80V40a8,8,0,0,1,16,0v80h80A8,8,0,0,1,224,128Z"
                  ></path>
                </svg>
              </button>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="action-buttons">
            <button class="btn btn-outline" :class="{ active: isFavorite }" @click="toggleFavorite">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                fill="currentColor"
                viewBox="0 0 256 256"
              >
                <path
                  v-if="!isFavorite"
                  d="M178,32c-20.65,0-38.73,8.88-50,23.89C116.73,40.88,98.65,32,78,32A62.07,62.07,0,0,0,16,94c0,70,103.79,126.66,108.21,129a8,8,0,0,0,7.58,0C136.21,220.66,240,164,240,94A62.07,62.07,0,0,0,178,32ZM128,206.8C109.74,196.16,32,147.69,32,94A46.06,46.06,0,0,1,78,48c19.45,0,35.78,10.36,42.6,27a8,8,0,0,0,14.8,0c6.82-16.67,23.15-27,42.6-27a46.06,46.06,0,0,1,46,46C224,147.61,146.24,196.15,128,206.8Z"
                ></path>
                <path
                  v-else
                  d="M240,94c0,70-103.79,126.66-108.21,129a8,8,0,0,1-7.58,0C119.79,220.66,16,164,16,94A62.07,62.07,0,0,1,78,32c20.65,0,38.73,8.88,50,23.89C139.27,40.88,157.35,32,178,32A62.07,62.07,0,0,1,240,94Z"
                ></path>
              </svg>
              <span>{{ isFavorite ? '已收藏' : '收藏' }}</span>
            </button>
            <button class="btn btn-secondary" :disabled="!canAddToCart" @click="addToCart">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                fill="currentColor"
                viewBox="0 0 256 256"
              >
                <path
                  d="M222.14,58.87A8,8,0,0,0,216,56H54.68L49.79,29.14A16,16,0,0,0,34.05,16H16a8,8,0,0,0,0,16h18L59.56,172.29a24,24,0,0,0,5.33,11.27,28,28,0,1,0,44.4,8.44h45.42A27.75,27.75,0,0,0,152,204a28,28,0,1,0,28-28H83.17a8,8,0,0,1-7.87-6.57L72.13,152h116a24,24,0,0,0,23.61-19.71l12.16-66.86A8,8,0,0,0,222.14,58.87ZM96,204a12,12,0,1,1-12-12A12,12,0,0,1,96,204Zm96,0a12,12,0,1,1-12-12A12,12,0,0,1,192,204Zm4-68H69.22L57.59,72H206.41Z"
                ></path>
              </svg>
              <span>加入购物车</span>
            </button>
            <button class="btn btn-primary" :disabled="!canAddToCart" @click="buyNow">
              <span>立即购买</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Product Details Tabs (横向全宽) -->
      <div class="product-details-tabs-fullwidth">
        <div class="tabs-header">
          <button
            class="tab-btn"
            :class="{ active: activeTab === 'description' }"
            @click="activeTab = 'description'"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              fill="currentColor"
              viewBox="0 0 256 256"
            >
              <path
                d="M208,32H48A16,16,0,0,0,32,48V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V48A16,16,0,0,0,208,32ZM176,152H80a8,8,0,0,1,0-16h96a8,8,0,0,1,0,16Zm0-32H80a8,8,0,0,1,0-16h96a8,8,0,0,1,0,16Zm0-32H80a8,8,0,0,1,0-16h96a8,8,0,0,1,0,16Z"
              ></path>
            </svg>
            商品描述
          </button>
          <button
            class="tab-btn"
            :class="{ active: activeTab === 'specs' }"
            @click="activeTab = 'specs'"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              fill="currentColor"
              viewBox="0 0 256 256"
            >
              <path
                d="M200,24H72A16,16,0,0,0,56,40V64H40A16,16,0,0,0,24,80v96a16,16,0,0,0,16,16H56v24a16,16,0,0,0,16,16H200a16,16,0,0,0,16-16V40A16,16,0,0,0,200,24ZM72,176H40V80H72Zm128,40H72V192h48a16,16,0,0,0,16-16V80a16,16,0,0,0-16-16H72V40H200Z"
              ></path>
            </svg>
            规格参数
          </button>
          <button
            class="tab-btn"
            :class="{ active: activeTab === 'nutrition' }"
            @click="activeTab = 'nutrition'"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              fill="currentColor"
              viewBox="0 0 256 256"
            >
              <path
                d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm40-68a8,8,0,0,1-8,8H96a8,8,0,0,1,0-16h64A8,8,0,0,1,168,148Zm0-32a8,8,0,0,1-8,8H96a8,8,0,0,1,0-16h64A8,8,0,0,1,168,116Z"
              ></path>
            </svg>
            营养成分
          </button>
        </div>

        <div class="tabs-content">
          <!-- Description Tab -->
          <div v-show="activeTab === 'description'" class="tab-panel">
            <div class="description-content">
              <p class="description-text">
                {{
                  product.description ||
                  '这是一款优质的生鲜产品，精心挑选，新鲜直达。我们承诺为您提供最优质的食材，让您和家人享受健康美味的生活。'
                }}
              </p>

              <div class="description-features">
                <h4 class="features-title">产品特点</h4>
                <ul class="features-list">
                  <li>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      fill="currentColor"
                      viewBox="0 0 256 256"
                    >
                      <path
                        d="M173.66,98.34a8,8,0,0,1,0,11.32l-56,56a8,8,0,0,1-11.32,0l-24-24a8,8,0,0,1,11.32-11.32L112,148.69l50.34-50.35A8,8,0,0,1,173.66,98.34ZM232,128A104,104,0,1,1,128,24,104.11,104.11,0,0,1,232,128Zm-16,0a88,88,0,1,0-88,88A88.1,88.1,0,0,0,216,128Z"
                      ></path>
                    </svg>
                    <span>严格筛选，品质保证</span>
                  </li>
                  <li>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      fill="currentColor"
                      viewBox="0 0 256 256"
                    >
                      <path
                        d="M173.66,98.34a8,8,0,0,1,0,11.32l-56,56a8,8,0,0,1-11.32,0l-24-24a8,8,0,0,1,11.32-11.32L112,148.69l50.34-50.35A8,8,0,0,1,173.66,98.34ZM232,128A104,104,0,1,1,128,24,104.11,104.11,0,0,1,232,128Zm-16,0a88,88,0,1,0-88,88A88.1,88.1,0,0,0,216,128Z"
                      ></path>
                    </svg>
                    <span>新鲜采摘，当日配送</span>
                  </li>
                  <li>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      fill="currentColor"
                      viewBox="0 0 256 256"
                    >
                      <path
                        d="M173.66,98.34a8,8,0,0,1,0,11.32l-56,56a8,8,0,0,1-11.32,0l-24-24a8,8,0,0,1,11.32-11.32L112,148.69l50.34-50.35A8,8,0,0,1,173.66,98.34ZM232,128A104,104,0,1,1,128,24,104.11,104.11,0,0,1,232,128Zm-16,0a88,88,0,1,0-88,88A88.1,88.1,0,0,0,216,128Z"
                      ></path>
                    </svg>
                    <span>冷链保鲜，锁住营养</span>
                  </li>
                  <li>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      fill="currentColor"
                      viewBox="0 0 256 256"
                    >
                      <path
                        d="M173.66,98.34a8,8,0,0,1,0,11.32l-56,56a8,8,0,0,1-11.32,0l-24-24a8,8,0,0,1,11.32-11.32L112,148.69l50.34-50.35A8,8,0,0,1,173.66,98.34ZM232,128A104,104,0,1,1,128,24,104.11,104.11,0,0,1,232,128Zm-16,0a88,88,0,1,0-88,88A88.1,88.1,0,0,0,216,128Z"
                      ></path>
                    </svg>
                    <span>绿色健康，安全放心</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <!-- Specs Tab -->
          <div v-show="activeTab === 'specs'" class="tab-panel">
            <div class="specs-content">
              <table class="specs-table">
                <tbody>
                  <tr>
                    <td class="spec-label">商品名称</td>
                    <td class="spec-value">{{ product.name }}</td>
                  </tr>
                  <tr>
                    <td class="spec-label">商品分类</td>
                    <td class="spec-value">{{ product.category || '生鲜果蔬' }}</td>
                  </tr>
                  <tr>
                    <td class="spec-label">销售单位</td>
                    <td class="spec-value">{{ product.unit || '份' }}</td>
                  </tr>
                  <tr v-if="product.weight">
                    <td class="spec-label">重量/规格</td>
                    <td class="spec-value">{{ product.weight }}</td>
                  </tr>
                  <tr>
                    <td class="spec-label">当前价格</td>
                    <td class="spec-value">
                      <span class="price-highlight"
                        >¥{{ formatPrice(product.price) }}{{ product.unit }}</span
                      >
                    </td>
                  </tr>
                  <tr v-if="product.original_price">
                    <td class="spec-label">原价</td>
                    <td class="spec-value">
                      <span class="original-price-text"
                        >¥{{ formatPrice(product.original_price) }}</span
                      >
                      <span v-if="product.discount_rate" class="discount-tag"
                        >{{ product.discount_rate }} OFF</span
                      >
                    </td>
                  </tr>
                  <tr>
                    <td class="spec-label">库存</td>
                    <td class="spec-value">
                      <span :class="stockClass">{{ product.stock || 0 }} 件</span>
                    </td>
                  </tr>
                  <tr v-if="product.sales_count">
                    <td class="spec-label">已售</td>
                    <td class="spec-value">{{ product.sales_count }} 件</td>
                  </tr>
                  <tr v-if="product.rating">
                    <td class="spec-label">评分</td>
                    <td class="spec-value">
                      <span class="rating-display">
                        {{ formatRating(product.rating) }}
                        <span class="stars-inline">{{ renderStars(product.rating) }}</span>
                        <span class="review-count-inline" v-if="product.review_count">
                          ({{ product.review_count }} 条评价)
                        </span>
                      </span>
                    </td>
                  </tr>
                  <tr v-if="product.category">
                    <td class="spec-label">分类</td>
                    <td class="spec-value">{{ product.category }}</td>
                  </tr>
                  <tr v-if="product.is_organic">
                    <td class="spec-label">认证</td>
                    <td class="spec-value">
                      <span class="organic-badge">🌱 有机认证</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Nutrition Tab -->
          <div v-show="activeTab === 'nutrition'" class="tab-panel">
            <div class="nutrition-content">
              <h4 class="nutrition-title">营养价值</h4>
              <p class="nutrition-desc">富含多种维生素和矿物质，是健康饮食的重要组成部分。</p>
              <div class="nutrition-grid">
                <div class="nutrition-item">
                  <div class="nutrition-icon">💪</div>
                  <div class="nutrition-name">膳食纤维</div>
                  <div class="nutrition-benefit">促进消化</div>
                </div>
                <div class="nutrition-item">
                  <div class="nutrition-icon">🍊</div>
                  <div class="nutrition-name">维生素C</div>
                  <div class="nutrition-benefit">增强免疫力</div>
                </div>
                <div class="nutrition-item">
                  <div class="nutrition-icon">🦴</div>
                  <div class="nutrition-name">钙质</div>
                  <div class="nutrition-benefit">强健骨骼</div>
                </div>
                <div class="nutrition-item">
                  <div class="nutrition-icon">⚡</div>
                  <div class="nutrition-name">能量</div>
                  <div class="nutrition-benefit">补充体力</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Customer Reviews Section -->
      <div class="reviews-section">
        <div class="reviews-header">
          <h2 class="section-title">客户评价</h2>
          <div class="reviews-summary" v-if="reviews.length > 0">
            <span class="average-rating">{{ formatRating(averageRating) }}</span>
            <div class="rating-stars">{{ renderStars(averageRating) }}</div>
            <span class="total-reviews">基于 {{ reviews.length }} 条评价</span>
          </div>
        </div>

        <div v-if="reviews.length === 0" class="empty-reviews">
          <div class="empty-icon">💬</div>
          <p class="empty-text">暂无评价，快来抢沙发吧！</p>
        </div>

        <div class="reviews-list" v-else>
          <div v-for="review in reviews" :key="review.id" class="review-item">
            <div class="review-header">
              <div class="reviewer-info">
                <div class="reviewer-avatar">
                  <img
                    :src="
                      review.user_avatar ||
                      review.avatar ||
                      'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiNEMUQ1REIiLz4KPHBhdGggZD0iTTIwIDIwQzIyLjc2MTQgMjAgMjUgMTcuNzYxNCAyNSAxNUMyNSAxMi4yMzg2IDIyLjc2MTQgMTAgMjAgMTBDMTcuMjM4NiAxMCAxNSAxMi4yMzg2IDE1IDE1QzE1IDE3Ljc2MTQgMTcuMjM4NiAyMCAyMCAyMFoiIGZpbGw9IiM2NjY2NjYiLz4KPHBhdGggZD0iTTIwIDMwQzI0LjQxODMgMzAgMjggMjYuNDE4MyAyOCAyMkgyOEMyOCAyMC44OTU0IDI3LjEwNDYgMjAgMjYgMjBIMTRDMTIuODk1NCAyMCAxMiAyMC44OTU0IDEyIDIySDhDOCAyNi40MTgzIDExLjU4MTcgMzAgMjAgMzBaIiBmaWxsPSIjNjY2NjY2Ii8+Cjwvc3ZnPgo='
                    "
                    :alt="review.user_name || review.full_name"
                  />
                </div>
                <div class="reviewer-details">
                  <div class="reviewer-name">
                    {{ review.user_name || review.full_name || '匿名用户' }}
                  </div>
                  <div class="review-date">{{ formatDate(review.created_at) }}</div>
                </div>
              </div>
              <div class="star-rating">
                {{ renderStars(review.rating) }}
              </div>
            </div>
            <div class="review-content">
              <p class="review-text">{{ review.comment }}</p>
            </div>
            <div class="review-engagement">
              <button class="engagement-btn" @click="likeReview(review.id)">
                <span class="emoji">👍</span>
                <span class="count">{{ review.likes || 0 }}</span>
              </button>
              <button class="engagement-btn" @click="dislikeReview(review.id)">
                <span class="emoji">👎</span>
                <span class="count">{{ review.dislikes || 0 }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Related Products Section -->
      <div class="related-products-section" v-if="relatedProducts.length > 0">
        <h2 class="section-title">相关商品推荐</h2>
        <div class="related-products-grid">
          <div
            v-for="item in relatedProducts"
            :key="item.id"
            class="related-product"
            @click="goToProduct(item.id)"
          >
            <div class="related-product-image">
              <img v-if="item.image_url" :src="item.image_url" :alt="item.name" loading="lazy" />
              <div v-else class="product-placeholder">🍎</div>
              <div class="product-overlay">
                <span class="view-detail">查看详情</span>
              </div>
            </div>
            <div class="related-product-info">
              <h3 class="related-product-name">{{ item.name }}</h3>
              <div class="related-product-rating">
                <span class="stars-small">{{ renderStars(item.rating || 0) }}</span>
              </div>
              <div class="related-product-price">
                <span class="price-current">¥{{ formatPrice(item.price) }}</span>
                <span class="price-original" v-if="item.original_price">
                  ¥{{ formatPrice(item.original_price) }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State (if no product after loading) -->
    <div v-else class="error-container">
      <div class="error-icon">📦</div>
      <h2 class="error-title">商品不存在</h2>
      <p class="error-message">该商品可能已下架或不存在</p>
      <div class="error-actions">
        <button class="btn btn-primary" @click="router.push('/shop')">返回商城</button>
      </div>
    </div>

    <!-- Footer -->
    <footer class="footer">
      <div class="footer-content">
        <div class="footer-links">
          <a href="#" class="footer-link">About Us</a>
          <a href="#" class="footer-link">Contact</a>
          <a href="#" class="footer-link">FAQ</a>
          <a href="#" class="footer-link">Privacy Policy</a>
          <a href="#" class="footer-link">Terms of Service</a>
        </div>
        <div class="social-links">
          <a href="#" class="social-link">📷</a>
          <a href="#" class="social-link">🐦</a>
          <a href="#" class="social-link">📘</a>
        </div>
        <div class="copyright">@2024 Fresh Harvest. All rights reserved.</div>
      </div>
    </footer>
  </div>
</template>
<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cartStore'
import { useProductStore } from '@/stores/productStore'
import { useUserStore } from '@/stores/userStore'
import Header from '@/components/Header.vue'

const route = useRoute()
const router = useRouter()
const cartStore = useCartStore()
const productStore = useProductStore()
const userStore = useUserStore()

// State
const product = ref(null)
const quantity = ref(1)
const reviews = ref([])
const relatedProducts = ref([])
const loading = ref(false)
const error = ref(null)
const isFavorite = ref(false)

// Image state
const isImageZoomed = ref(false)
const imageLoaded = ref(false)
const imageError = ref(false)

// Tabs state
const activeTab = ref('description')

// Toast notification
const showToast = ref(false)
const toastMessage = ref('')
const toastType = ref('success')

// Computed properties
const maxQuantity = computed(() => {
  if (!product.value) return 99
  return product.value.stock || 99
})

const canAddToCart = computed(() => {
  return product.value && product.value.stock > 0 && quantity.value > 0
})

const stockClass = computed(() => {
  if (!product.value || !product.value.stock) return 'out-of-stock'
  if (product.value.stock < 10) return 'low-stock'
  return 'in-stock'
})

const stockText = computed(() => {
  if (!product.value || !product.value.stock || product.value.stock === 0) {
    return '暂无库存'
  }
  if (product.value.stock < 10) {
    return `仅剩 ${product.value.stock} 件`
  }
  return `充足 (${product.value.stock})`
})

const averageRating = computed(() => {
  if (reviews.value.length === 0) return 0
  const sum = reviews.value.reduce((acc, review) => acc + (review.rating || 0), 0)
  return sum / reviews.value.length
})

const toastIcon = computed(() => {
  return toastType.value === 'success' ? '✓' : toastType.value === 'error' ? '✗' : 'ℹ'
})

// Helper functions
const formatPrice = (price) => {
  const numPrice = typeof price === 'number' ? price : parseFloat(price) || 0
  return numPrice.toFixed(2)
}

const formatRating = (rating) => {
  const numRating = typeof rating === 'number' ? rating : parseFloat(rating) || 0
  return numRating.toFixed(1)
}

const renderStars = (rating) => {
  const numRating = typeof rating === 'number' ? rating : parseFloat(rating) || 0
  const fullStars = Math.floor(numRating)
  const hasHalfStar = numRating % 1 >= 0.5
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0)

  return '★'.repeat(fullStars) + (hasHalfStar ? '☆' : '') + '☆'.repeat(emptyStars)
}

const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
}

// Image functions
const getProductIcon = (category) => {
  const icons = {
    水果: '🍎',
    蔬菜: '🥬',
    肉类: '🥩',
    海鲜: '🦐',
    饮品: '🥤',
    零食: '🍪',
  }
  return icons[category] || '🍎'
}

const toggleImageZoom = () => {
  if (product.value?.image_url) {
    isImageZoomed.value = !isImageZoomed.value
  }
}

const onImageLoad = () => {
  imageLoaded.value = true
  imageError.value = false
}

const onImageError = () => {
  imageLoaded.value = false
  imageError.value = true
  console.error('图片加载失败')
}

const resetImageState = () => {
  imageLoaded.value = false
  imageError.value = false
  isImageZoomed.value = false
}

// Toast notification
const showToastNotification = (message, type = 'success') => {
  toastMessage.value = message
  toastType.value = type
  showToast.value = true
  setTimeout(() => {
    showToast.value = false
  }, 3000)
}

// Quantity controls
const increaseQuantity = () => {
  if (quantity.value < maxQuantity.value) {
    quantity.value++
  }
}

const decreaseQuantity = () => {
  if (quantity.value > 1) {
    quantity.value--
  }
}

const validateQuantity = () => {
  if (quantity.value < 1) quantity.value = 1
  if (quantity.value > maxQuantity.value) quantity.value = maxQuantity.value
}

// Cart actions
const addToCart = () => {
  if (!canAddToCart.value) {
    showToastNotification('该商品暂时无法购买', 'error')
    return
  }

  if (!userStore.isAuthenticated) {
    showToastNotification('请先登录', 'info')
    router.push({ path: '/login', query: { redirect: route.fullPath } })
    return
  }

  cartStore.addToCart(product.value, quantity.value)
  showToastNotification(`已添加 ${quantity.value} 件商品到购物车`, 'success')
}

const buyNow = () => {
  if (!canAddToCart.value) {
    showToastNotification('该商品暂时无法购买', 'error')
    return
  }

  if (!userStore.isAuthenticated) {
    showToastNotification('请先登录', 'info')
    router.push({ path: '/login', query: { redirect: route.fullPath } })
    return
  }

  cartStore.addToCart(product.value, quantity.value)
  router.push('/cart')
}

// Favorite toggle
const toggleFavorite = () => {
  if (!userStore.isAuthenticated) {
    showToastNotification('请先登录', 'info')
    router.push({ path: '/login', query: { redirect: route.fullPath } })
    return
  }

  isFavorite.value = !isFavorite.value
  showToastNotification(
    isFavorite.value ? '已添加到收藏' : '已取消收藏',
    isFavorite.value ? 'success' : 'info',
  )
}

// Review interactions
const likeReview = (reviewId) => {
  console.log('Like review:', reviewId)
  // TODO: Implement like review API call
}

const dislikeReview = (reviewId) => {
  console.log('Dislike review:', reviewId)
  // TODO: Implement dislike review API call
}

// Load reviews - 已经从API一起返回，不需要单独加载
const loadReviews = (reviewsData) => {
  if (Array.isArray(reviewsData)) {
    reviews.value = reviewsData
    console.log(`✅ 加载了 ${reviewsData.length} 条评价`)
  } else {
    reviews.value = []
  }
}

// Navigate to product
const goToProduct = (id) => {
  router.push(`/product/${id}`)
  // Scroll to top when navigating to a new product
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// Load product data
const loadProduct = async () => {
  loading.value = true
  error.value = null

  try {
    console.log('🔍 加载商品详情 ID:', route.params.id)

    // Fetch product details (包含product、reviews、related_products)
    const responseData = await productStore.fetchProductById(route.params.id)

    // API返回的数据结构: { product: {...}, reviews: [...], related_products: [...] }
    if (responseData.product) {
      product.value = responseData.product
      console.log('📦 商品信息:', {
        id: responseData.product.id,
        name: responseData.product.name,
        price: responseData.product.price,
        stock: responseData.product.stock,
        rating: responseData.product.rating,
        is_favorite: responseData.product.is_favorite,
      })

      // 设置收藏状态
      isFavorite.value = responseData.product.is_favorite === 1

      // Reset image state
      resetImageState()

      // Load reviews from API response
      loadReviews(responseData.reviews || [])

      // Load related products from API response
      if (Array.isArray(responseData.related_products)) {
        relatedProducts.value = responseData.related_products
        console.log(`🔗 相关商品: ${relatedProducts.value.length} 个`)
      } else {
        relatedProducts.value = []
      }

      console.log('✅ 商品详情加载成功')
    } else {
      // 兼容旧的数据格式
      product.value = responseData
      resetImageState()
      loadReviews([])
      relatedProducts.value = []
      console.warn('⚠️ API返回格式不符合预期，使用兼容模式')
    }
  } catch (err) {
    console.error('❌ 加载商品详情失败:', err)
    error.value = err.message || '加载失败，请稍后重试'
  } finally {
    loading.value = false
  }
}

// Watch for route changes
watch(
  () => route.params.id,
  (newId) => {
    if (newId) {
      quantity.value = 1
      isFavorite.value = false
      loadProduct()
    }
  },
)

// Initial load
onMounted(() => {
  loadProduct()
})
</script>

<style scoped>
.product-detail-page {
  min-height: 100vh;
  background-color: #f8f9fa;
  font-family:
    -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
  padding-bottom: 40px;
}

/* Toast Notification */
.toast-notification {
  position: fixed;
  top: 80px;
  right: 24px;
  padding: 16px 24px;
  border-radius: 12px;
  background-color: #fff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
  gap: 12px;
  z-index: 9999;
  min-width: 260px;
  animation: slideIn 0.3s ease-out;
}

.toast-notification.success {
  border-left: 4px solid #4caf50;
}

.toast-notification.error {
  border-left: 4px solid #f44336;
}

.toast-notification.info {
  border-left: 4px solid #2196f3;
}

.toast-icon {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 16px;
}

.toast-notification.success .toast-icon {
  background-color: #4caf50;
  color: white;
}

.toast-notification.error .toast-icon {
  background-color: #f44336;
  color: white;
}

.toast-notification.info .toast-icon {
  background-color: #2196f3;
  color: white;
}

.toast-message {
  flex: 1;
  font-size: 15px;
  color: #333;
  font-weight: 500;
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.toast-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(100%);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* Breadcrumbs */
.breadcrumbs {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px 24px;
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: #fff;
  border-radius: 8px;
  margin-top: 16px;
}

.breadcrumb-link {
  color: #618961;
  text-decoration: none;
  font-size: 14px;
  transition: color 0.2s;
}

.breadcrumb-link:hover {
  color: #4a6d4a;
  text-decoration: underline;
}

.breadcrumb-separator {
  color: #999;
  font-size: 14px;
}

.breadcrumb-current {
  color: #333;
  font-size: 14px;
  font-weight: 500;
}

/* Loading State */
.loading-container {
  max-width: 1200px;
  margin: 60px auto;
  padding: 80px 24px;
  text-align: center;
}

.loading-spinner {
  width: 60px;
  height: 60px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #618961;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.loading-text {
  font-size: 16px;
  color: #666;
}

/* Error State */
.error-container {
  max-width: 600px;
  margin: 60px auto;
  padding: 60px 24px;
  text-align: center;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.error-icon {
  font-size: 64px;
  margin-bottom: 20px;
}

.error-title {
  font-size: 24px;
  font-weight: 700;
  color: #333;
  margin: 0 0 12px 0;
}

.error-message {
  font-size: 16px;
  color: #666;
  margin: 0 0 32px 0;
  line-height: 1.6;
}

.error-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
}

/* Main Content */
.main-content {
  max-width: 1100px;
  margin: 0 auto;
  padding: 20px;
}

/* Product Section */
.product-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
  margin-bottom: 40px;
  background: #fff;
  border-radius: 12px;
  padding: 32px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.product-image-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.product-image-wrapper {
  width: 100%;
}

.product-image {
  width: 100%;
  aspect-ratio: 1;
  background-color: #f8f9fa;
  border-radius: 12px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  position: relative;
}

.product-image.zoomed {
  transform: scale(1.5);
  z-index: 100;
  cursor: zoom-out;
}

.image-container {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f5f7f5 0%, #e8ebe8 100%);
  position: relative;
  cursor: zoom-in;
}

.main-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.product-image.zoomed .image-container {
  cursor: zoom-out;
}

/* Image States */
.image-loading,
.image-error,
.placeholder-image {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 40px;
  color: #999;
}

.loading-spinner-small {
  width: 40px;
  height: 40px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #618961;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.error-icon,
.placeholder-icon {
  font-size: 64px;
}

.placeholder-text {
  font-size: 14px;
  color: #999;
  margin: 0;
}

/* Zoom Indicator */
.zoom-indicator {
  position: absolute;
  bottom: 16px;
  right: 16px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  opacity: 0;
  transition: opacity 0.3s;
  pointer-events: none;
}

.product-image:hover .zoom-indicator {
  opacity: 1;
}

/* Thumbnail Gallery */
.image-thumbnails {
  display: flex;
  gap: 12px;
  margin-top: 16px;
  overflow-x: auto;
  padding-bottom: 8px;
}

.image-thumbnails::-webkit-scrollbar {
  height: 6px;
}

.image-thumbnails::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.image-thumbnails::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 3px;
}

.image-thumbnails::-webkit-scrollbar-thumb:hover {
  background: #555;
}

.thumbnail-item {
  flex-shrink: 0;
  width: 80px;
  height: 80px;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  border: 2px solid transparent;
  transition: all 0.2s;
}

.thumbnail-item:hover {
  border-color: #618961;
}

.thumbnail-item.active {
  border-color: #618961;
  box-shadow: 0 2px 8px rgba(97, 137, 97, 0.3);
}

.thumbnail-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Product Highlights */
.product-highlights {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  background: #f8f9fa;
  padding: 16px;
  border-radius: 10px;
}

.highlight-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  background: white;
  border-radius: 8px;
  transition: all 0.2s;
}

.highlight-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
}

.highlight-icon {
  font-size: 22px;
  flex-shrink: 0;
}

.highlight-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.highlight-title {
  font-size: 12px;
  font-weight: 600;
  color: #333;
}

.highlight-desc {
  font-size: 11px;
  color: #888;
}

/* Tabs */
.product-details-tabs {
  border-top: 1px solid #f0f0f0;
  padding-top: 24px;
}

.tabs-header {
  display: flex;
  gap: 8px;
  border-bottom: 2px solid #f0f0f0;
  margin-bottom: 24px;
}

.tab-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  border: none;
  background: none;
  color: #666;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  border-bottom: 3px solid transparent;
  margin-bottom: -2px;
  transition: all 0.2s;
}

.tab-btn:hover {
  color: #618961;
}

.tab-btn.active {
  color: #618961;
  border-bottom-color: #618961;
}

.tab-btn svg {
  opacity: 0.7;
}

.tab-btn.active svg {
  opacity: 1;
}

.tabs-content {
  min-height: 200px;
}

.tab-panel {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Description Tab */
.description-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.description-text {
  font-size: 15px;
  color: #555;
  line-height: 1.8;
  margin: 0;
}

.description-features {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 12px;
}

.features-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0 0 16px 0;
}

.features-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.features-list li {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
  color: #555;
}

.features-list li svg {
  color: #618961;
  flex-shrink: 0;
}

/* Specs Tab */
.specs-content {
  background: #f8f9fa;
  border-radius: 12px;
  overflow: hidden;
}

.specs-table {
  width: 100%;
  border-collapse: collapse;
}

.specs-table tr {
  border-bottom: 1px solid #e0e0e0;
}

.specs-table tr:last-child {
  border-bottom: none;
}

.spec-label {
  width: 180px;
  padding: 16px 20px;
  font-size: 14px;
  font-weight: 600;
  color: #666;
  background: #fff;
}

.spec-value {
  padding: 16px 20px;
  font-size: 14px;
  color: #333;
  background: #f8f9fa;
}

.organic-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 12px;
  background: #e8f5e8;
  color: #4caf50;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 600;
}

.price-highlight {
  color: #618961;
  font-size: 18px;
  font-weight: 700;
}

.original-price-text {
  color: #999;
  text-decoration: line-through;
  margin-right: 8px;
}

.discount-tag {
  display: inline-block;
  padding: 2px 8px;
  background: #ff5252;
  color: white;
  border-radius: 8px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
}

.rating-display {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.stars-inline {
  color: #ffa726;
  font-size: 14px;
  letter-spacing: 1px;
}

.review-count-inline {
  color: #888;
  font-size: 13px;
}

/* Nutrition Tab */
.nutrition-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.nutrition-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.nutrition-desc {
  font-size: 14px;
  color: #666;
  margin: 0;
}

.nutrition-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.nutrition-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 12px;
  text-align: center;
  transition: all 0.2s;
}

.nutrition-item:hover {
  background: #e8f5e8;
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.nutrition-icon {
  font-size: 32px;
}

.nutrition-name {
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.nutrition-benefit {
  font-size: 12px;
  color: #888;
}

/* Product Details Tabs - 全宽横向布局 */
.product-details-tabs-fullwidth {
  background: #fff;
  border-radius: 12px;
  padding: 32px;
  margin-bottom: 32px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.product-details-tabs-fullwidth .tabs-header {
  display: flex;
  gap: 8px;
  border-bottom: 2px solid #f0f0f0;
  margin-bottom: 24px;
}

.product-details-tabs-fullwidth .tab-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  border: none;
  background: none;
  color: #666;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  border-bottom: 3px solid transparent;
  margin-bottom: -2px;
  transition: all 0.2s;
}

.product-details-tabs-fullwidth .tab-btn:hover {
  color: #618961;
  background-color: #f8f9fa;
}

.product-details-tabs-fullwidth .tab-btn.active {
  color: #618961;
  border-bottom-color: #618961;
}

.product-details-tabs-fullwidth .tab-btn svg {
  opacity: 0.7;
}

.product-details-tabs-fullwidth .tab-btn.active svg {
  opacity: 1;
}

.product-details-tabs-fullwidth .tabs-content {
  min-height: 200px;
}

.product-details-tabs-fullwidth .tab-panel {
  animation: fadeIn 0.3s ease;
}

/* Product Details */
.product-details-section {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.product-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.product-name {
  font-size: 24px;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 10px 0;
  line-height: 1.3;
  flex: 1;
}

.product-badges {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  align-items: flex-start;
}

.badge {
  padding: 5px 12px;
  border-radius: 16px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  white-space: nowrap;
}

.badge-new {
  background-color: #e3f2fd;
  color: #1976d2;
}

.badge-hot {
  background-color: #ffebee;
  color: #d32f2f;
}

.badge-discount {
  background-color: #fff3e0;
  color: #f57c00;
}

.product-subtitle {
  font-size: 14px;
  color: #888;
  margin: 0 0 16px 0;
  font-style: italic;
}

/* Rating Section */
.rating-section {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  padding: 14px 0;
  margin-bottom: 4px;
}

.star-rating {
  display: flex;
  align-items: center;
  gap: 6px;
}

.stars {
  color: #ffa726;
  font-size: 18px;
  letter-spacing: 2px;
}

.rating-value {
  font-size: 15px;
  font-weight: 600;
  color: #333;
}

.review-count,
.sales-count {
  font-size: 13px;
  color: #666;
  padding-left: 12px;
  border-left: 1px solid #e0e0e0;
}

/* Price Section */
.price-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: linear-gradient(135deg, #f0f8f0 0%, #e8f5e8 100%);
  border-radius: 10px;
  padding: 18px 20px;
  margin-bottom: 20px;
}

.price-wrapper {
  display: flex;
  align-items: baseline;
  gap: 12px;
}

.current-price {
  display: flex;
  align-items: baseline;
  gap: 3px;
}

.currency {
  font-size: 20px;
  font-weight: 700;
  color: #618961;
}

.amount {
  font-size: 36px;
  font-weight: 700;
  color: #618961;
  line-height: 1;
}

.unit {
  font-size: 14px;
  color: #618961;
  font-weight: 500;
}

.original-price {
  font-size: 16px;
  color: #999;
  text-decoration: line-through;
}

.promotion-tag {
  background-color: #ff5252;
  color: white;
  padding: 6px 14px;
  border-radius: 16px;
  font-size: 13px;
  font-weight: 600;
}

/* Stock Section */
.stock-section {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 0;
  margin-bottom: 6px;
}

.stock-label {
  font-size: 14px;
  color: #666;
  font-weight: 500;
}

.stock-value {
  font-size: 14px;
  font-weight: 600;
  padding: 5px 12px;
  border-radius: 6px;
}

.stock-value.in-stock {
  color: #4caf50;
  background-color: #e8f5e9;
}

.stock-value.low-stock {
  color: #ff9800;
  background-color: #fff3e0;
}

.stock-value.out-of-stock {
  color: #f44336;
  background-color: #ffebee;
}

/* Quantity Section */
.quantity-section {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 0;
  margin-bottom: 6px;
}

.quantity-label {
  font-size: 14px;
  color: #666;
  font-weight: 500;
}

.quantity-selector {
  display: flex;
  align-items: center;
  gap: 0;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  overflow: hidden;
}

.quantity-btn {
  width: 36px;
  height: 36px;
  border: none;
  background-color: #f5f5f5;
  color: #333;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.quantity-btn:hover:not(:disabled) {
  background-color: #618961;
  color: white;
}

.quantity-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.quantity-input {
  width: 50px;
  height: 36px;
  border: none;
  border-left: 1px solid #e0e0e0;
  border-right: 1px solid #e0e0e0;
  text-align: center;
  font-size: 15px;
  font-weight: 600;
  outline: none;
  -moz-appearance: textfield;
}

.quantity-input::-webkit-outer-spin-button,
.quantity-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

/* Product Description */
.product-description {
  padding: 24px 0;
  border-top: 1px solid #f0f0f0;
}

.description-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0 0 12px 0;
}

.description-text {
  font-size: 15px;
  color: #666;
  line-height: 1.8;
  margin: 0;
}

/* Action Buttons */
.action-buttons {
  display: flex;
  gap: 12px;
  padding-top: 20px;
  margin-top: 6px;
}

.btn {
  padding: 13px 24px;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  display: flex;
  align-items: center;
  gap: 6px;
  justify-content: center;
  flex: 1;
  min-height: 48px;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  background-color: #618961;
  color: #ffffff;
  box-shadow: 0 2px 8px rgba(97, 137, 97, 0.3);
}

.btn-primary:hover:not(:disabled) {
  background-color: #4a6d4a;
  box-shadow: 0 4px 12px rgba(97, 137, 97, 0.4);
  transform: translateY(-1px);
}

.btn-secondary {
  background-color: #fff;
  color: #618961;
  border: 2px solid #618961;
}

.btn-secondary:hover:not(:disabled) {
  background-color: #f0f8f0;
  border-color: #4a6d4a;
}

.btn-outline {
  background-color: #fff;
  color: #666;
  border: 2px solid #e0e0e0;
  flex: 0 0 auto;
  padding: 11px 20px;
  min-width: 120px;
}

.btn-outline:hover {
  border-color: #ff5252;
  color: #ff5252;
  background-color: #fff5f5;
}

.btn-outline.active {
  background-color: #ffebee;
  border-color: #ff5252;
  color: #ff5252;
}

/* Reviews Section */
.reviews-section {
  background: #fff;
  border-radius: 12px;
  padding: 32px;
  margin-bottom: 40px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.reviews-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 28px;
  padding-bottom: 16px;
  border-bottom: 2px solid #f0f0f0;
}

.section-title {
  font-size: 22px;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0;
}

.reviews-summary {
  display: flex;
  align-items: center;
  gap: 16px;
}

.average-rating {
  font-size: 36px;
  font-weight: 700;
  color: #ffa726;
}

.rating-stars {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.rating-stars::before {
  content: '';
  color: #ffa726;
  font-size: 18px;
  letter-spacing: 2px;
}

.total-reviews {
  font-size: 14px;
  color: #666;
}

.empty-reviews {
  text-align: center;
  padding: 60px 20px;
  color: #999;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.empty-text {
  font-size: 16px;
  color: #999;
  margin: 0;
}

.reviews-list {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.review-item {
  background-color: #f8f9fa;
  border-radius: 12px;
  padding: 24px;
  transition: all 0.2s;
}

.review-item:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.review-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.reviewer-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.reviewer-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
}

.reviewer-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.reviewer-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.reviewer-name {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.review-date {
  font-size: 13px;
  color: #999;
}

.star-rating {
  font-size: 16px;
  color: #ffa726;
  letter-spacing: 2px;
}

.review-content {
  margin-bottom: 16px;
}

.review-text {
  font-size: 15px;
  color: #555;
  line-height: 1.7;
  margin: 0;
}

.review-engagement {
  display: flex;
  gap: 16px;
}

.engagement-btn {
  background: none;
  border: 1px solid #e0e0e0;
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 14px;
  color: #666;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 6px;
}

.engagement-btn:hover {
  background-color: #f5f5f5;
  border-color: #618961;
  color: #618961;
}

.engagement-btn .emoji {
  font-size: 16px;
}

.engagement-btn .count {
  font-weight: 500;
}

/* Related Products */
.related-products-section {
  background: #fff;
  border-radius: 12px;
  padding: 32px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.related-products-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-top: 24px;
}

.related-product {
  background-color: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.3s;
  cursor: pointer;
  border: 2px solid transparent;
}

.related-product:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
  border-color: #618961;
}

.related-product-image {
  width: 100%;
  aspect-ratio: 4/3;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48px;
  background: linear-gradient(135deg, #f5f7f5 0%, #e8ebe8 100%);
  position: relative;
  overflow: hidden;
}

.related-product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.related-product:hover .related-product-image img {
  transform: scale(1.1);
}

.product-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48px;
}

.product-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s;
}

.related-product:hover .product-overlay {
  opacity: 1;
}

.view-detail {
  color: white;
  font-size: 14px;
  font-weight: 600;
  padding: 8px 16px;
  background-color: #618961;
  border-radius: 20px;
}

.related-product-info {
  padding: 16px;
  text-align: center;
}

.related-product-name {
  font-size: 15px;
  font-weight: 600;
  color: #333;
  margin: 0 0 8px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.related-product-rating {
  margin-bottom: 8px;
}

.stars-small {
  color: #ffa726;
  font-size: 14px;
  letter-spacing: 1px;
}

.related-product-price {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.price-current {
  font-size: 18px;
  font-weight: 700;
  color: #618961;
}

.price-original {
  font-size: 14px;
  color: #999;
  text-decoration: line-through;
}

/* Footer */
.footer {
  background-color: #f8f9fa;
  border-top: 1px solid #e5e5e5;
  padding: 32px 0;
  margin-top: 60px;
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
  text-align: center;
}

.footer-links {
  display: flex;
  justify-content: center;
  gap: 24px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.footer-link {
  color: #666;
  text-decoration: none;
  font-size: 14px;
  transition: color 0.2s;
}

.footer-link:hover {
  color: #618961;
}

.social-links {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-bottom: 16px;
}

.social-link {
  font-size: 24px;
  text-decoration: none;
  transition: transform 0.2s;
}

.social-link:hover {
  transform: scale(1.2);
}

.copyright {
  font-size: 14px;
  color: #999;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .product-section {
    grid-template-columns: 1fr;
    gap: 32px;
  }

  .related-products-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 768px) {
  .breadcrumbs {
    padding: 16px;
    margin-top: 8px;
  }

  .main-content {
    padding: 16px;
  }

  .product-section {
    padding: 20px;
  }

  .product-name {
    font-size: 24px;
  }

  .amount {
    font-size: 32px;
  }

  .action-buttons {
    flex-direction: column;
  }

  .btn {
    width: 100%;
  }

  .related-products-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }

  .reviews-section,
  .related-products-section {
    padding: 20px;
  }

  .footer-links {
    flex-direction: column;
    gap: 12px;
  }
}

@media (max-width: 480px) {
  .related-products-grid {
    grid-template-columns: 1fr;
  }

  .reviews-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
}
</style>
