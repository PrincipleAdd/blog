<template>
  <!-- 登录页 -->
  <router-view v-if="isLoginPage" />

  <!-- 管理后台 -->
  <el-container v-else-if="isAdminPage" style="min-height: 100vh;">
    <el-aside width="200px" class="admin-aside">
      <div style="padding: 20px 16px; color: #fff; font-size: 16px; font-weight: 700; border-bottom: 1px solid #1f3a5f;">
        博客管理
      </div>
      <el-menu :default-active="$route.path" background-color="#001529" text-color="#ccc" active-text-color="#409eff" router>
        <el-menu-item index="/admin/dashboard"><el-icon><House /></el-icon><span>控制台</span></el-menu-item>
        <el-menu-item index="/admin/posts"><el-icon><Document /></el-icon><span>文章管理</span></el-menu-item>
        <el-menu-item index="/admin/categories"><el-icon><Folder /></el-icon><span>分类管理</span></el-menu-item>
        <el-menu-item index="/admin/tags"><el-icon><Collection /></el-icon><span>标签管理</span></el-menu-item>
        <el-menu-item index="logout" @click="handleLogout"><el-icon><SwitchButton /></el-icon><span>退出登录</span></el-menu-item>
      </el-menu>
    </el-aside>
    <el-container>
      <el-main><router-view /></el-main>
    </el-container>
  </el-container>

  <!-- 公开页面：侧边栏 + 内容区 -->
  <div v-else class="blog-layout" :data-theme="theme">
    <!-- 侧边栏 -->
    <aside class="blog-sidebar">
      <div class="sidebar-avatar">{{ avatarLetter }}</div>
      <div class="sidebar-name">{{ siteConfig.name }}</div>
      <div class="sidebar-bio">{{ siteConfig.bio }}</div>

      <nav>
        <ul class="sidebar-nav">
          <li><router-link to="/"><span class="nav-icon">📝</span> 文章</router-link></li>
          <li><router-link to="/about"><span class="nav-icon">👤</span> 关于</router-link></li>
        </ul>
      </nav>

      <hr class="sidebar-divider" />

      <div v-if="tags.length">
        <div class="sidebar-section-title">标签</div>
        <div class="sidebar-tags">
          <router-link
            v-for="tag in tags.slice(0, 12)"
            :key="tag.id"
            :to="`/tags/${tag.slug}`"
            class="sidebar-tag"
          >{{ tag.name }}</router-link>
        </div>
      </div>

      <button class="theme-toggle" @click="toggleTheme">
        <span>{{ theme === 'dark' ? '☀️' : '🌙' }}</span>
        {{ theme === 'dark' ? '浅色模式' : '深色模式' }}
      </button>
    </aside>

    <!-- 主内容 -->
    <main class="blog-content">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { House, Document, Folder, Collection, SwitchButton } from '@element-plus/icons-vue'
import { getTags } from './api/tags.js'

const route = useRoute()
const router = useRouter()

const isLoginPage = computed(() => route.path === '/admin/login')
const isAdminPage = computed(() => route.path.startsWith('/admin') && !isLoginPage.value)

// 站点配置（可按需修改）
const siteConfig = {
  name: '我的博客',
  bio: '记录技术与思考，分享学习与生活。'
}

const avatarLetter = computed(() => siteConfig.name.charAt(0))

// 暗色模式
const theme = ref(localStorage.getItem('theme') || 'light')

function toggleTheme() {
  theme.value = theme.value === 'dark' ? 'light' : 'dark'
  localStorage.setItem('theme', theme.value)
  document.documentElement.setAttribute('data-theme', theme.value)
}

// 标签列表（侧边栏展示）
const tags = ref([])

async function loadTags() {
  try {
    const res = await getTags()
    tags.value = res.data || []
  } catch { /* 静默 */ }
}

function handleLogout() {
  localStorage.removeItem('token')
  router.push('/admin/login')
}

onMounted(() => {
  document.documentElement.setAttribute('data-theme', theme.value)
  loadTags()
})
</script>
