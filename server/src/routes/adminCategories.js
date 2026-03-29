const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const categoryService = require('../services/categoryService');

// 所有管理路由都需要认证
router.use(authMiddleware);

/**
 * POST /api/admin/categories
 * 创建新分类
 */
router.post('/', (req, res) => {
  try {
    const { name } = req.body;
    const category = categoryService.createCategory(name);
    res.status(201).json(category);
  } catch (err) {
    res.status(500).json({ error: '创建分类失败' });
  }
});

/**
 * DELETE /api/admin/categories/:id
 * 删除指定分类
 */
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    categoryService.deleteCategory(Number(id));
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: '删除分类失败' });
  }
});

module.exports = router;
