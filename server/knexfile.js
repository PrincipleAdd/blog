const path = require('path');

module.exports = {
  // 开发环境配置
  development: {
    client: 'better-sqlite3',
    connection: {
      filename: path.join(__dirname, 'data', 'blog.db')
    },
    // better-sqlite3 不支持连接池，但 knex 需要此配置
    useNullAsDefault: true,
    migrations: {
      directory: path.join(__dirname, 'migrations')
    },
    seeds: {
      directory: path.join(__dirname, 'seeds')
    }
  },

  // 生产环境配置
  production: {
    client: 'better-sqlite3',
    connection: {
      filename: path.join(__dirname, 'data', 'blog.db')
    },
    useNullAsDefault: true,
    migrations: {
      directory: path.join(__dirname, 'migrations')
    },
    seeds: {
      directory: path.join(__dirname, 'seeds')
    }
  }
};
