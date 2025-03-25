import { createRouter, createWebHistory } from 'vue-router'
import { inject } from 'vue'
import HomeView from '@/views/HomeView.vue'
import LoginView from '@/views/LoginView.vue'
import ProfileView from '@/views/ProfileView.vue'
import SettingsView from '@/views/SettingsView.vue'
import AccountView from '@/views/AccountView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
    },
    {
      path: '/profile',
      name: 'profile',
      component: ProfileView,
      meta: { requireAuth: true },
    },
    {
      path: '/settings',
      name: 'settings',
      component: SettingsView,
      meta: { requireAuth: true },
    },
    {
      path: '/account',
      name: 'account',
      component: AccountView,
      meta: { requireAuth: true },
    },
  ],
})

// NAVIGATION GUARD
router.beforeEach((to, from) => {
  const GlobalStore = inject('GlobalStore')
  if (to.meta.requireAuth && !GlobalStore.userInfoCookie.value) {
    return { name: 'login', query: { redirect: to.name } }
  }
})
export default router
