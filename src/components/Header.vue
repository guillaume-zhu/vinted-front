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
        <label for="searchbar">Articles</label>
        <input type="text" name="searchbar" id="searchbar" />
      </div>

      <!-- BOUTONS ------------------------------->
      <div class="header-main__buttons">
        <!-- SI NON CONNECTÉ -->
        <RouterLink :to="{ name: 'login' }" v-if="!GlobalStore.userInfoCookie.value">
          <button>S'inscrire | Se connecter</button>
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

        <RouterLink :to="{ name: 'sell' }"> <button>Vends tes articles</button></RouterLink>

        <div class="header-main__help"><span>?</span></div>
      </div>
    </div>

    <!-- NAV LINKS -->
    <CategoryDropdown />
  </header>
</template>

<style scoped>
/* HEADER BASE ------------------------------------------------*/
header {
  height: var(--header-height);
  max-width: 100vw;
  /* border: 1px solid black;  */
  /* margin-bottom: 1000px; */
}

/* HEADER MAIN --------------------------*/
.header-main {
  border: 1px solid blue;
  height: var(--header-main-height);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* HEADER BUTTONS & LOG --------*/
.header-main__buttons {
  display: flex;
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

/* HEADER PROFILE DROPDOWN */

.header-main__profile-container {
  position: relative;
  background-color: red;
  display: flex;
}

.header-main__dropdown {
  position: absolute;
  top: 50px;
  border: 1px solid red;
  background-color: white;
  z-index: 1000;
}

.header-main__dropdown ul {
  list-style: none;
}

.header-main__dropdown li {
  padding: 10px;
  cursor: pointer;
  transition: background-color 0.3s;
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

/* HEADER NAV ----------------------------- */

.header-nav {
  border: 1px solid red;
  height: var(--header-nav-height);
  display: flex;
  gap: 20px;
}
</style>
