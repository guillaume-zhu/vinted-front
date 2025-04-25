<script setup>
import { ref, onMounted, watchEffect, watch, computed } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import axios from 'axios'
import Breadcrumb from '@/components/Breadcrumb.vue'
import OfferCard from '@/components/OfferCard.vue'

// ----------------------------------------------
// 📄 PROPS / ROUTER / BASE VARIABLES
// ----------------------------------------------

const props = defineProps({
  id: {
    type: String,
  },
})
// console.log('main category id ---->', props.id)
const route = useRoute()
const router = useRouter()

const categoryData = ref([])
const categoryChildren = []
const isLoading = ref(false)

const offersList = ref([])
const totalPage = ref(null)
const page = ref(1)

// ----------------------------------------------
// 🎯 FILTER SYSTEM
// ----------------------------------------------

// 1. Main filters
const filters = ref({
  size: null,
  brand: null,
  condition: [],
  color: null,
  priceMin: null,
  priceMax: null,
  material: null,
  sortBy: null,
})

// 2. Main dropdown open/close state
const showDropdown = ref({
  size: false,
  brand: false,
  condition: false,
  color: false,
  price: false,
  material: false,
  sort: false,
})

// 3. Sizes
const availableSizes = ref([])

// 4. Brand input + filtered brand list
const inputBrand = ref('')
const availableBrands = ref([])
const filteredBrands = computed(() => {
  if (inputBrand.value === '') {
    return availableBrands.value.filter((b) => b.isPopular)
  } else {
    return availableBrands.value.filter((b) =>
      b.name.toLowerCase().includes(inputBrand.value.toLowerCase),
    )
  }
})

// 5. Condition
const availableConditions = ref([
  {
    name: 'Neuf avec étiquette',
    description: `Article neuf, jamais porté/utilisé avec étiquettes ou dans son emballage d’origine.`,
  },
  {
    name: 'Neuf sans étiquette',
    description: `Article neuf, jamais porté/utilisé, sans étiquettes ni emballage d’origine.`,
  },
  {
    name: 'Très bon état',
    description: `Article très peu porté/utilisé qui peut présenter de légères imperfections, mais qui reste en très bon état.`,
  },
  {
    name: 'Bon état',
    description: `Article porté/utilisé quelques fois, présentant des imperfections et des signes d’usure.`,
  },
  {
    name: 'Satisfaisant',
    description: `Article porté/utilisé plusieurs fois, présentant des imperfections et des signes d’usure.`,
  },
])

// 6. Colors
const availableColors = ref([])

// ----------------------------------------------
// ⚙️ INIT FILTERS FROM URL
// ----------------------------------------------

const initFiltersFromQuery = () => {
  filters.value.size = route.query.size || null
  filters.value.brand = route.query.brand || null
  filters.value.condition = Array.isArray(route.query.condition)
    ? route.query.condition
    : route.query.condition
      ? [route.query.condition]
      : []
  filters.value.color = Array.isArray(route.query.condition)
    ? route.query.condition
    : route.query.condition
      ? [route.query.condition]
      : []
  filters.value.priceMin = route.query.priceMin || null
  filters.value.priceMax = route.query.priceMax || null
  filters.value.material = route.query.material || null
  filters.value.sortBy = route.query.sortBy || null
}

// ----------------------------------------------
// 🔎 API FUNCTIONS FETCH
// ----------------------------------------------

const fetchSizesByCategory = async (categorySlug) => {
  try {
    const response = await axios.get(`http://localhost:1337/api/sizes/category/${categorySlug}`)

    availableSizes.value = response.data
    console.log('availableSizes ---->', availableSizes.value)
  } catch (error) {
    console.log('Erreur lors du chargement des tailles en fonction de la catégorie', error)
  }
}
const fetchBrandsByCategory = async (categorySlug) => {
  try {
    const response = await axios.get(`http://localhost:1337/api/brands/category/${categorySlug}`)

    availableBrands.value = response.data
    console.log('availableBrands ---->', availableBrands.value)
  } catch (error) {
    console.log(
      'Erreur lors du chargement des marques en fonction des offres disponibles et de la catégorie',
    )
  }
}
const fetchColorsByCategory = async (categorySlug) => {
  try {
    const response = await axios.get(`http://localhost:1337/api/colors/category/${categorySlug}`)
    availableColors.value = response.data

    console.log('availableColors ---->', availableColors.value)
  } catch (error) {
    console.log('Erreur lors du chargement des couleurs en fonction des offres de la catégorie')
  }
}

