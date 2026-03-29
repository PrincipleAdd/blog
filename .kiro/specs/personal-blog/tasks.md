# 实现计划：个人博客系统

## 概述

基于 Vue 3 + Vite（前端）和 Express + SQLite（后端）的前后端分离博客系统。实现按后端基础设施 → 数据层 → API 层 → 前端展示 → 管理后台 → 部署配置的顺序推进，每个阶段都确保可验证。

## 任务列表

- [x] 1. 初始化项目结构与依赖
  - [x] 1.1 创建后端项目骨架
    - 创建 `server/` 目录，初始化 `package.json`
    - 安装依赖：`express`, `better-sqlite3`, `knex`, `jsonwebtoken`, `bcryptjs`, `cors`, `marked`, `highlight.js`, `pinyin-pro`
    - 创建 `server/src/app.js` 入口文件，配置 Express 基础中间件（JSON 解析、CORS）
    - 创建 `server/knexfile.js` 配置 SQLite 数据库路径
    - _需求: 6.1_

  - [x] 1.2 创建前端项目骨架
    - 使用 Vite 创建 `client/` 目录的 Vue 3 项目
    - 安装依赖：`vue-router@4`, `pinia`, `axios`, `element-plus`, `marked`, `highlight.js`, `@unhead/vue`
    - 配置 `vite.config.js`，设置开发代理将 `/api` 转发到 `http://localhost:3000`
    - _需求: 4.1, 4.3_

- [x] 2. 数据库设计与迁移
  - [x] 2.1 创建数据库连接模块
    - 创建 `server/src/models/db.js`，使用 `better-sqlite3` 初始化数据库连接
    - 启用 WAL 模式和外键约束
    - _需求: 6.1_

  - [x] 2.2 编写 Knex 数据库迁移文件
    - 创建 `users` 表迁移：id, username(唯一), password_hash, created_at
    - 创建 `categories` 表迁移：id, name(唯一), slug(唯一), created_at
    - 创建 `tags` 表迁移：id, name(唯一), slug(唯一), created_at
    - 创建 `articles` 表迁移：id, title, slug(唯一), content_md, content_html, status(draft/published), created_at, updated_at, category_id(FK)
    - 创建 `article_tags` 关联表迁移：article_id(FK), tag_id(FK)，复合主键
    - _需求: 1.1, 1.2, 2.1, 2.4, 3.1_

  - [x] 2.3 创建数据库种子文件
    - 创建种子脚本，插入默认管理员用户（用户名 admin，密码使用 bcryptjs 加密）
    - _需求: 5.1, 5.5_


- [x] 3. 后端工具函数与中间件
  - [x] 3.1 实现 Slug 生成工具
    - 创建 `server/src/utils/slug.js`
    - 使用 `pinyin-pro` 将中文标题转拼音，英文转小写，空格替换为 `-`，去除特殊字符
    - 实现冲突检测：若 slug 已存在则追加数字后缀（如 `my-post-2`）
    - _需求: 7.1_

  - [x] 3.2 编写 Slug 生成的单元测试
    - 测试中文标题转拼音 slug
    - 测试英文标题转 slug
    - 测试特殊字符过滤
    - 测试 slug 冲突时的数字后缀追加
    - _需求: 7.1_

  - [x] 3.3 实现 JWT 认证中间件
    - 创建 `server/src/middleware/auth.js`
    - 从 `Authorization: Bearer <token>` 头中提取并验证 JWT
    - 验证成功将 `{ userId, username }` 挂载到 `req.user`
    - 验证失败返回 401 状态码
    - _需求: 5.1, 5.2, 5.3, 5.4_

