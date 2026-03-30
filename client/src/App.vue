<template>
  <!-- 登录页：直接渲染，不显示任何导航 -->
  <router-view v-if="isLoginPage" />

  <!-- 管理后台页面：侧边栏 + 主内容 -->
  <el-container v-else-if="isAdminPage" style="min-height: 100vh;">
    <el-aside width="200px" class="admin-aside">
      <div style="padding: 20px 16px; color: #fff; font-size: 16px; font-weight: 700; border-bottom: 1px solid #1f3a5f;">
        博客管理
      </div>
      <el-menu
        :default-active="$route.path"
        background-color="#001529"
        text-color="#ccc"
        active-text-color="#409eff"
        router
      >
        <el-menu-item index="/admin/dashboard">
          <el-icon><House /></el-icon>
          <span>控制台</span>
        </el-menu-item>
        <el-menu-item index="/admin/posts">
          <el-icon><Document /></el-icon>
          <span>文章管理</span>
        </el-menu-item>
        <el-menu-item index="/admin/categories">
          <el-icon><Folder /></el-icon>
          <span>分类管理</span>
        </el-menu-item>
        <el-menu-item index="/admin/tags">
          <el-icon><Collection /></el-icon>
          <span>标签管理</span>
        </el-menu-item>
        <el-menu-item index="logout" @click="handleLogout">
          <el-icon><SwitchButton /></el-icon>
          <span>退出登录</span>
        </el-menu-item>
      </el-menu>
    </el-aside>
    <el-container>
      <el-main>
        <router-view />
      </el-main>
    </el-container>
  </el-container>

  <!-- 公开页面：顶部导航 + 主内容 -->
  <template v-else>
    <el-header class="blog-header" height="60px">
      <div class="header-inner">
        <router-link to="/" class="blog-title">我的博客</router-link>
        <nav class="nav-links">
          <router-link to="/">首页</router-link>
          <router-link to="/about">关于</router-link>
        </nav>
      </div>
    </el-header>
    <div class="public-main">
      <router-view />
    </div>
  </template>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { House, Document, Folder, Collection, SwitchButton } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()

const isLoginPage = computed(() => route.path === '/admin/login')
const isAdminPage = computed(() => route.path.startsWith('/admin') && !isLoginPage.value)

function handleLogout() {
  localStorage.removeItem('token')
  router.push('/admin/login')
}
</script>
