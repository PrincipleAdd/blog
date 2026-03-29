const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const tagService = require('../services/tagService');

// 所有管理路由都需要认证
router.use(authMiddleware);

/**
 * POST /api/admin/tags
 * 创建新标签
 */
router.post('/', (req, res) => {
  try {
    const { name } = req.body;
    const tag = tagService.createTag(name);
    res.status(201).json(tag);
  } catch (err) {
    res.status(500).json({ error: '创建标签失败' });
  }
});

/**
 * DELETE /api/admin/tags/:id
 * 删除指定标签
 */
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    tagService.deleteTag(Number(id));
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: '删除标签失败' });
  }
});

module.exports = router;
