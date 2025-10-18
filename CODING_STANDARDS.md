# 项目文件命名规范

## 📁 目录结构规范

```
src/
├── api/           # API 接口文件
├── assets/        # 静态资源
│   ├── images/    # 图片资源
│   └── styles/    # 样式文件
├── components/    # 可复用组件
├── data/          # 静态数据文件
├── router/        # 路由配置
├── services/      # 服务层
├── stores/        # 状态管理
├── utils/         # 工具函数
└── views/         # 页面组件
```

## 📝 文件命名规范

### 1. Vue 组件文件

- **页面组件** (`views/`): 使用 PascalCase
  - `Home.vue`
  - `ProductDetail.vue`
  - `OrderList.vue`

- **可复用组件** (`components/`): 使用 PascalCase
  - `ProductCard.vue`
  - `Breadcrumb.vue`
  - `LogisticsTracker.vue`

### 2. JavaScript 文件

- **API 文件** (`api/`): 使用 camelCase
  - `user.js`
  - `product.js`
  - `order.js`

- **Store 文件** (`stores/`): 使用 camelCase + Store 后缀
  - `userStore.js`
  - `productStore.js`
  - `cartStore.js`

- **工具文件** (`utils/`): 使用 camelCase
  - `request.js`
  - `format.js`
  - `validate.js`

### 3. 静态资源文件

- **图片文件**: 使用 kebab-case
  - `apple.jpg` ✅
  - `banner-image.png` ✅
  - `product-card-bg.svg` ✅
  - `女.jpg` ❌ (避免中文)
  - `柠檬.jpg` ❌ (避免中文)

- **样式文件**: 使用 kebab-case
  - `main.css`
  - `variables.css`
  - `components.css`

### 4. 配置文件

- **根目录配置文件**: 使用 kebab-case
  - `vite.config.js`
  - `eslint.config.js`
  - `.prettierrc`
  - `.gitignore`

## 🎯 命名最佳实践

### 1. 组件命名

```vue
<!-- ✅ 推荐 -->
<ProductCard />
<UserProfile />
<OrderSummary />

<!-- ❌ 避免 -->
<productCard />
<user_profile />
<order-summary />
```

### 2. 变量命名

```javascript
// ✅ 推荐
const userStore = useUserStore()
const productList = ref([])
const isLoading = ref(false)

// ❌ 避免
const user_store = useUserStore()
const productlist = ref([])
const is_loading = ref(false)
```

### 3. 函数命名

```javascript
// ✅ 推荐
const fetchUserProfile = async () => {}
const handleSubmit = () => {}
const validateForm = () => {}

// ❌ 避免
const fetch_user_profile = async () => {}
const handle_submit = () => {}
const validate_form = () => {}
```

### 4. 常量命名

```javascript
// ✅ 推荐
const API_BASE_URL = 'https://api.example.com'
const MAX_RETRY_COUNT = 3
const DEFAULT_PAGE_SIZE = 20

// ❌ 避免
const api_base_url = 'https://api.example.com'
const maxRetryCount = 3
const defaultPageSize = 20
```

## 🔧 需要重命名的文件

### 图片文件重命名建议

```
女.jpg → female-avatar.jpg
男.jpg → male-avatar.jpg
柠檬.jpg → lemon.jpg
橙子.jpg → orange.jpg
橙汁.jpg → orange-juice.jpg
沙拉蔬菜.jpg → salad-vegetables.jpg
牛油果.jpg → avocado.jpg
甘蓝.jpg → cabbage.jpg
番茄.jpg → tomato.jpg
红辣椒.jpg → red-pepper.jpg
绿笋.jpg → green-bamboo.jpg
胡萝卜.jpg → carrot.jpg
芒果.jpg → mango.jpg
草莓.jpg → strawberry.jpg
菠菜.jpg → spinach.jpg
葡萄.jpg → grape.jpg
蓝莓.jpg → blueberry.jpg
```

## 📋 检查清单

- [ ] 所有 Vue 组件使用 PascalCase
- [ ] 所有 JavaScript 文件使用 camelCase
- [ ] 所有图片文件使用 kebab-case
- [ ] 避免使用中文文件名
- [ ] 文件名具有描述性
- [ ] 文件名长度适中（不超过 30 个字符）
- [ ] 避免使用特殊字符和空格
