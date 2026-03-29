const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// ========== 基础中间件 ==========

// 解析 JSON 请求体
app.use(express.json());

// 解析 URL 编码的请求体
app.use(express.urlencoded({ extended: true }));

// 跨域资源共享配置
app.use(cors());

// ========== 健康检查 ==========

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ========== 启动服务器 ==========

app.listen(PORT, () => {
  console.log(`博客后端服务已启动，端口: ${PORT}`);
});

module.exports = app;