// ----------------------------------------------
// 🛟 UTILS (helpers)
// ----------------------------------------------

const collectCategoryNames = (category) => {
  console.log('category in collectCategoryNames ---->', category)

  if (category?.attributes?.children?.data?.length > 0) {
    for (const child of category.attributes.children.data) {
      categoryChildren.push({ displayName: child.attributes.displayName, id: child.id })
    }
  }
}

// Fonction récursive pour trouver les id en arborescence
const collectCategoryIds = (category) => {
  if (!allCategoriesId.includes(category.id)) {
    allCategoriesId.push(category.id)
  }

  if (category?.attributes?.children?.data?.length > 0)
    for (const child of category.attributes.children.data) {
      collectCategoryIds(child)
    }
}

// ----------------------------------------------
// 🔁 WATCHERS
// ----------------------------------------------

// Update URL when filters change
watch(
  filters,
  (newFilters) => {
    const query = {}

    // ajouter les filtres remplis
    for (const key in newFilters) {
      if (newFilters[key]) {
        query[key] = newFilters[key]
      }
    }

    // garder la page actuelle
    query.page = page.value

    // maj de l'url sans recharger la page
    router.push({ query })
  },
  { deep: true },
)

// ----------------------------------------------
// 🚀 onMounted - Initial Data Loading - Request
// ----------------------------------------------

onMounted(async () => {
  isLoading.value = true
  try {
    const response = await axios.get(
      `http://localhost:1337/api/categories/${props.id}?populate[0]=children&populate[1]=children.children&populate[2]=children.children.children&populate[3]=children.children.children.children?populate[4]=parent&populate[5]=parent.parent&populate[6]=parent.parent.parent&populate[7]=parent.parent.parent.parent&populate[8]=parent.parent.parent.parent.parent`,
    )
    categoryData.value = response.data.data
    console.log('categoryData ---->', categoryData.value)

    initFiltersFromQuery()

    fetchSizesByCategory(categoryData.value.attributes.name)

    fetchBrandsByCategory(categoryData.value.attributes.name)

    fetchColorsByCategory(categoryData.value.attributes.name)

    collectCategoryNames(categoryData.value)
    console.log('categoryChildren ---->', categoryChildren)

    watchEffect(async () => {
      if (!categoryData.value.attributes) return

      const categoryName = categoryData.value.attributes.name
      console.log('categoryName ---->', categoryName)

      //// GESTION PARAMS
      const params = {}

      // categoryName
      params['filters[category][name][$containsi]'] = categoryName

      // pagination
      params['pagination[pageSize]'] = 96
      params['pagination[page]'] = page.value

      // size
      if (filters.value.size) {
        params['filters[size][name][$eq]'] = filters.value.size
      }

      // brand
      if (filters.value.brand) {
        params['filters[brand][name][$eq]'] = filters.value.brand
      }

      // condition
      if (filters.value.condition.length > 0) {
        params['filters[condition][$in]'] = filters.value.condition
      }

      // colors
      if (filters.value.color.length > 0) {
        params['filters[colors][id][$in]'] = filters.value.color
      }

      console.log('params envoyé à axios ---->', params)

      const responseOffers = await axios.get(`http://localhost:1337/api/offers?populate=*&`, {
        params,
      })

      offersList.value = responseOffers.data
      console.log('offersList ---->', offersList.value)

      totalPage.value = offersList.value.meta.pagination.pageCount
    })
  } catch (error) {
    console.log('Erreur lors du chargement des offres')
  }
})

// ----------------------------------------------
// 📜 PAGINATION HANDLER
// ----------------------------------------------

const changePage = (order, actualNum) => {
  if (order === 'prev' && page.value > 1) {
    page.value -= 1
  } else if (order === 'next' && page.value < totalPage.value) {
    page.value += 1
  } else if (order === 'num' && page.value !== actualNum) {
    page.value = actualNum
  }
}
</script>

