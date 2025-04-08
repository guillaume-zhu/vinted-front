<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import axios from 'axios'
import { RouterLink } from 'vue-router'

/////////// CATEGORY DROPDOWN MENU
const openStates = ref({})
const categoryRefs = ref({})
const dropdownRefs = ref({})
const categories = ref([])
const activeSubCategoryByRoot = ref({})

const toggleCategory = (cat) => {
  // Fermer le menu "À propos"
  aboutOpen.value = false
  // Fermer les autres menus
  for (const key in openStates.value) {
    openStates.value[key] = false
  }

  // Ouvrir ou fermer celui cliqué
  openStates.value[cat] = true

  // Trouver la catégorie correspondante
  const root = categories.value.find((c) => c.attributes.name === cat)
  if (root?.attributes?.children?.data?.length) {
    // Sélectionner la 1ere sous catégorie automatiquement
    activeSubCategoryByRoot.value[cat] = root.attributes.children.data[0]
  }
}

const selectSubCategory = (cat, sub) => {
  // si on clique sur le même = rien
  if (activeSubCategoryByRoot.value[cat]?.id === sub.id) return

  // sinon actualiser
  activeSubCategoryByRoot.value[cat] = sub
}

const handleClickOutside = (event) => {
  for (const key in openStates.value) {
    const catRef = categoryRefs.value[key]
    const dropdownRef = dropdownRefs.value[key]

    if (
      dropdownRef &&
      !dropdownRef.contains(event.target) &&
      catRef &&
      !catRef.contains(event.target)
    ) {
      openStates.value[key] = false
    }
  }

  // Fermer le menu "À propos" si clic en dehors
  const aboutRef = document.querySelector('.about-dropdown')
  const aboutTrigger = document.querySelector('.about-trigger')

  if (
    aboutOpen.value &&
    aboutRef &&
    !aboutRef.contains(event.target) &&
    aboutTrigger &&
    !aboutTrigger.contains(event.target)
  ) {
    aboutOpen.value = false
  }
}

// Requete pour récupérer les catégories
onMounted(async () => {
  try {
    const response = await axios.get(
      `http://localhost:1337/api/categories/?filters[categoryLevel][$eq]=level1&populate[children][populate]=children`,
    )

    categories.value = response.data.data.filter(
      (cat) => !['electronique', 'divertissement'].includes(cat.attributes.name),
    )
    console.log('categories.value ---->', categories.value)

    // Initialiser openStates
    categories.value.forEach((cat) => {
      openStates.value[cat.attributes.name] = false
    })

    console.log('openStates', openStates.value)
  } catch (error) {
    console.log('Erreur lors du chargement des catégories', error)
  }
})

// Event pour ajouter et supprimer evenement click après montage et après destruction du composant
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

// Menu supplémentaire about
const aboutOpen = ref(false)

const toggleAbout = () => {
  // Fermer tous les autres
  for (const key in openStates.value) {
    openStates.value[key] = false
  }
  aboutOpen.value = !aboutOpen.value
}

// Données pour le menu "À propos"
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
</script>

<template>
  <div class="header-nav container">
    <div
      v-for="cat in categories"
      :key="cat.id"
      class="nav-item"
      @click="toggleCategory(cat.attributes.name)"
      :ref="(el) => (categoryRefs[cat.attributes.name] = el)"
    >
      {{ cat.attributes.displayName }}

      <transition name="fade">
        <div
          v-if="openStates[cat.attributes.name]"
          class="dropdown-category"
          :ref="(el) => (dropdownRefs[cat.attributes.name] = el)"
        >
          <div class="dropdown-category__container">
            <!-- Colonne gauche -->
            <ul class="dropdown-category__left">
              <li
                v-for="sub in cat.attributes.children.data"
                :key="sub.id"
                @click.stop="selectSubCategory(cat.attributes.name, sub)"
                :class="{ active: activeSubCategoryByRoot[cat.attributes.name]?.id === sub.id }"
              >
                {{ sub.attributes.displayName }}
              </li>
            </ul>

            <!-- Colonne droite -->
            <ul
              class="dropdown-category__right"
              v-if="
                activeSubCategoryByRoot[cat.attributes.name]?.attributes?.children?.data?.length
              "
            >
              <li
                v-for="child in activeSubCategoryByRoot[cat.attributes.name].attributes.children
                  .data"
                :key="child.id"
              >
                <RouterLink :to="{}">
                  {{ child.attributes.displayName }}
                </RouterLink>
              </li>
            </ul>
          </div>
        </div>
      </transition>
    </div>

    <!-- À propos -->
    <div class="nav-item about-trigger" @click="toggleAbout">
      À propos

      <transition name="fade">
        <div v-if="aboutOpen" class="dropdown-category about-dropdown">
          <div class="dropdown-category__container about">
            <div class="about-column" v-for="(group, index) in aboutLinks" :key="index">
              <strong>{{ group.title }}</strong>
              <ul>
                <li v-for="(item, i) in group.items" :key="i">{{ item }}</li>
              </ul>
            </div>
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>

<style scoped>
/* DROPDOWN NAV */

.nav-item {
  position: relative;
}

.dropdown-category {
  position: absolute;
  top: 100%;
  left: 0;
  background-color: white;
  z-index: 1000;
}

.dropdown-category__container {
  display: flex;
  background: white;
  padding: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.dropdown-category__left {
  width: 200px;
  padding-right: 20px;
  list-style: none;
  border-right: 1px solid #eee;
}

.dropdown-category__right {
  list-style: none;
  padding-left: 20px;
  display: grid;
  grid-template-columns: repeat(2, minmax(100px, 1fr));
  gap: 10px 20px;
}

.dropdown-category__left li {
  padding: 8px 0;
  cursor: pointer;
}

.dropdown-category__left li.active {
  font-weight: bold;
  background-color: #f5f5f5;
}

/* ABOUT */

.dropdown-category__container.about {
  display: flex;
  gap: 40px;
  padding: 20px 40px;
}

.about-column {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.about-column strong {
  margin-bottom: 6px;
  font-size: 0.9rem;
  font-weight: bold;
}
</style>
