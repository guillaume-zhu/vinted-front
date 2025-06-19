import { createRouter, createWebHistory } from 'vue-router'

import HomeView from '@/views/HomeView.vue'
import LoginView from '@/views/LoginView.vue'
import ProfileView from '@/views/ProfileView.vue'
import SettingsView from '@/views/SettingsView.vue'
import AccountView from '@/views/AccountView.vue'
import PasswordView from '@/views/PasswordView.vue'
import ProductView from '@/views/ProductView.vue'
import CatalogView from '@/views/CatalogView.vue'
import SellView from '@/views/SellView.vue'
import EditView from '@/views/EditView.vue'
import CheckoutView from '@/views/CheckoutView.vue'
import SearchView from '@/views/SearchView.vue'
import DesignSystemView from '@/views/DesignSystemView.vue'

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
      path: '/profile/:id',
      name: 'profile',
      component: ProfileView,
      // meta: { requireAuth: true },
      props: true,
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
    {
      path: '/account/password',
      name: 'password',
      component: PasswordView,
      meta: { requireAuth: true },
    },
    {
      path: '/product/:id',
      name: 'product',
      component: ProductView,
      props: true,
    },
    {
      path: '/catalog/:id',
      name: 'catalog',
      component: CatalogView,
      props: true,
    },
    {
      path: '/sell',
      name: 'sell',
      component: SellView,
      meta: { requireAuth: true },
    },
    {
      path: '/edit/:id',
      name: 'edit',
      component: EditView,
      meta: { requireAuth: true },
      props: true,
    },
    {
      path: '/checkout/:id',
      name: 'checkout',
      component: CheckoutView,
      meta: { requireAuth: true },
      props: true,
    },
    {
      path: '/search',
      name: 'search',
      component: SearchView,
    },
    {
      path: '/design',
      name: 'design',
      component: DesignSystemView,
    },
  ],
  scrollBehavior(to, from, savedPosition) {
    return { top: 0 }
  },
})

// NAVIGATION GUARD
router.beforeEach((to, from) => {
  // const GlobalStore = inject('GlobalStore')
  const userToken = $cookies.get('userToken')
  if (to.meta.requireAuth && !userToken) {
    return { name: 'login', query: { redirect: to.name } }
  }
})
export default router
