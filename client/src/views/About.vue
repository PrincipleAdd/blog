<template>
  <div>
    <h1 class="page__title">关于</h1>
    <div class="page__content">
      <p>你好，我是 Principle。</p>
      <p>这里记录我的技术学习笔记、项目经验和一些生活感悟，主要涉及前端开发、后端开发、工具使用等内容。</p>
      <h2>关于本站</h2>
      <p>本博客基于 <strong>Vue 3 + Express + SQLite</strong> 构建，部署在腾讯云服务器上，使用 Nginx 反向代理和 PM2 进程管理。</p>
      <h2>联系方式</h2>
      <ul>
        <li>GitHub：<a href="https://github.com/PrincipleAdd" target="_blank" rel="noopener">github.com/PrincipleAdd</a></li>
        <li>邮箱：<a href="mailto:1369401433@qq.com">1369401433@qq.com</a></li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { useHead } from '@unhead/vue'
useHead({ title: '关于 | Principle' })
</script>
