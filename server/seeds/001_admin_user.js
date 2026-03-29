/**
 * 数据库种子文件 - 插入默认管理员用户
 * 用户名: admin，默认密码: admin123（使用 bcryptjs 加密存储）
 */

const bcrypt = require('bcryptjs');

/**
 * @param {import('knex').Knex} knex
 */
exports.seed = async function (knex) {
  // 检查管理员用户是否已存在，避免重复插入
  const existingAdmin = await knex('users').where({ username: 'admin' }).first();

  if (existingAdmin) {
    console.log('管理员用户已存在，跳过种子插入');
    return;
  }

  // 使用 bcryptjs 加密默认密码
  const saltRounds = 10;
  const passwordHash = await bcrypt.hash('admin123', saltRounds);

  // 插入默认管理员用户
  await knex('users').insert({
    username: 'admin',
    password_hash: passwordHash
  });

  console.log('默认管理员用户创建成功');
};
