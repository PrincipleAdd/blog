const express = require('express');
const router = express.Router();
const categoryService = require('../services/categoryService');
const articleService = require('../services/articleService');

/**
 * GET /api/categories
 * 获取所有分类列表
 */
router.get('/', (req, res) => {
  try {
    const categories = categoryService.listCategories();
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: '获取分类列表失败' });
  }
});

/**
 * GET /api/categories/:slug
 * 获取指定分类下的已发布文章列表，支持分页
 */
router.get('/:slug', (req, res) => {
  try {
    const { slug } = req.params;
    const page = parseInt(req.query.page, 10) || 1;
    const pageSize = parseInt(req.query.pageSize, 10) || 10;

    const result = articleService.listByCategory(slug, page, pageSize);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: '获取分类文章失败' });
  }
});

module.exports = router;