- [ ] 4. 后端服务层实现
  - [x] 4.1 实现认证服务
    - 创建 `server/src/services/authService.js`
    - 实现 `login(username, password)`：验证凭据，返回 JWT token（24 小时过期）
    - 实现 `verifyToken(token)`：解析并验证 JWT
    - 实现 `hashPassword(password)`：使用 bcryptjs 加密密码
    - _需求: 5.1, 5.2, 5.3, 5.4, 5.5_

  - [x] 4.2 实现分类服务
    - 创建 `server/src/services/categoryService.js`
    - 实现 `createCategory(name)`：创建分类并自动生成 slug
    - 实现 `deleteCategory(id)`：删除分类
    - 实现 `listCategories()`：获取所有分类
    - 实现 `getCategoryBySlug(slug)`：按 slug 查询分类
    - _需求: 2.1, 2.3, 2.4_

  - [-] 4.3 实现标签服务
    - 创建 `server/src/services/tagService.js`
    - 实现 `createTag(name)`：创建标签并自动生成 slug
    - 实现 `deleteTag(id)`：删除标签
    - 实现 `listTags()`：获取所有标签（含文章计数）
    - 实现 `getTagBySlug(slug)`：按 slug 查询标签
    - _需求: 3.1, 3.2, 3.3, 3.4_

  - [ ] 4.4 实现文章服务
    - 创建 `server/src/services/articleService.js`
    - 实现 `createArticle({ title, content, categoryId, tagIds, status })`：创建文章，使用 `marked` 将 Markdown 转 HTML 存储到 `content_html`，自动生成 slug，处理 article_tags 关联
    - 实现 `updateArticle(id, { title, content, categoryId, tagIds, status })`：更新文章，同步更新 `content_html` 和 `updated_at`
    - 实现 `deleteArticle(id)`：删除文章及其 article_tags 关联
    - 实现 `getArticleBySlug(slug)`：按 slug 获取文章详情（含分类和标签信息）
    - 实现 `listPublishedArticles(page, pageSize)`：分页获取已发布文章，按发布时间倒序
    - 实现 `listAllArticles(page, pageSize)`：分页获取所有文章（含草稿）
    - 实现 `listByCategory(categorySlug, page, pageSize)`：按分类获取文章
    - 实现 `listByTag(tagSlug, page, pageSize)`：按标签获取文章
    - _需求: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 2.2_

  - [ ] 4.5 编写文章服务的单元测试
    - 测试创建文章时 Markdown 正确转换为 HTML
    - 测试草稿文章不出现在已发布列表中
    - 测试删除文章同时清除标签关联
    - 测试分页逻辑返回正确的 total 和 articles
    - _需求: 1.1, 1.3, 1.4, 1.5, 1.6_


- [ ] 5. 后端 API 路由层
  - [ ] 5.1 实现认证路由
    - 创建 `server/src/routes/auth.js`
    - `POST /api/auth/login`：调用 authService.login，返回 token
    - `GET /api/auth/profile`：需认证，返回当前用户信息
    - _需求: 5.1, 5.2, 5.3_

  - [ ] 5.2 实现文章公开路由
    - 创建 `server/src/routes/articles.js`
    - `GET /api/articles`：分页获取已发布文章列表，支持 `page` 和 `pageSize` 查询参数
    - `GET /api/articles/:slug`：获取文章详情（仅已发布）
    - _需求: 1.6, 4.1, 4.4_

  - [ ] 5.3 实现文章管理路由
    - 在 `server/src/routes/articles.js` 中添加管理路由（需认证中间件）
    - `GET /api/admin/articles`：获取所有文章列表（含草稿）
    - `POST /api/admin/articles`：创建文章
    - `PUT /api/admin/articles/:id`：更新文章
    - `DELETE /api/admin/articles/:id`：删除文章
    - _需求: 1.1, 1.2, 1.3, 1.5, 1.6_

  - [ ] 5.4 实现分类路由
    - 创建 `server/src/routes/categories.js`
    - `GET /api/categories`：获取所有分类
    - `GET /api/categories/:slug`：获取分类下的文章
    - `POST /api/admin/categories`：创建分类（需认证）
    - `DELETE /api/admin/categories/:id`：删除分类（需认证）
    - _需求: 2.1, 2.3, 2.4_

  - [ ] 5.5 实现标签路由
    - 创建 `server/src/routes/tags.js`
    - `GET /api/tags`：获取所有标签（含文章数）
    - `GET /api/tags/:slug`：获取标签下的文章
    - `POST /api/admin/tags`：创建标签（需认证）
    - `DELETE /api/admin/tags/:id`：删除标签（需认证）
    - _需求: 3.1, 3.3, 3.4_

  - [ ] 5.6 实现 Sitemap 路由
    - 创建 `server/src/routes/sitemap.js`
    - `GET /sitemap.xml`：生成包含所有已发布文章 URL 的 XML sitemap
    - _需求: 7.3_

  - [ ] 5.7 注册所有路由到 Express 应用
    - 在 `server/src/app.js` 中挂载所有路由模块
    - 添加全局错误处理中间件
    - 添加 404 处理
    - _需求: 6.1_

