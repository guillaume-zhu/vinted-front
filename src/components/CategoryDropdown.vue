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
const categoryImages = {
  // 🌸 Femmes
  'femmes-vetements': '/images/categories/femmes-vetements.png',
  'femmes-chaussures': '/images/categories/femmes-chaussures.png',
  'femmes-sacs': '/images/categories/femmes-sacs.png',
  'femmes-accessoires': '/images/categories/femmes-accessoires.png',
  'femmes-beaute': '/images/categories/femmes-beaute.png',

  // 🧔 Hommes
  'hommes-vetements': '/images/categories/hommes-vetements.png',
  'hommes-chaussures': '/images/categories/hommes-chaussures.png',
  'hommes-accessoires': '/images/categories/hommes-accessoires.png',
  'hommes-soins': '/images/categories/hommes-soins.png',

  // 👶 Enfants
  'enfants-filles': '/images/categories/enfants-filles.png',
  'enfants-garcons': '/images/categories/enfants-garcons.png',
  'enfants-jouets': '/images/categories/enfants-jouets.png',
  'enfants-soinsBebe': '/images/categories/enfants-soins-bebe.png',
  'enfants-poussettes': '/images/categories/enfants-poussettes.png',
  'enfants-porteursTrotteursJouetsBascule':
    '/images/categories/enfants-porteurs-trotteurs-et-jouets-a-bascule.png',
  'enfants-chaisesHautesSiegeAuto': '/images/categories/enfants-chaises-hautes-et-sieges-auto.png',
  'enfants-mobilier': '/images/categories/enfants-mobilier.png',
  'enfants-scolarite': '/images/categories/enfants-scolarite.png',
  'enfants-autres': '/images/categories/enfants-autres.png',

  // 🏠 Maison
  'maison-textiles': '/images/categories/maison-textiles.png',
  'maison-decoration': '/images/categories/maison-decoration.png',
  'maison-artsTable': '/images/categories/maison-arts-de-la-table.png',
  'maison-celebrationFetes': '/images/categories/maison-celebrations-et-fetes.png',
}

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

const closeAllMenus = () => {
  for (const key in openStates.value) {
    openStates.value[key] = false
  }
  aboutOpen.value = false
}

// Requete pour récupérer les catégories
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
    // console.log('categories.value ---->', categories.value)

    // Initialiser openStates
    categories.value.forEach((cat) => {
      openStates.value[cat.attributes.name] = false
    })

    // console.log('openStates', openStates.value)
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
      <span class="text-md">{{ cat.attributes.displayName }}</span>

      <transition name="fade">
        <div
          v-if="openStates[cat.attributes.name]"
          class="dropdown-category"
          :ref="(el) => (dropdownRefs[cat.attributes.name] = el)"
        >
          <div class="dropdown-category__container container">
            <!-- Colonne gauche -->
            <ul class="dropdown-category__left">
              <li class="voir-tout">
                <RouterLink
                  :to="{ name: 'catalog', params: { id: cat.id } }"
                  @click.stop
                  @click="closeAllMenus"
                >
                  <div class="dropdown-category__left-icon-sub">
                    <img
                      src="/images/categories/voir-tout.png"
                      alt="Icônes de sous-catégorie voir tout"
                      class="dropdown-category__left-icon"
                    />
                    <strong>Voir tout</strong>
                  </div>
                </RouterLink>
              </li>

              <li
                v-for="sub in cat.attributes.children.data"
                :key="sub.id"
                @click.stop="selectSubCategory(cat.attributes.name, sub)"
                :class="{ active: activeSubCategoryByRoot[cat.attributes.name]?.id === sub.id }"
              >
                <div class="dropdown-category__left-icon-sub">
                  <img
                    :src="categoryImages[sub.attributes.name]"
                    alt="Icône de sous-caégorie"
                    v-if="categoryImages[sub.attributes.name]"
                    class="dropdown-category__left-icon"
                  />
                  {{ sub.attributes.displayName }}
                </div>
                <font-awesome-icon
                  :icon="['fas', 'chevron-right']"
                  :class="{ active: activeSubCategoryByRoot[cat.attributes.name]?.id === sub.id }"
                />
              </li>
            </ul>

            <!-- Colonne droite -->
            <ul
              class="dropdown-category__right"
              v-if="
                activeSubCategoryByRoot[cat.attributes.name]?.attributes?.children?.data?.length
              "
            >
              <li class="voir-tout">
                <RouterLink
                  :to="{
                    name: 'catalog',
                    params: { id: activeSubCategoryByRoot[cat.attributes.name].id },
                  }"
                  @click.stop
                  @click="closeAllMenus"
                >
                  <strong>Voir tout</strong>
                </RouterLink>
              </li>

              <li
                v-for="child in activeSubCategoryByRoot[cat.attributes.name].attributes.children
                  .data"
                :key="child.id"
              >
                <RouterLink
                  :to="{ name: 'catalog', params: { id: child.id } }"
                  @click="closeAllMenus"
                >
                  {{ child.attributes.displayName }}
                </RouterLink>
              </li>
            </ul>
          </div>
        </div>
      </transition>
    </div>

    <!-- À propos -->
    <div class="nav-item about-trigger text-md" @click="toggleAbout">
      À propos

      <transition name="fade">
        <div v-if="aboutOpen" class="dropdown-category">
          <div class="dropdown-category__container container dropdown-category__about">
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
/* DESKTOP ----------------------------------------- */

