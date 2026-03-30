import { createRouter, createWebHistory } from 'vue-router'

// 公开路由
const publicRoutes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/Home.vue')
  },
  {
    path: '/posts/:slug',
    name: 'Post',
    component: () => import('../views/Post.vue')
  },
  {
    path: '/categories/:slug',
    name: 'Category',
    component: () => import('../views/Category.vue')
  },
  {
    path: '/tags/:slug',
    name: 'Tag',
    component: () => import('../views/Tag.vue')
  },
  {
    path: '/about',
    name: 'About',
    component: () => import('../views/About.vue')
  }
]

// 管理后台路由
const adminRoutes = [
  {
    path: '/admin/login',
    name: 'AdminLogin',
    component: () => import('../views/admin/Login.vue')
  },
  {
    path: '/admin/dashboard',
    name: 'AdminDashboard',
    component: () => import('../views/admin/Dashboard.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/admin/posts',
    name: 'AdminPostList',
    component: () => import('../views/admin/PostList.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/admin/posts/new',
    name: 'AdminPostNew',
    component: () => import('../views/admin/PostEditor.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/admin/posts/:id/edit',
    name: 'AdminPostEdit',
    component: () => import('../views/admin/PostEditor.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/admin/categories',
    name: 'AdminCategories',
    component: () => import('../views/admin/Categories.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/admin/tags',
    name: 'AdminTags',
    component: () => import('../views/admin/Tags.vue'),
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes: [...publicRoutes, ...adminRoutes]
})

// 导航守卫：保护管理后台路由
router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth) {
    const token = localStorage.getItem('token')
    if (!token) {
      next({ name: 'AdminLogin' })
    } else {
      next()
    }
  } else {
    next()
  }
})

export default router
