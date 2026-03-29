const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { db } = require('../models/db');

// JWT 密钥，与 middleware/auth.js 保持一致
const JWT_SECRET = process.env.JWT_SECRET || 'blog-secret-key';

// Token 过期时间：24 小时（秒）
const TOKEN_EXPIRES_IN = 86400;

// bcrypt 加盐轮数
const SALT_ROUNDS = 10;

/**
 * 用户登录
 * 验证用户名和密码，成功后返回 JWT token
 * @param {string} username - 用户名
 * @param {string} password - 明文密码
 * @returns {{ token: string, expiresIn: number }} JWT token 和过期时间
 * @throws {Error} 用户名或密码错误时抛出异常
 */
function login(username, password) {
  // 从数据库查询用户
  const user = db.prepare('SELECT id, username, password_hash FROM users WHERE username = ?').get(username);

  if (!user) {
    throw new Error('用户名或密码错误');
  }

  // 比较密码
  const isMatch = bcrypt.compareSync(password, user.password_hash);
  if (!isMatch) {
    throw new Error('用户名或密码错误');
  }

  // 签发 JWT token
  const token = jwt.sign(
    { userId: user.id, username: user.username },
    JWT_SECRET,
    { expiresIn: TOKEN_EXPIRES_IN }
  );

  return { token, expiresIn: TOKEN_EXPIRES_IN };
}

/**
 * 验证 JWT token
 * 解析并验证 token，返回解码后的用户信息
 * @param {string} token - JWT token
 * @returns {{ userId: number, username: string }} 解码后的用户信息
 * @throws {Error} token 无效或已过期时抛出异常
 */
function verifyToken(token) {
  const decoded = jwt.verify(token, JWT_SECRET);
  return { userId: decoded.userId, username: decoded.username };
}

/**
 * 加密密码
 * 使用 bcryptjs 对明文密码进行哈希加密
 * @param {string} password - 明文密码
 * @returns {string} 加密后的密码哈希值
 */
function hashPassword(password) {
  return bcrypt.hashSync(password, SALT_ROUNDS);
}

module.exports = { login, verifyToken, hashPassword };
