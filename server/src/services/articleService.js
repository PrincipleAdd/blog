const { db } = require('../models/db');
const { generateUniqueSlug } = require('../utils/slug');
const { marked } = require('marked');

/**
 * 创建文章
 * 使用 marked 将 Markdown 转 HTML，自动生成 slug，处理 article_tags 关联
 * @param {object} params - 文章参数
 * @param {string} params.title - 文章标题
 * @param {string} params.content - Markdown 内容
 * @param {number|null} params.categoryId - 分类 ID
 * @param {number[]} params.tagIds - 标签 ID 数组
 * @param {string} params.status - 文章状态（draft/published）
 * @returns {object} 创建的文章对象
 */
function createArticle({ title, content, categoryId, tagIds = [], status = 'draft' }) {
  // 生成唯一 slug
  const slug = generateUniqueSlug(title, 'articles');

  // 将 Markdown 转换为 HTML
  const contentHtml = marked(content);

  // 使用事务确保文章和标签关联的原子性
  const insertArticle = db.transaction(() => {
    // 插入文章记录
    const stmt = db.prepare(
      `INSERT INTO articles (title, slug, content_md, content_html, status, category_id)
       VALUES (?, ?, ?, ?, ?, ?)`
    );
    const result = stmt.run(title, slug, content, contentHtml, status, categoryId || null);
    const articleId = result.lastInsertRowid;

    // 插入文章-标签关联
    if (tagIds.length > 0) {
      const insertTag = db.prepare(
        'INSERT INTO article_tags (article_id, tag_id) VALUES (?, ?)'
      );
      for (const tagId of tagIds) {
        insertTag.run(articleId, tagId);
      }
    }

    // 返回创建的文章
    return db.prepare('SELECT * FROM articles WHERE id = ?').get(articleId);
  });

  return insertArticle();
}

/**
 * 更新文章
 * 同步更新 content_html 和 updated_at，重新处理标签关联
 * @param {number} id - 文章 ID
 * @param {object} params - 更新参数
 * @param {string} params.title - 文章标题
 * @param {string} params.content - Markdown 内容
 * @param {number|null} params.categoryId - 分类 ID
 * @param {number[]} params.tagIds - 标签 ID 数组
 * @param {string} params.status - 文章状态
 * @returns {object} 更新后的文章对象
 */
function updateArticle(id, { title, content, categoryId, tagIds = [], status }) {
  // 将 Markdown 转换为 HTML
  const contentHtml = marked(content);

  const update = db.transaction(() => {
    // 更新文章记录
    db.prepare(
      `UPDATE articles
       SET title = ?, content_md = ?, content_html = ?, status = ?, category_id = ?, updated_at = datetime('now')
       WHERE id = ?`
    ).run(title, content, contentHtml, status, categoryId || null, id);

    // 删除旧的标签关联，重新插入
    db.prepare('DELETE FROM article_tags WHERE article_id = ?').run(id);

    if (tagIds.length > 0) {
      const insertTag = db.prepare(
        'INSERT INTO article_tags (article_id, tag_id) VALUES (?, ?)'
      );
      for (const tagId of tagIds) {
        insertTag.run(id, tagId);
      }
    }

    // 返回更新后的文章
    return db.prepare('SELECT * FROM articles WHERE id = ?').get(id);
  });

  return update();
}

/**
 * 删除文章及其 article_tags 关联
 * 由于 article_tags 设置了 ON DELETE CASCADE，删除文章时关联会自动清除
 * @param {number} id - 文章 ID
 */
function deleteArticle(id) {
  db.prepare('DELETE FROM articles WHERE id = ?').run(id);
}

/**
 * 按 slug 获取文章详情（含分类和标签信息）
 * @param {string} slug - 文章 slug
 * @returns {object|null} 文章对象（含 category 和 tags），未找到返回 null
 */
function getArticleBySlug(slug) {
  // 查询文章并 JOIN 分类表
  const article = db.prepare(
    `SELECT a.*, c.name AS category_name, c.slug AS category_slug
     FROM articles a
     LEFT JOIN categories c ON a.category_id = c.id
     WHERE a.slug = ?`
  ).get(slug);

  if (!article) {
    return null;
  }

  // 查询文章关联的标签
  const tags = db.prepare(
    `SELECT t.id, t.name, t.slug
     FROM tags t
     INNER JOIN article_tags at ON t.id = at.tag_id
     WHERE at.article_id = ?`
  ).all(article.id);

  return {
    ...article,
    tags
  };
}

/**
 * 为文章列表中的每篇文章附加分类名称和标签数组
 * @param {object[]} articles - 文章列表
 * @returns {object[]} 附加了 tags 数组的文章列表
 */
