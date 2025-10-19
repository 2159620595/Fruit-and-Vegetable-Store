<!-- src/views/Shop.vue -->
<template>
  <div class="shop">
    <div class="container">
      <!-- 面包屑导航 -->
      <Breadcrumb current-page="商品列表" />

      <!-- 页面标题和视图切换 -->
      <div class="page-header">
        <div>
          <h1>商品列表</h1>
          <p class="subtitle">发现新鲜美味的果蔬</p>
        </div>
        <div class="view-toggle">
          <button
            :class="['view-btn', { active: viewMode === 'grid' }]"
            @click="viewMode = 'grid'"
            title="网格视图"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              fill="currentColor"
              viewBox="0 0 256 256"
            >
              <path
                d="M104,40H56A16,16,0,0,0,40,56v48a16,16,0,0,0,16,16h48a16,16,0,0,0,16-16V56A16,16,0,0,0,104,40Zm0,96H56a16,16,0,0,0-16,16v48a16,16,0,0,0,16,16h48a16,16,0,0,0,16-16V152A16,16,0,0,0,104,136Zm96-96H152a16,16,0,0,0-16,16v48a16,16,0,0,0,16,16h48a16,16,0,0,0,16-16V56A16,16,0,0,0,200,40Zm0,96H152a16,16,0,0,0-16,16v48a16,16,0,0,0,16,16h48a16,16,0,0,0,16-16V152A16,16,0,0,0,200,136Z"
              ></path>
            </svg>
          </button>
          <button
            :class="['view-btn', { active: viewMode === 'list' }]"
            @click="viewMode = 'list'"
            title="列表视图"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              fill="currentColor"
              viewBox="0 0 256 256"
            >
              <path
                d="M224,128a8,8,0,0,1-8,8H40a8,8,0,0,1,0-16H216A8,8,0,0,1,224,128ZM40,72H216a8,8,0,0,0,0-16H40a8,8,0,0,0,0,16ZM216,184H40a8,8,0,0,0,0,16H216a8,8,0,0,0,0-16Z"
              ></path>
            </svg>
          </button>
        </div>
      </div>

      <!-- 搜索关键词显示 -->
      <div v-if="searchKeyword" class="search-info">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          fill="currentColor"
          viewBox="0 0 256 256"
        >
          <path
            d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z"
          ></path>
        </svg>
        <p>
          搜索 "
          <strong>{{ searchKeyword }}</strong>
          " 的结果
          <button @click="clearSearch" class="clear-search-btn">×</button>
        </p>
      </div>

      <div class="shop-layout">
        <!-- Filters Sidebar -->
        <aside class="filters">
          <!-- 筛选标题 -->
          <div class="filter-header">
            <h2>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                fill="currentColor"
                viewBox="0 0 256 256"
              >
                <path
                  d="M200,136a8,8,0,0,1-8,8H152a8,8,0,0,1,0-16h40A8,8,0,0,1,200,136Zm-8-56H152a8,8,0,0,0,0,16h40a8,8,0,0,0,0-16Zm0,96H152a8,8,0,0,0,0,16h40a8,8,0,0,0,0-16ZM88,128a8,8,0,0,0-8-8H40a8,8,0,0,0,0,16H80A8,8,0,0,0,88,128ZM128,72a8,8,0,0,0-8-8H40a8,8,0,0,0,0,16h80A8,8,0,0,0,128,72Zm0,112a8,8,0,0,0-8-8H40a8,8,0,0,0,0,16h80A8,8,0,0,0,128,184Z"
                ></path>
              </svg>
              筛选条件
            </h2>
            <button
              v-if="hasActiveFilters"
              class="clear-all-btn"
              @click="resetFilters"
            >
              清除全部
            </button>
          </div>

          <!-- 价格区间 -->
          <div class="filter-group">
            <h3>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                viewBox="0 0 256 256"
              >
                <path
                  d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm40-68a28,28,0,0,1-28,28h-4v8a8,8,0,0,1-16,0v-8H104a8,8,0,0,1,0-16h36a12,12,0,0,0,0-24H116a28,28,0,0,1,0-56h4V72a8,8,0,0,1,16,0v8h16a8,8,0,0,1,0,16H116a12,12,0,0,0,0,24h24A28,28,0,0,1,168,148Z"
                ></path>
              </svg>
              价格区间
            </h3>
            <!-- 价格滑块 -->
            <div class="price-slider-container">
              <div class="slider-wrapper">
                <input
                  ref="priceSlider"
                  type="range"
                  min="0"
                  :max="priceRangeMax"
                  v-model.number="maxPrice"
                  class="price-slider"
                />
                <div class="slider-track">
                  <div
                    class="slider-fill"
                    :style="{ width: (maxPrice / priceRangeMax) * 100 + '%' }"
                  ></div>
                </div>
              </div>
              <div class="price-display">
                <span class="price-label">最高价格: ¥{{ maxPrice }}</span>
              </div>
            </div>

            <!-- 预设价格区间 -->
            <div class="price-presets">
              <h4>快速选择</h4>
              <div class="preset-buttons">
                <button
                  v-for="preset in pricePresets"
                  :key="preset.label"
                  class="preset-btn"
                  :class="{ active: isPricePresetActive(preset) }"
                  @click="applyPricePreset(preset)"
                >
                  {{ preset.label }}
                </button>
              </div>
            </div>
          </div>

          <!-- 评分筛选 -->
          <div class="filter-group">
            <h3>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                viewBox="0 0 256 256"
              >
                <path
                  d="M239.2,97.4A16,16,0,0,0,224.6,86.6l-59.4-4.84-22.55-55.43a15.95,15.95,0,0,0-29.3,0L90.8,81.76,31.4,86.6a16,16,0,0,0-9.1,28.06l45.4,39.74-13,56.66a16,16,0,0,0,24.2,17.3l51.1-31,51.1,31a16,16,0,0,0,24.2-17.3l-13-56.66,45.4-39.74A16,16,0,0,0,239.2,97.4Z"
                ></path>
              </svg>
              评分
            </h3>
            <div class="rating-options">
              <label
                v-for="rating in ratingOptions"
                :key="rating.value"
                class="rating-item"
                :class="{ active: selectedRating === rating.value }"
              >
                <input
                  type="radio"
                  :value="rating.value"
                  v-model="selectedRating"
                  class="rating-input"
                />
                <div class="rating-stars">
                  <span
                    v-for="star in 5"
                    :key="star"
                    class="star"
                    :class="{ filled: star <= rating.value }"
                  >
                    ★
                  </span>
                </div>
                <span class="rating-text">{{ rating.text }}</span>
                <span class="rating-count">
                  ({{ getRatingCount(rating.value) }})
                </span>
              </label>
            </div>
          </div>

          <!-- 库存状态 -->
          <div class="filter-group">
            <h3>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                viewBox="0 0 256 256"
              >
                <path
                  d="M208,80H176V56a24,24,0,0,0-24-24H104A24,24,0,0,0,80,56V80H48A16,16,0,0,0,32,96V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V96A16,16,0,0,0,208,80ZM96,56a8,8,0,0,1,8-8h48a8,8,0,0,1,8,8V80H96ZM208,208H48V96H208V208Z"
                ></path>
              </svg>
              库存状态
            </h3>
            <div class="stock-options">
              <label
                class="stock-item"
                :class="{ active: stockFilter === 'all' }"
              >
                <input
                  type="radio"
                  value="all"
                  v-model="stockFilter"
                  class="stock-input"
                />
                <span>全部商品</span>
                <span class="stock-count">
                  ({{ productStore.productList.length }})
                </span>
              </label>
              <label
                class="stock-item"
                :class="{ active: stockFilter === 'in-stock' }"
              >
                <input
                  type="radio"
                  value="in-stock"
                  v-model="stockFilter"
                  class="stock-input"
                />
                <span>有库存</span>
                <span class="stock-count">({{ getInStockCount() }})</span>
              </label>
              <label
                class="stock-item"
                :class="{ active: stockFilter === 'low-stock' }"
              >
                <input
                  type="radio"
                  value="low-stock"
                  v-model="stockFilter"
                  class="stock-input"
                />
                <span>库存紧张</span>
                <span class="stock-count">({{ getLowStockCount() }})</span>
              </label>
            </div>
          </div>

          <!-- 品牌筛选 -->
          <div class="filter-group" v-if="brands.length > 0">
            <h3>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                viewBox="0 0 256 256"
              >
                <path
                  d="M224,48H32A16,16,0,0,0,16,64V192a16,16,0,0,0,16,16H224a16,16,0,0,0,16-16V64A16,16,0,0,0,224,48ZM32,64H224V80H32ZM32,192V96H224v96Z"
                ></path>
              </svg>
              品牌
            </h3>
            <div class="brand-list">
              <label
                v-for="brand in brands"
                :key="brand"
                class="brand-item"
                :class="{ active: selectedBrands.includes(brand) }"
              >
                <input
                  type="checkbox"
                  :value="brand"
                  v-model="selectedBrands"
                  class="brand-checkbox"
                />
                <span class="brand-name">{{ brand }}</span>
                <span class="brand-count">({{ getBrandCount(brand) }})</span>
              </label>
            </div>
          </div>

          <!-- 重置按钮 -->
          <div class="filter-actions">
            <button
              class="reset-btn"
              @click="resetFilters"
              :disabled="!hasActiveFilters"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                viewBox="0 0 256 256"
              >
                <path
                  d="M240,56v48a8,8,0,0,1-8,8H184a8,8,0,0,1,0-16H211.4L184.81,71.64l-.25-.24a80,80,0,1,0-1.67,114.78,8,8,0,0,1,11,11.63A95.44,95.44,0,0,1,128,224h-1.32A96,96,0,1,1,195.75,60L224,85.8V56a8,8,0,1,1,16,0Z"
                ></path>
              </svg>
              重置筛选
            </button>
          </div>
        </aside>

        <!-- Products Grid -->
        <div class="products-area">
          <div class="products-header">
            <p>找到 {{ filteredProducts.length }} 个商品</p>
            <div class="sort-controls">
              <select v-model="sortBy" class="sort-select">
                <option value="name">按名称排序</option>
                <option value="price-low">价格: 从低到高</option>
                <option value="price-high">价格: 从高到低</option>
                <option value="rating-high">评分: 从高到低</option>
                <option value="rating-low">评分: 从低到高</option>
                <option value="newest">最新上架</option>
                <option value="popular">最受欢迎</option>
              </select>

              <!-- 排序方向指示器 -->
              <div class="sort-indicator">
                <svg
                  v-if="
                    sortBy.includes('price') ||
                    sortBy.includes('rating') ||
                    sortBy === 'newest' ||
                    sortBy === 'popular'
                  "
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  fill="currentColor"
                  viewBox="0 0 256 256"
                  :class="{
                    'sort-desc':
                      sortBy.includes('high') ||
                      sortBy === 'newest' ||
                      sortBy === 'popular',
                    'sort-asc': sortBy.includes('low'),
                  }"
                >
                  <!-- 价格图标 -->
                  <path
                    v-if="sortBy.includes('price')"
                    d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm40-68a28,28,0,0,1-28,28h-4v8a8,8,0,0,1-16,0v-8H104a8,8,0,0,1,0-16h36a12,12,0,0,0,0-24H116a28,28,0,0,1,0-56h4V72a8,8,0,0,1,16,0v8h16a8,8,0,0,1,0,16H116a12,12,0,0,0,0,24h24A28,28,0,0,1,168,148Z"
                  ></path>
                  <!-- 评分图标 -->
                  <path
                    v-else-if="sortBy.includes('rating')"
                    d="M239.2,97.4A16,16,0,0,0,224.6,86.6l-59.4-4.84-22.55-55.43a15.95,15.95,0,0,0-29.3,0L90.8,81.76,31.4,86.6a16,16,0,0,0-9.1,28.06l45.4,39.74-13,56.66a16,16,0,0,0,24.2,17.3l51.1-31,51.1,31a16,16,0,0,0,24.2-17.3l-13-56.66,45.4-39.74A16,16,0,0,0,239.2,97.4Z"
                  ></path>
                  <!-- 最新上架图标 -->
                  <path
                    v-else-if="sortBy === 'newest'"
                    d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm40-88a8,8,0,0,1-8,8H96a8,8,0,0,1,0-16h64A8,8,0,0,1,168,128Zm0,32a8,8,0,0,1-8,8H96a8,8,0,0,1,0-16h64A8,8,0,0,1,168,160Z"
                  ></path>
                  <!-- 最受欢迎图标 -->
                  <path
                    v-else-if="sortBy === 'popular'"
                    d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm40-88a8,8,0,0,1-8,8H96a8,8,0,0,1,0-16h64A8,8,0,0,1,168,128Zm0,32a8,8,0,0,1-8,8H96a8,8,0,0,1,0-16h64A8,8,0,0,1,168,160Z"
                  ></path>
                </svg>
              </div>
            </div>
          </div>

          <!-- 加载状态 -->
          <div v-if="productStore.loading" class="loading-state">
            <div class="spinner"></div>
            <p>加载中...</p>
          </div>

          <!-- 商品列表 -->
          <div
            v-else-if="sortedProducts.length > 0"
            :class="['products-grid', viewMode]"
          >
            <div
              v-for="product in paginatedProducts"
              :key="product.id"
              class="product-card"
              @click="goToProduct(product.id)"
            >
              <div class="product-image">
                <!-- 商品标签 -->
                <div class="product-badges">
                  <span v-if="product.is_new" class="badge badge-new">
                    新品
                  </span>
                  <span
                    v-if="product.discount && product.discount > 0"
                    class="badge badge-discount"
                  >
                    {{ Math.round(product.discount * 10) }}折
                  </span>
                  <span v-if="product.is_hot" class="badge badge-hot">
                    热销
                  </span>
                </div>

                <img
                  v-if="product.image_url"
                  :data-src="product.image_url"
                  :alt="product.name"
                  class="lazy-img"
                  loading="lazy"
                />
                <div v-else class="placeholder">🍎</div>
                <!-- 图片加载骨架屏 -->
                <div class="image-loading"></div>
              </div>
              <div class="product-info">
                <h3>{{ product.name }}</h3>

                <!-- 评分显示 -->
                <div
                  v-if="product.rating && typeof product.rating === 'number'"
                  class="rating"
                >
                  <span class="stars">
                    <span
                      v-for="i in 5"
                      :key="i"
                      :class="[
                        'star',
                        { filled: i <= Math.round(product.rating) },
                      ]"
                    >
                      ★
                    </span>
                  </span>
                  <span class="rating-value">
                    {{ Number(product.rating).toFixed(1) }}
                  </span>
                  <span v-if="product.review_count" class="review-count">
                    ({{ product.review_count }})
                  </span>
                </div>

                <div class="product-meta">
                  <div class="price-wrapper">
                    <p class="price">
                      ¥{{
                        typeof product.price === 'number'
                          ? product.price.toFixed(2)
                          : product.price
                      }}
                    </p>
                    <p
                      v-if="
                        product.original_price &&
                        typeof product.original_price === 'number' &&
                        product.original_price > product.price
                      "
                      class="original-price"
                    >
                      ¥{{ product.original_price.toFixed(2) }}
                    </p>
                  </div>
                  <p v-if="product.unit" class="unit">/ {{ product.unit }}</p>
                </div>

                <p v-if="product.description" class="description">
                  {{ product.description }}
                </p>

                <!-- 库存提示 -->
                <p
                  v-if="product.stock !== undefined"
                  class="stock-info"
                  :class="{ 'low-stock': product.stock < 10 }"
                >
                  {{ product.stock > 0 ? `库存: ${product.stock}` : '已售罄' }}
                </p>

                <div class="product-actions">
                  <button
                    class="add-to-cart-btn"
                    @click.stop="addToCart(product)"
                    :disabled="product.stock === 0"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      fill="currentColor"
                      viewBox="0 0 256 256"
                    >
                      <path
                        d="M222.14,58.87A8,8,0,0,0,216,56H54.68L49.79,29.14A16,16,0,0,0,34.05,16H16a8,8,0,0,0,0,16h18L59.56,172.29a24,24,0,0,0,5.33,11.27,28,28,0,1,0,44.4,8.44h45.42A27.75,27.75,0,0,0,152,204a28,28,0,1,0,28-28H83.17a8,8,0,0,1-7.87-6.57L72.13,152h116a24,24,0,0,0,23.61-19.71l12.16-66.86A8,8,0,0,0,222.14,58.87Z"
                      ></path>
                    </svg>
                    {{ product.stock === 0 ? '已售罄' : '加入购物车' }}
                  </button>

                  <!-- 收藏按钮 -->
                  <button
                    class="action-btn favorite-btn"
                    :class="{ 'is-favorite': product.is_favorite }"
                    @click="toggleFavorite(product)"
                    :disabled="product.stock === 0"
                    :title="product.is_favorite ? '取消收藏' : '添加收藏'"
                  >
                    <svg
                      v-if="!product.is_favorite"
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      viewBox="0 0 24 24"
                    >
                      <path
                        d="M20.84 4.61C20.3292 4.099 19.7228 3.69364 19.0554 3.41708C18.3879 3.14052 17.6725 2.99817 16.95 2.99817C16.2275 2.99817 15.5121 3.14052 14.8446 3.41708C14.1772 3.69364 13.5708 4.099 13.06 4.61L12 5.67L10.94 4.61C9.9083 3.5783 8.50903 2.9987 7.05 2.9987C5.59096 2.9987 4.19169 3.5783 3.16 4.61C2.1283 5.6417 1.5487 7.04097 1.5487 8.5C1.5487 9.95903 2.1283 11.3583 3.16 12.39L12 21.23L20.84 12.39C21.351 11.8792 21.7563 11.2728 22.0329 10.6053C22.3095 9.93789 22.4518 9.22248 22.4518 8.5C22.4518 7.77752 22.3095 7.06211 22.0329 6.39467C21.7563 5.72723 21.351 5.1208 20.84 4.61Z"
                      />
                    </svg>
                    <svg
                      v-else
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        d="M20.84 4.61C20.3292 4.099 19.7228 3.69364 19.0554 3.41708C18.3879 3.14052 17.6725 2.99817 16.95 2.99817C16.2275 2.99817 15.5121 3.14052 14.8446 3.41708C14.1772 3.69364 13.5708 4.099 13.06 4.61L12 5.67L10.94 4.61C9.9083 3.5783 8.50903 2.9987 7.05 2.9987C5.59096 2.9987 4.19169 3.5783 3.16 4.61C2.1283 5.6417 1.5487 7.04097 1.5487 8.5C1.5487 9.95903 2.1283 11.3583 3.16 12.39L12 21.23L20.84 12.39C21.351 11.8792 21.7563 11.2728 22.0329 10.6053C22.3095 9.93789 22.4518 9.22248 22.4518 8.5C22.4518 7.77752 22.3095 7.06211 22.0329 6.39467C21.7563 5.72723 21.351 5.1208 20.84 4.61Z"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            <!-- 分页 -->
            <div v-if="sortedProducts.length > itemsPerPage" class="pagination">
              <button
                class="page-btn"
                @click="currentPage--"
                :disabled="currentPage === 1"
              >
                上一页
              </button>
              <span class="page-info">
                第 {{ currentPage }} 页 / 共 {{ totalPages }} 页
              </span>
              <button
                class="page-btn"
                @click="currentPage++"
                :disabled="currentPage === totalPages"
              >
                下一页
              </button>
            </div>

            <!-- 空状态 - 只在有筛选条件时显示 -->
            <div v-else-if="hasActiveFilters" class="empty-state">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="64"
                height="64"
                fill="currentColor"
                viewBox="0 0 256 256"
              >
                <path
                  d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z"
                ></path>
              </svg>
              <p>
                {{
                  searchKeyword ? '未找到匹配的商品' : '未找到符合条件的商品'
                }}
              </p>
              <p v-if="searchKeyword" class="suggestion">
                尝试使用其他关键词或
                <button @click="clearSearch" class="link-btn">清除搜索</button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Toast 提示 -->
    <Transition name="toast">
      <div v-if="toast.show" :class="['toast', toast.type]">
        <svg
          v-if="toast.type === 'success'"
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          fill="currentColor"
          viewBox="0 0 256 256"
        >
          <path
            d="M173.66,98.34a8,8,0,0,1,0,11.32l-56,56a8,8,0,0,1-11.32,0l-24-24a8,8,0,0,1,11.32-11.32L112,148.69l50.34-50.35A8,8,0,0,1,173.66,98.34ZM232,128A104,104,0,1,1,128,24,104.11,104.11,0,0,1,232,128Zm-16,0a88,88,0,1,0-88,88A88.1,88.1,0,0,0,216,128Z"
          ></path>
        </svg>
        <svg
          v-else
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          fill="currentColor"
          viewBox="0 0 256 256"
        >
          <path
            d="M165.66,101.66,139.31,128l26.35,26.34a8,8,0,0,1-11.32,11.32L128,139.31l-26.34,26.35a8,8,0,0,1-11.32-11.32L116.69,128,90.34,101.66a8,8,0,0,1,11.32-11.32L128,116.69l26.34-26.35a8,8,0,0,1,11.32,11.32ZM232,128A104,104,0,1,1,128,24,104.11,104.11,0,0,1,232,128Zm-16,0a88,88,0,1,0-88,88A88.1,88.1,0,0,0,216,128Z"
          ></path>
        </svg>
        <span>{{ toast.message }}</span>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useProductStore } from '../stores/productStore'
