<script setup>
import { RouterLink, useRouter, useRoute } from 'vue-router'
import { computed, inject, watchEffect } from 'vue'
import { ref, onMounted, onUnmounted } from 'vue'
import axios from 'axios'
import CategoryDropdown from './CategoryDropdown.vue'

// ----------------------------------------------
// 📄 PROPS / ROUTER / BASE VARIABLES
// ----------------------------------------------

const router = useRouter()
const route = useRoute()
const GlobalStore = inject('GlobalStore')
console.log('is connected ? global userInfoCookie ---->', GlobalStore.userInfoCookie.value)

// ----------------------------------------------
// 🎯 HEADER VARIABLES
// ----------------------------------------------

// 1. Dropdown menu
const isOpen = ref(false)

// Références pour détecter les clics extérieurs
const avatarRef = ref(null)
const menuRef = ref(null)

// 2. SearchInput
const searchTerm = ref(null)
const OnSearch = () => {
  if (!searchTerm.value.trim()) {
    return
  }
  router.push({ name: 'search', query: { q: searchTerm.value.trim(), page: 1 } })
}

// 3. Responsive burger menu
const isBurgerMenuOpen = ref(false)
const categories = ref(null)
const categoryImages = {
  femmes: '/images/categories/femmes.png',
  hommes: '/images/categories/hommes.png',
  enfants: '/images/categories/enfants.png',
  maison: '/images/categories/maison.png',
}

// 4. À propos
const aboutLinks = [
  {
    title: 'Découvrir',
    items: [
      'Comment ça marche ?',
      "Vérification de l'article",
      'Applications mobiles',
      "Centre d'aide",
      'Tableau de bord',
      'Vinted Pro',
      'Guide Vinted Pro',
    ],
  },
  {
    title: 'Politiques',
    items: [
      'Confiance et Sécurité',
      'Politique de Confidentialité',
      'Termes et Conditions',
      'Politique de cookies',
      'Pro Terms and Conditions',
    ],
  },
  {
    title: 'Vie privée',
    items: ['Paramètres des cookies'],
  },
  {
    title: 'Entreprise',
    items: ['À propos de Vinted', 'Carrière', 'Éco-responsabilité', 'Presse', 'Publicités'],
  },
]

// ----------------------------------------------
// ⚙️ FUNCTIONS / HELPERS
// ----------------------------------------------

// 1. Open / Close dropdown menu

// Fonction pour ouvrir / fermer le menu
const toggleMenu = () => {
  isOpen.value = !isOpen.value
}

// Fonction de navigation qui ferme le menu après un clic
const navigate = (route) => {
  if (route === 'settings') {
    router.push({ name: route })
  } else if (route === 'profile') {
    router.push({ name: route, params: { id: GlobalStore.userInfoCookie.value.id } })
  }
  isOpen.value = false
}

// Fonction pour fermer le menu si on clique dehors
const closeMenu = (event) => {
  if (
    menuRef.value &&
    !menuRef.value.contains(event.target) &&
    avatarRef.value &&
    !avatarRef.value.contains(event.target)
  ) {
    isOpen.value = false
  }
}

// 2. Navigate

const goToCatalog = (id) => {
  router.push({ name: 'catalog', params: { id } })
}

// ----------------------------------------------
// 🚀 HOOKS / API REQUEST
// ----------------------------------------------
onMounted(async () => {
  try {
    const response = await axios.get(
      `http://localhost:1337/api/categories/?filters[categoryLevel][$eq]=level1&populate[children][populate]=children`,
    )

    const desiredOrder = ['femmes', 'hommes', 'enfants', 'maison']

    const filtered = response.data.data.filter(
      (cat) => !['electronique', 'divertissement'].includes(cat.attributes.name),
    )

    categories.value = desiredOrder
      .map((name) => filtered.find((cat) => cat.attributes.name === name))
      .filter(Boolean)

    console.log('categories.value ---->', categories.value)
  } catch (error) {
    console.log('Erreur lors du chargement des catégories', error)
  }
})

onMounted(() => {
  document.addEventListener('click', closeMenu)
})

onUnmounted(() => {
  document.removeEventListener('click', closeMenu)
})
</script>

