<template>
  <div class="home">
    <div class="root">
      <div class="container">
        <!-- header 开始 -->
        <Header></Header>

        <!-- 内容开始 -->
        <div class="main">
          <div class="main-content">
            <!-- 轮播图开始 -->
            <div class="banner-container">
              <div class="banner">
                <div class="banner-wrapper">
                  <!-- 加载骨架屏 -->
                  <div class="banner-skeleton" v-if="!bannerImagesLoaded">
                    <div class="skeleton-shimmer"></div>
                  </div>

                  <div
                    class="banner-image"
                    :class="{ loaded: bannerImagesLoaded }"
                    :style="{
                      backgroundImage: `linear-gradient(0deg, rgba(0, 0, 0, 0.4) 0%, rgba(0, 0, 0, 0) 25%), url(${
                        bannerList.length > 0 ? bannerList[currentBannerIndex].image_url : ''
                      })`,
                    }"
                  >
                    <!-- 轮播图内容 -->
                    <div
                      class="banner-content"
                      v-if="bannerList.length > 0 && bannerList[currentBannerIndex].title"
                    >
                      <h3 class="banner-title">{{ bannerList[currentBannerIndex].title }}</h3>
                      <p
                        class="banner-description"
                        v-if="bannerList[currentBannerIndex].description"
                      >
                        {{ bannerList[currentBannerIndex].description }}
                      </p>
                    </div>

                    <!-- 左右箭头 -->
                    <button
                      class="banner-arrow banner-arrow-left"
                      @click="prevBanner"
                      v-if="bannerList.length > 1 && bannerImagesLoaded"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        fill="currentColor"
                        viewBox="0 0 256 256"
                      >
                        <path
                          d="M165.66,202.34a8,8,0,0,1-11.32,11.32l-80-80a8,8,0,0,1,0-11.32l80-80a8,8,0,0,1,11.32,11.32L91.31,128Z"
                        ></path>
                      </svg>
                    </button>
                    <button
                      class="banner-arrow banner-arrow-right"
                      @click="nextBanner"
                      v-if="bannerList.length > 1 && bannerImagesLoaded"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        fill="currentColor"
                        viewBox="0 0 256 256"
                      >
                        <path
                          d="M181.66,133.66l-80,80a8,8,0,0,1-11.32-11.32L164.69,128,90.34,53.66a8,8,0,0,1,11.32-11.32l80,80A8,8,0,0,1,181.66,133.66Z"
                        ></path>
                      </svg>
                    </button>

                    <!-- 小圆点 -->
                    <div class="banner-icons" v-if="bannerList.length > 1 && bannerImagesLoaded">
                      <div
                        v-for="(item, index) in bannerList"
                        :key="index"
                        class="dot"
                        :class="{ active: index === currentBannerIndex }"
                        @click="goToBanner(index)"
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <!-- 轮播图结束 -->

            <!-- 分类开始 -->
            <div class="bar">
              <div class="bar-item">
                <a class="bar-items active" href="#">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24px"
                    height="24px"
                    fill="currentColor"
                    viewBox="0 0 256 256"
                  >
                    <path
                      d="M100,86.38V100H86.38A14.25,14.25,0,0,1,72,87,14,14,0,0,1,87,72,14.25,14.25,0,0,1,100,86.38ZM72,169a14,14,0,0,0,15,15,14.25,14.25,0,0,0,13-14.34V156H86.38A14.25,14.25,0,0,0,72,169ZM184,87a14,14,0,0,0-15-15,14.25,14.25,0,0,0-13,14.34V100h13.62A14.25,14.25,0,0,0,184,87Zm40-23V192a32,32,0,0,1-32,32H64a32,32,0,0,1-32-32V64A32,32,0,0,1,64,32H192A32,32,0,0,1,224,64Zm-68,76V116h13.38c16.39,0,30.21-12.88,30.61-29.25A30,30,0,0,0,169.25,56C152.88,56.41,140,70.23,140,86.62V100H116V86.62C116,70.23,103.12,56.41,86.75,56A30,30,0,0,0,56,86.75C56.41,103.12,70.23,116,86.62,116H100v24H86.62C70.23,140,56.41,152.88,56,169.25A30,30,0,0,0,86.75,200c16.37-.4,29.25-14.22,29.25-30.61V156h24v13.38c0,16.39,12.88,30.21,29.25,30.61A30,30,0,0,0,200,169.25c-.4-16.37-14.22-29.25-30.61-29.25Zm-40,0h24V116H116Zm40,30a14,14,0,1,0,14-14H156Z"
                    ></path>
                  </svg>
                  <p>时令水果</p>
                </a>
                <a class="bar-items" href="#">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24px"
                    height="24px"
                    fill="currentColor"
                    viewBox="0 0 256 256"
                  >
                    <path
                      d="M232,64H203.31l26.35-26.34a8,8,0,0,0-11.32-11.32L192,52.69V24a8,8,0,0,0-16,0V56.57a64,64,0,0,0-77.2,10.12l0,0,0,0,0,0c-40.1,39.39-70.25,133.08-73.19,142.45a16,16,0,0,0,21.26,21.26c9.37-2.94,103.18-33.13,142.47-73.21A64,64,0,0,0,199.43,80H232a8,8,0,0,0,0-16Zm-54.12,82c-8.94,9.12-21.25,17.8-34.85,25.73l-25.38-25.39a8,8,0,0,0-11.32,11.32l22.09,22.09c-40.87,21.19-86.32,35.42-87,35.63A7.93,7.93,0,0,0,40,216a7.93,7.93,0,0,0,.59-1.41c.29-.93,28-89.58,64-130.67l33.77,33.77a8,8,0,0,0,11.32-11.32L116.18,72.88A48,48,0,0,1,177.88,146Z"
                    ></path>
                  </svg>
                  <p>新鲜蔬菜</p>
                </a>
                <a class="bar-items" href="#">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24px"
                    height="24px"
                    fill="currentColor"
                    viewBox="0 0 256 256"
                  >
                    <path
                      d="M248,80H8a8,8,0,0,0-8,8,128,128,0,0,0,256,0A8,8,0,0,0,248,80ZM77.4,149.91l42.6-42.6V167.6A79.59,79.59,0,0,1,77.4,149.91ZM66.09,138.6A79.59,79.59,0,0,1,48.4,96h60.29ZM136,107.31l42.6,42.6A79.59,79.59,0,0,1,136,167.6Zm53.91,31.29L147.31,96H207.6A79.59,79.59,0,0,1,189.91,138.6ZM128,200A112.15,112.15,0,0,1,16.28,96H32.34a96,96,0,0,0,191.32,0h16.06A112.15,112.15,0,0,1,128,200Z"
                    ></path>
                  </svg>
                  <p>健康果汁</p>
                </a>
                <a class="bar-items" href="#">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24px"
                    height="24px"
                    fill="currentColor"
                    viewBox="0 0 256 256"
                  >
                    <path
                      d="M223.45,40.07a8,8,0,0,0-7.52-7.52C139.8,28.08,78.82,51,52.82,94a87.09,87.09,0,0,0-12.76,49c.57,15.92,5.21,32,13.79,47.85l-19.51,19.5a8,8,0,0,0,11.32,11.32l19.5-19.51C81,210.73,97.09,215.37,113,215.94q1.67.06,3.33.06A86.93,86.93,0,0,0,162,203.18C205,177.18,227.93,116.21,223.45,40.07ZM153.75,189.5c-22.75,13.78-49.68,14-76.71.77l88.63-88.62a8,8,0,0,0-11.32-11.32L65.73,179c-13.19-27-13-54,.77-76.71,22.09-36.47,74.6-56.44,141.31-54.06C210.2,114.89,190.22,167.41,153.75,189.5Z"
                    ></path>
                  </svg>
                  <p>有机蔬菜</p>
                </a>
              </div>
            </div>
            <!-- 分类结束 -->

            <!-- 热门精选开始 -->
            <h2 class="title">热门精选</h2>
            <div class="product">
              <div class="product-list">
                <!-- 显示热门精选商品 -->
                <div
                  class="product-list-item"
                  v-for="item in popularPicks"
                  :key="item.id"
                  @click="click(item.id)"
                >
                  <div class="product-list-item-img lazy-image" :data-bg="item.image_url" v-lazy-bg>
                    <div class="image-skeleton" v-if="!item.imageLoaded"></div>
                  </div>
                  <div>
                    <p class="product-name">{{ item.name }}</p>
                    <p class="product-price">¥{{ item.price }}{{ item.unit }}</p>
                  </div>
                </div>
              </div>
            </div>
            <!-- 热门精选结束 -->

            <!-- 客户最爱开始 -->
            <h2 class="title">客户最爱</h2>
            <div class="grid-container">
              <div
                class="grid-item"
                v-for="item in customerFavorites"
                :key="item.id"
                @click="click(item.id)"
              >
                <div class="grid-item-img lazy-image" :data-bg="item.image_url" v-lazy-bg>
                  <div class="image-skeleton" v-if="!item.imageLoaded"></div>
                </div>
                <div>
                  <p class="product-name">{{ item.name }}</p>
                  <p class="product-price">¥{{ item.price }}{{ item.unit }}</p>
                </div>
              </div>
              <!-- 如果没有数据显示提示 -->
              <div v-if="customerFavorites.length === 0" class="empty-tip">暂无客户最爱商品</div>
            </div>
            <!-- 客户最爱结束 -->

            <!-- 新品上市开始 -->
            <h2 class="title">新品上市</h2>
            <div class="grid-container">
              <div
                class="grid-item"
                v-for="item in newArrivals"
                :key="item.id"
                @click="click(item.id)"
              >
                <div class="grid-item-img lazy-image" :data-bg="item.image_url" v-lazy-bg>
                  <div class="image-skeleton" v-if="!item.imageLoaded"></div>
                  <!-- 新品标签 -->
                  <span class="new-badge" v-if="item.is_new">新品</span>
                </div>
                <div>
                  <p class="product-name">{{ item.name }}</p>
                  <p class="product-price">¥{{ item.price }}{{ item.unit }}</p>
                </div>
              </div>
            </div>
            <!-- 新品上市结束 -->

            <!-- 限时优惠开始 -->
            <h2 class="title">限时优惠</h2>
            <div class="grid-container">
              <div
                class="grid-item"
                v-for="item in limitedOffers"
                :key="item.id"
                @click="click(item.id)"
              >
                <div class="grid-item-img lazy-image" :data-bg="item.image_url" v-lazy-bg>
                  <div class="image-skeleton" v-if="!item.imageLoaded"></div>
                  <!-- 显示折扣标签 -->
                  <span class="discount-badge" v-if="item.is_discount && item.discount_rate">{{
                    item.discount_rate
                  }}</span>
                </div>
                <div>
                  <p class="product-name">{{ item.name }}</p>
                  <div class="price-wrapper">
                    <p class="product-price">¥{{ item.price }}{{ item.unit }}</p>
                    <p class="original-price" v-if="item.original_price">
                      ¥{{ item.original_price }}
                    </p>
                  </div>
                </div>
              </div>
              <!-- 如果没有优惠商品 -->
              <div v-if="limitedOffers.length === 0" class="empty-tip">暂无优惠商品</div>
            </div>
            <!-- 限时优惠结束 -->

            <!-- 客户评价开始 -->
            <h2 class="title">客户评价</h2>
            <div class="comment-list">
              <div class="comment-list-item" v-for="review in reviews" :key="review.id">
                <div class="comment-list-item-user">
                  <div
                    class="comment-list-item-user-avatar lazy-image"
                    :data-bg="review.user_avatar"
                    v-lazy-bg
                  >
                    <div class="image-skeleton" v-if="!review.avatarLoaded"></div>
                  </div>
                  <div class="comment-list-item-user-info">
                    <p class="comment-list-item-user-info-name">{{ review.user_name }}</p>
                    <p class="comment-list-item-user-info-date">
                      {{ formatDate(review.created_at) }}
                    </p>
                  </div>
                </div>
                <!-- 五星评价 -->
                <div class="comment-list-item-star">
                  <svg
                    v-for="n in 5"
                    :key="n"
                    xmlns="http://www.w3.org/2000/svg"
                    width="20px"
                    height="20px"
                    :fill="n <= review.rating ? 'currentColor' : 'none'"
                    :stroke="n <= review.rating ? 'none' : 'currentColor'"
                    viewBox="0 0 256 256"
                  >
                    <path
                      d="M234.5,114.38l-45.1,39.36,13.51,58.6a16,16,0,0,1-23.84,17.34l-51.11-31-51,31a16,16,0,0,1-23.84-17.34L66.61,153.8,21.5,114.38a16,16,0,0,1,9.11-28.06l59.46-5.15,23.21-55.36a15.95,15.95,0,0,1,29.44,0h0L166,81.17l59.44,5.15a16,16,0,0,1,9.11,28.06Z"
                    ></path>
                  </svg>
                </div>
                <!-- 评论内容 -->
                <p class="comment-list-item-content">{{ review.comment }}</p>
                <div class="comment-list-item-like">
                  <!-- 点赞 -->
                  <button class="comment-list-item-likes">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20px"
                      height="20px"
                      fill="currentColor"
                      viewBox="0 0 256 256"
                    >
                      <path
                        d="M234,80.12A24,24,0,0,0,216,72H160V56a40,40,0,0,0-40-40,8,8,0,0,0-7.16,4.42L75.06,96H32a16,16,0,0,0-16,16v88a16,16,0,0,0,16,16H204a24,24,0,0,0,23.82-21l12-96A24,24,0,0,0,234,80.12ZM32,112H72v88H32ZM223.94,97l-12,96a8,8,0,0,1-7.94,7H88V105.89l36.71-73.43A24,24,0,0,1,144,56V80a8,8,0,0,0,8,8h64a8,8,0,0,1,7.94,9Z"
                      ></path>
                    </svg>
                    <p>{{ review.likes || 0 }}</p>
                  </button>
                </div>
              </div>
              <!-- 如果没有评价 -->
              <div v-if="reviews.length === 0" class="empty-tip">暂无客户评价</div>
            </div>
            <!-- 客户评价结束 -->

            <!-- 故事 -->
            <h2 class="title">我们的故事</h2>
            <p class="story">
              在 Fresh
              Harvest,我们致力于将最新鲜、最优质的农产品直接从本地农场送到您的餐桌。我们的旅程始于一个简单的想法：将消费者与食物来源联系起来,确保新鲜度和可持续性。我们与同样热衷于品质和环境责任的农民紧密合作,采用可持续的耕作方式种植最好的水果和蔬菜。我们的产品涵盖各种时令农产品,从爽脆的苹果和多汁的浆果,到鲜嫩的绿叶蔬菜和营养丰富的根茎类蔬菜。每件产品都经过精心挑选和处理,以保持其新鲜度和营养价值,确保您收到最好的产品。我们推崇透明度和可追溯性,因此您可以随时了解食物的来源和种植方式。我们的承诺不仅仅是提供优质的农产品；我们还致力于教育顾客了解健康饮食和可持续生活的好处。加入我们,支持本地农业,享受最新鲜、最美味的农产品。
            </p>
          </div>
        </div>
        <!-- 内容区结束 -->

        <!-- 底部开始 -->
        <footer class="footer">
          <div class="footer-container">
            <div class="footer-content">
              <div class="footer-content-links">
                <a href="#">关于我们</a>
                <a href="#">隐私政策</a>
                <a href="#">服务条款</a>
                <a href="#">常见问题</a>
              </div>
              <p class="copyright">© 2024 Fresh Harvest. 保留所有权利。</p>
            </div>
          </div>
        </footer>
        <!-- 底部结束 -->
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import Header from '@/components/Header.vue'
import { getGoodsList } from '@/api/index.js'

