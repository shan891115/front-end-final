import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '../views/HomePage.vue'
import ComparePage from '../views/ComparePage.vue'
import AdvicePage from '../views/AdvicePage.vue'
import PhotosPage from '../views/PhotosPage.vue'
import LoginPage from '../views/LoginPage.vue'
import { isUserLoggedIn } from '../services/authService'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomePage
    },
    {
      path: '/compare',
      name: 'compare',
      component: ComparePage
    },
    {
      path: '/advice',
      name: 'advice',
      component: AdvicePage
    },
    {
      path: '/photos',
      name: 'photos',
      component: PhotosPage
    },
    {
      path: '/login',
      name: 'login',
      component: LoginPage
    }
  ]
})

// 全局路由守衛
router.beforeEach((to, from, next) => {
  // 檢查該路由是否需要登入
  if (to.matched.some(record => record.meta.requiresAuth)) {
    // 如果需要登入但用戶未登入，重定向到登入頁面
    if (!isUserLoggedIn()) {
      next({
        path: '/login',
        query: { redirect: to.fullPath }
      });
    } else {
      next(); // 用戶已登入，正常導航
    }
  } else {
    next(); // 不需要登入，正常導航
  }
});

export default router
