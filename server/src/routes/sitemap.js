const express = require('express');
const router = express.Router();
const { db } = require('../models/db');

/**
 * GET /sitemap.xml
 * 生成包含所有已发布文章 URL 的 XML sitemap
 */
router.get('/sitemap.xml', (req, res) => {
  try {
    // 查询所有已发布文章的 slug 和 updated_at
    const articles = db.prepare(
      "SELECT slug, updated_at FROM articles WHERE status = 'published' ORDER BY updated_at DESC"
    ).all();

    // 构建 XML sitemap
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    for (const article of articles) {
      xml += '  <url>\n';
      xml += `    <loc>https://159.75.26.219/posts/${article.slug}</loc>\n`;
      // 将 SQLite 日期格式转为 W3C Datetime 格式
      xml += `    <lastmod>${article.updated_at}</lastmod>\n`;
      xml += '  </url>\n';
    }

    xml += '</urlset>';

    // 设置响应类型为 XML
    res.set('Content-Type', 'application/xml');
    res.send(xml);
  } catch (err) {
    res.status(500).json({ error: '生成 sitemap 失败' });
  }
});

module.exports = router;
