const { pinyin } = require('pinyin-pro');
const { db } = require('../models/db');

/**
 * 将标题转换为 URL 友好的 slug
 * 中文转拼音，英文转小写，空格替换为连字符，去除特殊字符
 * @param {string} title - 文章/分类/标签标题
 * @returns {string} URL 友好的 slug
 */
function generateSlug(title) {
  if (!title || typeof title !== 'string') {
    return '';
  }

  // 按中文和非中文片段分别处理
  // 匹配连续中文字符片段
  const parts = [];
  const regex = /([\u4e00-\u9fff]+)|([^\u4e00-\u9fff]+)/g;
  let match;

  while ((match = regex.exec(title)) !== null) {
    if (match[1]) {
      // 中文片段：使用 pinyin-pro 转拼音
      parts.push(pinyin(match[1], { toneType: 'none', separator: '-' }));
    } else {
      // 非中文片段：保留原文
      parts.push(match[2]);
    }
  }

  const combined = parts.join(' ');

  const slug = combined
    .toLowerCase()                    // 转小写
    .replace(/\s+/g, '-')            // 空格替换为连字符
    .replace(/[^a-z0-9-]/g, '')      // 去除特殊字符，仅保留字母、数字和连字符
    .replace(/-+/g, '-')             // 合并连续连字符
    .replace(/^-+|-+$/g, '');        // 去除首尾连字符

  return slug;
}

/**
 * 生成唯一 slug，若存在冲突则追加数字后缀
 * @param {string} title - 文章/分类/标签标题
 * @param {string} tableName - 数据库表名（如 'articles', 'categories', 'tags'）
 * @returns {string} 唯一的 slug
 */
function generateUniqueSlug(title, tableName) {
  const baseSlug = generateSlug(title);

  if (!baseSlug) {
    return '';
  }

  // 查询是否已存在相同 slug 或带数字后缀的 slug
  const existingSlugs = db
    .prepare(`SELECT slug FROM ${tableName} WHERE slug = ? OR slug LIKE ?`)
    .all(baseSlug, `${baseSlug}-%`);

  // 如果没有冲突，直接返回
  if (existingSlugs.length === 0) {
    return baseSlug;
  }

  // 提取已有的数字后缀，找到最大值
  const slugSet = new Set(existingSlugs.map(row => row.slug));

  // 如果 baseSlug 本身不存在，直接返回
  if (!slugSet.has(baseSlug)) {
    return baseSlug;
  }

  // 找到下一个可用的数字后缀
  let suffix = 2;
  while (slugSet.has(`${baseSlug}-${suffix}`)) {
    suffix++;
  }

  return `${baseSlug}-${suffix}`;
}

module.exports = { generateSlug, generateUniqueSlug };