import { useCartStore } from '../stores/cartStore'
import { useUserStore } from '../stores/userStore'
import Breadcrumb from '../components/Breadcrumb.vue'
import { toggleFavorite as toggleFavoriteAPI } from '../api/favorites'

const router = useRouter()
const route = useRoute()
const productStore = useProductStore()
const cartStore = useCartStore()
const userStore = useUserStore()

// 筛选状态
const minPrice = ref(0)
const maxPrice = ref(1000)
const priceRangeMax = ref(1000)
const sortBy = ref('name')
const searchKeyword = ref('')

// 新增筛选状态
const selectedRating = ref(0) // 0表示不筛选评分
const stockFilter = ref('all') // 'all', 'in-stock', 'low-stock'
const selectedBrands = ref([])

// 滑块引用
const priceSlider = ref(null)

// 价格预设选项
const pricePresets = [
  { label: '¥0-50', min: 0, max: 50 },
  { label: '¥50-100', min: 0, max: 100 },
  { label: '¥100-200', min: 0, max: 200 },
  { label: '¥200-500', min: 0, max: 500 },
  { label: '¥500以上', min: 0, max: 2000 },
]

// 评分选项
const ratingOptions = [
  { value: 0, text: '全部评分' },
  { value: 4, text: '4星及以上' },
  { value: 3, text: '3星及以上' },
  { value: 2, text: '2星及以上' },
  { value: 1, text: '1星及以上' },
]

