const Database = require('better-sqlite3');
const knex = require('knex');
const path = require('path');
const fs = require('fs');
const knexConfig = require('../../knexfile');

// 确保数据目录存在
const dataDir = path.join(__dirname, '..', '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// 数据库文件路径
const dbPath = path.join(dataDir, 'blog.db');

// 使用 better-sqlite3 初始化数据库连接
const db = new Database(dbPath);

// 启用 WAL 模式，提升并发读写性能
db.pragma('journal_mode = WAL');

// 启用外键约束
db.pragma('foreign_keys = ON');

// 初始化 knex 实例，用于数据库迁移
const env = process.env.NODE_ENV || 'development';
const knexInstance = knex(knexConfig[env]);

module.exports = { db, knex: knexInstance };
