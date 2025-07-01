<script setup>
import { ref, onMounted, watchEffect, watch, computed, onBeforeUnmount } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import axios from 'axios'

import OfferCard from '@/components/OfferCard.vue'
import PricePopup from '@/components/PricePopup.vue'

import { debounce } from 'lodash'

// NE PAS OUBLIER
// Modifier catalog view pour sortir les div de + ajouter props fromCatalog a pricePopup
// Gérer la pagination

// ----------------------------------------------
// 📄 PROPS / ROUTER / BASE VARIABLES
// ----------------------------------------------

// 1. Main & Import variables
const route = useRoute()
const router = useRouter()

const offersList = ref([])

// 2. Price Pop-up
const selectedOfferForPopup = ref(null)
const showPricePopup = ref(false)

const handlePriceClick = (offer) => {
  selectedOfferForPopup.value = offer
  showPricePopup.value = true
}

const closePricePopup = () => {
  showPricePopup.value = false
  selectedOfferForPopup.value = null
}

// 3. searchTerm q
const q = computed(() => route.query.q?.trim() || '')
console.log('q ---->', q.value)

// 4. pagination
const totalPage = ref(null)
const page = ref(Number(route.query.page) || 1)

// ----------------------------------------------
// 🎯 FILTER SYSTEM
// ----------------------------------------------

// 1. Main filters

function toArray(param) {
  return Array.isArray(param) ? param : [param]
}