<template>
  <header>
    <div class="header-main container">
      <!-- LOGO ---------------------------------->
      <RouterLink :to="{ name: 'home' }">
        <img src="./../assets/img/logo.svg" alt="" class="desktop-only medium-only" />
        <img src="./../assets/img/logo-mono.svg" alt="" class="small-only logo-mono" />
      </RouterLink>

      <!-- SEARCHBAR ----------------------------->
      <div class="header-main__search-group desktop-only">
        <div class="header-main__search-label">
          <label for="searchbar">Articles</label>
        </div>

        <div class="header-main__search-input">
          <font-awesome-icon :icon="['fas', 'search']" />
          <input
            type="text"
            name="searchbar"
            id="searchbar"
            @keydown.enter="OnSearch"
            placeholder="Rechercher des articles"
            v-model="searchTerm"
            class="text-lg"
          />
          <font-awesome-icon :icon="['fas', 'times']" v-if="searchTerm" @click="searchTerm = ''" />
        </div>
      </div>

      <!-- RESPONSIVE MENU ------------------------>
      <!-- BURGER -->
      <div
        class="header-main__responsive-burger medium-only"
        @click="isBurgerMenuOpen = true"
        v-if="!isBurgerMenuOpen"
      >
        <font-awesome-icon :icon="['fas', 'bars']" />
      </div>
      <div
        class="header-main__responsive-burger medium-only"
        @click="isBurgerMenuOpen = false"
        v-if="isBurgerMenuOpen"
      >
        <font-awesome-icon :icon="['fas', 'times']" />
      </div>

      <!-- MENU -->
      <div class="header-main__responsive-menu medium-only small-only" v-if="isBurgerMenuOpen">
        <!-- BUTTONS -->
        <div class="responsive-menu__buttons">
          <RouterLink :to="{ name: 'sell' }">
            <button class="btn--secondary">Vends tes articles</button>
          </RouterLink>

          <!-- SI NON CONNECTÉ -->
          <RouterLink :to="{ name: 'login' }" v-if="!GlobalStore.userInfoCookie.value">
            <button class="btn--primary">S'inscrire | Se connecter</button>
          </RouterLink>
        </div>

        <!-- NAV LINKS -->
        <div class="responsive-menu__category">
          <div>
            <span class="text-md">Parcourir</span>
          </div>
          <ul>
            <li v-for="category in categories">
              <RouterLink :to="{ name: 'catalog', params: { id: category.id } }">
                <img :src="categoryImages[category.attributes.name]" alt="Icône de catégorie" />
                <span class="text-lg">{{ category.attributes.displayName }}</span>
              </RouterLink>
            </li>
          </ul>
        </div>

        <!-- SI CONNECTÉ -->
        <div class="responsive-menu__category" v-if="GlobalStore.userInfoCookie.value">
          <div>
            <span class="text-md">Mon compte</span>
          </div>
          <ul class="responsive-menu__account">
            <li @click="navigate('profile')"><span>Mon profil</span></li>
            <li @click="navigate('settings')"><span>Mes paramètres</span></li>
            <li
              @click="
                () => {
                  isOpen = false
                  GlobalStore.logOut()
                }
              "
            >
              <span>Se déconnecter</span>
            </li>
          </ul>
        </div>

        <!-- A PROPOS -->
        <div class="responsive-menu__category" v-for="(group, index) in aboutLinks" :key="index">
          <div>
            <span class="text-md">{{ group.title }}</span>
          </div>
          <ul class="responsive-menu__discover">
            <li v-for="(item, i) in group.items" :key="i">
              <span class="text-lg">{{ item }}</span>
            </li>
          </ul>
        </div>
      </div>

      <!-- BOUTONS ------------------------------->
      <div class="header-main__buttons desktop-only">
        <!-- SI NON CONNECTÉ -->
        <RouterLink :to="{ name: 'login' }" v-if="!GlobalStore.userInfoCookie.value">
          <button class="btn--primary">S'inscrire | Se connecter</button>
        </RouterLink>

        <!-- SI CONNECTÉ --------------->
        <div class="header-main__profile-container" v-else-if="GlobalStore.userInfoCookie.value">
          <!-- Avatar utilisateur -->
          <div class="header-main__avatar" @click="toggleMenu" ref="avatarRef">
            <img
              :src="GlobalStore.avatarUrl.value"
              :key="GlobalStore.avatarUrl.value"
              alt="Avatar utilisateur"
            />
          </div>
        </div>

        <!-- Menu déroulant -->
        <transition name="fade">
          <div v-if="isOpen" class="header-main__dropdown" ref="menuRef">
            <ul>
              <li @click="navigate('profile')">Mon profil</li>
              <li @click="navigate('settings')">Mes paramètres</li>
              <li
                @click="
                  () => {
                    isOpen = false
                    GlobalStore.logOut()
                  }
                "
              >
                Se déconnecter
              </li>
            </ul>
          </div>
        </transition>

        <RouterLink :to="{ name: 'sell' }">
          <button class="btn--secondary">Vends tes articles</button></RouterLink
        >

        <div class="header-main__help"><span class="text-md">?</span></div>
      </div>
    </div>

    <div class="header__separator"></div>

    <!-- HEADER BOT --------------->
    <div class="header-bot">
      <!-- RESPONSIVE SEARCHBAR -->
      <div class="header-main__search-group search-group--responsive hidden medium-only">
        <div class="header-main__search-label">
          <label for="searchbar">Articles</label>
        </div>

        <div class="header-main__search-input">
          <font-awesome-icon :icon="['fas', 'search']" />
          <input
            type="text"
            name="searchbar"
            id="searchbar"
            @keydown.enter="OnSearch"
            placeholder="Rechercher des articles"
            v-model="searchTerm"
            class="text-lg"
          />
          <font-awesome-icon :icon="['fas', 'times']" v-if="searchTerm" @click="searchTerm = ''" />
        </div>
      </div>

      <!-- CATALOG LINKS -->
      <CategoryDropdown class="category-dropdown" />

      <!-- RESPONSIVE CATALOG LINKS -->
      <div class="medium-only header-bot__catalog-nav">
        <div
          class="ds-filter-btn"
          :class="{ activeBtn: String(category.id) === route.params.id }"
          v-for="category in categories"
          :key="category.id"
          @click="goToCatalog(category.id)"
        >
          <span>{{ category.attributes.displayName }}</span>
        </div>
      </div>
    </div>
  </header>
