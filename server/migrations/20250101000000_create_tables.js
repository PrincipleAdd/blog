/**
 * 数据库迁移文件 - 创建所有表
 * 包含：users, categories, tags, articles, article_tags
 */

/**
 * @param {import('knex').Knex} knex
 */
exports.up = async function (knex) {
  // 创建用户表
  await knex.schema.createTable('users', (table) => {
    table.increments('id').primary();
    table.text('username').notNullable().unique();
    table.text('password_hash').notNullable();
    table.text('created_at').defaultTo(knex.fn.now());
  });

  // 创建分类表
  await knex.schema.createTable('categories', (table) => {
    table.increments('id').primary();
    table.text('name').notNullable().unique();
    table.text('slug').notNullable().unique();
    table.text('created_at').defaultTo(knex.fn.now());
  });

  // 创建标签表
  await knex.schema.createTable('tags', (table) => {
    table.increments('id').primary();
    table.text('name').notNullable().unique();
    table.text('slug').notNullable().unique();
    table.text('created_at').defaultTo(knex.fn.now());
  });

  // 创建文章表
  await knex.schema.createTable('articles', (table) => {
    table.increments('id').primary();
    table.text('title').notNullable();
    table.text('slug').notNullable().unique();
    table.text('content_md').notNullable();
    table.text('content_html').notNullable();
    table.text('status').notNullable().defaultTo('draft');
    table.text('created_at').defaultTo(knex.fn.now());
    table.text('updated_at').defaultTo(knex.fn.now());
    table
      .integer('category_id')
      .unsigned()
      .references('id')
      .inTable('categories')
      .onDelete('SET NULL');
  });

  // 添加 status 字段的 CHECK 约束（仅允许 draft 或 published）
  await knex.raw(`
    CREATE TRIGGER check_articles_status_insert
    BEFORE INSERT ON articles
    BEGIN
      SELECT CASE
        WHEN NEW.status NOT IN ('draft', 'published')
        THEN RAISE(ABORT, 'status 必须为 draft 或 published')
      END;
    END;
  `);

  await knex.raw(`
    CREATE TRIGGER check_articles_status_update
    BEFORE UPDATE ON articles
    BEGIN
      SELECT CASE
        WHEN NEW.status NOT IN ('draft', 'published')
        THEN RAISE(ABORT, 'status 必须为 draft 或 published')
      END;
    END;
  `);

  // 创建文章-标签关联表（多对多）
  await knex.schema.createTable('article_tags', (table) => {
    table
      .integer('article_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('articles')
      .onDelete('CASCADE');
    table
      .integer('tag_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('tags')
      .onDelete('CASCADE');
    table.primary(['article_id', 'tag_id']);
  });
};

/**
 * @param {import('knex').Knex} knex
 */
exports.down = async function (knex) {
  // 按照外键依赖的反序删除表
  await knex.schema.dropTableIfExists('article_tags');

  // 删除 articles 表上的触发器
  await knex.raw('DROP TRIGGER IF EXISTS check_articles_status_insert');
  await knex.raw('DROP TRIGGER IF EXISTS check_articles_status_update');

  await knex.schema.dropTableIfExists('articles');
  await knex.schema.dropTableIfExists('tags');
  await knex.schema.dropTableIfExists('categories');
  await knex.schema.dropTableIfExists('users');
};
