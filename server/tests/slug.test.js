const Database = require('better-sqlite3');

// 创建内存数据库用于测试（变量名必须以 mock 开头，jest 要求）
const mockDb = new Database(':memory:');
mockDb.pragma('journal_mode = WAL');
mockDb.pragma('foreign_keys = ON');

// 在 require slug 模块之前，先 mock db 模块
jest.mock('../src/models/db', () => ({
  db: mockDb,
}));

const { generateSlug, generateUniqueSlug } = require('../src/utils/slug');

// ============================================================
// generateSlug 单元测试
// ============================================================
describe('generateSlug', () => {
  // 测试中文标题转拼音 slug
  test('中文标题应转换为拼音 slug', () => {
    const slug = generateSlug('你好世界');
    expect(slug).toBe('ni-hao-shi-jie');
  });

  // 测试英文标题转 slug
  test('英文标题应转换为小写连字符格式', () => {
    expect(generateSlug('Hello World')).toBe('hello-world');
  });

  // 测试中英文混合标题
  test('中英文混合标题应正确转换', () => {
    const slug = generateSlug('你好Hello世界World');
    expect(slug).toMatch(/^ni-hao-hello-shi-jie-world$/);
  });

  // 测试特殊字符过滤
  test('特殊字符应被移除', () => {
    expect(generateSlug('Hello! @World# $Test%')).toBe('hello-world-test');
  });

  // 测试多个空格和连字符合并
  test('多个空格和连字符应合并为单个连字符', () => {
    expect(generateSlug('Hello   World')).toBe('hello-world');
    expect(generateSlug('Hello---World')).toBe('hello-world');
    expect(generateSlug('Hello - - World')).toBe('hello-world');
  });

  // 测试空值和 null 输入
  test('空值或 null 输入应返回空字符串', () => {
    expect(generateSlug('')).toBe('');
    expect(generateSlug(null)).toBe('');
    expect(generateSlug(undefined)).toBe('');
  });

  // 测试非字符串输入
  test('非字符串输入应返回空字符串', () => {
    expect(generateSlug(123)).toBe('');
    expect(generateSlug({})).toBe('');
  });
});


// ============================================================
// generateUniqueSlug 单元测试（使用内存数据库）
// ============================================================
describe('generateUniqueSlug', () => {
  // 每次测试前重建表
  beforeEach(() => {
    mockDb.exec('DROP TABLE IF EXISTS articles');
    mockDb.exec(`
      CREATE TABLE articles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        slug TEXT NOT NULL UNIQUE
      )
    `);
  });

  // 测试无冲突时直接返回基础 slug
  test('无冲突时应返回基础 slug', () => {
    const slug = generateUniqueSlug('Hello World', 'articles');
    expect(slug).toBe('hello-world');
  });

  // 测试 slug 已存在时追加 -2
  test('slug 已存在时应追加 -2', () => {
    mockDb.prepare('INSERT INTO articles (slug) VALUES (?)').run('hello-world');

    const slug = generateUniqueSlug('Hello World', 'articles');
    expect(slug).toBe('hello-world-2');
  });

  // 测试 slug 和 slug-2 都存在时追加 -3
  test('slug 和 slug-2 都存在时应追加 -3', () => {
    mockDb.prepare('INSERT INTO articles (slug) VALUES (?)').run('hello-world');
    mockDb.prepare('INSERT INTO articles (slug) VALUES (?)').run('hello-world-2');

    const slug = generateUniqueSlug('Hello World', 'articles');
    expect(slug).toBe('hello-world-3');
  });

  // 测试空标题返回空字符串
  test('空标题应返回空字符串', () => {
    const slug = generateUniqueSlug('', 'articles');
    expect(slug).toBe('');
  });
});