// 视图模式
const viewMode = ref('grid') // 'grid' 或 'list'

// 分页状态
const currentPage = ref(1)
const itemsPerPage = ref(12)

// Toast 提示状态
const toast = ref({
  show: false,
  message: '',
  type: 'success',
})

// 从商品数据中提取分类
const categories = computed(() => {
  const cats = new Set()
  productStore.productList.forEach(p => {
    if (p.category) {
      cats.add(p.category)
    }
  })
  return Array.from(cats)
})

// 从商品数据中提取品牌
const brands = computed(() => {
  const brandSet = new Set()
  productStore.productList.forEach(p => {
    if (p.brand) {
      brandSet.add(p.brand)
    }
  })
  return Array.from(brandSet)
})

// 判断是否有活跃的筛选条件
const hasActiveFilters = computed(() => {
  return (
    searchKeyword.value ||
    maxPrice.value < priceRangeMax.value ||
    selectedRating.value > 0 ||
    stockFilter.value !== 'all' ||
    selectedBrands.value.length > 0
  )
})

// 监听路由查询参数变化
watch(
  () => route.query.search,
  newSearch => {
    searchKeyword.value = newSearch || ''
  },
  { immediate: true }
)

// 监听filter查询参数
watch(
  () => route.query.filter,
  newFilter => {
    if (newFilter === 'new') {
      // 新到商品筛选 - 可以根据创建时间或特殊标记筛选
      searchKeyword.value = ''
      // 这里可以添加新商品的筛选逻辑
    } else if (newFilter === 'sale') {
      // 促销活动筛选 - 可以根据折扣或促销标记筛选
      searchKeyword.value = ''
      // 这里可以添加促销商品的筛选逻辑
    }
  },
  { immediate: true }
)

