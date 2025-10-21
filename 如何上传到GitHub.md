# 📤 如何将项目上传到 GitHub

## 方法一：使用命令行（推荐）

### 1️⃣ 在 GitHub 上创建仓库

1. 访问 [https://github.com/new](https://github.com/new)
2. 填写以下信息：
   - **Repository name**: `fruit-and-vegetable-mall`
   - **Description**: `生鲜果蔬商城 - 基于 Vue 3 + Element Plus 的现代化电商平台`
   - **Public** (公开) 或 **Private** (私有)
   - **不要勾选** "Add a README file"（我们已经有了）
   - **不要勾选** "Add .gitignore"（我们已经有了）
3. 点击 **Create repository**

创建完成后，GitHub 会显示一个页面，记下仓库地址，类似于：
```
https://github.com/你的用户名/fruit-and-vegetable-mall.git
```

### 2️⃣ 在本地初始化 Git

打开项目根目录，在 PowerShell 或 Git Bash 中执行：

```bash
# 初始化 Git 仓库
git init

# 添加所有文件到暂存区
git add .

# 提交代码
git commit -m "Initial commit: 生鲜果蔬商城项目完整代码"

# 创建主分支（如果需要）
git branch -M main

# 添加远程仓库（替换为你的仓库地址）
git remote add origin https://github.com/你的用户名/fruit-and-vegetable-mall.git

# 推送到 GitHub
git push -u origin main
```

### 3️⃣ 如果遇到认证问题

如果推送时要求输入用户名和密码：

#### 方法 A：使用 Personal Access Token（推荐）

1. 访问 [https://github.com/settings/tokens](https://github.com/settings/tokens)
2. 点击 **Generate new token** → **Generate new token (classic)**
3. 填写信息：
   - **Note**: `Fruit Mall Project`
   - **Expiration**: 选择过期时间（建议 90 days 或 No expiration）
   - **Select scopes**: 勾选 `repo`（全部权限）
4. 点击 **Generate token**
5. **复制生成的 token**（只会显示一次！）
6. 推送时：
   - **Username**: 你的 GitHub 用户名
   - **Password**: 粘贴刚才复制的 token

#### 方法 B：使用 SSH 密钥

1. 生成 SSH 密钥：
```bash
ssh-keygen -t ed25519 -C "your_email@example.com"
```

2. 复制公钥：
```bash
cat ~/.ssh/id_ed25519.pub
```

3. 在 GitHub 添加 SSH 密钥：
   - 访问 [https://github.com/settings/keys](https://github.com/settings/keys)
   - 点击 **New SSH key**
   - 粘贴公钥内容
   - 点击 **Add SSH key**

4. 修改远程仓库地址为 SSH：
```bash
git remote set-url origin git@github.com:你的用户名/fruit-and-vegetable-mall.git
git push -u origin main
```

---

## 方法二：使用 GitHub Desktop（简单）

### 1️⃣ 下载并安装 GitHub Desktop

下载地址：[https://desktop.github.com/](https://desktop.github.com/)

### 2️⃣ 登录 GitHub 账号

打开 GitHub Desktop，点击 `File` → `Options` → `Accounts` 登录

### 3️⃣ 添加本地仓库

1. 点击 `File` → `Add local repository`
2. 选择你的项目文件夹
3. 如果提示 "This directory does not appear to be a Git repository"：
   - 点击 `Create a repository`
   - 填写仓库信息
   - 点击 `Create repository`

### 4️⃣ 提交并推送

1. 在左侧查看要提交的文件
2. 在底部 "Summary" 输入：`Initial commit: 生鲜果蔬商城项目`
3. 点击 **Commit to main**
4. 点击顶部的 **Publish repository**
5. 填写仓库名称和描述
6. 选择公开或私有
7. 点击 **Publish repository**

---

## 方法三：使用 VS Code（如果你用 VS Code）

### 1️⃣ 初始化仓库

1. 打开项目文件夹
2. 点击左侧 **Source Control** 图标（或按 `Ctrl+Shift+G`）
3. 点击 **Initialize Repository**

### 2️⃣ 提交代码

1. 在 "Message" 输入框输入：`Initial commit: 生鲜果蔬商城项目`
2. 点击 **✓ Commit** 或按 `Ctrl+Enter`

### 3️⃣ 推送到 GitHub

1. 点击 **...** → **Remote** → **Add Remote**
2. 输入仓库 URL：`https://github.com/你的用户名/fruit-and-vegetable-mall.git`
3. 输入远程名称：`origin`
4. 点击 **...** → **Push**

---

## 📝 后续更新代码

当你修改代码后，使用以下命令更新到 GitHub：

```bash
# 查看修改的文件
git status

# 添加所有修改的文件
git add .

# 提交修改
git commit -m "描述你的修改"

# 推送到 GitHub
git push
```

---

## 🔧 常见问题

### Q1: 提示 "fatal: remote origin already exists"

**解决方法**：
```bash
git remote remove origin
git remote add origin https://github.com/你的用户名/fruit-and-vegetable-mall.git
```

### Q2: 提示 "Updates were rejected because the remote contains work"

**解决方法**：
```bash
git pull origin main --allow-unrelated-histories
git push -u origin main
```

### Q3: 推送时一直要求输入密码

**解决方法**：使用 Personal Access Token 或配置 SSH 密钥（见上方方法）

### Q4: 文件太大无法上传

**解决方法**：
1. 检查 `.gitignore` 文件，确保 `node_modules` 和 `dist` 被忽略
2. 如果已经提交了大文件，需要从历史中删除：
```bash
git rm -r --cached node_modules
git rm -r --cached dist
git commit -m "Remove large files"
git push
```

---

## ✅ 验证上传成功

访问你的 GitHub 仓库页面：
```
https://github.com/你的用户名/fruit-and-vegetable-mall
```

应该能看到所有项目文件，README.md 会自动显示在页面下方。

---

## 🎉 完成！

现在你的项目已经在 GitHub 上了！你可以：
- 分享给其他人查看
- 用于毕业设计答辩
- 继续开发和更新
- 部署到 Vercel、Netlify 等平台

**仓库地址示例**：`https://github.com/你的用户名/fruit-and-vegetable-mall`

