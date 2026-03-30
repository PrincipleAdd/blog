<template>
  <div class="public-main">
    <div class="about-card">
      <div class="about-avatar">
        <el-avatar :size="80" icon="UserFilled" />
      </div>
      <h1 class="about-name">博主</h1>
      <p class="about-bio">热爱技术，喜欢分享。这里记录我的学习笔记、技术思考和生活感悟。</p>

      <el-divider />

      <div class="about-section">
        <h2>关于本站</h2>
        <p>本博客基于 Vue 3 + Express + SQLite 构建，部署在腾讯云服务器上。</p>
        <p>主要分享技术文章，包括前端开发、后端开发、工具使用等内容。</p>
      </div>

      <div class="about-section">
        <h2>联系方式</h2>
        <p>如有问题或合作意向，欢迎通过以下方式联系：</p>
        <ul>
          <li>GitHub：<a href="https://github.com" target="_blank" rel="noopener">github.com</a></li>
          <li>邮箱：<a href="mailto:[email]">[email]</a></li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useHead } from '@unhead/vue'
useHead({ title: '关于 | 我的博客' })
</script>

<style scoped>
.about-card {
  background: #fff;
  border-radius: 8px;
  padding: 40px 32px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
  text-align: center;
}
.about-avatar { margin-bottom: 16px; }
.about-name {
  font-size: 24px;
  font-weight: 700;
  color: #222;
  margin-bottom: 8px;
}
.about-bio {
  color: #666;
  font-size: 15px;
  line-height: 1.7;
  max-width: 500px;
  margin: 0 auto;
}
.about-section {
  text-align: left;
  margin-bottom: 24px;
}
.about-section h2 {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin-bottom: 10px;
}
.about-section p {
  color: #555;
  line-height: 1.7;
  margin-bottom: 8px;
}
.about-section ul {
  padding-left: 20px;
  color: #555;
  line-height: 1.9;
}
.about-section a {
  color: #409eff;
  text-decoration: none;
}
.about-section a:hover { text-decoration: underline; }
</style>
