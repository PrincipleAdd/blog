const { db } = require('../models/db');
const { generateUniqueSlug } = require('../utils/slug');

/**
 * 创建标签
 * 自动根据标签名称生成唯一 slug
 * @param {string} name - 标签名称
 * @returns {object} 创建的标签对象
 */
function createTag(name) {
  // 生成唯一 slug
  const slug = generateUniqueSlug(name, 'tags');

  // 插入标签记录
  const stmt = db.prepare(
    'INSERT INTO tags (name, slug) VALUES (?, ?)'
  );
  const result = stmt.run(name, slug);

  // 返回创建的标签对象
  return db.prepare('SELECT * FROM tags WHERE id = ?').get(result.lastInsertRowid);
}

/**
 * 删除标签
 * @param {number} id - 标签 ID
 */
function deleteTag(id) {
  db.prepare('DELETE FROM tags WHERE id = ?').run(id);
}

/**
 * 获取所有标签（含文章计数）
 * 通过 LEFT JOIN article_tags 统计每个标签关联的文章数量
 * 按创建时间倒序排列
 * @returns {object[]} 标签列表，每个标签包含 articleCount 字段
 */
function listTags() {
  return db.prepare(
    `SELECT t.*, COUNT(at.article_id) as articleCount
     FROM tags t
     LEFT JOIN article_tags at ON t.id = at.tag_id
     GROUP BY t.id
     ORDER BY created_at DESC`
  ).all();
}

/**
 * 按 slug 查询标签
 * @param {string} slug - 标签 slug
 * @returns {object|null} 标签对象，未找到返回 null
 */
function getTagBySlug(slug) {
  const tag = db.prepare('SELECT * FROM tags WHERE slug = ?').get(slug);
  return tag || null;
}

module.exports = { createTag, deleteTag, listTags, getTagBySlug };
