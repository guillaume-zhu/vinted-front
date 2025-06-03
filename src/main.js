import './assets/main.css'

import { computed, createApp, onMounted, watchEffect } from 'vue'
import App from './App.vue'
import router from './router'
import { ref } from 'vue'
import VueCookies from 'vue-cookies'

import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

import {
  faArrowLeft,
  faCheckCircle,
  faChevronDown,
  faChevronLeft,
  faChevronRight,
  faChevronUp,
  faMapMarkerAlt,
  faPen,
  faPlus,
  faSearch,
  faShieldAlt,
  faTimes,
} from '@fortawesome/free-solid-svg-icons'
import { faFacebookSquare, faInstagram, faLinkedin } from '@fortawesome/free-brands-svg-icons'
import { faEye, faEyeSlash } from '@fortawesome/free-regular-svg-icons'

library.add(
  faChevronRight,
  faChevronLeft,
  faFacebookSquare,
  faLinkedin,
  faInstagram,
  faEye,
  faEyeSlash,
  faMapMarkerAlt,
  faPen,
  faShieldAlt,
  faChevronLeft,
  faChevronRight,
  faTimes,
  faMapMarkerAlt,
  faCheckCircle,
  faChevronDown,
  faChevronUp,
  faPlus,
  faArrowLeft,
  faSearch,
)

const app = createApp(App).component('font-awesome-icon', FontAwesomeIcon)

app.use(VueCookies, { expires: '1d' })

////////////////////////// GlobalStore
///// Variables
const userInfoCookie = ref($cookies.get('userToken') || '')

// Actualisation de la ref contenant le cookie
const updateInfoCookie = () => {
  userInfoCookie.value = $cookies.get('userToken') || ''
}

// Création cookie / Connexion
const setUserInfoCookie = (token, id, username, avatarUrl) => {
  const userInfo = { token: token, id: id, username: username, avatarUrl: avatarUrl }
  $cookies.set('userToken', userInfo)
}

// Suppression cookie / Déconnexion
const logOut = () => {
  $cookies.remove('userToken')
  updateInfoCookie()
  router.push('home')
}

// Définir l'url si avatar existant
import userProfileImg from '@/assets/img/user-profile.webp'

const avatarUrl = computed(() => {
  // Si cookie existe et contient avatarUrl
  if (userInfoCookie.value && userInfoCookie.value.avatarUrl) {
    return userInfoCookie.value.avatarUrl

    // Sinon retourner l'image par défaut
  } else {
    return userProfileImg
  }
})

app.provide('GlobalStore', {
  userInfoCookie,
  setUserInfoCookie,
  updateInfoCookie,
  logOut,
  avatarUrl,
})

app.use(router)

app.mount('#app')
