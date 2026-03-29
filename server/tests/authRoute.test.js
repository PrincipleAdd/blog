const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'blog-secret-key';

// 模拟 authService
jest.mock('../src/services/authService', () => ({
  login: jest.fn(),
  verifyToken: jest.fn(),
  hashPassword: jest.fn()
}));

const authService = require('../src/services/authService');
const authRouter = require('../src/routes/auth');

// 辅助函数：创建模拟的 Express req/res 对象
function createMockReqRes(options = {}) {
  const req = {
    body: options.body || {},
    headers: options.headers || {},
    user: options.user || undefined
  };

  const res = {
    statusCode: 200,
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

  return { req, res };
}

// 辅助函数：查找路由处理器
function findRouteHandler(router, method, path) {
  const layer = router.stack.find(
    (l) => l.route && l.route.path === path && l.route.methods[method]
  );
  if (!layer) return null;
  // 返回路由层的所有处理器
  return layer.route.stack.map((s) => s.handle);
}

describe('认证路由 - /api/auth', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /login', () => {
    test('登录成功应返回 token 和 expiresIn', () => {
      const mockResult = { token: 'mock-jwt-token', expiresIn: 86400 };
      authService.login.mockReturnValue(mockResult);

      const { req, res } = createMockReqRes({
        body: { username: 'admin', password: 'admin123' }
      });

      const handlers = findRouteHandler(authRouter, 'post', '/login');
      // POST /login 只有一个处理器
      handlers[0](req, res);

      expect(authService.login).toHaveBeenCalledWith('admin', 'admin123');
      expect(res.body).toEqual({ token: 'mock-jwt-token', expiresIn: 86400 });
    });

    test('登录失败应返回 401 和错误信息', () => {
      authService.login.mockImplementation(() => {
        throw new Error('用户名或密码错误');
      });

      const { req, res } = createMockReqRes({
        body: { username: 'admin', password: 'wrong' }
      });

      const handlers = findRouteHandler(authRouter, 'post', '/login');
      handlers[0](req, res);

      expect(res.statusCode).toBe(401);
      expect(res.body).toEqual({ error: '用户名或密码错误' });
    });
  });

  describe('GET /profile', () => {
    test('已认证用户应返回用户信息', () => {
      const { req, res } = createMockReqRes({
        user: { userId: 1, username: 'admin' }
      });
      // 模拟 authMiddleware 已执行，user 已挂载到 req
      req.user = { userId: 1, username: 'admin' };

      const handlers = findRouteHandler(authRouter, 'get', '/profile');
      // 最后一个处理器是实际的路由逻辑（第一个是 authMiddleware）
      const routeHandler = handlers[handlers.length - 1];
      routeHandler(req, res);

      expect(res.body).toEqual({ userId: 1, username: 'admin' });
    });
  });

  describe('路由结构验证', () => {
    test('应包含 POST /login 路由', () => {
      const handlers = findRouteHandler(authRouter, 'post', '/login');
      expect(handlers).not.toBeNull();
    });

    test('应包含 GET /profile 路由', () => {
      const handlers = findRouteHandler(authRouter, 'get', '/profile');
      expect(handlers).not.toBeNull();
    });

    test('GET /profile 应使用认证中间件', () => {
      const handlers = findRouteHandler(authRouter, 'get', '/profile');
      // 应有两个处理器：authMiddleware + 路由处理器
      expect(handlers.length).toBe(2);
    });
  });
});
