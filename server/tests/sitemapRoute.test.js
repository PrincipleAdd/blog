// 模拟 db 模块
jest.mock('../src/models/db', () => {
  const prepareMock = jest.fn();
  return {
    db: {
      prepare: prepareMock
    }
  };
});

const { db } = require('../src/models/db');
const sitemapRouter = require('../src/routes/sitemap');

// 辅助函数：创建模拟的 Express req/res 对象
function createMockReqRes() {
  const req = {};
  const res = {
    statusCode: 200,
    headers: {},
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      this.body = data;
      return this;
    },
    set(key, value) {
      this.headers[key] = value;
      return this;
    },
    send(data) {
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

describe('Sitemap 路由 - /sitemap.xml', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /sitemap.xml', () => {
    test('生成包含已发布文章的 XML sitemap', () => {
      const mockArticles = [
        { slug: 'hello-world', updated_at: '2025-01-15 10:00:00' },
        { slug: 'second-post', updated_at: '2025-01-10 08:30:00' }
      ];
      db.prepare.mockReturnValue({ all: () => mockArticles });

      const { req, res } = createMockReqRes();
      const handlers = findRouteHandler(sitemapRouter, 'get', '/sitemap.xml');
      handlers[0](req, res);

      // 验证 Content-Type 为 XML
      expect(res.headers['Content-Type']).toBe('application/xml');

      // 验证 XML 声明
      expect(res.body).toContain('<?xml version="1.0" encoding="UTF-8"?>');

      // 验证 urlset 命名空间
      expect(res.body).toContain('xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"');

      // 验证文章 URL
      expect(res.body).toContain('<loc>https://159.75.26.219/posts/hello-world</loc>');
      expect(res.body).toContain('<loc>https://159.75.26.219/posts/second-post</loc>');

      // 验证 lastmod
      expect(res.body).toContain('<lastmod>2025-01-15 10:00:00</lastmod>');
      expect(res.body).toContain('<lastmod>2025-01-10 08:30:00</lastmod>');
    });

    test('没有已发布文章时返回空 sitemap', () => {
      db.prepare.mockReturnValue({ all: () => [] });

      const { req, res } = createMockReqRes();
      const handlers = findRouteHandler(sitemapRouter, 'get', '/sitemap.xml');
      handlers[0](req, res);

      expect(res.headers['Content-Type']).toBe('application/xml');
      expect(res.body).toContain('<?xml version="1.0" encoding="UTF-8"?>');
      expect(res.body).toContain('<urlset');
      expect(res.body).toContain('</urlset>');
      // 不应包含任何 <url> 标签
      expect(res.body).not.toContain('<url>');
    });

    test('数据库异常时返回 500', () => {
      db.prepare.mockImplementation(() => {
        throw new Error('数据库错误');
      });

      const { req, res } = createMockReqRes();
      const handlers = findRouteHandler(sitemapRouter, 'get', '/sitemap.xml');
      handlers[0](req, res);

      expect(res.statusCode).toBe(500);
      expect(res.body).toEqual({ error: '生成 sitemap 失败' });
    });
  });

  describe('路由结构验证', () => {
    test('应包含 GET /sitemap.xml 路由', () => {
      const handlers = findRouteHandler(sitemapRouter, 'get', '/sitemap.xml');
      expect(handlers).not.toBeNull();
    });
  });
});