- [ ] 6. 检查点 - 后端功能验证
  - 确保所有后端 API 可正常运行，数据库迁移和种子数据正确执行。如有问题请向用户确认。


- [ ] 7. 前端基础架构
  - [ ] 7.1 配置 Vue Router 路由
    - 创建 `client/src/router/index.js`
    - 配置公开路由：`/`（首页）、`/posts/:slug`（文章详情）、`/categories/:slug`（分类文章）、`/tags/:slug`（标签文章）、`/about`（关于）
    - 配置管理路由：`/admin/login`、`/admin/dashboard`、`/admin/posts`、`/admin/posts/new`、`/admin/posts/:id/edit`、`/admin/categories`、`/admin/tags`
    - 管理路由添加导航守卫，未登录跳转到登录页
    - _需求: 5.1, 7.1_

  - [ ] 7.2 配置 Pinia 状态管理与 API 封装
    - 创建 `client/src/stores/auth.js`：管理登录状态、token 存储（localStorage）、登出逻辑
    - 创建 `client/src/api/index.js`：封装 Axios 实例，配置请求拦截器自动附加 Authorization 头，响应拦截器处理 401 跳转登录
    - 创建 `client/src/api/articles.js`、`categories.js`、`tags.js`、`auth.js`：各模块 API 请求方法
    - _需求: 5.2, 5.4_

  - [ ] 7.3 配置 Element Plus 和全局样式
    - 在 `client/src/main.js` 中注册 Element Plus、Pinia、Router、@unhead/vue
    - 创建 `client/src/App.vue`，设置公开页面和管理后台的布局切换
    - 添加基础全局样式，确保响应式布局
    - _需求: 4.3_

- [ ] 8. 前端公开展示页面
  - [ ] 8.1 实现首页（Home.vue）
    - 创建 `client/src/views/Home.vue`
    - 调用 `GET /api/articles` 获取文章列表，按发布时间倒序展示
    - 每篇文章展示标题、摘要（content_md 截取前 200 字符）、发布时间、分类、标签
    - 集成 Pagination 分页组件，每页 10 篇
    - _需求: 4.1, 4.4_

  - [ ] 8.2 实现文章详情页（Post.vue）
    - 创建 `client/src/views/Post.vue`
    - 根据路由参数 slug 调用 `GET /api/articles/:slug` 获取文章
    - 使用 MarkdownRenderer 组件渲染文章内容
    - 展示文章标题、发布时间、分类、标签
    - 使用 `@unhead/vue` 动态设置页面 title、meta description、Open Graph 标签
    - _需求: 4.2, 7.1, 7.2, 7.4_

  - [ ] 8.3 实现通用组件
    - 创建 `client/src/components/Pagination.vue`：接收 total、currentPage、pageSize props，触发 page-change 事件
    - 创建 `client/src/components/MarkdownRenderer.vue`：封装 `marked` + `highlight.js`，接收 markdown 内容 prop 渲染为 HTML
    - 创建 `client/src/components/TagCloud.vue`：获取标签列表，根据文章数量调整字体大小，点击跳转到标签文章页
    - _需求: 3.4, 4.2, 4.4_

  - [ ] 8.4 实现分类文章页（Category.vue）
    - 创建 `client/src/views/Category.vue`
    - 根据路由参数 slug 调用 `GET /api/categories/:slug` 获取分类下的文章列表
    - 展示分类名称和文章列表，支持分页
    - _需求: 2.3_

  - [ ] 8.5 实现标签文章页（Tag.vue）
    - 创建 `client/src/views/Tag.vue`
    - 根据路由参数 slug 调用 `GET /api/tags/:slug` 获取标签下的文章列表
    - 展示标签名称和文章列表，支持分页
    - _需求: 3.3_

  - [ ] 8.6 实现关于页面（About.vue）
    - 创建 `client/src/views/About.vue`
    - 展示博主个人介绍信息（可硬编码或从配置读取）
    - _需求: 4.5_


