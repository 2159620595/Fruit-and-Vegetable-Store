// src/main.js
import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import { createPinia } from 'pinia'
import { createPersistedState } from 'pinia-plugin-persistedstate'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import App from './App.vue'
import './assets/main.css'
import router from './router'

// // 页面组件
// import Home from './views/Home.vue'
// import Shop from './views/Shop.vue'
// import ProductDetail from './views/ProductDetail.vue'
// import Cart from './views/Cart.vue'
// import Checkout from './views/Checkout.vue'
// import OrderDetail from './views/OrderDetail.vue'
// import Profile from './views/Profile.vue'
// import DeliveryAddress from './views/DeliveryAddress.vue'
// import Login from './views/Login.vue'
// import Signup from './views/Signup.vue'

// // 路由配置
// const routes = [
//   { path: '/', name: 'Home', component: Home },
//   { path: '/shop', name: 'Shop', component: Shop },
//   { path: '/product/:id', name: 'ProductDetail', component: ProductDetail },
//   { path: '/cart', name: 'Cart', component: Cart },
//   { path: '/checkout', name: 'Checkout', component: Checkout, meta: { requiresAuth: true } },
//   {
//     // path: '/orders/:id',
//     path: '/orders/:id',
//     name: 'OrderDetail',
//     component: OrderDetail,
//     meta: { requiresAuth: true },
//   },
//   { path: '/profile', name: 'Profile', component: Profile, meta: { requiresAuth: true } },
//   {
//     path: '/addresses',
//     name: 'DeliveryAddress',
//     component: DeliveryAddress,
//     meta: { requiresAuth: true },
//   },
//   { path: '/login', name: 'Login', component: Login },
//   { path: '/signup', name: 'Signup', component: Signup },
// ]

// const router = createRouter({
//   history: createWebHistory(),
//   routes,
// })

// 路由守卫
// router.beforeEach((to, from, next) => {
//   const isAuthenticated = localStorage.getItem('token')
//   if (to.meta.requiresAuth && !isAuthenticated) {
//     next('/login')
//   } else {
//     next()
//   }
// })

const pinia = createPinia()
pinia.use(createPersistedState())

const app = createApp(App)

app.use(router)
app.use(pinia)
app.use(ElementPlus, {
  locale: zhCn,
})

app.mount('#app')
