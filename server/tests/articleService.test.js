const Database = require('better-sqlite3');

// 创建内存数据库用于测试
const mockDb = new Database(':memory:');
mockDb.pragma('journal_mode = WAL');
mockDb.pragma('foreign_keys = ON');

// 在 require 模块之前，先 mock db 模块，使用内存数据库
jest.mock('../src/models/db', () => ({
  db: mockDb,
}));

// mock slug 模块，返回可预测的 slug
jest.mock('../src/utils/slug', () => ({
  generateUniqueSlug: jest.fn((title) => `slug-${title.toLowerCase().replace(/\s+/g, '-')}`),
}));

const { generateUniqueSlug } = require('../src/utils/slug');
const {
  createArticle,
  deleteArticle,
  listPublishedArticles,
  listAllArticles,
} = require('../src/services/articleService');

/**
 * 初始化测试所需的数据库表
 */
function setupTables() {
  // 创建分类表
  mockDb.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      slug TEXT NOT NULL UNIQUE,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

  // 创建标签表
  mockDb.exec(`
    CREATE TABLE IF NOT EXISTS tags (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      slug TEXT NOT NULL UNIQUE,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

  // 创建文章表
  mockDb.exec(`
    CREATE TABLE IF NOT EXISTS articles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      content_md TEXT NOT NULL,
      content_html TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'draft',
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL
    )
  `);

  // 创建文章-标签关联表
  mockDb.exec(`
    CREATE TABLE IF NOT EXISTS article_tags (
      article_id INTEGER NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
      tag_id INTEGER NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
      PRIMARY KEY (article_id, tag_id)
    )
  `);
}

/**
 * 清空所有表数据
 */
function cleanTables() {
  mockDb.exec('DELETE FROM article_tags');
  mockDb.exec('DELETE FROM articles');
  mockDb.exec('DELETE FROM tags');
  mockDb.exec('DELETE FROM categories');
}

describe('文章服务 - articleService', () => {
  // 首次运行时创建表
  beforeAll(() => {
    setupTables();
  });

  // 每次测试前清空数据并重置 mock
  beforeEach(() => {
    cleanTables();
    jest.clearAllMocks();
    // 重新设置 slug mock，每次调用返回不同的 slug
    let slugCounter = 0;
    generateUniqueSlug.mockImplementation((title) => {
      slugCounter++;
      return `slug-${slugCounter}`;
    });
  });

  // ============================================================
  // 测试创建文章时 Markdown 正确转换为 HTML（需求 1.1, 1.4）
  // ============================================================
  describe('createArticle() - Markdown 转 HTML', () => {
    test('应将 Markdown 标题转换为 HTML h1 标签', () => {
      const article = createArticle({
        title: '测试文章',
        content: '# Hello',
        categoryId: null,
        tagIds: [],
        status: 'draft',
      });

      // 验证 content_html 包含 <h1> 标签
      expect(article.content_html).toContain('<h1>');
      expect(article.content_html).toContain('Hello');
      expect(article.content_html).toContain('</h1>');
    });

    test('应将 Markdown 段落和加粗语法正确转换', () => {
      const article = createArticle({
        title: '格式测试',
        content: '这是一段**加粗**文字',
        categoryId: null,
        tagIds: [],
        status: 'draft',
      });

      // 验证加粗语法被转换为 <strong> 标签
      expect(article.content_html).toContain('<strong>加粗</strong>');
    });
  });

  // ============================================================
  // 测试草稿文章不出现在已发布列表中（需求 1.5, 1.6）
  // ============================================================
  describe('listPublishedArticles() - 草稿过滤', () => {
    test('草稿文章不应出现在已发布文章列表中', () => {
      // 创建一篇草稿文章
      createArticle({
        title: '草稿文章',
        content: '草稿内容',
        categoryId: null,
        tagIds: [],
        status: 'draft',
      });

      // 创建一篇已发布文章
      createArticle({
        title: '已发布文章',
        content: '已发布内容',
        categoryId: null,
        tagIds: [],
        status: 'published',
      });

      const result = listPublishedArticles(1, 10);

      // 只应返回已发布的文章
      expect(result.total).toBe(1);
      expect(result.articles).toHaveLength(1);
      expect(result.articles[0].title).toBe('已发布文章');
      expect(result.articles[0].status).toBe('published');
    });
  });

  // ============================================================
  // 测试删除文章同时清除标签关联（需求 1.3）
  // ============================================================
  describe('deleteArticle() - 级联删除标签关联', () => {
    test('删除文章后应同时清除 article_tags 关联记录', () => {
      // 先插入标签
      mockDb.prepare('INSERT INTO tags (name, slug) VALUES (?, ?)').run('JavaScript', 'javascript');
      mockDb.prepare('INSERT INTO tags (name, slug) VALUES (?, ?)').run('Vue', 'vue');
      const tag1 = mockDb.prepare('SELECT id FROM tags WHERE name = ?').get('JavaScript');
      const tag2 = mockDb.prepare('SELECT id FROM tags WHERE name = ?').get('Vue');

      // 创建带标签的文章
      const article = createArticle({
        title: '带标签文章',
        content: '内容',
        categoryId: null,
        tagIds: [tag1.id, tag2.id],
        status: 'published',
      });

      // 验证关联记录已创建
      const tagsBefore = mockDb
        .prepare('SELECT * FROM article_tags WHERE article_id = ?')
        .all(article.id);
      expect(tagsBefore).toHaveLength(2);

      // 删除文章
      deleteArticle(article.id);

      // 验证文章已删除
      const deletedArticle = mockDb
        .prepare('SELECT * FROM articles WHERE id = ?')
        .get(article.id);
      expect(deletedArticle).toBeUndefined();

      // 验证 article_tags 关联记录也被清除（ON DELETE CASCADE）
      const tagsAfter = mockDb
        .prepare('SELECT * FROM article_tags WHERE article_id = ?')
        .all(article.id);
      expect(tagsAfter).toHaveLength(0);
    });
  });

  // ============================================================
  // 测试分页逻辑返回正确的 total 和 articles（需求 1.6）
  // ============================================================
  describe('分页逻辑', () => {
    test('listPublishedArticles 应返回正确的 total 和分页数据', () => {
      // 创建 5 篇已发布文章
      for (let i = 1; i <= 5; i++) {
        createArticle({
          title: `文章${i}`,
          content: `内容${i}`,
          categoryId: null,
          tagIds: [],
          status: 'published',
        });
      }

      // 第一页，每页 2 篇
      const page1 = listPublishedArticles(1, 2);
      expect(page1.total).toBe(5);
      expect(page1.articles).toHaveLength(2);

      // 第二页
      const page2 = listPublishedArticles(2, 2);
      expect(page2.total).toBe(5);
      expect(page2.articles).toHaveLength(2);

      // 第三页（最后一页，只剩 1 篇）
      const page3 = listPublishedArticles(3, 2);
      expect(page3.total).toBe(5);
      expect(page3.articles).toHaveLength(1);
    });

    test('listAllArticles 应包含草稿和已发布文章的总数', () => {
      // 创建 3 篇草稿 + 2 篇已发布
      for (let i = 1; i <= 3; i++) {
        createArticle({
          title: `草稿${i}`,
          content: `草稿内容${i}`,
          categoryId: null,
          tagIds: [],
          status: 'draft',
        });
      }
      for (let i = 1; i <= 2; i++) {
        createArticle({
          title: `已发布${i}`,
          content: `已发布内容${i}`,
          categoryId: null,
          tagIds: [],
          status: 'published',
        });
      }

      // 获取所有文章，每页 3 篇
      const page1 = listAllArticles(1, 3);
      expect(page1.total).toBe(5);
      expect(page1.articles).toHaveLength(3);

      const page2 = listAllArticles(2, 3);
      expect(page2.total).toBe(5);
      expect(page2.articles).toHaveLength(2);
    });
  });
});
