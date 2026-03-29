const jwt = require('jsonwebtoken');

// JWT 密钥，优先从环境变量读取，否则使用默认值
const JWT_SECRET = process.env.JWT_SECRET || 'blog-secret-key';

/**
 * JWT 认证中间件
 * 从请求头 Authorization: Bearer <token> 中提取并验证 JWT
 * 验证成功后将用户信息挂载到 req.user
 * 验证失败返回 401 状态码
 */
const authMiddleware = (req, res, next) => {
  // 获取 Authorization 请求头
  const authHeader = req.headers.authorization;

  // 检查是否存在 Authorization 头
  if (!authHeader) {
    return res.status(401).json({ error: '未提供认证令牌' });
  }

  // 检查格式是否为 Bearer <token>
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({ error: '认证令牌格式错误' });
  }

  const token = parts[1];

  try {
    // 验证并解码 JWT
    const decoded = jwt.verify(token, JWT_SECRET);

    // 将用户信息挂载到 req.user
    req.user = {
      userId: decoded.userId,
      username: decoded.username
    };

    next();
  } catch (err) {
    // 区分 token 过期和其他验证错误
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: '认证令牌已过期' });
    }
    return res.status(401).json({ error: '无效的认证令牌' });
  }
};

module.exports = authMiddleware;