</template>

<style scoped>
/* HEADER BASE ------------------------------------------------*/
header {
  height: var(--header-height);
  width: 100vw;
  position: fixed;
  top: 0;
  z-index: 1000;
  background-color: white;
}

/* HEADER MAIN --------------------------*/
.header-main {
  height: var(--header-main-height);
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 50px;
  padding: 7px 16px 7px 16px;
}

.header-main > a > img {
  width: 73px;
  object-fit: contain;
}

/* HEADER SEARCHBAR -------*/
.header-main__search-group {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
}

.header-main__search-group svg {
  color: var(--color-gray);
}

/* LABEL */
.header-main__search-label {
  background-color: var(--color-light);
  height: 100%;
  width: 100px;
  border-radius: var(--radius) 0px 0px var(--radius);
  display: flex;
  justify-content: center;
  align-items: center;
  border-right: 0.5px solid var(--color-gray);
}

.header-main__search-label > label {
  font-size: var(--font-span-md);
  color: var(--color-gray);
}

/* INPUT */
.header-main__search-input {
  width: 100%;
  height: 100%;
  border-radius: 0px var(--radius) var(--radius) 0px;
  background-color: var(--color-light);
  border: none;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 0px 12px 0px 12px;
}

.header-main__search-input > input {
  border: none;
  background: none;
  font: inherit;
  outline: none;
  color: var(--color-black);
  font-weight: 375;
  width: 100%;
}

/* HEADER BUTTONS & LOG */
.header-main__buttons {
  display: flex;
  align-items: center;
  /* border: 1px solid red; */
  gap: 10px;
  height: 100%;
}

.header-main__buttons a {
  height: 100%;
  display: flex;
  align-items: center;
  text-decoration: none;
}