// 数据状态
const loading = ref(false)
const bannerList = ref([])
const categories = ref([])
const popularPicks = ref([])
const customerFavorites = ref([])
const newArrivals = ref([])
const limitedOffers = ref([])
const reviews = ref([])

// 轮播图相关
const currentBannerIndex = ref(0)
const bannerImagesLoaded = ref(false)
const loadedImages = new Set()
let bannerTimer = null

// 获取首页所有数据
const getHomeData = async () => {
  loading.value = true
  try {
    const result = await getGoodsList()
    console.log('API 返回:', result)

    if (result?.data?.data) {
      const data = result.data.data

      // 轮播图数据
      bannerList.value = data.banner || []

      // 分类数据
      categories.value = data.categories || []

      // 热门精选
      popularPicks.value = data.popular_picks || []

      // 客户最爱
      customerFavorites.value = data.customer_favorites || []

      // 新品上市
      newArrivals.value = data.new_arrivals || []

      // 限时优惠
      limitedOffers.value = data.limited_offers || []

      // 客户评价
      reviews.value = data.customer_reviews || []

      console.log('数据加载成功:', {
        轮播图: bannerList.value.length,
        分类: categories.value.length,
        热门精选: popularPicks.value.length,
        客户最爱: customerFavorites.value.length,
        新品上市: newArrivals.value.length,
        限时优惠: limitedOffers.value.length,
        客户评价: reviews.value.length,
      })

      // 如果有轮播图数据，预加载图片
      if (bannerList.value.length > 0) {
        preloadBannerImages()
      }
    }
  } catch (error) {
    console.error('获取首页数据失败:', error)
  } finally {
    loading.value = false
  }
}

