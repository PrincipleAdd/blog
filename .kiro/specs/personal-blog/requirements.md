# 需求文档

## 简介

在用户自有的腾讯云服务器（Ubuntu）上搭建一个个人博客系统。博客应支持文章的撰写与发布、分类管理、标签系统，并提供简洁美观的前端展示页面。系统需具备基本的安全防护和性能优化能力，适合个人长期使用和维护。

## 术语表

- **Blog_System**: 部署在云服务器上的个人博客系统整体，包含前端展示和后端服务
- **Article_Manager**: 负责文章创建、编辑、删除和发布的模块
- **Category_Manager**: 负责文章分类的创建和管理的模块
- **Tag_Manager**: 负责文章标签的创建和管理的模块
- **Frontend**: 面向访客的博客前端展示页面
- **Admin_Panel**: 博客管理后台，供博主管理内容
- **Server**: 用户的腾讯云服务器（Ubuntu 系统，IP: 159.75.26.219）
- **Visitor**: 访问博客的普通用户
- **Author**: 博客的拥有者和内容管理者

## 需求

### 需求 1：文章管理

**用户故事：** 作为博客作者，我希望能够创建、编辑、删除和发布文章，以便管理我的博客内容。

#### 验收标准

1. WHEN Author 在 Admin_Panel 中提交新文章，THE Article_Manager SHALL 保存文章内容并生成唯一的文章 URL
2. WHEN Author 编辑已有文章并保存，THE Article_Manager SHALL 更新文章内容并保留修改时间记录
3. WHEN Author 删除一篇文章，THE Article_Manager SHALL 将该文章从数据库中移除，并使对应的 URL 返回 404 状态
4. THE Article_Manager SHALL 支持 Markdown 格式编写文章内容
5. WHEN Author 将文章设为草稿状态，THE Article_Manager SHALL 确保该文章对 Visitor 不可见
6. WHEN Author 将文章设为已发布状态，THE Article_Manager SHALL 使该文章在 Frontend 上对所有 Visitor 可见

### 需求 2：分类管理

**用户故事：** 作为博客作者，我希望能够对文章进行分类，以便访客按类别浏览内容。

#### 验收标准

1. WHEN Author 创建一个新分类，THE Category_Manager SHALL 保存该分类并使其可用于文章关联
2. WHEN Author 为文章指定分类，THE Article_Manager SHALL 将该文章与指定分类建立关联
3. WHEN Visitor 点击某个分类，THE Frontend SHALL 展示该分类下的所有已发布文章列表
4. THE Category_Manager SHALL 确保每个分类名称在系统中唯一

### 需求 3：标签系统

**用户故事：** 作为博客作者，我希望能够为文章添加标签，以便访客通过标签发现相关内容。

#### 验收标准

1. WHEN Author 为文章添加标签，THE Tag_Manager SHALL 保存标签并与该文章建立关联
2. THE Tag_Manager SHALL 允许一篇文章关联多个标签
3. WHEN Visitor 点击某个标签，THE Frontend SHALL 展示包含该标签的所有已发布文章列表
4. THE Frontend SHALL 在侧边栏或专用页面展示标签云

### 需求 4：前端展示

**用户故事：** 作为访客，我希望博客页面简洁美观、加载迅速，以便获得良好的阅读体验。

#### 验收标准

1. THE Frontend SHALL 提供博客首页，按发布时间倒序展示文章列表
2. WHEN Visitor 访问文章详情页，THE Frontend SHALL 渲染 Markdown 内容为 HTML 并展示文章标题、发布时间、分类和标签
3. THE Frontend SHALL 采用响应式设计，在桌面端和移动端均可正常浏览
4. THE Frontend SHALL 提供文章列表的分页功能，每页展示不超过 10 篇文章
5. THE Frontend SHALL 提供"关于"页面，展示博主的个人介绍信息

### 需求 5：管理后台认证

**用户故事：** 作为博客作者，我希望管理后台有登录保护，以防止未授权的人修改我的博客内容。

#### 验收标准

1. WHEN 用户访问 Admin_Panel，THE Blog_System SHALL 要求输入用户名和密码进行身份验证
2. WHEN 用户提交正确的凭据，THE Blog_System SHALL 创建登录会话并允许访问管理功能
3. IF 用户提交错误的凭据，THEN THE Blog_System SHALL 拒绝访问并显示错误提示信息
4. WHEN 登录会话超过 24 小时未活动，THE Blog_System SHALL 自动终止该会话并要求重新登录
5. THE Blog_System SHALL 使用加密方式存储密码，禁止明文存储

### 需求 6：服务器部署

**用户故事：** 作为博客作者，我希望博客能稳定运行在我的云服务器上，以便访客随时访问。

#### 验收标准

1. THE Blog_System SHALL 部署在 Server 上，通过 HTTP/HTTPS 协议对外提供服务
2. THE Blog_System SHALL 使用 Nginx 作为反向代理服务器
3. WHEN Server 重启后，THE Blog_System SHALL 自动启动所有必要的服务
4. THE Blog_System SHALL 将应用日志写入指定的日志文件，便于问题排查

### 需求 7：SEO 与访问优化

**用户故事：** 作为博客作者，我希望博客对搜索引擎友好，以便更多人能发现我的文章。

#### 验收标准

1. THE Frontend SHALL 为每篇文章生成语义化的 URL（如 /posts/article-slug）
2. THE Frontend SHALL 为每个页面生成合适的 HTML title 和 meta description 标签
3. THE Blog_System SHALL 自动生成 sitemap.xml 文件，包含所有已发布文章的 URL
4. THE Frontend SHALL 为文章页面提供 Open Graph 元标签，支持社交媒体分享预览
