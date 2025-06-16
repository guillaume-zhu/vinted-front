<script setup>
import { RouterLink, useRouter } from 'vue-router'
import { computed, inject, watchEffect } from 'vue'
import { ref, onMounted, onUnmounted } from 'vue'
import axios from 'axios'
import CategoryDropdown from './CategoryDropdown.vue'

const router = useRouter()
const GlobalStore = inject('GlobalStore')
console.log('is connected ? global userInfoCookie ---->', GlobalStore.userInfoCookie.value)

/////////// AVATAR DROPDOWN MENU
// Etat du menu déroulant
const isOpen = ref(false)

// Références pour détecter les clics extérieurs
const avatarRef = ref(null)
const menuRef = ref(null)

// SaerchInput
const searchTerm = ref(null)
const OnSearch = () => {
  if (!searchTerm.value.trim()) {
    return
  }
  router.push({ name: 'search', query: { q: searchTerm.value.trim(), page: 1 } })
}

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

// Ajouter un écouteur global pour fermer menu quand on clique ailleurs
onMounted(() => {
  document.addEventListener('click', closeMenu)
})

// Retirer l'écouter quand le composant est détruit
onUnmounted(() => {
  document.removeEventListener('click', closeMenu)
})
</script>

<template>
  <header>
    <div class="header-main container">
      <!-- LOGO ---------------------------------->
      <RouterLink :to="{ name: 'home' }">
        <img src="./../assets/img/logo.svg" alt="" />
      </RouterLink>

      <!-- SEARCHBAR ----------------------------->
      <div class="header-main__search-group">
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

      <!-- BOUTONS ------------------------------->
      <div class="header-main__buttons">
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

    <!-- NAV LINKS -->
    <div class="header-bot">
      <CategoryDropdown />
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
  /* border: 1px solid blue; */
  height: var(--header-main-height);
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 50px;
  padding: 7px 0px 7px 0px;
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

/* HEADER BOT --------------------------*/
.header-bot {
  border: 2px solid var(--color-light);
}
</style>