// 预加载轮播图图片
const preloadBannerImages = () => {
  if (bannerList.value.length === 0) return

  // 先加载第一张图片
  const firstImage = new Image()
  firstImage.src = bannerList.value[0].image_url
  firstImage.onload = () => {
    bannerImagesLoaded.value = true
    loadedImages.add(bannerList.value[0].image_url)

    // 第一张图片加载完成后，启动自动轮播
    if (bannerList.value.length > 1) {
      startBannerAutoPlay()
    }

    // 后台预加载其他图片
    preloadRemainingImages()
  }
  firstImage.onerror = () => {
    console.error('轮播图第一张图片加载失败')
    bannerImagesLoaded.value = true // 即使失败也显示，避免一直显示骨架屏
  }
}

// 预加载剩余的轮播图图片
const preloadRemainingImages = () => {
  bannerList.value.slice(1).forEach((banner, index) => {
    // 使用 setTimeout 错开加载时间，避免同时请求太多图片
    setTimeout(() => {
      const img = new Image()
      img.src = banner.image_url
      img.onload = () => {
        loadedImages.add(banner.image_url)
      }
      img.onerror = () => {
        console.error(`轮播图图片 ${index + 2} 加载失败:`, banner.image_url)
      }
    }, index * 300) // 每张图片间隔300ms加载
  })
}

