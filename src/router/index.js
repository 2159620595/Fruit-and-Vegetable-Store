import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/userStore'

// 页面组件
import Home from '@/views/Home.vue'
import Shop from '@/views/Shop.vue'
import ProductDetail from '@/views/ProductDetail.vue'
import Cart from '@/views/Cart.vue'
import Checkout from '@/views/Checkout.vue'
import OrderList from '@/views/OrderList.vue'
import OrderDetail from '@/views/OrderDetail.vue'
import Profile from '@/views/Profile.vue'
import Login from '@/views/Login.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // 首页
    {
      path: '/',
      name: 'Home',
      component: Home,
      meta: {
        title: '首页 - 果蔬商城',
      },
    },

    // 商品列表
    {
      path: '/shop',
      name: 'Shop',
      component: Shop,
      meta: {
        title: '商品列表 - 果蔬商城',
      },
    },

    // 商品详情
    {
      path: '/product/:id',
      name: 'ProductDetail',
      component: ProductDetail,
      meta: {
        title: '商品详情 - 果蔬商城',
      },
    },

    // 购物车
    {
      path: '/cart',
      name: 'Cart',
      component: Cart,
      meta: {
        title: '购物车 - 果蔬商城',
      },
    },

    // 结算页面（需要登录）
    {
      path: '/checkout',
      name: 'Checkout',
      component: Checkout,
      meta: {
        requiresAuth: true,
        title: '结算 - 果蔬商城',
      },
    },

    // 我的订单列表（需要登录）
    {
      path: '/orders',
      name: 'Orders',
      component: OrderList,
      meta: {
        requiresAuth: true,
        title: '我的订单 - 果蔬商城',
      },
    },

    // 订单详情（需要登录）
    {
      path: '/orders/:id',
      name: 'OrderDetail',
      component: OrderDetail,
      meta: {
        requiresAuth: true,
        title: '订单详情 - 果蔬商城',
      },
    },

    // 个人中心（需要登录）
    {
      path: '/profile',
      name: 'Profile',
      component: Profile,
      meta: {
        requiresAuth: true,
        title: '个人中心 - 果蔬商城',
      },
    },

    // 登录/注册（统一页面）
    {
      path: '/login',
      name: 'Login',
      component: Login,
      meta: {
        title: '登录注册 - 果蔬商城',
        hideForAuth: true, // 已登录用户访问时重定向
      },
    },

    // 重定向：/signup -> /login
    {
      path: '/signup',
      redirect: '/login',
    },

    // 404页面
    {
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      component: () => import('@/views/NotFound.vue'),
      meta: {
        title: '页面未找到 - 果蔬商城',
      },
    },
  ],

  // 滚动行为
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  },
})

// 路由守卫
router.beforeEach((to, from, next) => {
  // 更新页面标题
  if (to.meta.title) {
    document.title = to.meta.title
  }

  const userStore = useUserStore()

  // 检查是否需要登录
  if (to.meta.requiresAuth) {
    if (!userStore.isLoggedIn) {
      console.warn('⚠️ 需要登录才能访问:', to.path)
      // 保存目标路由，登录后跳转回来
      next({
        path: '/login',
        query: { redirect: to.fullPath },
      })
      return
    }
  }

  // 已登录用户访问登录页，重定向到首页
  if (to.meta.hideForAuth && userStore.isLoggedIn) {
    console.log('✅ 已登录，重定向到首页')
    next('/')
    return
  }

  next()
})

// 路由错误处理
router.onError((error) => {
  console.error('❌ 路由错误:', error)
})

export default router
