const jwt = require('jsonwebtoken');
const authMiddleware = require('../src/middleware/auth');

const JWT_SECRET = process.env.JWT_SECRET || 'blog-secret-key';

// 辅助函数：创建模拟的 req, res, next
function createMocks(authHeader) {
  const req = {
    headers: {}
  };
  if (authHeader !== undefined) {
    req.headers.authorization = authHeader;
  }

  const res = {
    statusCode: null,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      this.body = data;
      return this;
    }
  };

  const next = jest.fn();

  return { req, res, next };
}

// 辅助函数：生成有效的 JWT token
function generateToken(payload, options = {}) {
  return jwt.sign(payload, JWT_SECRET, options);
}

describe('JWT 认证中间件', () => {
  test('缺少 Authorization 头时返回 401', () => {
    const { req, res, next } = createMocks();

    authMiddleware(req, res, next);

    expect(res.statusCode).toBe(401);
    expect(res.body).toEqual({ error: '未提供认证令牌' });
    expect(next).not.toHaveBeenCalled();
  });

  test('Authorization 格式不正确时返回 401', () => {
    const { req, res, next } = createMocks('InvalidFormat token123');

    authMiddleware(req, res, next);

    expect(res.statusCode).toBe(401);
    expect(res.body).toEqual({ error: '认证令牌格式错误' });
    expect(next).not.toHaveBeenCalled();
  });

  test('仅有 Bearer 无 token 时返回 401', () => {
    const { req, res, next } = createMocks('Bearer');

    authMiddleware(req, res, next);

    expect(res.statusCode).toBe(401);
    expect(res.body).toEqual({ error: '认证令牌格式错误' });
    expect(next).not.toHaveBeenCalled();
  });

  test('无效的 token 返回 401', () => {
    const { req, res, next } = createMocks('Bearer invalid.token.here');

    authMiddleware(req, res, next);

    expect(res.statusCode).toBe(401);
    expect(res.body).toEqual({ error: '无效的认证令牌' });
    expect(next).not.toHaveBeenCalled();
  });

  test('过期的 token 返回 401 并提示已过期', () => {
    // 生成一个已过期的 token
    const token = generateToken(
      { userId: 1, username: 'admin' },
      { expiresIn: '-1s' }
    );
    const { req, res, next } = createMocks(`Bearer ${token}`);

    authMiddleware(req, res, next);

    expect(res.statusCode).toBe(401);
    expect(res.body).toEqual({ error: '认证令牌已过期' });
    expect(next).not.toHaveBeenCalled();
  });

  test('有效的 token 将用户信息挂载到 req.user 并调用 next', () => {
    const payload = { userId: 1, username: 'admin' };
    const token = generateToken(payload, { expiresIn: '24h' });
    const { req, res, next } = createMocks(`Bearer ${token}`);

    authMiddleware(req, res, next);

    expect(req.user).toEqual({ userId: 1, username: 'admin' });
    expect(next).toHaveBeenCalledTimes(1);
    expect(res.statusCode).toBeNull();
  });
});