// 轮播图自动播放
const startBannerAutoPlay = () => {
  stopBannerAutoPlay() // 先清除之前的定时器
  bannerTimer = setInterval(() => {
    nextBanner()
  }, 5000) // 每5秒切换一次
}

// 停止轮播图自动播放
const stopBannerAutoPlay = () => {
  if (bannerTimer) {
    clearInterval(bannerTimer)
    bannerTimer = null
  }
}

// 下一张
const nextBanner = () => {
  if (bannerList.value.length === 0) return
  currentBannerIndex.value = (currentBannerIndex.value + 1) % bannerList.value.length
}

// 上一张
const prevBanner = () => {
  if (bannerList.value.length === 0) return
  currentBannerIndex.value =
    currentBannerIndex.value === 0 ? bannerList.value.length - 1 : currentBannerIndex.value - 1
}

// 跳转到指定图片
const goToBanner = (index) => {
  currentBannerIndex.value = index
  // 点击圆点后重新开始自动播放
  startBannerAutoPlay()
}

// 点击商品跳转到详情页
const click = (id) => {
  console.log('点击商品ID:', id)
  // 添加路由跳转逻辑
  // router.push({ name: 'ProductDetail', params: { id } })
}

// 格式化日期
const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN')
}

// 默认占位图 - SVG格式，轻量且美观
const DEFAULT_PLACEHOLDER =
  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3Crect fill="%23f0f4f0" width="400" height="300"/%3E%3Cpath fill="%23c0d4c0" d="M200 120c-22.09 0-40 17.91-40 40s17.91 40 40 40 40-17.91 40-40-17.91-40-40-40zm0 60c-11.05 0-20-8.95-20-20s8.95-20 20-20 20 8.95 20 20-8.95 20-20 20z"/%3E%3Cpath fill="%23c0d4c0" d="M320 80H80c-11.05 0-20 8.95-20 20v100c0 11.05 8.95 20 20 20h240c11.05 0 20-8.95 20-20V100c0-11.05-8.95-20-20-20zm0 120H80V100h240v100z"/%3E%3C/svg%3E'

