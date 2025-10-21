# 🍎 生鲜果蔬商城

<div align="center">

![Vue](https://img.shields.io/badge/Vue-3.5.18-green.svg)
![Element Plus](https://img.shields.io/badge/Element%20Plus-2.11.4-blue.svg)
![Vite](https://img.shields.io/badge/Vite-7.0.6-purple.svg)
![Node](https://img.shields.io/badge/Node-%3E%3D20.19.0-brightgreen.svg)
![License](https://img.shields.io/badge/License-MIT-orange.svg)

一个现代化的生鲜果蔬电商平台，基于 Vue 3 + Element Plus + Pinia 构建

**新鲜健康每一天** 🥬🍎🥕

</div>

---

## ✨ 功能特性

### 🛒 商品模块

- **商品浏览**: 支持网格/列表视图切换
- **分类筛选**: 多级分类，精准定位
- **搜索功能**: 关键词搜索，智能推荐
- **价格筛选**: 自定义价格区间
- **排序功能**: 默认/价格/销量多维度排序
- **商品详情**: 图片轮播、规格说明、用户评价
- **骨架屏**: 优化加载体验

### 🛍️ 购物车

- **便捷管理**: 增删改查，批量操作
- **全选功能**: 一键全选/取消
- **实时计算**: 动态价格计算
- **库存检查**: 智能库存提醒
- **数据持久化**: 跨会话保存

### 💳 订单系统

- **快速下单**: 简化流程，一键结算
- **订单管理**: 全状态订单查询
- **订单详情**: 完整订单信息展示
- **多种支付**: 余额/支付宝/微信/银行卡
- **订单跟踪**: 实时物流信息
- **订单评价**: 晒图评价，互动点赞
- **退款申请**: 便捷的售后服务

### 👤 用户中心

- **账户管理**: 个人信息修改
- **头像上传**: 支持图片压缩
- **密码修改**: 安全密码管理
- **会员系统**: 四级会员体系（普通/白银/黄金/钻石）
- **余额管理**: 充值、消费记录
- **订单统计**: 消费数据可视化

### 📍 地址管理

- **地址簿**: 多地址管理
- **省市区选择**: 三级联动选择器
- **默认地址**: 智能默认地址设置
- **地址验证**: 表单验证保证准确性

### 🚚 物流追踪

- **实时更新**: 30秒自动刷新
- **可视化展示**: 时间轴展示物流进度
- **状态提醒**: 物流状态智能提示
- **预计送达**: 预计送达时间显示

### 🎨 主题系统

- **明暗切换**: 完整的明亮/暗黑主题
- **平滑过渡**: 优雅的主题切换动画
- **状态持久化**: 记住用户偏好
- **会员配色**: 不同会员等级专属配色

### ⭐ 收藏功能

- **商品收藏**: 一键收藏喜欢的商品
- **收藏管理**: 批量管理收藏列表
- **快速加购**: 从收藏直接加入购物车

## 🛠️ 技术栈

### 核心框架

- **[Vue 3.5.18](https://vuejs.org/)** - 渐进式 JavaScript 框架
  - Composition API
  - `<script setup>` 语法
  - Reactive 响应式系统
- **[Vite 7.0.6](https://vitejs.dev/)** - 下一代前端构建工具
  - 极速的 HMR 热更新
  - 优化的构建输出
  - 开箱即用的 TypeScript 支持

### 状态与路由

- **[Pinia 3.0.3](https://pinia.vuejs.org/)** - Vue 官方状态管理库
- **[pinia-plugin-persistedstate 4.5.0](https://github.com/prazdevs/pinia-plugin-persistedstate)** - 状态持久化插件
- **[Vue Router 4.5.1](https://router.vuejs.org/)** - Vue 官方路由

### UI 与样式

- **[Element Plus 2.11.4](https://element-plus.org/)** - Vue 3 组件库
- **[Element Icons](https://element-plus.org/zh-CN/component/icon.html)** - 图标库
- **CSS Variables** - 动态主题变量
- **Responsive Design** - 响应式布局

### 工具库

- **[Axios 1.5.0](https://axios-http.com/)** - HTTP 请求库
- **[element-china-area-data 6.1.0](https://github.com/Plortinus/element-china-area-data)** - 中国省市区数据

### 代码质量

- **[ESLint 9.31.0](https://eslint.org/)** - 代码检查工具
- **[Prettier 3.6.2](https://prettier.io/)** - 代码格式化工具
- **[Vue DevTools 8.0.0](https://devtools.vuejs.org/)** - Vue 调试工具

## 📁 项目结构

```
fruit-and-vegetable-mall/
├── public/                    # 静态资源
│   └── favicon.ico           # 网站图标
├── src/
│   ├── api/                  # API 接口模块
│   │   ├── address.js        # 地址接口
│   │   ├── cart.js           # 购物车接口
│   │   ├── favorites.js      # 收藏接口
│   │   ├── logistics.js      # 物流接口
│   │   ├── order.js          # 订单接口
│   │   ├── recharge.js       # 充值接口
│   │   ├── review.js         # 评价接口
│   │   └── user.js           # 用户接口
│   ├── assets/               # 资源文件
│   │   ├── images/           # 图片资源
│   │   └── main.css          # 全局样式
│   ├── components/           # 公共组件
│   │   ├── AddressSelector.vue      # 地址选择器
│   │   ├── Breadcrumb.vue           # 面包屑导航
│   │   ├── Footer.vue               # 页脚组件
│   │   ├── LogisticsDialog.vue      # 物流对话框
│   │   ├── LogisticsTracker.vue     # 物流追踪组件
│   │   ├── OrderReviewDialog.vue    # 订单评价对话框
│   │   ├── PaymentDialog.vue        # 支付对话框
│   │   ├── RegionSelector.vue       # 地区选择器
│   │   ├── ReviewDetailDialog.vue   # 评价详情对话框
│   │   └── SkeletonLoader.vue       # 骨架屏组件
│   ├── config/               # 配置文件
│   │   └── shipping.js       # 配送配置
│   ├── data/                 # 静态数据
│   │   └── regions.js        # 地区数据
│   ├── router/               # 路由配置
│   │   └── index.js          # 路由定义
│   ├── services/             # 服务层
│   │   └── logisticsRealTimeService.js  # 物流实时服务
│   ├── stores/               # Pinia 状态管理
│   │   ├── addressStore.js   # 地址状态
│   │   ├── cartStore.js      # 购物车状态
│   │   ├── index.js          # Store 入口
│   │   ├── logisticsStore.js # 物流状态
│   │   ├── orderStore.js     # 订单状态
│   │   ├── productStore.js   # 商品状态
│   │   ├── searchStore.js    # 搜索状态
│   │   ├── themeStore.js     # 主题状态
│   │   └── userStore.js      # 用户状态
│   ├── utils/                # 工具函数
│   │   └── request.js        # HTTP 请求封装
│   ├── views/                # 页面组件
│   │   ├── AccountSettings.vue      # 账户设置
│   │   ├── AddressManagement.vue    # 地址管理
│   │   ├── Cart.vue                 # 购物车
│   │   ├── Checkout.vue             # 结算页
│   │   ├── Favorites.vue            # 收藏夹
│   │   ├── Home.vue                 # 首页
│   │   ├── Login.vue                # 登录/注册
│   │   ├── NotFound.vue             # 404 页面
│   │   ├── OrderDetail.vue          # 订单详情
│   │   ├── OrderList.vue            # 订单列表
│   │   ├── ProductDetail.vue        # 商品详情
│   │   ├── Profile.vue              # 个人中心
│   │   └── Shop.vue                 # 商品列表
│   ├── App.vue               # 根组件
│   └── main.js               # 应用入口
├── .eslintrc.cjs             # ESLint 配置
├── .gitignore                # Git 忽略文件
├── .prettierrc.json          # Prettier 配置
├── index.html                # HTML 入口
├── package.json              # 项目配置
├── vite.config.js            # Vite 配置
└── README.md                 # 项目文档
```

## 🚀 快速开始

### 环境要求

- **Node.js**: `^20.19.0` 或 `>=22.12.0`
- **npm**: `>= 8.0.0` 或 **yarn**: `>= 1.22.0`

### 安装与运行

1. **克隆项目**

```bash
git clone <repository-url>
cd fruit-and-vegetable-mall
```

2. **安装依赖**

```bash
npm install
```

3. **启动开发服务器**

```bash
npm run dev
```

浏览器访问: [http://localhost:5173](http://localhost:5173)

4. **构建生产版本**

```bash
npm run build
```

5. **预览生产版本**

```bash
npm run preview
```

### 可用命令

| 命令                   | 说明                        |
| ---------------------- | --------------------------- |
| `npm run dev`          | 启动开发服务器 (端口: 5173) |
| `npm run build`        | 构建生产版本到 `dist/` 目录 |
| `npm run preview`      | 本地预览生产构建            |
| `npm run lint`         | 运行 ESLint 并自动修复问题  |
| `npm run lint:check`   | 检查代码规范（不修复）      |
| `npm run format`       | 使用 Prettier 格式化代码    |
| `npm run format:check` | 检查代码格式（不修复）      |
| `npm run clean`        | 清理构建缓存                |

## 📋 核心功能实现

### 状态管理 (Pinia)

项目使用 Pinia 进行全局状态管理，所有 Store 支持持久化：

```javascript
// stores/userStore.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useUserStore = defineStore(
  'user',
  () => {
    const user = ref(null)
    const token = ref(null)

    const isLoggedIn = computed(() => !!token.value)

    const login = async credentials => {
      // 登录逻辑
    }

    return { user, token, isLoggedIn, login }
  },
  {
    persist: true, // 自动持久化到 localStorage
  }
)
```

### 路由守卫

```javascript
// router/index.js
router.beforeEach((to, from, next) => {
  const userStore = useUserStore()

  // 需要登录的页面
  if (to.meta.requiresAuth && !userStore.isLoggedIn) {
    next('/login')
  } else {
    next()
  }
})
```

### API 请求封装

```javascript
// utils/request.js
import axios from 'axios'
import { ElMessage } from 'element-plus'

const request = axios.create({
  baseURL: '/api',
  timeout: 10000,
})

// 请求拦截器
request.interceptors.request.use(config => {
  const userStore = useUserStore()
  if (userStore.token) {
    config.headers.Authorization = `Bearer ${userStore.token}`
  }
  return config
})

// 响应拦截器
request.interceptors.response.use(
  response => response.data,
  error => {
    ElMessage.error(error.message || '请求失败')
    return Promise.reject(error)
  }
)
```

### 主题切换实现

```javascript
// stores/themeStore.js
export const useThemeStore = defineStore(
  'theme',
  () => {
    const theme = ref('light')

    const toggleTheme = () => {
      theme.value = theme.value === 'light' ? 'dark' : 'light'
      applyTheme()
    }

    const applyTheme = () => {
      document.documentElement.className = `${theme.value}-theme`
      document.documentElement.style.colorScheme = theme.value
    }

    return { theme, toggleTheme }
  },
  {
    persist: true,
  }
)
```

## 🎨 设计规范

### 色彩系统

#### 明亮模式

- **主色**: `#4a8157` (绿色)
- **辅色**: `#5a7a98` (蓝色)
- **背景**: `#dfe3e8` / `#f0f2f5`
- **文字**: `#2c3e50`

#### 暗黑模式

- **主色**: `#5a9a67` (绿色)
- **辅色**: `#6a8a9e` (蓝色)
- **背景**: `#18191a` / `#242526`
- **文字**: `#e4e6eb`

### 会员等级配色

- **普通会员**: `#e59a5a` (铜色)
- **白银会员**: `#d4d4d4` (银色)
- **黄金会员**: `#ffd700` (金色)
- **钻石会员**: `#b9f2ff` (钻石蓝)

### 间距规范

```css
--spacing-xs: 4px --spacing-sm: 8px --spacing-md: 16px --spacing-lg: 24px
  --spacing-xl: 32px;
```

### 圆角规范

```css
--border-radius-sm: 4px --border-radius-md: 8px --border-radius-lg: 12px
  --border-radius-full: 50%;
```

## 🎯 开发规范

### 命名规范

- **组件文件**: PascalCase (如 `ProductCard.vue`)
- **工具文件**: camelCase (如 `request.js`)
- **常量**: UPPER_SNAKE_CASE (如 `API_BASE_URL`)
- **CSS 类名**: kebab-case (如 `product-card`)

### 代码风格

- 使用 Composition API (`<script setup>`)
- 使用 ESLint + Prettier 保证代码质量
- 组件 Props 需要完整的类型定义和验证
- 避免在模板中使用复杂逻辑，使用计算属性
- 合理使用组件拆分，单个组件不超过 500 行

## 🔌 API 接口

### 接口规范

- **基础地址**: `/api`
- **认证方式**: Bearer Token
- **数据格式**: JSON

### 主要接口模块

| 模块   | 接口路径           | 说明                 |
| ------ | ------------------ | -------------------- |
| 认证   | `/api/auth/*`      | 登录、注册、登出     |
| 用户   | `/api/user/*`      | 用户信息、头像、密码 |
| 商品   | `/api/products/*`  | 商品列表、详情、分类 |
| 购物车 | `/api/cart/*`      | 购物车 CRUD 操作     |
| 订单   | `/api/orders/*`    | 订单创建、查询、支付 |
| 地址   | `/api/addresses/*` | 收货地址管理         |
| 物流   | `/api/logistics/*` | 物流信息查询         |
| 收藏   | `/api/favorites/*` | 商品收藏管理         |
| 评价   | `/api/reviews/*`   | 商品评价、点赞       |
| 充值   | `/api/recharge/*`  | 账户充值、记录       |

### 请求示例

```javascript
// 获取商品列表
const { data } = await request.get('/products', {
  params: {
    page: 1,
    pageSize: 12,
    category: 'fruits',
    sortBy: 'sales',
  },
})
```

## 📱 浏览器支持

| 浏览器  | 版本  |
| ------- | ----- |
| Chrome  | >= 88 |
| Edge    | >= 88 |
| Firefox | >= 78 |
| Safari  | >= 14 |
| Opera   | >= 75 |

> **注意**: 不支持 IE 浏览器

## 🔒 安全特性

- ✅ HTTPS 加密传输
- ✅ JWT Token 认证
- ✅ XSS 攻击防护
- ✅ CSRF 防护
- ✅ 密码加密存储
- ✅ 请求频率限制

## 📈 性能优化

### 已实现的优化

- ✅ 路由懒加载
- ✅ 组件异步加载
- ✅ 图片懒加载
- ✅ Gzip 压缩
- ✅ CDN 加速
- ✅ 代码分割
- ✅ 骨架屏加载
- ✅ 虚拟滚动（大列表）

### 性能指标

- **首屏加载**: < 2s
- **白屏时间**: < 0.8s
- **交互延迟**: < 100ms

## 🚀 部署指南

### Nginx 部署

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/fruit-mall/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### Docker 部署

```bash
# 构建镜像
docker build -t fruit-mall .

# 运行容器
docker run -d -p 80:80 fruit-mall
```

## 🤝 贡献指南

欢迎贡献代码！请遵循以下步骤：

1. **Fork** 本仓库
2. **创建特性分支**
   ```bash
   git checkout -b feature/AmazingFeature
   ```
3. **提交更改**
   ```bash
   git commit -m 'Add some AmazingFeature'
   ```
4. **推送到分支**
   ```bash
   git push origin feature/AmazingFeature
   ```
5. **开启 Pull Request**

### 贡献规范

- 代码符合 ESLint 规范
- 提交信息清晰明确
- 添加必要的注释和文档
- 通过所有测试用例

## 📝 更新日志

### v1.0.0 (2025-10-21)

- ✨ 完整的电商功能实现
- 🎨 明暗主题切换
- 🛒 购物车功能
- 💳 订单系统
- 🚚 物流追踪
- 👤 会员系统
- 📱 响应式设计

## 📄 许可证

本项目采用 [MIT](LICENSE) 许可证

## 👥 开发团队

- **项目负责人**: [Your Name]
- **开发时间**: 2024-2025
- **技术栈**: Vue 3 + Element Plus + Pinia

## 📞 联系方式

如有问题或建议，欢迎通过以下方式联系：

- 📧 **邮箱**: your-email@example.com
- 🐛 **Bug 反馈**: [提交 Issue](https://github.com/your-repo/issues)
- 💬 **讨论**: [Discussions](https://github.com/your-repo/discussions)

## 🙏 致谢

感谢以下开源项目的支持：

- [Vue.js](https://vuejs.org/) - 渐进式 JavaScript 框架
- [Element Plus](https://element-plus.org/) - Vue 3 组件库
- [Vite](https://vitejs.dev/) - 下一代前端构建工具
- [Pinia](https://pinia.vuejs.org/) - Vue 状态管理库

## 📸 项目截图

### 首页

<img src="docs/screenshots/home.png" alt="首页" width="600">

### 商品列表

<img src="docs/screenshots/shop.png" alt="商品列表" width="600">

### 购物车

<img src="docs/screenshots/cart.png" alt="购物车" width="600">

### 个人中心

<img src="docs/screenshots/profile.png" alt="个人中心" width="600">

---

<div align="center">

**⭐ 如果这个项目对你有帮助，请给它一个 Star！**

Made with ❤️ by [Your Name]

[返回顶部](#-生鲜果蔬商城)

</div>
