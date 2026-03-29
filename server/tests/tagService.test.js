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
const { createTag, deleteTag, listTags, getTagBySlug } = require('../src/services/tagService');

describe('标签服务 - tagService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createTag()', () => {
    test('应创建标签并返回标签对象', () => {
      const mockTag = { id: 1, name: 'JavaScript', slug: 'javascript', created_at: '2025-01-01' };
      generateUniqueSlug.mockReturnValue('javascript');
      mockRun.mockReturnValue({ lastInsertRowid: 1 });
      mockGet.mockReturnValue(mockTag);

      const result = createTag('JavaScript');

      // 验证 slug 生成调用，表名应为 tags
      expect(generateUniqueSlug).toHaveBeenCalledWith('JavaScript', 'tags');
      // 验证 INSERT 语句
      expect(db.prepare).toHaveBeenCalledWith('INSERT INTO tags (name, slug) VALUES (?, ?)');
      expect(mockRun).toHaveBeenCalledWith('JavaScript', 'javascript');
      // 验证返回查询
      expect(db.prepare).toHaveBeenCalledWith('SELECT * FROM tags WHERE id = ?');
      expect(result).toEqual(mockTag);
    });

    test('中文标签名应正确生成 slug', () => {
      const mockTag = { id: 2, name: '前端开发', slug: 'qian-duan-kai-fa', created_at: '2025-01-01' };
      generateUniqueSlug.mockReturnValue('qian-duan-kai-fa');
      mockRun.mockReturnValue({ lastInsertRowid: 2 });
      mockGet.mockReturnValue(mockTag);

      const result = createTag('前端开发');

      expect(generateUniqueSlug).toHaveBeenCalledWith('前端开发', 'tags');
      expect(result.slug).toBe('qian-duan-kai-fa');
    });
  });

  describe('deleteTag()', () => {
    test('应按 ID 删除标签', () => {
      mockRun.mockReturnValue({ changes: 1 });

      deleteTag(1);

      expect(db.prepare).toHaveBeenCalledWith('DELETE FROM tags WHERE id = ?');
      expect(mockRun).toHaveBeenCalledWith(1);
    });
  });

  describe('listTags()', () => {
    test('应返回所有标签及文章计数', () => {
      const mockTags = [
        { id: 2, name: 'Vue', slug: 'vue', created_at: '2025-01-02', articleCount: 5 },
        { id: 1, name: 'JavaScript', slug: 'javascript', created_at: '2025-01-01', articleCount: 3 }
      ];
      mockAll.mockReturnValue(mockTags);

      const result = listTags();

      // 验证使用了 LEFT JOIN 查询
      expect(db.prepare).toHaveBeenCalledWith(
        expect.stringContaining('LEFT JOIN article_tags')
      );
      expect(db.prepare).toHaveBeenCalledWith(
        expect.stringContaining('COUNT(at.article_id) as articleCount')
      );
      expect(result).toEqual(mockTags);
      expect(result[0].articleCount).toBe(5);
      expect(result[1].articleCount).toBe(3);
    });

    test('无标签时应返回空数组', () => {
      mockAll.mockReturnValue([]);

      const result = listTags();

      expect(result).toEqual([]);
    });
  });

  describe('getTagBySlug()', () => {
    test('存在的 slug 应返回标签对象', () => {
      const mockTag = { id: 1, name: 'JavaScript', slug: 'javascript', created_at: '2025-01-01' };
      mockGet.mockReturnValue(mockTag);

      const result = getTagBySlug('javascript');

      expect(db.prepare).toHaveBeenCalledWith('SELECT * FROM tags WHERE slug = ?');
      expect(mockGet).toHaveBeenCalledWith('javascript');
      expect(result).toEqual(mockTag);
    });

    test('不存在的 slug 应返回 null', () => {
      mockGet.mockReturnValue(undefined);

      const result = getTagBySlug('nonexistent');

      expect(result).toBeNull();
    });
  });
});