// 懒加载指令
const vLazyBg = {
  mounted(el) {
    const imageUrl = el.getAttribute('data-bg')
    if (!imageUrl) {
      // 如果没有图片URL，直接显示占位图
      el.style.backgroundImage = `url(${DEFAULT_PLACEHOLDER})`
      el.classList.add('loaded')
      return
    }

    // 创建 Intersection Observer
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // 元素进入可视区域，开始加载图片
            const img = new Image()
            img.src = imageUrl

            img.onload = () => {
              // 图片加载成功，设置背景图
              el.style.backgroundImage = `url(${imageUrl})`
              el.classList.add('loaded')
              // 移除骨架屏
              const skeleton = el.querySelector('.image-skeleton')
              if (skeleton) {
                skeleton.style.display = 'none'
              }
            }

            img.onerror = () => {
              console.error('图片加载失败:', imageUrl)
              // 加载失败时显示占位图
              el.style.backgroundImage = `url(${DEFAULT_PLACEHOLDER})`
              el.classList.add('loaded', 'error')
              // 移除骨架屏
              const skeleton = el.querySelector('.image-skeleton')
              if (skeleton) {
                skeleton.style.display = 'none'
              }
            }

            // 停止观察
            observer.unobserve(el)
          }
        })
      },
      {
        rootMargin: '50px', // 提前50px开始加载
        threshold: 0.01,
      },
    )

    observer.observe(el)

    // 保存observer到元素上，方便清理
    el._lazyObserver = observer
  },
  unmounted(el) {
    // 清理observer
    if (el._lazyObserver) {
      el._lazyObserver.disconnect()
    }
  },
}

