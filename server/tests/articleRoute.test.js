// 模拟 articleService
jest.mock('../src/services/articleService', () => ({
  listPublishedArticles: jest.fn(),
  getArticleBySlug: jest.fn()
}));

const articleService = require('../src/services/articleService');
const articleRouter = require('../src/routes/articles');

// 辅助函数：创建模拟的 Express req/res 对象
function createMockReqRes(options = {}) {
  const req = {
    query: options.query || {},
    params: options.params || {},
    body: options.body || {},
    headers: options.headers || {}
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
  return layer.route.stack.map((s) => s.handle);
}

describe('文章公开路由 - /api/articles', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /', () => {
    test('使用默认分页参数获取已发布文章列表', () => {
      const mockResult = { articles: [{ id: 1, title: '测试文章' }], total: 1 };
      articleService.listPublishedArticles.mockReturnValue(mockResult);

      const { req, res } = createMockReqRes();
      const handlers = findRouteHandler(articleRouter, 'get', '/');
      handlers[0](req, res);

      expect(articleService.listPublishedArticles).toHaveBeenCalledWith(1, 10);
      expect(res.body).toEqual(mockResult);
    });

    test('使用自定义分页参数获取文章列表', () => {
      const mockResult = { articles: [], total: 0 };
      articleService.listPublishedArticles.mockReturnValue(mockResult);

      const { req, res } = createMockReqRes({ query: { page: '2', pageSize: '5' } });
      const handlers = findRouteHandler(articleRouter, 'get', '/');
      handlers[0](req, res);

      expect(articleService.listPublishedArticles).toHaveBeenCalledWith(2, 5);
      expect(res.body).toEqual(mockResult);
    });

    test('服务层抛出异常时返回 500', () => {
      articleService.listPublishedArticles.mockImplementation(() => {
        throw new Error('数据库错误');
      });

      const { req, res } = createMockReqRes();
      const handlers = findRouteHandler(articleRouter, 'get', '/');
      handlers[0](req, res);

      expect(res.statusCode).toBe(500);
      expect(res.body).toEqual({ error: '获取文章列表失败' });
    });
  });

  describe('GET /:slug', () => {
    test('获取已发布文章详情', () => {
      const mockArticle = { id: 1, title: '测试', slug: 'ce-shi', status: 'published' };
      articleService.getArticleBySlug.mockReturnValue(mockArticle);

      const { req, res } = createMockReqRes({ params: { slug: 'ce-shi' } });
      const handlers = findRouteHandler(articleRouter, 'get', '/:slug');
      handlers[0](req, res);

      expect(articleService.getArticleBySlug).toHaveBeenCalledWith('ce-shi');
      expect(res.body).toEqual(mockArticle);
    });

    test('文章不存在时返回 404', () => {
      articleService.getArticleBySlug.mockReturnValue(null);

      const { req, res } = createMockReqRes({ params: { slug: 'not-exist' } });
      const handlers = findRouteHandler(articleRouter, 'get', '/:slug');
      handlers[0](req, res);

      expect(res.statusCode).toBe(404);
      expect(res.body).toEqual({ error: '文章不存在' });
    });

    test('草稿文章返回 404', () => {
      const mockArticle = { id: 1, title: '草稿', slug: 'cao-gao', status: 'draft' };
      articleService.getArticleBySlug.mockReturnValue(mockArticle);

      const { req, res } = createMockReqRes({ params: { slug: 'cao-gao' } });
      const handlers = findRouteHandler(articleRouter, 'get', '/:slug');
      handlers[0](req, res);

      expect(res.statusCode).toBe(404);
      expect(res.body).toEqual({ error: '文章不存在' });
    });

    test('服务层抛出异常时返回 500', () => {
      articleService.getArticleBySlug.mockImplementation(() => {
        throw new Error('数据库错误');
      });

      const { req, res } = createMockReqRes({ params: { slug: 'error' } });
      const handlers = findRouteHandler(articleRouter, 'get', '/:slug');
      handlers[0](req, res);

      expect(res.statusCode).toBe(500);
      expect(res.body).toEqual({ error: '获取文章详情失败' });
    });
  });

  describe('路由结构验证', () => {
    test('应包含 GET / 路由', () => {
      const handlers = findRouteHandler(articleRouter, 'get', '/');
      expect(handlers).not.toBeNull();
    });

    test('应包含 GET /:slug 路由', () => {
      const handlers = findRouteHandler(articleRouter, 'get', '/:slug');
      expect(handlers).not.toBeNull();
    });
  });
});