function attachTagsToArticles(articles) {
  if (articles.length === 0) return articles;

  const articleIds = articles.map(a => a.id);
  const placeholders = articleIds.map(() => '?').join(',');

  // 批量查询所有文章的标签
  const allTags = db.prepare(
    `SELECT at.article_id, t.id, t.name, t.slug
     FROM tags t
     INNER JOIN article_tags at ON t.id = at.tag_id
     WHERE at.article_id IN (${placeholders})`
  ).all(...articleIds);

  // 按 article_id 分组
  const tagMap = {};
  for (const tag of allTags) {
    if (!tagMap[tag.article_id]) {
      tagMap[tag.article_id] = [];
    }
    tagMap[tag.article_id].push({ id: tag.id, name: tag.name, slug: tag.slug });
  }

  return articles.map(article => ({
    ...article,
    tags: tagMap[article.id] || []
  }));
}

/**
 * 分页获取已发布文章，按发布时间倒序
 * @param {number} page - 页码（从 1 开始）
 * @param {number} pageSize - 每页数量
 * @returns {{ articles: object[], total: number }}
 */
function listPublishedArticles(page = 1, pageSize = 10) {
  const offset = (page - 1) * pageSize;

  const total = db.prepare(
    "SELECT COUNT(*) AS count FROM articles WHERE status = 'published'"
  ).get().count;

  const articles = db.prepare(
    `SELECT a.*, c.name AS category_name, c.slug AS category_slug
     FROM articles a
     LEFT JOIN categories c ON a.category_id = c.id
     WHERE a.status = 'published'
     ORDER BY a.created_at DESC
     LIMIT ? OFFSET ?`
  ).all(pageSize, offset);

  return { articles: attachTagsToArticles(articles), total };
}

/**
 * 分页获取所有文章（含草稿），按创建时间倒序
 * @param {number} page - 页码（从 1 开始）
 * @param {number} pageSize - 每页数量
 * @returns {{ articles: object[], total: number }}
 */
function listAllArticles(page = 1, pageSize = 10) {
  const offset = (page - 1) * pageSize;

  const total = db.prepare(
    'SELECT COUNT(*) AS count FROM articles'
  ).get().count;

  const articles = db.prepare(
    `SELECT a.*, c.name AS category_name, c.slug AS category_slug
     FROM articles a
     LEFT JOIN categories c ON a.category_id = c.id
     ORDER BY a.created_at DESC
     LIMIT ? OFFSET ?`
  ).all(pageSize, offset);

  return { articles: attachTagsToArticles(articles), total };
}

/**
 * 按分类获取已发布文章
 * @param {string} categorySlug - 分类 slug
 * @param {number} page - 页码
 * @param {number} pageSize - 每页数量
 * @returns {{ articles: object[], total: number }}
 */
function listByCategory(categorySlug, page = 1, pageSize = 10) {
  const offset = (page - 1) * pageSize;

  const total = db.prepare(
    `SELECT COUNT(*) AS count
     FROM articles a
     INNER JOIN categories c ON a.category_id = c.id
     WHERE c.slug = ? AND a.status = 'published'`
  ).get(categorySlug).count;

  const articles = db.prepare(
    `SELECT a.*, c.name AS category_name, c.slug AS category_slug
     FROM articles a
     INNER JOIN categories c ON a.category_id = c.id
     WHERE c.slug = ? AND a.status = 'published'
     ORDER BY a.created_at DESC
     LIMIT ? OFFSET ?`
  ).all(categorySlug, pageSize, offset);

  return { articles: attachTagsToArticles(articles), total };
}

/**
 * 按标签获取已发布文章
 * @param {string} tagSlug - 标签 slug
 * @param {number} page - 页码
 * @param {number} pageSize - 每页数量
 * @returns {{ articles: object[], total: number }}
 */
function listByTag(tagSlug, page = 1, pageSize = 10) {
  const offset = (page - 1) * pageSize;

  const total = db.prepare(
    `SELECT COUNT(*) AS count
     FROM articles a
     INNER JOIN article_tags at ON a.id = at.article_id
     INNER JOIN tags t ON at.tag_id = t.id
     WHERE t.slug = ? AND a.status = 'published'`
  ).get(tagSlug).count;

  const articles = db.prepare(
    `SELECT a.*, c.name AS category_name, c.slug AS category_slug
     FROM articles a
     INNER JOIN article_tags at ON a.id = at.article_id
     INNER JOIN tags t ON at.tag_id = t.id
     LEFT JOIN categories c ON a.category_id = c.id
     WHERE t.slug = ? AND a.status = 'published'
     ORDER BY a.created_at DESC
     LIMIT ? OFFSET ?`
  ).all(tagSlug, pageSize, offset);

  return { articles: attachTagsToArticles(articles), total };
}

module.exports = {
  createArticle,
  updateArticle,
  deleteArticle,
  getArticleBySlug,
  listPublishedArticles,
  listAllArticles,
  listByCategory,
  listByTag
};