// 组件挂载时获取数据
onMounted(() => {
  getHomeData()
})

// 组件卸载时清除定时器
onUnmounted(() => {
  stopBannerAutoPlay()
})
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.home {
  background-color: #ffffff;
  min-height: 100vh;
}

.root {
  font-family: Epilogue, 'Noto Sans', sans-serif;
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  min-height: 100vh;
  flex-direction: column;
  background-color: #ffffff;
  overflow-x: hidden;
}

.container {
  display: flex;
  height: 100%;
  flex-grow: 1;
  flex-direction: column;
}

/* Header 样式 */
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  white-space: nowrap;
  border-bottom: 1px solid #f0f4f0;
  padding: 12px 40px;
}

.nav {
  display: flex;
  align-items: center;
  gap: 16px;
  color: #111811;
}

.nav-logo {
  width: 16px;
  height: 16px;
  color: #111811;
}

.nav h2 {
  color: #111811;
  font-size: 18px;
  font-weight: 700;
  line-height: 1.2;
  letter-spacing: -0.015em;
}

.nav-right {
  display: flex;
  flex: 1;
  justify-content: flex-end;
  gap: 32px;
}

.nav-right-items {
  display: flex;
  align-items: center;
  gap: 36px;
}

.nav-right-items a {
  color: #111811;
  font-size: 14px;
  font-weight: 500;
  line-height: 1.5;
  text-decoration: none;
}

.nav-right-btns {
  display: flex;
  gap: 8px;
}

.nav-right-search-item,
.nav-right-cart {
  display: flex;
  max-width: 480px;
  cursor: pointer;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-radius: 8px;
  height: 40px;
  background-color: #f0f4f0;
  color: #111811;
  gap: 8px;
  font-size: 14px;
  font-weight: 700;
  line-height: 1.5;
  letter-spacing: 0.015em;
  min-width: 0;
  padding: 0 10px;
  border: none;
}

/* 主内容区 */
.main {
  padding: 0 160px;
  display: flex;
  flex: 1;
  justify-content: center;
  padding-top: 20px;
  padding-bottom: 20px;
}

.main-content {
  display: flex;
  flex-direction: column;
  max-width: 960px;
  flex: 1;
}

