const { db } = require('../models/db');
const { generateUniqueSlug } = require('../utils/slug');

/**
 * 创建分类
 * 自动根据分类名称生成唯一 slug
 * @param {string} name - 分类名称
 * @returns {object} 创建的分类对象
 */
function createCategory(name) {
  // 生成唯一 slug
  const slug = generateUniqueSlug(name, 'categories');

  // 插入分类记录
  const stmt = db.prepare(
    'INSERT INTO categories (name, slug) VALUES (?, ?)'
  );
  const result = stmt.run(name, slug);

  // 返回创建的分类对象
  return db.prepare('SELECT * FROM categories WHERE id = ?').get(result.lastInsertRowid);
}

/**
 * 删除分类
 * @param {number} id - 分类 ID
 */
function deleteCategory(id) {
  db.prepare('DELETE FROM categories WHERE id = ?').run(id);
}

/**
 * 获取所有分类
 * 按创建时间倒序排列
 * @returns {object[]} 分类列表
 */
function listCategories() {
  return db.prepare('SELECT * FROM categories ORDER BY created_at DESC').all();
}

/**
 * 按 slug 查询分类
 * @param {string} slug - 分类 slug
 * @returns {object|null} 分类对象，未找到返回 null
 */
function getCategoryBySlug(slug) {
  const category = db.prepare('SELECT * FROM categories WHERE slug = ?').get(slug);
  return category || null;
}

module.exports = { createCategory, deleteCategory, listCategories, getCategoryBySlug };