- [ ] 9. 前端管理后台页面
  - [ ] 9.1 实现登录页（Login.vue）
    - 创建 `client/src/views/admin/Login.vue`
    - 使用 Element Plus 表单组件，包含用户名和密码输入框
    - 提交时调用 `POST /api/auth/login`，成功后存储 token 到 localStorage 并跳转到 Dashboard
    - 登录失败显示错误提示信息
    - _需求: 5.1, 5.2, 5.3_

  - [ ] 9.2 实现管理面板首页（Dashboard.vue）
    - 创建 `client/src/views/admin/Dashboard.vue`
    - 展示文章总数、分类总数、标签总数的统计卡片
    - 提供快捷入口：新建文章、管理分类、管理标签
    - _需求: 5.2_

  - [ ] 9.3 实现文章编辑器（PostEditor.vue）
    - 创建 `client/src/views/admin/PostEditor.vue`
    - 集成 Markdown 编辑器（使用 `md-editor-v3`），支持实时预览
    - 表单包含：标题输入、分类下拉选择、标签多选、状态切换（草稿/已发布）
    - 新建模式：提交调用 `POST /api/admin/articles`
    - 编辑模式：根据路由参数 id 加载文章数据，提交调用 `PUT /api/admin/articles/:id`
    - _需求: 1.1, 1.2, 1.4, 1.5, 1.6, 2.2, 3.1, 3.2_

  - [ ] 9.4 实现文章列表管理（PostList.vue）
    - 创建 `client/src/views/admin/PostList.vue`
    - 调用 `GET /api/admin/articles` 获取所有文章（含草稿）
    - 使用 Element Plus Table 展示文章列表，包含标题、状态、分类、创建时间列
    - 提供编辑按钮（跳转到 PostEditor）和删除按钮（确认后调用 `DELETE /api/admin/articles/:id`）
    - _需求: 1.1, 1.2, 1.3_

  - [ ] 9.5 实现分类管理（Categories.vue）
    - 创建 `client/src/views/admin/Categories.vue`
    - 展示分类列表，提供新建分类的输入框和提交按钮
    - 提供删除按钮，确认后调用 `DELETE /api/admin/categories/:id`
    - _需求: 2.1, 2.4_

  - [ ] 9.6 实现标签管理（Tags.vue）
    - 创建 `client/src/views/admin/Tags.vue`
    - 展示标签列表（含文章数），提供新建标签的输入框和提交按钮
    - 提供删除按钮，确认后调用 `DELETE /api/admin/tags/:id`
    - _需求: 3.1_

- [ ] 10. 检查点 - 前端功能验证
  - 确保所有前端页面可正常渲染，路由跳转正确，API 调用正常。如有问题请向用户确认。

- [ ] 11. 部署配置
  - [ ] 11.1 创建 PM2 配置文件
    - 创建 `ecosystem.config.js`
    - 配置 Node.js 应用名称、入口文件路径、日志文件路径
    - 配置开机自启
    - _需求: 6.3, 6.4_

  - [ ] 11.2 创建 Nginx 配置文件
    - 创建 `nginx.conf`
    - 配置静态文件服务：将 `/` 指向 Vue 构建产物目录
    - 配置反向代理：将 `/api` 和 `/sitemap.xml` 转发到 Express（端口 3000）
    - 配置 SPA history 模式的 fallback（`try_files $uri $uri/ /index.html`）
    - 配置 gzip 压缩和静态资源缓存头
    - _需求: 6.1, 6.2_

  - [ ] 11.3 创建构建与部署脚本
    - 在 `server/package.json` 中添加 `start` 和 `migrate` 脚本
    - 在 `client/package.json` 中确认 `build` 脚本输出到正确目录
    - 创建根目录 `deploy.sh` 脚本：安装依赖、运行迁移、构建前端、重启 PM2
    - _需求: 6.1, 6.3_

- [ ] 12. 最终检查点 - 全部功能验证
  - 确保所有测试通过，前后端联调正常，部署配置文件完整。如有问题请向用户确认。

## 备注

- 标记 `*` 的任务为可选任务，可跳过以加快 MVP 进度
- 每个任务都引用了对应的需求编号，确保需求可追溯
- 检查点任务用于阶段性验证，确保增量开发的正确性
- 实现顺序确保每一步都基于前一步的成果，不会出现孤立代码