.header-main__buttons button {
  border-radius: var(--radius);
  white-space: nowrap;
  width: fit-content;
  padding: 6px 12px;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.btn--primary {
  background-color: white;
  color: var(--color-primary);
  border: 1px solid var(--color-primary);
}

.btn--secondary {
  background-color: var(--color-primary);
  border: none;
  color: white;
}

.header-main__buttons img {
  height: 30px;
  width: 30px;
  object-fit: cover;
  border-radius: 50px;
  cursor: pointer;
}

.header-main__avatar {
  display: flex;
  justify-content: center;
  align-items: center;
}

.header-main__help {
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1.5px solid var(--color-gray);
  width: 20px;
  height: 20px;
  border-radius: 50px;
  padding: 5px;
  color: var(--color-gray);
}

/* HEADER PROFILE DROPDOWN */

.header-main__profile-container {
  position: relative;
  /* background-color: red; */
  display: flex;
}

.header-main__dropdown {
  position: absolute;
  top: 50px;
  /* border: 1px solid red; */
  background-color: white;
  z-index: 1000;
}

.header-main__dropdown ul {
  list-style: none;
}

.header-main__dropdown li {
  padding: 12px;
  cursor: pointer;
  transition: background-color 0.3s;
  font-size: 15px;
  color: var(--color-gray);
}

.header-main__dropdown li:hover {
  background-color: #f0f0f0;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter,
.fade-leave-to {
  opacity: 0;
}
/* HEADER SEPARATOR ------------------- */
.header__separator {
  border-bottom: 1px solid var(--color-light);
}
/* HEADER BOT --------------------------*/
.header-bot {
  background-color: white;
}

/* RESPONSIVE STYLES -------------------------- */
.hidden {
  display: none;
}

/* 1200px ---------------------- */
@media (max-width: 1200px) {
  header {
    /* background-color: red; */
  }
}

/* 960px ----------------------- */
@media (max-width: 960px) {
  header {
    /* background-color: #8a2be2; */
  }
  .header-main__search-group,
  .header-main__buttons,
  .category-dropdown {
    display: none;
  }

  .header-main {
    padding: 7px 16px 7px 16px;
  }

  /* RESPONSIVE MENU -----*/
  .header-main__responsive-burger {
    background-color: white;
    height: 100%;
    aspect-ratio: 1/1;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: var(--radius);
  }

  .header-main__responsive-burger:hover {
    background-color: var(--color-light);
  }

  .header-main__responsive-menu {
    border: 1px solid green;
    position: fixed;
    background-color: white;
    width: 100vw;
    height: calc(100vh - var(--header-main-height));
    left: 0;
    top: var(--header-main-height);
    z-index: 1000;
    overflow-y: auto;
  }

  /* BUTTONS */
  .responsive-menu__buttons {
    padding: 16px;
  }

  .responsive-menu__buttons button {
    width: 100%;
    height: 44px;
    padding: 6px 16px;
    border-radius: var(--radius);
    font-size: 16px;
    margin-bottom: 10px;
  }

  /* NAV LINKS */
  .responsive-menu__category > div {
    border-top: 1px solid var(--color-light);
    margin-top: 10px;
    padding: 24px 24px 8px 24px;
  }

  .responsive-menu__category li {
    /* border: 1px solid red; */
  }

  .responsive-menu__category a,
  .responsive-menu__account > li,
  .responsive-menu__discover > li {
    text-decoration: none;
    display: flex;
    align-items: center;
    padding: 16px;
    background-color: white;
    transition: background-color 0.3s;
  }

  .responsive-menu__category a:hover,
  .responsive-menu__account > li:hover,
  .responsive-menu__discover > li:hover {
    background-color: var(--color-light);
  }

  .responsive-menu__category img {
    width: 24px;
    height: 24px;
    margin-right: 10px;
  }

  .responsive-menu__category .text-lg,
  .responsive-menu__category .text-md {
    color: var(--color-gray);
    font-weight: var(--font-weight-light);
  }

  /* ACCOUNT MENU */
  .responsive-menu__account > li > span {
    color: var(--color-gray);
    font-weight: var(--font-weight-light);
  }

  /* HEADER BOT -----*/
  .header-bot {
    padding: 8px 16px 8px 16px;
  }

  /* SEARCHBAR */
  .search-group--responsive {
    display: flex;
    height: 36px;
  }

  /* FILTER BTN */
  .header-bot__catalog-nav {
    display: flex;
    gap: 10px;
    margin-top: 6px;
  }
}

/* 720px ----------------------- */
@media (max-width: 720px) {
  header {
    /* background-color: pink; */
  }
  .header-main,
  .header-bot {
    padding: 7px 10px 7px 10px;
  }
}
</style>
