// 模拟 db 和 slug 模块
const mockRun = jest.fn();
const mockGet = jest.fn();
const mockAll = jest.fn();

jest.mock('../src/models/db', () => {
  const mockDb = {
    prepare: jest.fn().mockReturnValue({
      run: mockRun,
      get: mockGet,
      all: mockAll
    })
  };
  return { db: mockDb };
});

jest.mock('../src/utils/slug', () => ({
  generateUniqueSlug: jest.fn()
}));

const { db } = require('../src/models/db');
const { generateUniqueSlug } = require('../src/utils/slug');
const { createCategory, deleteCategory, listCategories, getCategoryBySlug } = require('../src/services/categoryService');

describe('分类服务 - categoryService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createCategory()', () => {
    test('应创建分类并返回分类对象', () => {
      const mockCategory = { id: 1, name: '技术', slug: 'ji-shu', created_at: '2025-01-01' };
      generateUniqueSlug.mockReturnValue('ji-shu');
      mockRun.mockReturnValue({ lastInsertRowid: 1 });
      mockGet.mockReturnValue(mockCategory);

      const result = createCategory('技术');

      // 验证 slug 生成调用
      expect(generateUniqueSlug).toHaveBeenCalledWith('技术', 'categories');
      // 验证 INSERT 语句
      expect(db.prepare).toHaveBeenCalledWith('INSERT INTO categories (name, slug) VALUES (?, ?)');
      expect(mockRun).toHaveBeenCalledWith('技术', 'ji-shu');
      // 验证返回查询
      expect(db.prepare).toHaveBeenCalledWith('SELECT * FROM categories WHERE id = ?');
      expect(result).toEqual(mockCategory);
    });

    test('英文分类名应正确生成 slug', () => {
      const mockCategory = { id: 2, name: 'JavaScript', slug: 'javascript', created_at: '2025-01-01' };
      generateUniqueSlug.mockReturnValue('javascript');
      mockRun.mockReturnValue({ lastInsertRowid: 2 });
      mockGet.mockReturnValue(mockCategory);

      const result = createCategory('JavaScript');

      expect(generateUniqueSlug).toHaveBeenCalledWith('JavaScript', 'categories');
      expect(result.slug).toBe('javascript');
    });
  });

  describe('deleteCategory()', () => {
    test('应按 ID 删除分类', () => {
      mockRun.mockReturnValue({ changes: 1 });

      deleteCategory(1);

      expect(db.prepare).toHaveBeenCalledWith('DELETE FROM categories WHERE id = ?');
      expect(mockRun).toHaveBeenCalledWith(1);
    });
  });

  describe('listCategories()', () => {
    test('应返回按创建时间倒序排列的所有分类', () => {
      const mockCategories = [
        { id: 2, name: '生活', slug: 'sheng-huo', created_at: '2025-01-02' },
        { id: 1, name: '技术', slug: 'ji-shu', created_at: '2025-01-01' }
      ];
      mockAll.mockReturnValue(mockCategories);

      const result = listCategories();

      expect(db.prepare).toHaveBeenCalledWith('SELECT * FROM categories ORDER BY created_at DESC');
      expect(result).toEqual(mockCategories);
      expect(result).toHaveLength(2);
    });

    test('无分类时应返回空数组', () => {
      mockAll.mockReturnValue([]);

      const result = listCategories();

      expect(result).toEqual([]);
    });
  });

  describe('getCategoryBySlug()', () => {
    test('存在的 slug 应返回分类对象', () => {
      const mockCategory = { id: 1, name: '技术', slug: 'ji-shu', created_at: '2025-01-01' };
      mockGet.mockReturnValue(mockCategory);

      const result = getCategoryBySlug('ji-shu');

      expect(db.prepare).toHaveBeenCalledWith('SELECT * FROM categories WHERE slug = ?');
      expect(mockGet).toHaveBeenCalledWith('ji-shu');
      expect(result).toEqual(mockCategory);
    });

    test('不存在的 slug 应返回 null', () => {
      mockGet.mockReturnValue(undefined);

      const result = getCategoryBySlug('nonexistent');

      expect(result).toBeNull();
    });
  });
});