/* HEADER NAV ----------------------------- */
.header-nav {
  /* border: 1px solid green; */
  height: var(--header-nav-height);
  display: flex;
  justify-content: flex-start;
}

.nav-item {
  position: relative;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0px 16px 0px 16px;
  background-color: white;
  transition: background-color 0.3s;
  color: var(--color-gray);
}

.nav-item:hover {
  background-color: var(--color-light);
  border-bottom: 2px solid var(--color-primary);
  color: var(--color-black);
}

/* DROPDOWN NAV */
.dropdown-category {
  position: fixed;
  top: calc(var(--header-main-height) + var(--header-nav-height));
  left: 0;
  background-color: white;
  width: 100vw;
  z-index: 1000;
}

.dropdown-category__container {
  display: flex;
  background: white;
  padding: 20px;
  border: 1px solid red;
}

.dropdown-category li {
  font-size: var(--font-h2);
  color: var(--color-gray);
  border: 1px solid red;
  padding: 20px 10px;
  border-radius: 3px;
  background-color: white;
  transition: background-color 0.3s;
  height: 50px;
  display: flex;
  align-items: center;
  line-height: var(--line-height-body);
  overflow: hidden;
}

.dropdown-category li:hover {
  background-color: var(--color-light);
}

.dropdown-category li:hover a {
  color: var(--color-black);
  font-weight: var(--font-weight-medium);
}

/* .dropdown-category__right {
  padding-left: 20px;
  display: grid;
  grid-template-columns: repeat(2, minmax(100px, 1fr));
  gap: 0px 20px;
} */

.dropdown-category__right {
  column-count: 2;
  /* column-gap: 20px; */
  border: 1px solid peru;
  width: 700px;
}

.dropdown-category__right li {
  max-width: 350px;
  break-inside: avoid-column;
}

.dropdown-category a {
  text-decoration: none;
  color: var(--color-gray);
  font-weight: var(--font-weight-light);
}

.dropdown-category__left {
  width: 350px;
  padding-right: 20px;
  list-style: none;
  border-right: 1px solid #eee;
}

.dropdown-category__left-icon-sub {
  display: flex;
  justify-content: center;
  align-items: center;
}
.dropdown-category__left-icon {
  height: 23px;
  margin-right: 10px;
}

.dropdown-category__left li {
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.dropdown-category__left li.active {
  font-weight: var(--font-weight-medium);
  background-color: var(--color-light);
  color: var(--color-black);
}

.dropdown-category__left li svg {
  display: none;
  color: var(--color-gray);
  font-size: 14px;
  margin-left: 5px;
}

.dropdown-category__left li svg.active {
  display: inline;
}

/* ABOUT */
.dropdown-category__about {
  display: flex;
  gap: 40px;
  padding: 20px 20px;
  width: 100vw;
}

.about-column {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.about-column > ul > li {
  width: 250px;
}

.about-column strong {
  margin-bottom: 6px;
  font-size: 0.9rem;
  font-weight: bold;
}

/* RESPONSIVE STYLES -------------------------- */

/* 1200px ---------------------- */
@media (max-width: 1200px) {
}
/* 960px ----------------------- */

/* 720px ----------------------- */
</style>
