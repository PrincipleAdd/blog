const express = require('express');
const cors = require('cors');
const path = require('path');

// 导入路由模块
const authRoutes = require('./routes/auth');
const articleRoutes = require('./routes/articles');
const adminArticleRoutes = require('./routes/adminArticles');
const categoryRoutes = require('./routes/categories');
const adminCategoryRoutes = require('./routes/adminCategories');
const tagRoutes = require('./routes/tags');
const adminTagRoutes = require('./routes/adminTags');
const sitemapRoutes = require('./routes/sitemap');

// 导入数据库模块
const { knex } = require('./models/db');

const app = express();
const PORT = process.env.PORT || 3000;

// ========== 基础中间件 ==========

// 解析 JSON 请求体
app.use(express.json());

// 解析 URL 编码的请求体
app.use(express.urlencoded({ extended: true }));

// 跨域资源共享配置
app.use(cors());

// ========== 健康检查 ==========

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ========== 注册路由 ==========

// 认证路由
app.use('/api/auth', authRoutes);

// 文章公开路由
app.use('/api/articles', articleRoutes);

// 文章管理路由（需认证）
app.use('/api/admin/articles', adminArticleRoutes);

// 分类公开路由
app.use('/api/categories', categoryRoutes);

// 分类管理路由（需认证）
app.use('/api/admin/categories', adminCategoryRoutes);

// 标签公开路由
app.use('/api/tags', tagRoutes);

// 标签管理路由（需认证）
app.use('/api/admin/tags', adminTagRoutes);

// Sitemap 路由
app.use('/', sitemapRoutes);

// ========== 404 处理 ==========

app.use((req, res) => {
  res.status(404).json({ error: '接口不存在' });
});

// ========== 全局错误处理 ==========

app.use((err, req, res, next) => {
  console.error('服务器错误:', err);
  res.status(500).json({ error: '服务器内部错误' });
});

// ========== 启动数据库迁移并启动服务器 ==========

knex.migrate.latest()
  .then(() => {
    console.log('数据库迁移完成');
    app.listen(PORT, () => {
      console.log(`博客后端服务已启动，端口: ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('数据库迁移失败:', err);
    process.exit(1);
  });

module.exports = app;