const filteredProducts = computed(() => {
  // 使用 getter 确保总是获取数组
  let products = productStore.productList || []

  // 额外的安全检查
  if (!Array.isArray(products)) {
    console.warn('products 不是数组，使用空数组代替:', products)
    return []
  }

  try {
    // Filter查询参数筛选
    if (route.query.filter === 'new') {
      // 新到商品筛选 - 可以根据创建时间筛选最近7天的商品
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
      products = products.filter(p => {
        if (p.created_at) {
          return new Date(p.created_at) > sevenDaysAgo
        }
        // 如果没有创建时间字段，可以根据商品ID或其他逻辑判断
        return p.id > 0 // 简单示例：假设ID越大越新
      })
    } else if (route.query.filter === 'sale') {
      // 促销活动筛选 - 可以根据折扣价格筛选
      products = products.filter(p => {
        // 假设有原价和现价字段，或者有折扣字段
        if (p.original_price && p.price) {
          return p.original_price > p.price
        }
        // 如果没有折扣字段，可以根据价格范围筛选
        return p.price < 50 // 简单示例：价格低于50的商品
      })
    }

    // 搜索过滤
    if (searchKeyword.value) {
      const keyword = searchKeyword.value.toLowerCase().trim()
      if (keyword) {
        products = products.filter(
          p =>
            (p.name && p.name.toLowerCase().includes(keyword)) ||
            (p.description && p.description.toLowerCase().includes(keyword)) ||
            (p.category && p.category.toLowerCase().includes(keyword))
        )
      }
    }

    // 价格过滤
    products = products.filter(p => {
      // 将字符串价格转换为数字进行比较
      const price =
        parseFloat(p.price) ||
        parseFloat(p.current_price) ||
        parseFloat(p.unit_price) ||
        parseFloat(p.sale_price) ||
        0
      return price >= 0 && price <= maxPrice.value
    })

    // 评分过滤
    if (selectedRating.value > 0) {
      products = products.filter(p => {
        const rating = parseFloat(p.rating) || 0
        return rating >= selectedRating.value
      })
    }

    // 库存状态过滤
    if (stockFilter.value !== 'all') {
      products = products.filter(p => {
        const stock = typeof p.stock === 'number' ? p.stock : 0
        if (stockFilter.value === 'in-stock') {
          return stock > 0
        } else if (stockFilter.value === 'low-stock') {
          return stock > 0 && stock <= 10 // 假设库存紧张为10件以下
        }
        return true
      })
    }

    // 品牌过滤
    if (selectedBrands.value.length > 0) {
      products = products.filter(
        p => p.brand && selectedBrands.value.includes(p.brand)
      )
    }

    return products
  } catch (error) {
    console.error('过滤商品时出错:', error)
    return []
  }
})

