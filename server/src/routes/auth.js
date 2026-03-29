const express = require('express');
const router = express.Router();
const authService = require('../services/authService');
const authMiddleware = require('../middleware/auth');

/**
 * POST /api/auth/login
 * 用户登录，验证凭据后返回 JWT token
 */
router.post('/login', (req, res) => {
  try {
    const { username, password } = req.body;
    const result = authService.login(username, password);
    res.json({ token: result.token, expiresIn: result.expiresIn });
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
});

/**
 * GET /api/auth/profile
 * 获取当前认证用户信息，需要 JWT 认证
 */
router.get('/profile', authMiddleware, (req, res) => {
  res.json(req.user);
});

module.exports = router;
