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

  <!-- 公开页面 -->
  <div v-else :data-theme="theme">
    <!-- 顶部导航栏 -->
    <header class="masthead">
      <div class="masthead__inner">
        <router-link to="/" class="masthead__title">{{ siteConfig.title }}</router-link>
        <nav class="masthead__nav">
          <router-link to="/">文章</router-link>
          <router-link to="/about">关于</router-link>
          <button class="masthead__theme-btn" @click="toggleTheme">
            {{ theme === 'dark' ? '☀️' : '🌙' }}
          </button>
        </nav>
      </div>
    </header>

    <!-- 主体：侧边栏 + 内容 -->
    <div class="page-wrapper">
      <!-- 左侧作者信息栏 -->
      <aside class="author-profile">
        <div class="author__avatar">
          <div class="author__avatar-placeholder">{{ avatarLetter }}</div>
        </div>
        <h3 class="author__name">{{ siteConfig.author }}</h3>
        <p class="author__bio">{{ siteConfig.bio }}</p>

        <ul class="author__urls">
          <li v-if="siteConfig.email">
            <a :href="`mailto:${siteConfig.email}`">
              <span class="url-icon">✉️</span> {{ siteConfig.email }}
            </a>
          </li>
          <li v-if="siteConfig.github">
            <a :href="siteConfig.github" target="_blank" rel="noopener">
              <span class="url-icon">🐙</span> GitHub
            </a>
          </li>
          <li v-if="siteConfig.location">
            <span style="display:flex;align-items:center;gap:8px;font-size:13px;color:var(--text-muted);">
              <span class="url-icon">📍</span> {{ siteConfig.location }}
            </span>
          </li>
        </ul>

        <template v-if="tags.length">
          <hr class="author__divider" />
          <div class="author__section-title">标签</div>
          <div class="author__tags">
            <router-link
              v-for="tag in tags.slice(0, 15)"
              :key="tag.id"
              :to="`/tags/${tag.slug}`"
              class="author__tag"
            >{{ tag.name }}</router-link>
          </div>
        </template>
      </aside>

      <!-- 右侧内容区 -->
      <main class="page-content">
        <router-view />
      </main>
    </div>
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

// 站点配置 — 按需修改
const siteConfig = {
  title: 'Principle',
  author: 'Principle',
  bio: '记录技术与思考，分享学习与生活。',
  email: '1369401433@qq.com',
  github: 'https://github.com/PrincipleAdd',
  location: 'China'
}

const avatarLetter = computed(() => siteConfig.author.charAt(0).toUpperCase())

// 暗色模式
const theme = ref(localStorage.getItem('theme') || 'light')

function toggleTheme() {
  theme.value = theme.value === 'dark' ? 'light' : 'dark'
  localStorage.setItem('theme', theme.value)
  document.documentElement.setAttribute('data-theme', theme.value)
}

// 侧边栏标签
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