const sortedProducts = computed(() => {
  const products = [...filteredProducts.value]

  // 如果没有商品，直接返回空数组
  if (products.length === 0) {
    return products
  }

  try {
    let sortedResult
    switch (sortBy.value) {
      case 'price-low':
        sortedResult = products.sort((a, b) => {
          // 将字符串价格转换为数字进行比较
          const priceA =
            parseFloat(a.price) ||
            parseFloat(a.current_price) ||
            parseFloat(a.unit_price) ||
            parseFloat(a.sale_price) ||
            0
          const priceB =
            parseFloat(b.price) ||
            parseFloat(b.current_price) ||
            parseFloat(b.unit_price) ||
            parseFloat(b.sale_price) ||
            0
          return priceA - priceB
        })
        break
      case 'price-high':
        sortedResult = products.sort((a, b) => {
          // 将字符串价格转换为数字进行比较
          const priceA =
            parseFloat(a.price) ||
            parseFloat(a.current_price) ||
            parseFloat(a.unit_price) ||
            parseFloat(a.sale_price) ||
            0
          const priceB =
            parseFloat(b.price) ||
            parseFloat(b.current_price) ||
            parseFloat(b.unit_price) ||
            parseFloat(b.sale_price) ||
            0
          return priceB - priceA
        })
        break
      case 'rating-high':
        sortedResult = products.sort((a, b) => {
          const ratingA = parseFloat(a.rating) || 0
          const ratingB = parseFloat(b.rating) || 0
          return ratingB - ratingA
        })
        break
      case 'rating-low':
        sortedResult = products.sort((a, b) => {
          const ratingA = parseFloat(a.rating) || 0
          const ratingB = parseFloat(b.rating) || 0
          return ratingA - ratingB
        })
        break
      case 'newest':
        sortedResult = products.sort((a, b) => {
          // 优先使用 is_new 字段，然后使用 created_at，最后使用 ID
          if (a.is_new !== b.is_new) {
            return b.is_new - a.is_new // is_new 为 true 的排在前面
          }

          // 如果有创建时间，按时间排序
          if (a.created_at && b.created_at) {
            const timeA = new Date(a.created_at).getTime()
            const timeB = new Date(b.created_at).getTime()

            return timeB - timeA // 新的在前
          }

          // 最后按 ID 排序（假设 ID 越大越新）
          const idA = parseInt(a.id) || 0
          const idB = parseInt(b.id) || 0
          return idB - idA
        })
        break
      case 'popular':
        sortedResult = products.sort((a, b) => {
          // 综合多个受欢迎度指标进行排序
          const getPopularityScore = product => {
            let score = 0

            // 销量权重最高
            const salesCount = parseInt(product.sales_count) || 0
            score += salesCount * 10

            // 评价数量权重中等
            const reviewCount = parseInt(product.review_count) || 0
            score += reviewCount * 5

            // 评分权重中等
            const rating = parseFloat(product.rating) || 0
            score += rating * 3

            // 收藏状态加分
            if (product.is_favorite) {
              score += 50
            }

            // 折扣商品可能更受欢迎
            if (product.is_discount) {
              score += 20
            }

            return score
          }

          const scoreA = getPopularityScore(a)
          const scoreB = getPopularityScore(b)

          return scoreB - scoreA // 分数高的在前
        })
        break
      default:
        sortedResult = products.sort((a, b) => {
          const nameA = a.name || ''
          const nameB = b.name || ''
          return nameA.localeCompare(nameB)
        })
        break
    }

    return sortedResult
  } catch (error) {
    console.error('排序商品时出错:', error)
    return products
  }
})

// 分页商品
const paginatedProducts = computed(() => {
  const products = sortedProducts.value
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value

  // 确保分页参数有效
  if (start < 0 || start >= products.length) {
    return []
  }

  return products.slice(start, end)
})

// 总页数
const totalPages = computed(() => {
  const total = sortedProducts.value.length
  return Math.max(1, Math.ceil(total / itemsPerPage.value))
})

// 获取每个评分的商品数量
const getRatingCount = rating => {
  if (!productStore.productList) return 0
  if (rating === 0) return productStore.productList.length
  return productStore.productList.filter(p => {
    const productRating = parseFloat(p.rating) || 0
    return productRating >= rating
  }).length
}

// 获取有库存的商品数量
const getInStockCount = () => {
  if (!productStore.productList) return 0
  return productStore.productList.filter(p => {
    const stock = typeof p.stock === 'number' ? p.stock : 0
    return stock > 0
  }).length
}

// 获取库存紧张的商品数量
const getLowStockCount = () => {
  if (!productStore.productList) return 0
  return productStore.productList.filter(p => {
    const stock = typeof p.stock === 'number' ? p.stock : 0
    return stock > 0 && stock <= 10
  }).length
}

// 获取每个品牌的商品数量
const getBrandCount = brand => {
  if (!brand || !productStore.productList) return 0
  return productStore.productList.filter(p => p.brand === brand).length
}

// 价格预设相关方法
const isPricePresetActive = preset => {
  if (!preset) return false
  return preset.min === 0 && preset.max === maxPrice.value
}

const applyPricePreset = preset => {
  if (!preset) return

  const newValue = preset.max

  // 如果预设值超过当前价格范围，扩展价格范围
  if (newValue > priceRangeMax.value) {
    priceRangeMax.value = newValue
  }

  maxPrice.value = newValue

  // 使用 ref 直接操作滑块
  nextTick(() => {
    if (priceSlider.value) {
      priceSlider.value.value = newValue
    } else {
      console.log('滑块元素未找到')
    }
  })
}

const goToProduct = id => {
  router.push(`/product/${id}`)
}

const addToCart = product => {
  if (product.stock === 0) {
    showToast('商品已售罄', 'error')
    return
  }

  cartStore.addToCart(product)
  showToast(`${product.name} 已加入购物车`, 'success')
}

// 收藏功能
const toggleFavorite = async product => {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    router.push('/login')
    return
  }

  try {
    // 使用统一的切换收藏接口
    const response = await toggleFavoriteAPI(product.id)

    // 根据API返回的消息判断操作结果
    const message = response.data?.message || ''
    if (message.includes('收藏成功') || message.includes('已添加到收藏')) {
      product.is_favorite = true
      showToast('已添加到收藏', 'success')
    } else if (message.includes('已取消收藏') || message.includes('取消收藏')) {
      product.is_favorite = false
      showToast('已取消收藏', 'success')
    } else {
      // 如果消息不明确，根据当前状态切换
      product.is_favorite = !product.is_favorite
      showToast(product.is_favorite ? '已添加到收藏' : '已取消收藏', 'success')
    }
  } catch (error) {
    showToast('操作失败，请重试', 'error')
  }
}

// Toast 提示
const showToast = (message, type = 'success') => {
  toast.value = {
    show: true,
    message,
    type,
  }

  setTimeout(() => {
    toast.value.show = false
  }, 3000)
}

