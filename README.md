# 🍎 果蔬商城 (Fruit and Vegetable Mall)

一个基于 Vue 3 + Vite + Pinia 构建的现代化果蔬电商平台，提供完整的购物体验。

## ✨ 功能特性

- 🛒 **商品浏览**: 商品列表、详情页、分类筛选
- 🛍️ **购物车**: 添加商品、数量调整、价格计算
- 💳 **订单管理**: 下单、支付、订单跟踪
- 👤 **用户系统**: 注册、登录、个人中心
- 📍 **地址管理**: 收货地址的增删改查
- 🚚 **物流跟踪**: 实时物流信息查询
- 📱 **响应式设计**: 适配各种设备尺寸

## 🛠️ 技术栈

- **前端框架**: Vue 3 (Composition API)
- **构建工具**: Vite
- **状态管理**: Pinia
- **路由管理**: Vue Router 4
- **UI 组件库**: Element Plus
- **HTTP 客户端**: Axios
- **代码规范**: ESLint + Prettier
- **持久化**: Pinia Plugin Persistedstate

## 📁 项目结构

```
src/
├── api/           # API 接口
├── assets/        # 静态资源
├── components/    # 可复用组件
├── data/          # 静态数据
├── router/        # 路由配置
├── services/      # 服务层
├── stores/        # 状态管理
├── utils/         # 工具函数
└── views/         # 页面组件
```

## 🚀 快速开始

### 环境要求

- Node.js >= 20.19.0
- npm >= 8.0.0

### 安装依赖

```bash
npm install
```

### 开发环境

```bash
npm run dev
```

访问 [http://localhost:5173](http://localhost:5173) 查看应用

### 生产构建

```bash
npm run build
```

### 预览构建结果

```bash
npm run preview
```

## 🔧 开发工具

### 代码检查

```bash
# 检查代码规范
npm run lint:check

# 自动修复代码规范问题
npm run lint
```

### 代码格式化

```bash
# 检查代码格式
npm run format:check

# 自动格式化代码
npm run format
```

### 清理缓存

```bash
npm run clean
```

## 📋 开发规范

项目遵循严格的代码规范，详见 [CODING_STANDARDS.md](./CODING_STANDARDS.md)

### 主要规范

- Vue 组件使用 PascalCase 命名
- JavaScript 文件使用 camelCase 命名
- 图片文件使用 kebab-case 命名
- 避免使用中文文件名
- 使用 ESLint + Prettier 保证代码质量

## 🔌 API 接口

项目使用 RESTful API 设计，主要接口包括：

- **用户相关**: `/api/auth/*`, `/api/user/*`
- **商品相关**: `/api/products/*`
- **购物车**: `/api/cart/*`
- **订单**: `/api/orders/*`
- **地址**: `/api/addresses/*`
- **物流**: `/api/logistics/*`

## 🎨 设计规范

- **主色调**: 绿色系 (#67C23A)
- **辅助色**: 橙色系 (#E6A23C)
- **字体**: 系统默认字体栈
- **间距**: 8px 基础间距单位
- **圆角**: 4px 标准圆角

## 📱 浏览器支持

- Chrome >= 88
- Firefox >= 78
- Safari >= 14
- Edge >= 88

## 🤝 贡献指南

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 📞 联系方式

如有问题或建议，请通过以下方式联系：

- 提交 Issue
- 发送邮件
- 微信联系

---

⭐ 如果这个项目对你有帮助，请给它一个星标！