/* 轮播图 */
.banner-container {
  container-type: inline-size;
}

.banner {
  padding: 12px 16px;
}

.banner-wrapper {
  position: relative;
}

.banner-image {
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  overflow: hidden;
  background-color: #f5f5f5;
  border-radius: 8px;
  min-height: 320px;
  position: relative;
  transition: background-image 0.5s ease-in-out;
  opacity: 0;
}

.banner-image.loaded {
  opacity: 1;
  transition: opacity 0.3s ease-in;
}

/* 骨架屏 */
.banner-skeleton {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
  border-radius: 8px;
  z-index: 1;
}

.skeleton-shimmer {
  width: 100%;
  height: 100%;
}

@keyframes loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

.banner-content {
  padding: 30px;
  z-index: 2;
}

.banner-title {
  color: #ffffff;
  font-size: 28px;
  font-weight: 700;
  line-height: 1.3;
  margin-bottom: 8px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.banner-description {
  color: #ffffff;
  font-size: 16px;
  font-weight: 400;
  line-height: 1.5;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
}

.banner-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background-color: rgba(255, 255, 255, 0.9);
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 3;
  transition: all 0.3s ease;
  color: #111811;
}

.banner-arrow:hover {
  background-color: #ffffff;
  transform: translateY(-50%) scale(1.1);
}

.banner-arrow-left {
  left: 20px;
}

.banner-arrow-right {
  right: 20px;
}

.banner-icons {
  display: flex;
  justify-content: center;
  gap: 8px;
  padding: 20px;
  z-index: 2;
}

.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: #ffffff;
  opacity: 0.5;
  cursor: pointer;
  transition: all 0.3s ease;
}

.dot:hover {
  opacity: 0.8;
  transform: scale(1.2);
}

.dot.active {
  opacity: 1;
  width: 24px;
  border-radius: 5px;
}

/* 分类栏 */
.bar {
  padding-bottom: 12px;
}

.bar-item {
  display: flex;
  border-bottom: 1px solid #dbe6db;
  padding: 0 16px;
  gap: 32px;
}

.bar-items {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-bottom: 3px solid transparent;
  color: #618961;
  gap: 4px;
  padding-bottom: 7px;
  padding-top: 10px;
  text-decoration: none;
}

.bar-items.active {
  border-bottom-color: #111811;
  color: #111811;
}

.bar-items p {
  font-size: 14px;
  font-weight: 700;
  line-height: 1.5;
  letter-spacing: 0.015em;
}

/* 标题 */
.title {
  color: #111811;
  font-size: 22px;
  font-weight: 700;
  line-height: 1.2;
  letter-spacing: -0.015em;
  padding: 0 16px 12px;
  margin-top: 20px;
}

/* 产品列表 */
.product {
  overflow-y: auto;
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.product::-webkit-scrollbar {
  display: none;
}

.product-list {
  display: flex;
  align-items: stretch;
  padding: 16px;
  gap: 12px;
}

.product-list-item {
  display: flex;
  height: 100%;
  flex: 1;
  flex-direction: column;
  gap: 16px;
  border-radius: 8px;
  min-width: 160px;
}

.product-list-item-img {
  width: 100%;
  background-position: center;
  background-repeat: no-repeat;
  aspect-ratio: 3/4;
  background-size: cover;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  position: relative;
  background-color: #f5f5f5;
  opacity: 0;
  transition: opacity 0.3s ease-in;
}

.product-list-item-img.loaded {
  opacity: 1;
}

.product-name {
  color: #111811;
  font-size: 16px;
  font-weight: 500;
  line-height: 1.5;
}

.product-price {
  color: #618961;
  font-size: 14px;
  font-weight: 400;
  line-height: 1.5;
}

/* 网格布局 */
.grid-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(158px, 1fr));
  gap: 12px;
  padding: 16px;
}

.grid-item {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-bottom: 12px;
}

.grid-item-img {
  width: 100%;
  background-position: center;
  background-repeat: no-repeat;
  aspect-ratio: 3/4;
  background-size: cover;
  border-radius: 8px;
  position: relative;
  background-color: #f5f5f5;
  opacity: 0;
  transition: opacity 0.3s ease-in;
}