// 清除搜索
const clearSearch = () => {
  searchKeyword.value = ''
  router.push({ path: '/shop' })
}

// 重置筛选
const resetFilters = () => {
  maxPrice.value = priceRangeMax.value
  searchKeyword.value = ''
  selectedRating.value = 0
  stockFilter.value = 'all'
  selectedBrands.value = []
  currentPage.value = 1
  router.push({ path: '/shop' })
}

// 计算价格范围
const calculatePriceRange = () => {
  if (!productStore.productList || productStore.productList.length === 0) {
    priceRangeMax.value = 1000
    maxPrice.value = 1000
    return
  }

  try {
    const prices = productStore.productList
      .map(p => {
        // 将字符串价格转换为数字
        return (
          parseFloat(p.price) ||
          parseFloat(p.current_price) ||
          parseFloat(p.unit_price) ||
          parseFloat(p.sale_price) ||
          0
        )
      })
      .filter(price => price > 0)

    if (prices.length > 0) {
      const max = Math.max(...prices)
      priceRangeMax.value = Math.ceil(max / 100) * 100 || 1000
      maxPrice.value = priceRangeMax.value
    } else {
      priceRangeMax.value = 1000
      maxPrice.value = 1000
    }
  } catch (error) {
    console.error('计算价格范围时出错:', error)
    priceRangeMax.value = 1000
    maxPrice.value = 1000
  }
}

// 图片懒加载
const setupLazyLoading = () => {
  const images = document.querySelectorAll('.lazy-img')
  const imageObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target
        const src = img.getAttribute('data-src')
        if (src) {
          img.src = src
          img.classList.add('loaded')
          imageObserver.unobserve(img)
        }
      }
    })
  })

  images.forEach(img => imageObserver.observe(img))
}

onMounted(async () => {
  try {
    await productStore.fetchProducts()

    // 计算价格范围
    calculatePriceRange()

    // 从商品数据中提取分类
    if (!productStore.categories || productStore.categories.length === 0) {
      productStore.fetchCategories()
    }

    // 设置图片懒加载
    setTimeout(() => {
      setupLazyLoading()
    }, 100)
  } catch (error) {
    console.error('加载商品数据失败:', error)
  }
})

// 监听商品列表变化，重新设置懒加载
watch(
  () => sortedProducts.value.length,
  () => {
    setTimeout(() => {
      setupLazyLoading()
    }, 100)
  }
)

// 监听筛选条件变化，重置分页
watch(
  [
    maxPrice,
    sortBy,
    searchKeyword,
    selectedRating,
    stockFilter,
    selectedBrands,
  ],
  () => {
    currentPage.value = 1
  }
)
</script>

<style scoped>
.shop {
  min-height: 100vh;
  background-color: #f9f9f9;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

h1 {
  margin-bottom: 20px;
  color: #333;
}

/* 搜索信息 */
.search-info {
  background: #eef6ee;
  padding: 12px 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  border-left: 4px solid #618961;
}

.search-info p {
  margin: 0;
  color: #333;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.search-info strong {
  color: #2d5a27;
}

.clear-search-btn {
  background: none;
  border: none;
  font-size: 20px;
  color: #999;
  cursor: pointer;
  padding: 0;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: auto;
  transition: color 0.2s;
}

.clear-search-btn:hover {
  color: #333;
}

.shop-layout {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 30px;
  align-items: start;
}

.filters {
  background: white;
  padding: 0;
  border-radius: 12px;
  height: fit-content;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  position: sticky;
  top: 20px;
}

/* 筛选标题 */
.filter-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.filter-header h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
}

.clear-all-btn {
  padding: 6px 12px;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.clear-all-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.filter-group {
  padding: 20px;
  border-bottom: 1px solid #f0f0f0;
}

.filter-group:last-child {
  border-bottom: none;
}

.filter-group h3 {
  margin: 0 0 15px 0;
  font-size: 15px;
  color: #333;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
}

.filter-group h3 svg {
  color: #667eea;
}

.filter-group .no-data {
  color: #999;
  font-size: 14px;
  padding: 10px 0;
  text-align: center;
}

/* 分类列表 */
.category-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.category-item {
  display: flex;
  align-items: center;
  padding: 10px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid transparent;
  background: #f8f9fa;
}

.category-item:hover {
  background: #e8f5e9;
  border-color: #c8e6c9;
}

.category-item.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-color: #667eea;
  color: white;
}

.category-item input[type='checkbox'] {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: #667eea;
}

.category-item.active input[type='checkbox'] {
  accent-color: white;
}

.category-name {
  flex: 1;
  font-size: 14px;
  font-weight: 500;
}

.category-count {
  font-size: 12px;
  color: #999;
  background: white;
  padding: 2px 8px;
  border-radius: 10px;
}