const filters = ref({
  size: route.query.size ? toArray(route.query.size) : [],
  brand: route.query.brand ? toArray(route.query.brand) : [],
  condition: route.query.condition ? toArray(route.query.condition) : [],
  color: route.query.color ? toArray(route.query.color) : [],
  material: route.query.material ? toArray(route.query.material) : [],
  priceMin: route.query.priceMin ? Number(route.query.priceMin) : null,
  priceMax: route.query.priceMax ? Number(route.query.priceMax) : null,
  sort: route.query.sort || null,
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

const dropdownRef = {
  size: null,
  brand: null,
  condition: null,
  color: null,
  price: null,
  material: null,
  sortBy: null,
}

const toggleDropdown = (key) => {
  for (const dropdown in showDropdown.value) {
    showDropdown.value[dropdown] =
      dropdown === key
        ? !showDropdown.value[dropdown] // toggle le bouton cliqué
        : false // ferme les autres
  }
}

const handleClickOutside = (event) => {
  const clickedInsideAny = Object.values(dropdownRef).some(
    (ref) => ref && ref.contains(event.target),
  )

  if (!clickedInsideAny) {
    for (const key in showDropdown.value) {
      showDropdown.value[key] = false
    }
  }
}

// 3. Sizes
const availableSizes = ref([])

// 4. Brand
const inputBrand = ref('')
const availableBrands = ref([])

const filteredBrands = computed(() => {
  if (inputBrand.value === '') {
    return availableBrands.value.filter((b) => b.isPopular)
  } else {
    return availableBrands.value.filter((b) =>
      b.displayName.toLowerCase().includes(inputBrand.value.toLowerCase()),
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

// 6. Color
const availableColors = ref([])

// 7. Material
const availableMaterials = ref([])

// .8 Sort
const availableSorts = ref([
  { name: 'priceAsc', displayName: 'Prix croissant' },
  { name: 'priceDesc', displayName: 'Prix décroissant' },
])

// 9. Added filters
const addedFilters = ref({})
const availableRefs = ref({})

const removeFilter = (key, index) => {
  const current = {}

  // copie de filters
  for (const k in filters.value) {
    const v = filters.value[k]
    if (Array.isArray(v)) {
      current[k] = [...v]
    } else {
      current[k] = v
    }
  }

  // suppression
  if (Array.isArray(current[key])) {
    current[key].splice(index, 1)
  } else {
    current[key] = null
  }

  // assignation pour enclencher le watch
  filters.value = current
}
const removeAllFilters = () => {
  const empty = {}

  for (const key in filters.value) {
    const value = filters.value[key]
    if (Array.isArray(value)) {
      empty[key] = []
    } else {
      empty[key] = null
    }
  }

  filters.value = empty
  page.value = 1
}

// 10. Mobile Filter Menu
const isMobileFilterOpen = ref(false)
const mobileFilterSection = ref(null)
const mobileFilterTitles = {
  size: 'Tailles',
  brand: 'Marque',
  condition: 'État',
  color: 'Couleurs',
  price: 'Prix',
  material: 'Matières',
  sort: 'Tri',
}

const mobileFiltersSummaries = computed(() => {
  const summaries = {}
  const maxChars = 30

  for (const key in mobileFilterTitles) {
    const val = addedFilters.value[key]
    let text

    if (Array.isArray(val) && val.length > 0) {
      text = val.join(',')
    } else if (typeof val === 'string' && val) {
      text = val
    } else {
      text = 'Tous'
    }

    if (text.length > maxChars) {
      text = text.slice(0, maxChars) + '...'
    }

    summaries[key] = text
  }
  return summaries
})

const resetDropdowns = () => {
  for (const key in showDropdown.value) {
    showDropdown.value[key] = false
  }
}

const onMobileHeaderBack = () => {
  if (mobileFilterSection.value) {
    mobileFilterSection.value = null
    resetDropdowns()
  } else {
    isMobileFilterOpen.value = false
  }
}

const handleHeaderClear = (key) => {
  // si section précise
  if (mobileFilterSection.value) {
    // supprimer filtre en question
    const key = mobileFilterSection.value
    if (Array.isArray(filters.value[key])) {
      filters.value[key] = []
    } else {
      filters.value[key] = null
    }

    // si section principale
    // supprimer tout les filtres
  } else {
    removeAllFilters()
  }
}

const selectMobileFilter = (key) => {
  mobileFilterSection.value = key
  toggleDropdown(key)
}

const closeMobileFilters = () => {
  isMobileFilterOpen.value = false
  mobileFilterSection.vale = null
  resetDropdowns()
}

// ----------------------------------------------
// 🔎 API FUNCTIONS FETCH
// ----------------------------------------------

// 1. fetchOffers
const fetchOffers = async () => {
  if (!q.value) {
    return
  }

  const params = {
    'filters[name][$containsi]': q.value,
    'pagination[pageSize]': 96,
    'pagination[page]': page.value,
    populate: '*',
  }

  // Filtres dynamiques
  if (filters.value.brand.length) {
    params['filters[brand][name][$in]'] = filters.value.brand
  }
  if (filters.value.size.length) {
    params['filters[size][name][$in]'] = filters.value.size
  }
  if (filters.value.condition.length) {
    params['filters[condition][$in]'] = filters.value.condition
  }
  if (filters.value.color.length) {
    params['filters[colors][name][$in]'] = filters.value.color
  }
  if (filters.value.material.length) {
    params['filters[materials][id][$in]'] = filters.value.material
  }
  if (filters.value.priceMin !== null) {
    params['filters[price][$gte]'] = filters.value.priceMin
  }
  if (filters.value.priceMax !== null) {
    params['filters[price][$lte]'] = filters.value.priceMax
  }
  if (filters.value.sort === 'priceAsc') {
    params['sort'] = 'price:asc'
  }
  if (filters.value.sort === 'priceDesc') {
    params['sort'] = 'price:desc'
  }

  try {
    const response = await axios.get(`http://localhost:1337/api/offers`, { params })

    offersList.value = response.data
    totalPage.value = response.data.meta.pagination.pageCount

    extractSizesFromOffers(offersList.value.data)
    extractBrandsFromOffers(offersList.value.data)
    availableRefs.value.condition = availableConditions.value
    extractColorsFromOffers(offersList.value.data)
    extractMaterialsFromOffers(offersList.value.data)
    availableRefs.value.sort = availableSorts.value
  } catch (error) {
    console.log('Erreur lors du chargement des offres', error)
  }
}

const debouncedFetchOffers = debounce(() => {
  page.value = 1
  fetchOffers()
}, 2000) //

// ----------------------------------------------
// 🛟 FILTRAGE & EXTRACT FUNCTIONS
// ----------------------------------------------

// 2. Size
const extractSizesFromOffers = (offers) => {
  const sizes = offers
    .map((o) => o.attributes.size?.data)
    .filter((s) => s)
    .map((s) => ({
      name: s.attributes.name,
      displayName: s.attributes.displayName,
      displayCategoryName: s.attributes.displayCategoryName,
    }))

  const uniqueSizes = []
  const seen = new Set()

  for (const s of sizes) {
    if (!seen.has(s.name)) {
      seen.add(s.name)
      uniqueSizes.push(s)
    }
  }

  availableSizes.value = uniqueSizes.sort((a, b) => a.name.localeCompare(b.name))
  availableRefs.value.size = availableSizes.value
}

// 3. Brand
const extractBrandsFromOffers = (offers) => {
  const brands = offers
    .map((o) => o.attributes.brand?.data)
    .filter(Boolean)
    .map((b) => ({
      name: b.attributes.name,
      displayName: b.attributes.displayName,
      isPopular: b.attributes.isPopular || false,
    }))

  const uniqueBrands = brands.filter(
    (b, index, self) => index === self.findIndex((o) => o.name === b.name),
  )

  availableBrands.value = uniqueBrands.sort((a, b) => a.displayName.localeCompare(b.displayName))

  availableRefs.value.brand = availableBrands.value
}

// 4. Color
const extractColorsFromOffers = (offers) => {
  const colors = offers
    .flatMap((o) => o.attributes.colors?.data || [])
    .map((c) => ({
      name: c.attributes.name,
      displayName: c.attributes.displayName,
      hex: c.attributes.hex,
      style: c.attributes.style,
    }))

  // Supprimer les doublons
  const uniqueColors = colors.filter(
    (c, index, self) => index === self.findIndex((o) => o.name === c.name),
  )

  availableColors.value = uniqueColors.sort((a, b) => a.displayName.localeCompare(b.displayName))
  availableRefs.value.color = availableColors.value
}

// 5. Material
const extractMaterialsFromOffers = (offers) => {
  const allMaterials = offers
    .flatMap((o) => o.attributes.materials?.data || [])
    .map((m) => ({
      id: m.id,
      name: m.attributes.name,
      displayName: m.attributes.displayName,
    }))

  const uniqueMaterials = allMaterials.filter(
    (m, index, self) => index === self.findIndex((o) => o.name === m.name),
  )

  availableMaterials.value = uniqueMaterials.sort((a, b) =>
    a.displayName.localeCompare(b.displayName),
  )

  availableRefs.value.material = availableMaterials.value
}

// ----------------------------------------------
// 🔁 WATCHERS
// ----------------------------------------------

// 1. Watch q
watch(q, () => {
  page.value = 1
  fetchOffers()
})

// 2. Watch p
watch(page, () => {
  fetchOffers()
})

// 3. Watch filters
watch(
  filters,
  () => {
    debouncedFetchOffers()
  },
  { deep: true },
)

// 4. Watch filters pour sync l'url
watch(
  filters,
  (newFilters) => {
    const query = { q: q.value || undefined, page: page.value }

    for (const key in newFilters) {
      const val = newFilters[key]
      if (Array.isArray(val) && val.length) {
        query[key] = val
      } else if (!Array.isArray(val) && val != null) {
        query[key] = val
      }
      // sinon on ne met pas le paramètre vide dans l'URL
    }

    router.replace({ name: 'search', query })
  },
  { deep: true },
)

// 3. Watch added filters
watchEffect(() => {
  const updated = {}

  for (const key in filters.value) {
    const sourceList = availableRefs.value[key]
    const value = filters.value[key]

    if (key === 'priceMin' || key === 'priceMax') {
      updated[key] = value
    }

    if (!value || !sourceList) continue

    if (Array.isArray(value)) {
      updated[key] = value.map(
        (val) =>
          sourceList.find((item) => item.name === val || item.id === val)?.displayName || val,
      )
    } else {
      updated[key] =
        sourceList.find((item) => item.name === value || item.id === value)?.displayName || value
    }
  }

  addedFilters.value = updated
})

// ----------------------------------------------
// 🚀 onMounted
// ----------------------------------------------

onMounted(() => {
  fetchOffers()
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  document.addEventListener('click', handleClickOutside)
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
      <!-- CATALOG HEADER --------------------->
      <div class="catalog__header">
        <h1 v-if="q">Recherche pour "{{ q }}"</h1>
        <h1 v-else>Articles</h1>

        <!-- FILTERS & SORT -->
        <!-- mobile filters -->
        <button class="ds-filter-btn small-only" @click="isMobileFilterOpen = true">
          <font-awesome-icon :icon="['fas', 'sliders-h']" />Filtres
          <span v-if="Object.values(filters).some((v) => v?.length || v !== null)"
            >({{
              Object.values(filters).filter((v) => (Array.isArray(v) ? v.length : v !== null))
                .length
            }})</span
          >
        </button>

        <div class="filters">
          <!-- size -->
          <div
            class="filters__size"
            :ref="(element) => (dropdownRef.size = element)"
            v-if="availableSizes.length > 0"
          >
            <button @click="toggleDropdown('size')" class="filters__button">
              Taille <font-awesome-icon :icon="['fas', 'chevron-down']" v-if="!showDropdown.size" />
              <font-awesome-icon :icon="['fas', 'chevron-up']" v-else />
            </button>

            <div v-if="showDropdown.size" class="filter__dropdown">
              <p class="filter__title">Tailles</p>
              <ul class="filter__list">
                <li v-for="size in availableSizes" :key="size.id" class="filter__item">
                  <label>
                    <p>{{ size.displayCategoryName }}</p>
                    <p>{{ size.displayName }}</p>
                    <input type="checkbox" name="size" :value="size.name" v-model="filters.size" />
                  </label>
                </li>
              </ul>
            </div>
          </div>

          <!-- brand -->
          <div
            class="filters__brand"
            :ref="(element) => (dropdownRef.brand = element)"
            v-if="availableBrands.length > 0"
          >
            <button @click="toggleDropdown('brand')" class="filters__button">
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
                <li v-for="brand in filteredBrands" :key="brand.name" class="filter__item">
                  <label>
                    {{ brand.displayName }}
                    <input
                      type="checkbox"
                      name="brand"
                      :value="brand.name"
                      v-model="filters.brand"
                    />
                  </label>
                </li>
              </ul>
            </div>
          </div>

          <!-- condition -->
          <div class="filters__condition" :ref="(element) => (dropdownRef.condition = element)">
            <button @click="toggleDropdown('condition')">
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
          <div class="filters__color" :ref="(element) => (dropdownRef.color = element)">
            <button @click="toggleDropdown('color')">
              Couleur
              <font-awesome-icon :icon="['fas', 'chevron-down']" v-if="!showDropdown.color" />
              <font-awesome-icon :icon="['fas', 'chevron-up']" v-else />
            </button>

            <div v-if="showDropdown.color" class="filter__dropdown">
              <ul class="filter__list">
                <li v-for="color in availableColors" :key="color.id" class="filter__item">
                  <label>
                    <div
                      class="filter__color-circle"
                      :style="
                        color.hex ? { backgroundColor: color.hex } : { background: color.style }
                      "
                      :class="{
                        isWhite:
                          color.name === 'blanc' ||
                          color.name === 'creme' ||
                          color.name === 'beige',
                      }"
                    ></div>
                    <p>{{ color.displayName }}</p>
                    <input
                      type="checkbox"
                      name="color"
                      v-model="filters.color"
                      :value="color.name"
                    />
                  </label>
                </li>
              </ul>
            </div>
          </div>

          <!-- pricemin & pricemax -->
          <div class="filters__price" :ref="(element) => (dropdownRef.price = element)">
            <button @click="toggleDropdown('price')" class="filter__button">
              Prix
              <font-awesome-icon :icon="['fas', 'chevron-down']" v-if="!showDropdown.price" />
              <font-awesome-icon :icon="['fas', 'chevron-up']" v-else />
            </button>

            <div v-if="showDropdown.price" class="filter__dropdown">
              <label>
                De
                <input
                  type="number"
                  name="priceMin"
                  id="priceMin"
                  placeholder="0,00€"
                  v-model.number="filters.priceMin"
                />
              </label>

              <label
                >À
                <input
                  type="number"
                  name="priceMax"
                  id="priceMax"
                  placeholder="€"
                  v-model.number="filters.priceMax"
                />
              </label>
            </div>
          </div>

          <!-- material -->
          <div class="filters__material" :ref="(element) => (dropdownRef.material = element)">
            <button @click="toggleDropdown('material')">
              Matière<font-awesome-icon
                :icon="['fas', 'chevron-down']"
                v-if="!showDropdown.material"
              />
              <font-awesome-icon :icon="['fas', 'chevron-up']" v-else />
            </button>

            <div v-if="showDropdown.material" class="filter__dropdown">
              <ul class="filter__list">
                <li v-for="material in availableMaterials" :key="material.id" class="filter__item">
                  <label>
                    {{ material.displayName }}
                    <input
                      type="checkbox"
                      name="material"
                      id="material"
                      v-model="filters.material"
                      :value="material.id"
                    />
                  </label>
                </li>
              </ul>
            </div>
          </div>

          <!-- sort by price -->
          <div class="filters__sort" :ref="(element) => (dropdownRef.sort = element)">
            <button @click="toggleDropdown('sort')" class="filters__button">
              Tri
              <font-awesome-icon :icon="['fas', 'chevron-down']" v-if="!showDropdown.sort" />
              <font-awesome-icon :icon="['fas', 'chevron-up']" v-else />
            </button>

            <div class="filter__dropdown" v-if="showDropdown.sort">
              <ul class="filter__list">
                <li class="filter__item" v-for="(sort, index) in availableSorts" :key="sort.index">
                  <label>
                    {{ sort.displayName }}
                    <input
                      type="radio"
                      name="sort"
                      id="sort"
                      v-model="filters.sort"
                      :value="sort.name"
                    />
                  </label>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <!-- ADDED FILTERS -->
        <div class="filters__button" v-if="addedFilters && filters">
          <div v-for="(value, key) in addedFilters" :key="key">
            <button
              v-if="Array.isArray(value)"
              v-for="(val, index) in value"
              @click="removeFilter(key, index)"
            >
              {{ val }}
              <font-awesome-icon :icon="['fas', 'times']" />
            </button>

            <button v-else-if="key === 'sort'" @click="removeFilter(key)">
              {{ value }}
              <font-awesome-icon :icon="['fas', 'times']" />
            </button>

            <button
              v-else-if="
                (key === 'priceMin' && addedFilters.priceMin) ||
                (key === 'priceMax' && addedFilters.priceMax)
              "
              @click="removeFilter(key)"
            >
              {{
                key === 'priceMin'
                  ? 'De ' + Number(value).toFixed(2) + ' €'
                  : 'À ' + Number(value).toFixed(2) + ' €'
              }}
              <font-awesome-icon :icon="['fas', 'times']" />
            </button>
          </div>

          <p
            v-if="
              Object.values(filters).some((v) => v !== null && (!Array.isArray(v) || v.length > 0))
            "
            @click="removeAllFilters()"
          >
            Effacer les filtres
          </p>
        </div>
      </div>

      <!-- OFFERS ----------------------------->
      <div class="catalog__offers" v-if="offersList">
        <OfferCard
          v-for="offer in offersList.data"
          :key="offer.id"
          :offer="offer"
          :fromCatalog="true"
          @price-clicked="handlePriceClick"
        />
      </div>

      <!-- PAGINATION ------------------------->
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

  <PricePopup
    :selectedOfferForPopup="selectedOfferForPopup"
    :showPricePopup="showPricePopup"
    :fromCatalog="true"
    @closePricePopup="closePricePopup"
  />

  <!-- MOBILE FILTERS MENU -->
  <div class="mobile-filters__overlay" v-if="isMobileFilterOpen">
    <!-- header ------>
    <div class="mobile-filters__header">
      <button class="mobile-filters__back-btn" @click="onMobileHeaderBack">
        <font-awesome-icon :icon="['fas', mobileFilterSection ? 'arrow-left' : 'times']" />
      </button>

      <h2>{{ mobileFilterSection ? mobileFilterTitles[mobileFilterSection] : 'Filtrer' }}</h2>

      <h2 @click="handleHeaderClear">{{ mobileFilterSection ? 'Supprimer' : 'Effacer tout' }}</h2>
    </div>

    <!-- content ----->
    <div class="mobile-filters__content">
      <!-- 1. filters list -->
      <div v-if="!mobileFilterSection">
        <div
          class="mobile-filter__item"
          v-for="(label, key) in mobileFilterTitles"
          :key="key"
          @click="selectMobileFilter(key)"
        >
          <span class="mobile-filter__label">{{ label }}</span>
          <span class="mobile-filter__summary">{{ mobileFiltersSummaries[key] }}</span>
          <font-awesome-icon :icon="['fas', 'chevron-right']" />
        </div>
      </div>

      <!-- 2. size -->
      <div v-else-if="mobileFilterSection === 'size'">
        <p>{{ mobileFilterTitles[mobileFilterSection] }}</p>
        <ul class="mobile-filter__list">
          <li v-for="size in availableSizes" :key="size.id" class="mobile-filter__list-item">
            <label>
              <span>{{ size.displayName }}</span>
              <input type="checkbox" :value="size.name" v-model="filters.size" />
            </label>
          </li>
        </ul>
      </div>

      <!-- 3. brand -->
      <div v-else-if="mobileFilterSection === 'brand'">
        <input
          class="mobile-filter__search"
          type="text"
          v-model="inputBrand"
          placeholder="Recherche une marque"
        />
        <ul class="mobile-filter__list">
          <li v-for="brand in filteredBrands" :key="brand.id" class="mobile-filter__list-item">
            <label>
              <span>{{ brand.displayName }}</span>
              <input type="checkbox" :value="brand.name" v-model="filters.brand" />
            </label>
          </li>
        </ul>
      </div>

      <!-- 4. condition -->
      <div v-else-if="mobileFilterSection === 'condition'">
        <p>{{ mobileFilterTitles[mobileFilterSection] }}</p>
        <ul class="mobile-filter__list">
          <li
            v-for="condition in availableConditions"
            :key="condition.name"
            class="mobile-filter__list-item"
          >
            <label>
              <span>{{ condition.name }}</span>
              <input type="checkbox" :value="condition.name" v-model="filters.condition" />
            </label>
          </li>
        </ul>
      </div>

      <!-- 5. color -->
      <div v-else-if="mobileFilterSection === 'color'">
        <p>{{ mobileFilterTitles[mobileFilterSection] }}</p>
        <ul class="mobile-filter__list">
          <li v-for="color in availableColors" :key="color.id" class="mobile-filter__list-item">
            <label>
              <div
                class="filter__color-circle"
                :style="color.hex ? { backgroundColor: color.hex } : { background: color.style }"
                :class="{
                  isWhite:
                    color.name === 'blanc' || color.name === 'creme' || color.name === 'beige',
                }"
              ></div>
              <span> {{ color.displayName }}</span>
              <input type="checkbox" :value="color.name" v-model="filters.color" />
            </label>
          </li>
        </ul>
      </div>

      <!-- 5. price -->
      <div v-else-if="mobileFilterSection === 'price'">
        <p>{{ mobileFilterTitles[mobileFilterSection] }}</p>
        <div>
          <label>
            <span>De</span>
            <input
              type="number"
              name="priceMin"
              id="priceMin"
              placeholder="0,00€"
              v-model.number="filters.priceMin"
            />
          </label>

          <label>
            <span>À</span>
            <input
              type="number"
              name="priceMax"
              id="priceMax"
              placeholder="€"
              v-model.number="filters.priceMax"
            />
          </label>
        </div>
      </div>

      <!-- 6. material -->
      <div v-else-if="mobileFilterSection === 'material'">
        <p>{{ mobileFilterTitles[mobileFilterSection] }}</p>
        <ul class="mobile-filter__list">
          <li
            v-for="material in availableMaterials"
            :key="material.id"
            class="mobile-filter__list-item"
          >
            <label>
              <span>{{ material.displayName }}</span>
              <input type="checkbox" :value="material.id" v-model="filters.material" />
            </label>
          </li>
        </ul>
      </div>

      <!-- 7. sort -->
      <div v-else-if="mobileFilterSection === 'sort'">
        <p>{{ mobileFilterTitles[mobileFilterSection] }}</p>
        <ul class="mobile-filter__list">
          <li v-for="sort in availableSorts" :key="sort.name" class="mobile-filter__list-item">
            <label>
              <span>{{ sort.displayName }}</span>
              <input type="radio" name="sort" id="sort" :value="sort.name" v-model="filters.sort" />
            </label>
          </li>
        </ul>
      </div>
      <div class="mobile-filters__footer"></div>
      <button
        class="mobile-filters__apply-btn"
        @click="closeMobileFilters"
        v-if="mobileFilterSection"
      >
        Afficher les résultats
        <span v-if="offersList.data.length > 0">{{ offersList.data.length + ' résultats' }}</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
/* SMALL / MOBILE (≤ 720px) */
.container {
  margin-top: 145px;
}

.container__catalog {
  padding: 10px;
}

/* HEADER -----------------------*/
/* BANNER --------------*/
.catalog__banner {
  border: 1px solid red;
  width: 100%;
}

.catalog__banner > img {
  width: 100%;
}

/* TRI ET FILTRES -----*/
h1 {
  margin-top: 10px;
}

/* MOBILE FILTERS -----*/
.mobile-filters__overlay {
  position: fixed;
  top: 0px;
  width: 100%;
  background-color: white;
  border: 1px solid blue;
  z-index: 2000;
}

/* HEADER */
.mobile-filters__header {
  display: flex;
  justify-content: space-between;
  background-color: pink;
}

.filters {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 10px 0;
}

/* COLORS */
.filter__color-circle {
  width: 20px;
  height: 20px;
  /* border: 1px solid black; */
  border-radius: 50px;
}

.isWhite {
  border: 1px solid lightgray;
}

/* CHILD LINKS */
.catalog__child-links {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
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

/* MEDIUM (721px à 960px) */
@media (min-width: 721px) and (max-width: 960px) {
}

/* DESKTOP (> 961px) */
@media (min-width: 961px) {
}

/* DESKTOP LARGE (> 1200px) */
@media (min-width: 1200px) {
}
</style>
