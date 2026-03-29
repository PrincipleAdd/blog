const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const articleService = require('../services/articleService');

// 所有管理路由都需要认证
router.use(authMiddleware);

/**
 * GET /api/admin/articles
 * 获取所有文章列表（含草稿），支持分页
 */
router.get('/', (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const pageSize = parseInt(req.query.pageSize, 10) || 10;

    const result = articleService.listAllArticles(page, pageSize);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: '获取文章列表失败' });
  }
});

/**
 * POST /api/admin/articles
 * 创建新文章
 */
router.post('/', (req, res) => {
  try {
    const { title, content, categoryId, tagIds, status } = req.body;
    const article = articleService.createArticle({ title, content, categoryId, tagIds, status });
    res.status(201).json(article);
  } catch (err) {
    res.status(500).json({ error: '创建文章失败' });
  }
});

/**
 * PUT /api/admin/articles/:id
 * 更新指定文章
 */
router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, categoryId, tagIds, status } = req.body;
    const article = articleService.updateArticle(Number(id), { title, content, categoryId, tagIds, status });
    res.json(article);
  } catch (err) {
    res.status(500).json({ error: '更新文章失败' });
  }
});

/**
 * DELETE /api/admin/articles/:id
 * 删除指定文章
 */
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    articleService.deleteArticle(Number(id));
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: '删除文章失败' });
  }
});

module.exports = router;