.category-item.active .category-count {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

.price-range {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.price-input {
  flex: 1;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.price-input:focus {
  outline: none;
  border-color: #618961;
}

.price-range span {
  color: #999;
}

.price-slider {
  width: 100%;
  cursor: pointer;
  margin: 10px 0;
}

.price-label {
  color: #666;
  font-size: 14px;
  text-align: center;
  margin-top: 8px;
}

.reset-btn {
  width: 100%;
  padding: 10px;
  background: #f5f5f5;
  border: 1px solid #ddd;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  color: #666;
  transition: all 0.2s;
}

.reset-btn:hover {
  background: #618961;
  color: white;
  border-color: #618961;
}

.products-area {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.products-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding: 16px 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.products-header p {
  margin: 0;
  color: #333;
  font-size: 15px;
  font-weight: 500;
}

.products-header select {
  padding: 8px 16px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  font-size: 14px;
  color: #666;
  transition: all 0.2s;
  outline: none;
}

.products-header select:hover {
  border-color: #667eea;
}

.products-header select:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
}

.product-card {
  border: 1px solid #e5e5e5;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition:
    transform 0.2s,
    box-shadow 0.2s;
  background: white;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.product-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.product-image {
  width: 100%;
  height: 200px;
  overflow: hidden;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.product-image img.loaded {
  opacity: 1;
}

.image-loading {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
  z-index: 0;
}

.product-image img.loaded ~ .image-loading {
  display: none;
}

.placeholder {
  font-size: 48px;
  z-index: 1;
}

.product-info {
  padding: 15px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
  min-height: 0;
}

.product-info h3 {
  margin: 0;
  font-size: 16px;
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  height: 40px;
}

.product-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
  height: 24px;
}

.price {
  color: #2d5a27;
  font-size: 20px;
  font-weight: bold;
  margin: 0;
  line-height: 1;
}

.unit {
  color: #999;
  font-size: 14px;
  margin: 0;
  line-height: 1;
}

.description {
  color: #666;
  font-size: 13px;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  height: 36px;
}

.product-actions {
  margin-top: auto;
}

.add-to-cart-btn {
  width: 100%;
  padding: 10px;
  background: #618961;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.add-to-cart-btn:hover:not(:disabled) {
  background: #2d5a27;
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(97, 137, 97, 0.3);
}

.add-to-cart-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
  opacity: 0.6;
}

/* 加载状态 */
.loading-state {
  text-align: center;
  padding: 80px 20px;
  color: #666;
}

.spinner {
  margin: 0 auto 20px;
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #618961;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.loading-state p {
  font-size: 16px;
  margin: 0;
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #999;
}

.empty-state svg {
  margin-bottom: 20px;
  opacity: 0.5;
}

.empty-state p {
  font-size: 16px;
  margin: 10px 0;
}

.empty-state .suggestion {
  color: #666;
  font-size: 14px;
}

.link-btn {
  background: none;
  border: none;
  color: #618961;
  text-decoration: underline;
  cursor: pointer;
  font-size: 14px;
  padding: 0;
}

.link-btn:hover {
  color: #2d5a27;
}

@media (max-width: 960px) {
  .shop-layout {
    grid-template-columns: 1fr;
  }

  .filters {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 20px;
  }
}

@media (max-width: 640px) {
  .products-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 15px;
  }

  .product-image {
    height: 150px;
  }

  .page-header {
    flex-direction: column;
    align-items: flex-start !important;
    gap: 15px;
  }
}

/* 面包屑导航 */
.breadcrumb {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 0 20px;
  font-size: 14px;
  color: #666;
}

.breadcrumb a {
  color: #618961;
  text-decoration: none;
  transition: color 0.2s;
}

.breadcrumb a:hover {
  color: #2d5a27;
  text-decoration: underline;
}

.breadcrumb .separator {
  color: #ccc;
}

.breadcrumb .current {
  color: #333;
  font-weight: 500;
}

/* 页面标题 */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-header h1 {
  margin: 0 0 5px 0;
  font-size: 28px;
  color: #2d5a27;
}

.page-header .subtitle {
  margin: 0;
  font-size: 14px;
  color: #999;
}

/* 视图切换 */
.view-toggle {
  display: flex;
  gap: 8px;
  background: white;
  padding: 4px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.view-btn {
  background: none;
  border: none;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  color: #999;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.view-btn:hover {
  background: #f5f5f5;
  color: #618961;
}

.view-btn.active {
  background: #618961;
  color: white;
}

/* 列表视图样式 */
.products-grid.list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.products-grid.list .product-card {
  display: flex;
  flex-direction: row;
  max-width: 100%;
  height: auto;
}

.products-grid.list .product-image {
  width: 220px;
  height: 220px;
  flex-shrink: 0;
}

.products-grid.list .product-info {
  flex: 1;
  padding: 20px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  min-height: auto;
  gap: 12px;
}

.products-grid.list .product-info h3 {
  font-size: 18px;
  margin: 0;
  min-height: auto;
  -webkit-line-clamp: 1;
  line-clamp: 1;
}

.products-grid.list .rating {
  min-height: auto;
}

.products-grid.list .product-meta {
  flex-wrap: nowrap;
}

.products-grid.list .description {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  min-height: auto;
  flex: 0;
}

.products-grid.list .product-actions {
  margin-top: 0;
}

.products-grid.list .add-to-cart-btn {
  width: auto;
  padding: 10px 24px;
  align-self: flex-start;
}

/* 商品标签 */
.product-badges {
  position: absolute;
  top: 10px;
  right: 10px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  z-index: 2;
}

.badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  text-align: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.badge-new {
  background: #ff6b6b;
  color: white;
}

.badge-discount {
  background: #ffd43b;
  color: #333;
}

.badge-hot {
  background: #ff6b6b;
  color: white;
}

/* 评分样式 */
.rating {
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 0;
  font-size: 14px;
  height: 20px;
}

.stars {
  display: flex;
  gap: 2px;
  line-height: 1;
}

.star {
  color: #ddd;
  font-size: 16px;
  line-height: 1;
}

.star.filled {
  color: #ffc107;
}

.rating-value {
  color: #333;
  font-weight: 500;
  line-height: 1;
}

.review-count {
  color: #999;
  font-size: 12px;
  line-height: 1;
}

/* 价格样式 */
.price-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.price {
  font-size: 20px;
  color: #618961;
  font-weight: bold;
  margin: 0;
  line-height: 1;
}

.original-price {
  font-size: 14px;
  color: #999;
  text-decoration: line-through;
  margin: 0;
  line-height: 1;
}

/* 库存信息 */
.stock-info {
  font-size: 12px;
  color: #666;
  margin: 0;
  padding: 4px 8px;
  background: #f5f5f5;
  border-radius: 4px;
  display: flex;
  align-items: center;
  height: 22px;
  width: fit-content;
  line-height: 1;
}

.stock-info.low-stock {
  color: #ff6b6b;
  background: #fff5f5;
}

/* 分页样式 */
.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  margin: 40px 0;
  padding: 20px;
}

.page-btn {
  padding: 10px 20px;
  background: #618961;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.page-btn:hover:not(:disabled) {
  background: #2d5a27;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(97, 137, 97, 0.3);
}

.page-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
  opacity: 0.6;
}

.page-info {
  font-size: 14px;
  color: #666;
}

/* Toast 提示 */
.toast {
  position: fixed;
  top: 80px;
  right: 20px;
  background: white;
  padding: 16px 24px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
  gap: 12px;
  z-index: 9999;
  min-width: 200px;
  max-width: 400px;
}

.toast.success {
  border-left: 4px solid #4caf50;
  color: #4caf50;
}

.toast.error {
  border-left: 4px solid #f44336;
  color: #f44336;
}

.toast span {
  color: #333;
  font-size: 14px;
}

/* Toast 动画 */
.toast-enter-active {
  animation: toast-in 0.3s ease-out;
}

.toast-leave-active {
  animation: toast-out 0.3s ease-in;
}

@keyframes toast-in {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes toast-out {
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(100%);
    opacity: 0;
  }
}

/* 评分筛选样式 */
.rating-options {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.rating-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.rating-item:hover {
  background-color: #f5f5f5;
}

.rating-item.active {
  background-color: #e8f5e8;
  border: 1px solid #4a6b4a;
}

.rating-input {
  margin: 0;
}

.rating-stars {
  display: flex;
  gap: 2px;
}

.star {
  color: #ddd;
  font-size: 14px;
}

.star.filled {
  color: #ffc107;
}

.rating-text {
  font-size: 14px;
  color: #333;
}

.rating-count {
  font-size: 12px;
  color: #999;
  margin-left: auto;
}

/* 库存状态筛选样式 */
.stock-options {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.stock-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.stock-item:hover {
  background-color: #f5f5f5;
}

.stock-item.active {
  background-color: #e8f5e8;
  border: 1px solid #4a6b4a;
}

.stock-input {
  margin: 0;
}

.stock-count {
  font-size: 12px;
  color: #999;
  margin-left: auto;
}

/* 品牌筛选样式 */
.brand-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.brand-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.brand-item:hover {
  background-color: #f5f5f5;
}

.brand-item.active {
  background-color: #e8f5e8;
  border: 1px solid #4a6b4a;
}

.brand-checkbox {
  margin: 0;
}

.brand-name {
  font-size: 14px;
  color: #333;
}

.brand-count {
  font-size: 12px;
  color: #999;
  margin-left: auto;
}

/* 价格预设样式 */
.price-presets {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #e5e5e5;
}

.price-presets h4 {
  margin: 0 0 12px 0;
  font-size: 14px;
  color: #666;
  font-weight: 500;
}

.preset-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.preset-btn {
  padding: 6px 12px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 4px;
  font-size: 12px;
  color: #666;
  cursor: pointer;
  transition: all 0.2s ease;
}

.preset-btn:hover {
  border-color: #4a6b4a;
  color: #4a6b4a;
}

.preset-btn.active {
  background: #4a6b4a;
  border-color: #4a6b4a;
  color: white;
}

/* 分类搜索样式 */
.category-search {
  margin-bottom: 12px;
}

.category-search-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s ease;
}

.category-search-input:focus {
  border-color: #4a6b4a;
}

/* 分类排序样式 */
.category-sort {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.sort-btn {
  padding: 4px 8px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 4px;
  font-size: 12px;
  color: #666;
  cursor: pointer;
  transition: all 0.2s ease;
}

.sort-btn:hover {
  border-color: #4a6b4a;
  color: #4a6b4a;
}

.sort-btn.active {
  background: #4a6b4a;
  border-color: #4a6b4a;
  color: white;
}

/* 分类列表样式 */
.category-items {
  max-height: 200px;
  overflow-y: auto;
  margin-bottom: 12px;
}

.category-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.category-item:hover {
  background-color: #f5f5f5;
}

.category-item.active {
  background-color: #e8f5e8;
  border: 1px solid #4a6b4a;
}

.category-name {
  font-size: 14px;
  color: #333;
}

.category-count {
  font-size: 12px;
  color: #999;
  margin-left: auto;
}

/* 分类操作按钮样式 */
.category-actions {
  display: flex;
  gap: 8px;
  padding-top: 12px;
  border-top: 1px solid #e5e5e5;
}

.action-btn {
  flex: 1;
  padding: 6px 12px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 4px;
  font-size: 12px;
  color: #666;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-btn:hover:not(:disabled) {
  border-color: #4a6b4a;
  color: #4a6b4a;
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 收藏按钮样式 */
.favorite-btn {
  background-color: #f8f9fa;
  color: #6c757d;
  border-color: #e9ecef;
}

.favorite-btn:hover:not(:disabled) {
  background-color: #e9ecef;
  border-color: #dee2e6;
  color: #495057;
}

.favorite-btn.is-favorite {
  background-color: #ff6b6b;
  color: #ffffff;
  border-color: #ff6b6b;
}

.favorite-btn.is-favorite:hover:not(:disabled) {
  background-color: #ff5252;
  border-color: #ff5252;
}

/* 排序控制样式 */
.sort-controls {
  display: flex;
  align-items: center;
  gap: 12px;
}

.sort-select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  background: white;
  font-size: 14px;
  color: #333;
  cursor: pointer;
  outline: none;
  transition: border-color 0.2s ease;
  min-width: 160px;
}

.sort-select:focus {
  border-color: #4a6b4a;
}

.sort-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background: #f5f5f5;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.sort-indicator svg {
  color: #666;
  transition: all 0.2s ease;
}

.sort-indicator .sort-asc {
  transform: rotate(180deg);
  color: #4a6b4a;
}

.sort-indicator .sort-desc {
  color: #4a6b4a;
}

/* 搜索信息图标 */
.search-info svg {
  color: #618961;
  flex-shrink: 0;
}

/* 价格滑块容器 */
.price-slider-container {
  margin: 20px 0;
}

.slider-wrapper {
  position: relative;
  height: 40px;
  display: flex;
  align-items: center;
}

.price-slider {
  position: absolute;
  width: 100%;
  height: 6px;
  background: transparent;
  outline: none;
  cursor: pointer;
  z-index: 2;
  -webkit-appearance: none;
  appearance: none;
}

.price-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 20px;
  height: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(102, 126, 234, 0.3);
  transition: all 0.2s ease;
}

.price-slider::-webkit-slider-thumb:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.price-slider::-moz-range-thumb {
  width: 20px;
  height: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  cursor: pointer;
  border: none;
  box-shadow: 0 2px 6px rgba(102, 126, 234, 0.3);
  transition: all 0.2s ease;
}

.price-slider::-moz-range-thumb:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.slider-track {
  position: absolute;
  width: 100%;
  height: 6px;
  background: #e0e0e0;
  border-radius: 3px;
  z-index: 1;
}

.slider-fill {
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 3px;
  transition: width 0.2s ease;
}

.price-display {
  margin-top: 15px;
  text-align: center;
}

.price-label {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  background: #f8f9fa;
  padding: 8px 16px;
  border-radius: 20px;
  display: inline-block;
  border: 1px solid #e0e0e0;
}

/* 双滑块 */
.dual-slider {
  position: relative;
  height: 40px;
  margin: 15px 0;
  z-index: 1;
}

.slider-min,
.slider-max {
  position: absolute;
  width: 100%;
  height: 6px;
  -webkit-appearance: none;
  appearance: none;
  background: transparent;
  pointer-events: none;
  top: 50%;
  transform: translateY(-50%);
  z-index: 1;
}

.slider-min::-webkit-slider-track,
.slider-max::-webkit-slider-track {
  height: 6px;
  background: #e0e0e0;
  border-radius: 3px;
}

.slider-min::-webkit-slider-thumb,
.slider-max::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 20px;
  height: 20px;
  background: white;
  border: 3px solid #667eea;
  border-radius: 50%;
  cursor: pointer;
  pointer-events: all;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
  transition: all 0.2s;
  position: relative;
  z-index: 2;
}

.slider-min::-webkit-slider-thumb:hover,
.slider-max::-webkit-slider-thumb:hover {
  transform: scale(1.1);
  box-shadow: 0 3px 10px rgba(102, 126, 234, 0.4);
}

.slider-max {
  z-index: 2;
}

.slider-min::-webkit-slider-thumb:active,
.slider-max::-webkit-slider-thumb:active {
  z-index: 3;
}

/* 价格显示 */
.price-display {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-top: 10px;
  position: relative;
  z-index: 5;
}

.price-tag {
  padding: 6px 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  position: relative;
  z-index: 5;
}

.price-range-line {
  flex: 1;
  height: 2px;
  background: linear-gradient(to right, #667eea, #764ba2);
  border-radius: 1px;
  position: relative;
  z-index: 5;
}

/* 筛选操作 */
.filter-actions {
  padding: 20px;
  background: #f8f9fa;
}
</style>
