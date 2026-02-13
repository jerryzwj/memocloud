# Memo Cloud

一个基于React的备忘录应用，支持将数据存储在WebDAV网盘中，具备富文本编辑功能和响应式设计。

## 功能特性

### 📝 富文本编辑
- 支持粗体、斜体、下划线等基础文本格式化
- 支持无序列表和有序列表
- 支持插入链接
- 支持插入水平分隔线
- 支持创建待办事项（带复选框）
- 支持文件上传到WebDAV网盘

### ☁️ 数据存储
- 使用WebDAV网盘存储备忘录数据
- 本地存储作为备用方案，确保离线也能使用
- 自动备份所有操作到本地存储

### 🎨 界面设计
- 支持明亮模式和黑暗模式
- 响应式设计，适配PC和手机屏幕
- 简洁美观的卡片式布局
- 流畅的过渡动画效果

### 🔒 安全认证
- 基于环境变量的用户登录认证
- 安全的密码存储方式
- 记住登录状态，减少重复登录

## 技术栈

- **前端框架**：React 18
- **构建工具**：Vite 5
- **富文本编辑器**：基于contentEditable的自定义实现
- **WebDAV客户端**：webdav
- **样式**：纯CSS（使用CSS变量实现主题切换）
- **部署**：Cloudflare Pages

## 安装和运行

### 前提条件
- Node.js 16.0+
- npm 7.0+

### 安装步骤

1. **克隆仓库**
   ```bash
   git clone <repository-url>
   cd memo-cloud
   ```

2. **安装依赖**
   ```bash
   npm install
   ```

3. **配置环境变量**
   复制 `.env.example` 文件为 `.env`，并填写相应的配置：
   ```bash
   # WebDAV配置
   VITE_WEBDAV_URL=https://wajima.infini-cloud.net/dav/
   VITE_WEBDAV_USERNAME=your_username
   VITE_WEBDAV_PASSWORD=your_password

   # 用户登录账号密码
   VITE_LOGIN_USERNAME=admin
   VITE_LOGIN_PASSWORD=password123
   ```

4. **开发模式运行**
   ```bash
   npm run dev
   ```
   访问 http://localhost:5173/ 查看应用

5. **构建生产版本**
   ```bash
   npm run build
   ```
   构建产物将生成在 `dist` 目录

## 部署到Cloudflare Pages

1. **登录Cloudflare Pages**：访问 https://pages.cloudflare.com/ 并登录

2. **创建新项目**：点击 "Create a project"

3. **连接Git仓库**：选择你的项目仓库

4. **配置构建选项**：
   - Framework preset: React
   - Build command: `npm run build`
   - Build output directory: `dist`

5. **设置环境变量**：在 "Environment variables" 部分添加以下变量：
   - `VITE_WEBDAV_URL` = `https://wajima.infini-cloud.net/dav/`
   - `VITE_WEBDAV_USERNAME` = `your_username`
   - `VITE_WEBDAV_PASSWORD` = `your_password`
   - `VITE_LOGIN_USERNAME` = `admin`
   - `VITE_LOGIN_PASSWORD` = `password123`

6. **部署**：点击 "Deploy site" 开始部署

## 使用方法

### 登录
- 用户名：`admin`
- 密码：`password123`

### 创建备忘录
1. 登录后，点击右上角 "新建备忘录" 按钮
2. 输入标题和内容
3. 使用工具栏进行文本格式化
4. 点击 "保存" 按钮保存备忘录

### 编辑备忘录
1. 点击任意备忘录卡片进入编辑页面
2. 修改标题和内容
3. 点击 "保存" 按钮保存修改

### 删除备忘录
1. 进入编辑页面
2. 点击 "删除" 按钮
3. 确认删除操作

### 上传文件
1. 进入编辑页面
2. 点击工具栏中的 📎 按钮
3. 选择要上传的文件
4. 文件会被上传到WebDAV网盘并在编辑器中插入文件链接

## 项目结构

```
memo-cloud/
├── src/
│   ├── App.jsx          # 主应用组件
│   ├── main.jsx         # 应用入口
│   └── index.css        # 全局样式
├── .env                 # 环境变量配置
├── .env.example         # 环境变量示例
├── .gitignore           # Git忽略文件
├── _redirects           # Cloudflare Pages重定向规则
├── wrangler.toml        # Cloudflare Pages配置
├── index.html           # HTML入口
├── package.json         # 项目配置
└── vite.config.js       # Vite配置
```

## 环境变量说明

| 变量名 | 描述 | 默认值 | 是否必填 |
|--------|------|--------|----------|
| VITE_WEBDAV_URL | WebDAV服务器地址 | https://wajima.infini-cloud.net/dav/ | 是 |
| VITE_WEBDAV_USERNAME | WebDAV用户名 | - | 是 |
| VITE_WEBDAV_PASSWORD | WebDAV密码 | - | 是 |
| VITE_LOGIN_USERNAME | 用户登录用户名 | admin | 是 |
| VITE_LOGIN_PASSWORD | 用户登录密码 | password123 | 是 |

## 注意事项

1. **WebDAV连接**：如果WebDAV连接失败，应用会自动切换到本地存储
2. **文件上传**：文件上传大小受WebDAV服务器限制
3. **安全性**：敏感环境变量应在部署平台的控制台中设置，不要提交到版本控制系统
4. **浏览器兼容性**：推荐使用Chrome、Firefox、Safari等现代浏览器

## 开发和贡献

### 开发命令
- `npm run dev`：启动开发服务器
- `npm run build`：构建生产版本
- `npm run lint`：运行代码检查

### 贡献指南
1. Fork本仓库
2. 创建功能分支
3. 提交代码
4. 发起Pull Request

## 许可证

MIT License

## 联系方式

如果您有任何问题或建议，欢迎通过以下方式联系：

- 项目地址：<repository-url>

---

**Memo Cloud** - 让备忘录存储更安全、编辑更高效 🚀