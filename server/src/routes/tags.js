const express = require('express');
const router = express.Router();
const tagService = require('../services/tagService');
const articleService = require('../services/articleService');

/**
 * GET /api/tags
 * 获取所有标签列表（含文章数）
 */
router.get('/', (req, res) => {
  try {
    const tags = tagService.listTags();
    res.json(tags);
  } catch (err) {
    res.status(500).json({ error: '获取标签列表失败' });
  }
});

/**
 * GET /api/tags/:slug
 * 获取指定标签下的已发布文章列表，支持分页
 */
router.get('/:slug', (req, res) => {
  try {
    const { slug } = req.params;
    const page = parseInt(req.query.page, 10) || 1;
    const pageSize = parseInt(req.query.pageSize, 10) || 10;

    const result = articleService.listByTag(slug, page, pageSize);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: '获取标签文章失败' });
  }
});

module.exports = router;
