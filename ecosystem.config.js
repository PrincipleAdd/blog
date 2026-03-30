module.exports = {
  apps: [
    {
      name: 'personal-blog',
      script: './server/src/app.js',
      cwd: './server',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '256M',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      // 日志文件路径
      out_file: './logs/out.log',
      error_file: './logs/error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss'
    }
  ]
}
