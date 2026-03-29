// 模拟 articleService
jest.mock('../src/services/articleService', () => ({
  listAllArticles: jest.fn(),
  createArticle: jest.fn(),
  updateArticle: jest.fn(),
  deleteArticle: jest.fn()
}));

// 模拟 auth 中间件，直接放行
jest.mock('../src/middleware/auth', () => (req, res, next) => {
  req.user = { userId: 1, username: 'admin' };
  next();
});

const articleService = require('../src/services/articleService');
const adminArticleRouter = require('../src/routes/adminArticles');

// 辅助函数：创建模拟的 Express req/res 对象
function createMockReqRes(options = {}) {
  const req = {
    query: options.query || {},
    params: options.params || {},
    body: options.body || {},
    headers: options.headers || {},
    user: { userId: 1, username: 'admin' }
  };

  const res = {
    statusCode: 200,
    body: null,
    _ended: false,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      this.body = data;
      return this;
    },
    send() {
      this._ended = true;
      return this;
    }
  };

  return { req, res };
}

// 辅助函数：查找路由处理器（跳过 authMiddleware，取最后一个 handler）
function findRouteHandler(router, method, path) {
  const layer = router.stack.find(
    (l) => l.route && l.route.path === path && l.route.methods[method]
  );
  if (!layer) return null;
  return layer.route.stack.map((s) => s.handle);
}

describe('文章管理路由 - /api/admin/articles', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /', () => {
    test('使用默认分页参数获取所有文章列表', () => {
      const mockResult = {
        articles: [{ id: 1, title: '测试文章', status: 'draft' }],
        total: 1
      };
      articleService.listAllArticles.mockReturnValue(mockResult);

      const { req, res } = createMockReqRes();
      const handlers = findRouteHandler(adminArticleRouter, 'get', '/');
      // 执行最后一个 handler（路由处理器）
      handlers[handlers.length - 1](req, res);

      expect(articleService.listAllArticles).toHaveBeenCalledWith(1, 10);
      expect(res.body).toEqual(mockResult);
    });

    test('使用自定义分页参数获取文章列表', () => {
      const mockResult = { articles: [], total: 0 };
      articleService.listAllArticles.mockReturnValue(mockResult);

      const { req, res } = createMockReqRes({ query: { page: '3', pageSize: '5' } });
      const handlers = findRouteHandler(adminArticleRouter, 'get', '/');
      handlers[handlers.length - 1](req, res);

      expect(articleService.listAllArticles).toHaveBeenCalledWith(3, 5);
    });

    test('服务层抛出异常时返回 500', () => {
      articleService.listAllArticles.mockImplementation(() => {
        throw new Error('数据库错误');
      });

      const { req, res } = createMockReqRes();
      const handlers = findRouteHandler(adminArticleRouter, 'get', '/');
      handlers[handlers.length - 1](req, res);

      expect(res.statusCode).toBe(500);
      expect(res.body).toEqual({ error: '获取文章列表失败' });
    });
  });

  describe('POST /', () => {
    test('成功创建文章返回 201', () => {
      const mockArticle = { id: 1, title: '新文章', slug: 'xin-wen-zhang', status: 'published' };
      articleService.createArticle.mockReturnValue(mockArticle);

      const body = {
        title: '新文章',
        content: '# 内容',
        categoryId: 1,
        tagIds: [1, 2],
        status: 'published'
      };
      const { req, res } = createMockReqRes({ body });
      const handlers = findRouteHandler(adminArticleRouter, 'post', '/');
      handlers[handlers.length - 1](req, res);

      expect(articleService.createArticle).toHaveBeenCalledWith({
        title: '新文章',
        content: '# 内容',
        categoryId: 1,
        tagIds: [1, 2],
        status: 'published'
      });
      expect(res.statusCode).toBe(201);
      expect(res.body).toEqual(mockArticle);
    });

    test('服务层抛出异常时返回 500', () => {
      articleService.createArticle.mockImplementation(() => {
        throw new Error('创建失败');
      });

      const { req, res } = createMockReqRes({ body: { title: '测试' } });
      const handlers = findRouteHandler(adminArticleRouter, 'post', '/');
      handlers[handlers.length - 1](req, res);

      expect(res.statusCode).toBe(500);
      expect(res.body).toEqual({ error: '创建文章失败' });
    });
  });

  describe('PUT /:id', () => {
    test('成功更新文章', () => {
      const mockArticle = { id: 1, title: '更新后标题', status: 'published' };
      articleService.updateArticle.mockReturnValue(mockArticle);

      const body = {
        title: '更新后标题',
        content: '# 更新内容',
        categoryId: 2,
        tagIds: [3],
        status: 'published'
      };
      const { req, res } = createMockReqRes({ params: { id: '1' }, body });
      const handlers = findRouteHandler(adminArticleRouter, 'put', '/:id');
      handlers[handlers.length - 1](req, res);

      expect(articleService.updateArticle).toHaveBeenCalledWith(1, {
        title: '更新后标题',
        content: '# 更新内容',
        categoryId: 2,
        tagIds: [3],
        status: 'published'
      });
      expect(res.body).toEqual(mockArticle);
    });

    test('服务层抛出异常时返回 500', () => {
      articleService.updateArticle.mockImplementation(() => {
        throw new Error('更新失败');
      });

      const { req, res } = createMockReqRes({ params: { id: '1' }, body: { title: '测试' } });
      const handlers = findRouteHandler(adminArticleRouter, 'put', '/:id');
      handlers[handlers.length - 1](req, res);

      expect(res.statusCode).toBe(500);
      expect(res.body).toEqual({ error: '更新文章失败' });
    });
  });

  describe('DELETE /:id', () => {
    test('成功删除文章返回 204', () => {
      articleService.deleteArticle.mockReturnValue(undefined);

      const { req, res } = createMockReqRes({ params: { id: '1' } });
      const handlers = findRouteHandler(adminArticleRouter, 'delete', '/:id');
      handlers[handlers.length - 1](req, res);

      expect(articleService.deleteArticle).toHaveBeenCalledWith(1);
      expect(res.statusCode).toBe(204);
    });

    test('服务层抛出异常时返回 500', () => {
      articleService.deleteArticle.mockImplementation(() => {
        throw new Error('删除失败');
      });

      const { req, res } = createMockReqRes({ params: { id: '1' } });
      const handlers = findRouteHandler(adminArticleRouter, 'delete', '/:id');
      handlers[handlers.length - 1](req, res);

      expect(res.statusCode).toBe(500);
      expect(res.body).toEqual({ error: '删除文章失败' });
    });
  });

  describe('路由结构验证', () => {
    test('应包含 GET / 路由', () => {
      const handlers = findRouteHandler(adminArticleRouter, 'get', '/');
      expect(handlers).not.toBeNull();
    });

    test('应包含 POST / 路由', () => {
      const handlers = findRouteHandler(adminArticleRouter, 'post', '/');
      expect(handlers).not.toBeNull();
    });

    test('应包含 PUT /:id 路由', () => {
      const handlers = findRouteHandler(adminArticleRouter, 'put', '/:id');
      expect(handlers).not.toBeNull();
    });

    test('应包含 DELETE /:id 路由', () => {
      const handlers = findRouteHandler(adminArticleRouter, 'delete', '/:id');
      expect(handlers).not.toBeNull();
    });
  });
});
