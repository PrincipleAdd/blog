const express = require('express');
const router = express.Router();
const articleService = require('../services/articleService');

/**
 * GET /api/articles
 * 分页获取已发布文章列表，支持 page 和 pageSize 查询参数
 */
router.get('/', (req, res) => {
  try {
    // 从查询参数中提取分页信息，设置默认值
    const page = parseInt(req.query.page, 10) || 1;
    const pageSize = parseInt(req.query.pageSize, 10) || 10;

    const result = articleService.listPublishedArticles(page, pageSize);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: '获取文章列表失败' });
  }
});

/**
 * GET /api/articles/:slug
 * 获取文章详情（仅已发布文章）
 */
router.get('/:slug', (req, res) => {
  try {
    const { slug } = req.params;
    const article = articleService.getArticleBySlug(slug);

    // 文章不存在或状态为草稿时返回 404
    if (!article || article.status === 'draft') {
      return res.status(404).json({ error: '文章不存在' });
    }

    res.json(article);
  } catch (err) {
    res.status(500).json({ error: '获取文章详情失败' });
  }
});

module.exports = router;