.grid-item-img.loaded {
  opacity: 1;
}

/* 图片骨架屏 */
.image-skeleton {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
  border-radius: 8px;
}

/* 懒加载图片 */
.lazy-image {
  overflow: hidden;
}

/* 评论区 */
.comment-list {
  display: flex;
  flex-direction: column;
  gap: 32px;
  overflow-x: hidden;
  background-color: #ffffff;
  padding: 16px;
}

.comment-list-item {
  display: flex;
  flex-direction: column;
  gap: 12px;
  background-color: #ffffff;
}

.comment-list-item-user {
  display: flex;
  align-items: center;
  gap: 12px;
}

.comment-list-item-user-avatar {
  background-position: center;
  background-repeat: no-repeat;
  aspect-ratio: 1;
  background-size: cover;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  position: relative;
  background-color: #f5f5f5;
  opacity: 0;
  transition: opacity 0.3s ease-in;
  overflow: hidden;
}

.comment-list-item-user-avatar.loaded {
  opacity: 1;
}

.comment-list-item-user-info {
  flex: 1;
}

.comment-list-item-user-info-name {
  color: #111811;
  font-size: 16px;
  font-weight: 500;
  line-height: 1.5;
}

.comment-list-item-user-info-date {
  color: #618961;
  font-size: 14px;
  font-weight: 400;
  line-height: 1.5;
}

.comment-list-item-star {
  display: flex;
  gap: 2px;
  color: #111811;
}

.comment-list-item-content {
  color: #111811;
  font-size: 16px;
  font-weight: 400;
  line-height: 1.5;
}

.comment-list-item-like {
  display: flex;
  gap: 36px;
  color: #618961;
}

.comment-list-item-likes,
.comment-list-item-stepon {
  display: flex;
  align-items: center;
  gap: 8px;
  background: none;
  border: none;
  cursor: pointer;
  color: inherit;
  padding: 0;
}

.comment-list-item-likes p,
.comment-list-item-stepon p {
  color: inherit;
}

/* 故事 */
.story {
  color: #111811;
  font-size: 16px;
  font-weight: 400;
  line-height: 1.5;
  padding: 4px 16px 12px;
}

/* 底部 */
.footer {
  display: flex;
  justify-content: center;
}

.footer-container {
  display: flex;
  max-width: 960px;
  flex: 1;
  flex-direction: column;
}

.footer-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 40px 20px;
  text-align: center;
}

.footer-content-links {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 24px;
}

.footer-content-links a {
  color: #618961;
  font-size: 16px;
  font-weight: 400;
  line-height: 1.5;
  min-width: 160px;
  text-decoration: none;
}

.copyright {
  color: #618961;
  font-size: 16px;
  font-weight: 400;
  line-height: 1.5;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .main {
    padding: 0 80px;
  }
}

@media (max-width: 768px) {
  .header {
    padding: 12px 20px;
  }

  .nav-right-items {
    display: none;
  }

  .main {
    padding: 0 20px;
  }

  .product-list {
    overflow-x: auto;
  }

  .grid-container {
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  }
}

@media (max-width: 480px) {
  .banner-image {
    min-height: 240px;
  }

  .banner-arrow {
    width: 32px;
    height: 32px;
  }

  .banner-arrow-left {
    left: 10px;
  }

  .banner-arrow-right {
    right: 10px;
  }

  .banner-title {
    font-size: 20px;
  }

  .banner-description {
    font-size: 14px;
  }

  .banner-content {
    padding: 20px;
  }

  .bar-item {
    gap: 16px;
  }

  .bar-items p {
    font-size: 12px;
  }

  .product-list-item {
    min-width: 140px;
  }

  .grid-container {
    grid-template-columns: repeat(2, 1fr);
  }
}

.empty-tip {
  grid-column: 1 / -1;
  text-align: center;
  padding: 40px;
  color: #999;
  font-size: 14px;
}

.discount-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  background: #ff4757;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: bold;
}

.new-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  background: #4caf50;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: bold;
}

.grid-item-img {
  position: relative;
  overflow: hidden;
}

.price-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
}

.original-price {
  color: #999;
  font-size: 12px;
  text-decoration: line-through;
}
</style>