<template>
  <div class="container">
    <div class="container__catalog">
      <!-- CATALOG HEADER ---------------------->
      <div class="catalog__header" v-if="categoryData.attributes">
        <!-- BREADCRUMB -->
        <Breadcrumb :category="categoryData" />
        <h1>
          {{ categoryData.attributes.displayName }}
        </h1>

        <!-- FILTERS & SORT -->
        <div class="filters">
          <!-- size -->
          <div class="filters__size">
            <button @click="showDropdown.size = !showDropdown.size" class="filters__button">
              Taille <font-awesome-icon :icon="['fas', 'chevron-down']" v-if="!showDropdown.size" />
              <font-awesome-icon :icon="['fas', 'chevron-up']" v-else />
            </button>

            <div v-if="showDropdown.size" class="filter__dropdown">
              <p class="filter__title">Tailles</p>
              <ul class="filter__list">
                <li v-for="size in availableSizes" :key="size.id" class="filter__item">
                  <label>
                    {{ size.displayName }}
                    <input
                      type="radio"
                      name="size"
                      :value="size.name"
                      v-model="filters.size"
                      @change="showDropdown.size = false"
                    />
                  </label>
                </li>
              </ul>
            </div>

            <!-- brand -->
            <div class="filters__brand">
              <button @click="showDropdown.brand = !showDropdown.brand" class="filters__button">
                Marque
                <font-awesome-icon :icon="['fas', 'chevron-down']" v-if="!showDropdown.brand" />
                <font-awesome-icon :icon="['fas', 'chevron-up']" v-else />
              </button>

              <div v-if="showDropdown.brand" class="filter__dropdown">
                <input
                  type="text"
                  name="inputBrand"
                  id="inputBrand"
                  v-model="inputBrand"
                  placeholder="Recherche une marque"
                />
                <ul class="filter__list">
                  <li v-for="brand in filteredBrands" :key="brand.id" class="filter__item">
                    <label>
                      {{ brand.displayName }}
                      <input
                        type="radio"
                        name="brand"
                        :value="brand.name"
                        v-model="filters.brand"
                        @change="showDropdown.brand = false"
                      />
                    </label>
                  </li>
                </ul>
              </div>
            </div>

            <!-- condition -->
            <div class="filters__condition">
              <button @click="showDropdown.condition = !showDropdown.condition">
                État
                <font-awesome-icon :icon="['fas', 'chevron-down']" v-if="!showDropdown.condition" />
                <font-awesome-icon :icon="['fas', 'chevron-up']" v-else />
              </button>

              <div v-if="showDropdown.condition" class="filter__dropdown">
                <ul class="filter__list">
                  <li
                    v-for="condition in availableConditions"
                    :key="condition.name"
                    class="filter__item"
                  >
                    <label
                      >{{ condition.name }}
                      <p>{{ condition.description }}</p>
                      <input
                        type="checkbox"
                        name="condition"
                        v-model="filters.condition"
                        :value="condition.name"
                      />
                    </label>
                  </li>
                </ul>
              </div>
            </div>

            <!-- color -->
            <div class="filters__color">
              <button @click="showDropdown.color = !showDropdown.color">
                Couleur
                <font-awesome-icon :icon="['fas', 'chevron-down']" v-if="!showDropdown.color" />
                <font-awesome-icon :icon="['fas', 'chevron-up']" v-else />
              </button>
            </div>

            <div v-if="showDropdown.color" class="filter__dropdown">
              <ul class="filter__list">
                <li v-for="color in availableColors" :key="color.id" class="filter__item">
                  <label>
                    <p>ROND COULEUR</p>
                    <p>{{ color.displayName }}</p>
                    <input type="checkbox" name="color" v-model="filters.color" :value="color.id" />
                  </label>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <!-- CHILD LINKS -->
        <div>
          <ul v-if="categoryChildren" class="catalog__child-links">
            <li v-for="child in categoryChildren" :key="child.id">
              <RouterLink :to="{ name: 'catalog', params: { id: child.id } }">
                <p>{{ child.displayName }}</p>
              </RouterLink>
            </li>
          </ul>
        </div>
      </div>

      <!-- CATLOG OFFERS ----------------------->
      <div class="catalog__offers" v-if="offersList">
        <OfferCard
          v-for="offer in offersList.data"
          :key="offer.id"
          :offer="offer"
          :fromCatalog="true"
        />
      </div>

      <div class="catalog__offers-pagination" v-if="totalPage">
        <div @click="changePage('prev')" :class="{ disable: page === 1 }">
          <font-awesome-icon :icon="['fas', 'chevron-left']" />
        </div>
        <div v-for="num in totalPage">
          <p @click="changePage('num', num)">{{ num }}</p>
        </div>
        <div @click="changePage('next')" :class="{ disable: page === totalPage }">
          <font-awesome-icon :icon="['fas', 'chevron-right']" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.catalog__child-links {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

/* TRI ET FILTRES */
.filters {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 10px 0;
}

/* OFFERS */
.catalog__offers {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
}

/* PAGINATION */
.catalog__offers-pagination {
  display: flex;
  gap: 30px;
}

.disable {
  opacity: 0.2;
}
</style>
