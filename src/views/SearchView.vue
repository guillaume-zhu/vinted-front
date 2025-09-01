<script setup>
import { ref, onMounted, watchEffect, watch, computed, onBeforeUnmount } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import axios from 'axios'

import OfferCard from '@/components/OfferCard.vue'
import PricePopup from '@/components/PricePopup.vue'
import { apiUrl } from '@/config'

import { debounce } from 'lodash'

// ----------------------------------------------
// 📄 PROPS / ROUTER / BASE VARIABLES
// ----------------------------------------------

// 1. Main & Import variables
const route = useRoute()
const router = useRouter()

const offersList = ref([])

const isLoading = ref(false)

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

// 4. pagination
const totalPage = ref(null)
const page = ref(Number(route.query.page) || 1)
const pageSize = ref(window.innerWidth >= 1200 ? 95 : 96)
const updatePageSize = () => {
  pageSize.value = window.innerWidth >= 1200 ? 95 : 96
}

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
  sort: 'Trier par',
}

const mobileFiltersSummaries = computed(() => {
  const summaries = {}
  const maxChars = 30

  for (const key in mobileFilterTitles) {
    let text = 'Tous'

    if (key === 'price') {
      const minRaw = filters.value.priceMin
      const maxRaw = filters.value.priceMax

      const minNum = parseFloat(minRaw)
      const maxNum = parseFloat(maxRaw)

      const minValid = !Number.isNaN(minNum)
      const maxValid = !Number.isNaN(maxNum)

      if (minValid && maxValid) {
        text = `De ${minNum.toFixed(2)}€ à ${maxNum.toFixed(2)}€`
      } else if (minValid) {
        text = `De ${minNum.toFixed(2)}€`
      } else if (maxValid) {
        text = `À ${maxNum.toFixed(2)}€`
      }
    } else {
      const val = addedFilters.value[key]
      if (Array.isArray(val) && val.length > 0) {
        text = val.join(', ')
      } else if (typeof val === 'string' && val) {
        text = val
      } else {
        text = 'Tous'
      }
    }

    if (text?.length > maxChars) {
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
  isLoading.value = true
  if (!q.value) {
    return
  }

  const params = {
    'filters[name][$containsi]': q.value,
    'pagination[pageSize]': pageSize.value,
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
    const response = await axios.get(`${apiUrl}/api/offers`, { params })

    offersList.value = response.data
    totalPage.value = response.data.meta.pagination.pageCount

    extractSizesFromOffers(offersList.value.data)
    extractBrandsFromOffers(offersList.value.data)
    availableRefs.value.condition = availableConditions.value
    extractColorsFromOffers(offersList.value.data)
    extractMaterialsFromOffers(offersList.value.data)
    availableRefs.value.sort = availableSorts.value

    isLoading.value = false
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
  removeAllFilters()
  page.value = 1
  fetchOffers()
})

// 2. Watch page
watch(page, () => {
  fetchOffers()
})

// 3. Watch pageSize
watch(pageSize, () => {
  fetchOffers()
})

// 4. Watch filters
watch(
  filters,
  () => {
    debouncedFetchOffers()
  },
  { deep: true },
)

// 5. Watch filters pour sync l'url
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

// 6. Watch added filters
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
  window.addEventListener('resize', updatePageSize)
})

onBeforeUnmount(() => {
  document.addEventListener('click', handleClickOutside)
  window.removeEventListener('resize', updatePageSize)
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
    <!-- CATALOG BANNER IMG ------------------>
    <div class="catalog__banner">
      <img src="../assets/img/catalog-banner.png" alt="Bannière visuel" />
    </div>
    <div class="container__catalog">
      <!-- CATALOG HEADER --------------------->
      <div class="catalog__header" v-if="!isLoading">
        <h1 v-if="q">Recherche pour "{{ q }}"</h1>
        <h1 v-else>Articles</h1>

        <!-- FILTERS & SORT -->
        <!-- mobile filters -->
        <button
          class="ds-filter-btn small-only"
          :class="{ activeBtn: Object.values(filters).some((v) => v?.length || v > 1) }"
          @click="isMobileFilterOpen = true"
        >
          <font-awesome-icon :icon="['fas', 'sliders-h']" />Filtres
          <span v-if="Object.values(filters).some((v) => v?.length || v !== null)"
            >({{
              Object.values(filters).filter((v) => (Array.isArray(v) ? v.length : v !== null))
                .length
            }})</span
          >
        </button>

        <!-- desktop filters -->
        <div class="filters">
          <!-- size -->
          <div class="filters__bloc" :ref="(element) => (dropdownRef.size = element)">
            <button
              @click="toggleDropdown('size')"
              class="filter__toggle ds-filter-btn"
              :class="{ activeBtn: showDropdown.size || filters.size.length > 0 }"
            >
              Taille <font-awesome-icon :icon="['fas', 'chevron-down']" v-if="!showDropdown.size" />
              <font-awesome-icon :icon="['fas', 'chevron-up']" v-else />
            </button>

            <div v-if="showDropdown.size" class="filter__dropdown">
              <div class="filter__list-wrapper">
                <div class="size__title-div">
                  <p class="filter__title text-md">
                    {{
                      availableSizes?.length > 0 ? availableSizes[0].displayCategoryName : 'Tailles'
                    }}
                  </p>
                </div>
                <ul class="filter__list">
                  <li v-for="size in availableSizes" :key="size.id" class="filter__item">
                    <label>
                      {{ size.displayName }}
                      <input
                        type="checkbox"
                        name="size"
                        :value="size.name"
                        v-model="filters.size"
                      />
                    </label>
                  </li>
                </ul>
              </div>
              <div class="filter__results">
                <button
                  class="mobile-filters__apply-btn ds-btn ds-btn--primary"
                  @click="resetDropdowns"
                >
                  Afficher les
                  <span v-if="offersList.data.length > 0">{{
                    offersList.data.length + ' résultats'
                  }}</span>
                  <span v-else>résultats</span>
                </button>
              </div>
            </div>
          </div>

          <!-- brand -->
          <div class="filters__bloc" :ref="(element) => (dropdownRef.brand = element)">
            <button
              @click="toggleDropdown('brand')"
              class="filter__toggle ds-filter-btn"
              :class="{ activeBtn: showDropdown.brand || filters.brand.length > 0 }"
            >
              Marque
              <font-awesome-icon :icon="['fas', 'chevron-down']" v-if="!showDropdown.brand" />
              <font-awesome-icon :icon="['fas', 'chevron-up']" v-else />
            </button>

            <div v-if="showDropdown.brand" class="filter__dropdown">
              <div class="filter__list-wrapper">
                <div class="ds-search-input">
                  <input type="text" v-model="inputBrand" placeholder="Recherche une marque" />
                  <font-awesome-icon
                    :icon="['fas', 'times']"
                    v-if="inputBrand"
                    @click="inputBrand = ''"
                  />
                </div>
                <ul class="filter__list">
                  <li v-for="brand in filteredBrands" :key="brand.id" class="filter__item">
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
              <div class="filter__results">
                <button
                  class="mobile-filters__apply-btn ds-btn ds-btn--primary"
                  @click="resetDropdowns"
                >
                  Afficher les
                  <span v-if="offersList.data.length > 0">{{
                    offersList.data.length + ' résultats'
                  }}</span>
                  <span v-else>résultats</span>
                </button>
              </div>
            </div>
          </div>

          <!-- condition -->
          <div class="filters__bloc" :ref="(element) => (dropdownRef.condition = element)">
            <button
              @click="toggleDropdown('condition')"
              class="filter__toggle ds-filter-btn"
              :class="{ activeBtn: showDropdown.condition || filters.condition.length > 0 }"
            >
              État
              <font-awesome-icon :icon="['fas', 'chevron-down']" v-if="!showDropdown.condition" />
              <font-awesome-icon :icon="['fas', 'chevron-up']" v-else />
            </button>

            <div v-if="showDropdown.condition" class="filter__dropdown">
              <div class="filter__list-wrapper">
                <ul class="filter__list">
                  <li
                    v-for="condition in availableConditions"
                    :key="condition.name"
                    class="filter__item"
                  >
                    <label class="condition__label">
                      <div>
                        {{ condition.name }}
                        <p>{{ condition.description }}</p>
                      </div>

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
              <div class="filter__results">
                <button
                  class="mobile-filters__apply-btn ds-btn ds-btn--primary"
                  @click="resetDropdowns"
                >
                  Afficher les
                  <span v-if="offersList.data.length > 0">{{
                    offersList.data.length + ' résultats'
                  }}</span>
                  <span v-else>résultats</span>
                </button>
              </div>
            </div>
          </div>

          <!-- color -->
          <div class="filters__bloc" :ref="(element) => (dropdownRef.color = element)">
            <button
              @click="toggleDropdown('color')"
              class="filter__toggle ds-filter-btn"
              :class="{ activeBtn: showDropdown.color || filters.color.length > 0 }"
            >
              Couleur
              <font-awesome-icon :icon="['fas', 'chevron-down']" v-if="!showDropdown.color" />
              <font-awesome-icon :icon="['fas', 'chevron-up']" v-else />
            </button>

            <div v-if="showDropdown.color" class="filter__dropdown">
              <div class="filter__list-wrapper">
                <ul class="filter__list">
                  <li v-for="color in availableColors" :key="color.id" class="filter__item">
                    <label>
                      <div class="filter__color-name">
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
                      </div>
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

              <div class="filter__results">
                <button
                  class="mobile-filters__apply-btn ds-btn ds-btn--primary"
                  @click="resetDropdowns"
                >
                  Afficher les
                  <span v-if="offersList.data.length > 0">{{
                    offersList.data.length + ' résultats'
                  }}</span>
                  <span v-else>résultats</span>
                </button>
              </div>
            </div>
          </div>

          <!-- pricemin & pricemax -->
          <div class="filters__bloc" :ref="(element) => (dropdownRef.price = element)">
            <button
              @click="toggleDropdown('price')"
              class="filter__toggle ds-filter-btn"
              :class="{ activeBtn: showDropdown.price || filters.priceMin || filters.priceMax }"
            >
              Prix
              <font-awesome-icon :icon="['fas', 'chevron-down']" v-if="!showDropdown.price" />
              <font-awesome-icon :icon="['fas', 'chevron-up']" v-else />
            </button>

            <div v-if="showDropdown.price" class="filter__dropdown price__dropdown">
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
          <div class="filters__bloc" :ref="(element) => (dropdownRef.material = element)">
            <button
              @click="toggleDropdown('material')"
              class="filters__toggle ds-filter-btn"
              :class="{ activeBtn: showDropdown.material || filters.material.length > 0 }"
            >
              Matière<font-awesome-icon
                :icon="['fas', 'chevron-down']"
                v-if="!showDropdown.material"
              />
              <font-awesome-icon :icon="['fas', 'chevron-up']" v-else />
            </button>

            <div v-if="showDropdown.material" class="filter__dropdown filter__dropdown-material">
              <div class="filter__list-wrapper">
                <ul class="filter__list">
                  <li
                    v-for="material in availableMaterials"
                    :key="material.id"
                    class="filter__item"
                  >
                    <label>
                      {{ material.displayName }}
                      <input
                        type="checkbox"
                        name="material"
                        id="material"
                        v-model="filters.material"
                        :value="material.name"
                      />
                    </label>
                  </li>
                </ul>
              </div>

              <div class="filter__results">
                <button
                  class="mobile-filters__apply-btn ds-btn ds-btn--primary"
                  @click="resetDropdowns"
                >
                  Afficher les
                  <span v-if="offersList.data.length > 0">{{
                    offersList.data.length + ' résultats'
                  }}</span>
                  <span v-else>résultats</span>
                </button>
              </div>
            </div>
          </div>

          <!-- sort by price -->
          <div class="filters__bloc" :ref="(element) => (dropdownRef.sort = element)">
            <button
              @click="toggleDropdown('sort')"
              class="filters__toggle ds-filter-btn"
              :class="{ activeBtn: showDropdown.sort || filters.sort }"
            >
              Tri
              <font-awesome-icon :icon="['fas', 'chevron-down']" v-if="!showDropdown.sort" />
              <font-awesome-icon :icon="['fas', 'chevron-up']" v-else />
            </button>

            <div class="filter__dropdown filter__dropdown-sort" v-if="showDropdown.sort">
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
              <div class="filter__results">
                <button
                  class="mobile-filters__apply-btn ds-btn ds-btn--primary"
                  @click="resetDropdowns"
                >
                  Afficher les
                  <span v-if="offersList.data.length > 0">{{
                    offersList.data.length + ' résultats'
                  }}</span>
                  <span v-else>résultats</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Buttons addedFilters -->
        <div class="filters__button" v-if="Object.keys(addedFilters).length">
          <div class="filters__button-flex">
            <template v-for="(value, key) in addedFilters" :key="key">
              <!-- cas d’une liste (ex: brand, condition…) -->
              <button
                v-if="Array.isArray(value)"
                v-for="(val, idx) in value"
                :key="`${key}-${val}`"
                @click="removeFilter(key, idx)"
                class="ds-filter-btn ds-filter-btn--added"
              >
                {{ val }} <font-awesome-icon :icon="['fas', 'times']" />
              </button>

              <!-- cas d’un filtre simple (priceMin, priceMax) -->
              <button
                v-else-if="Number(value)"
                @click="removeFilter(key)"
                class="ds-filter-btn ds-filter-btn--added"
              >
                {{
                  key === 'priceMin'
                    ? `De ${Number(value).toFixed(2)} €`
                    : key === 'priceMax'
                      ? `À ${Number(value).toFixed(2)} €`
                      : value
                }}
                <font-awesome-icon :icon="['fas', 'times']" />
              </button>

              <!-- cas du filtre sort -->
              <button
                v-else-if="key === 'sort' && value"
                class="ds-filter-btn ds-filter-btn--added"
                @click="removeFilter(key)"
              >
                {{ value === 'price:asc' ? 'Prix croissant' : 'Prix décroissant' }}
                <font-awesome-icon :icon="['fas', 'times']" />
              </button>
            </template>
          </div>

          <!-- lien effacer les filtres -->
          <p
            v-if="
              Object.values(filters).some((v) => v !== null && (!Array.isArray(v) || v.length > 0))
            "
            @click="removeAllFilters"
            class="filter__clear-all"
          >
            Effacer les filtres
          </p>
        </div>
      </div>

      <div v-else>
        <p class="load-message">En cours de chargement</p>
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
        <div
          @click="changePage('prev')"
          :class="{ disable: page === 1 }"
          class="offers-pagination__box"
        >
          <font-awesome-icon :icon="['fas', 'chevron-left']" />
        </div>
        <div
          v-for="num in totalPage"
          class="offers-pagination__box"
          :class="{ activePage: page === num }"
        >
          <span @click="changePage('num', num)" class="text-md">{{ num }}</span>
        </div>
        <div
          @click="changePage('next')"
          :class="{ disable: page === totalPage }"
          class="offers-pagination__box"
        >
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
      <div class="mobile-filters__header-top">
        <button class="mobile-filters__back-btn" @click="onMobileHeaderBack">
          <font-awesome-icon :icon="['fas', mobileFilterSection ? 'arrow-left' : 'times']" />
        </button>

        <h2>{{ mobileFilterSection ? mobileFilterTitles[mobileFilterSection] : 'Filtrer' }}</h2>

        <h2 @click="handleHeaderClear">{{ mobileFilterSection ? 'Supprimer' : 'Effacer tout' }}</h2>
      </div>

      <div class="brand__navigation" v-if="mobileFilterSection === 'brand'">
        <div class="ds-search-input">
          <font-awesome-icon :icon="['fas', 'search']" />
          <input
            class="mobile-filters__search"
            type="text"
            v-model="inputBrand"
            placeholder="Recherche une marque"
          />
          <font-awesome-icon :icon="['fas', 'times']" v-if="inputBrand" @click="inputBrand = ''" />
        </div>
      </div>
    </div>

    <!-- content ----->
    <div class="mobile-filters__content">
      <!-- 1. filters list -->
      <div v-if="!mobileFilterSection">
        <div
          class="mobile-filters__item"
          v-for="(label, key) in mobileFilterTitles"
          :key="key"
          @click="selectMobileFilter(key)"
        >
          <span class="mobile-filters__label">{{ label }}</span>

          <div class="mobile-filters__summary-svg">
            <span
              class="mobile-filters__summary"
              :class="{ summaryActive: mobileFiltersSummaries[key] != 'Tous' }"
              >{{ mobileFiltersSummaries[key] }}</span
            >
            <font-awesome-icon :icon="['fas', 'chevron-right']" />
          </div>
        </div>
      </div>

      <!-- 2. size -->
      <div v-else-if="mobileFilterSection === 'size'">
        <ul class="mobile-filters__list">
          <li v-for="size in availableSizes" :key="size.id" class="mobile-filters__list-item">
            <label>
              <span>{{ size.displayName }}</span>
              <input type="checkbox" :value="size.name" v-model="filters.size" />
            </label>
          </li>
        </ul>
      </div>

      <!-- 3. brand -->
      <div v-else-if="mobileFilterSection === 'brand'">
        <ul class="mobile-filters__list">
          <li v-for="brand in filteredBrands" :key="brand.id" class="mobile-filters__list-item">
            <label>
              <span>{{ brand.displayName }}</span>
              <input type="checkbox" :value="brand.name" v-model="filters.brand" />
            </label>
          </li>
        </ul>
      </div>

      <!-- 4. condition -->
      <div v-else-if="mobileFilterSection === 'condition'">
        <ul class="mobile-filters__list">
          <li
            v-for="condition in availableConditions"
            :key="condition.name"
            class="mobile-filters__list-item"
          >
            <label>
              <div>
                <span>{{ condition.name }}</span>
                <p class="condition__description">{{ condition.description }}</p>
              </div>
              <input type="checkbox" :value="condition.name" v-model="filters.condition" />
            </label>
          </li>
        </ul>
      </div>

      <!-- 5. color -->
      <div v-else-if="mobileFilterSection === 'color'">
        <ul class="mobile-filters__list">
          <li v-for="color in availableColors" :key="color.id" class="mobile-filters__list-item">
            <label>
              <div class="color__item-block">
                <div
                  class="filter__color-circle"
                  :style="color.hex ? { backgroundColor: color.hex } : { background: color.style }"
                  :class="{
                    isWhite:
                      color.name === 'blanc' || color.name === 'creme' || color.name === 'beige',
                  }"
                ></div>
                <span> {{ color.displayName }}</span>
              </div>
              <input type="checkbox" :value="color.name" v-model="filters.color" />
            </label>
          </li>
        </ul>
      </div>

      <!-- 5. price -->
      <div v-else-if="mobileFilterSection === 'price'">
        <div class="filters__price-group">
          <label class="filters__price-bloc">
            <span>De</span>
            <input
              type="number"
              name="priceMin"
              id="priceMin"
              placeholder="0,00€"
              v-model.number="filters.priceMin"
            />
          </label>

          <label class="filters__price-bloc">
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
        <ul class="mobile-filters__list">
          <li
            v-for="material in availableMaterials"
            :key="material.id"
            class="mobile-filters__list-item"
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
        <ul class="mobile-filters__list">
          <li v-for="sort in availableSorts" :key="sort.name" class="mobile-filters__list-item">
            <label>
              <span>{{ sort.displayName }}</span>
              <input type="radio" name="sort" id="sort" :value="sort.name" v-model="filters.sort" />
            </label>
          </li>
        </ul>
      </div>
    </div>

    <!-- Footer -->
    <div class="mobile-filters__footer">
      <button class="mobile-filters__apply-btn ds-btn ds-btn--primary" @click="closeMobileFilters">
        Afficher les
        <span v-if="offersList.data.length > 0">{{ offersList.data.length + ' résultats' }}</span>
        <span v-else>résultats</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
/* SMALL / MOBILE (< 720px) */
.container__catalog {
  padding: 10px;
}

/* HEADER -----------------------*/
/* BANNER --------------*/
.catalog__banner {
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
.ds-filter-btn {
  margin-top: 10px;
  margin-bottom: 20px;
}

/* MENU */
.mobile-filters__overlay {
  position: fixed;
  top: 0px;
  width: 100%;
  height: 100%;
  background-color: white;
  z-index: 2000;
  display: flex;
  flex-direction: column;
}

/* HEADER */
.mobile-filters__header {
  border-bottom: 1px solid var(--color-light-gray);
}

.mobile-filters__header-top {
  display: flex;
  justify-content: space-between;
  padding: 16px;
  align-items: center;
}

.brand__navigation {
  padding: 0px 6px 6px 6px;
}

.mobile-filters__header button {
  color: var(--color-primary);
  border: none;
  background-color: white;
  font-size: 20px;
}

/* CONTENT-LIST */
.mobile-filters__content {
  width: 100%;
  height: 100%;
  overflow-y: scroll;
}

.mobile-filters__item,
.mobile-filters__list-item {
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.mobile-filters__label,
.mobile-filters__list-item > label > span,
.mobile-filters__list-item > label > div > span {
  color: var(--color-black);
  font-weight: var(--font-weight-medium);
}

.mobile-filters__summary-svg {
  color: var(--color-gray);
  display: flex;
  align-items: center;
  font-weight: var(--font-weight-light);
}

.mobile-filters__summary {
  margin-right: 10px;
}

.summaryActive {
  color: var(--color-primary);
}

.mobile-filters__summary-svg svg {
  color: var(--color-light-gray);
  font-size: 14px;
}

/* CONTENT-INPUT */
.mobile-filters__list-item label {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

/* checkbox */
input[type='checkbox'] {
  /* desactiver */
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  margin: 0;
  padding: 0;

  /* style */
  width: 24px;
  height: 24px;
  border: 2px solid var(--color-light-gray);
  border-radius: var(--radius);
  background-color: white;
  cursor: pointer;
  position: relative; /* nécessaire pour positionner le “check” */
}

input[type='checkbox']::after {
  content: '';
  position: absolute;
  top: 3px;
  left: 7px;
  width: 4px;
  height: 10px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
  opacity: 0;
  transition: opacity 0.1s ease-in-out;
}

input[type='checkbox']:checked {
  border-color: var(--color-primary);
  background-color: var(--color-primary);
}

input[type='checkbox']:checked::after {
  opacity: 1;
}

/* condition */
.condition__description {
  color: var(--color-gray);
  font-size: var(--font-span-lg);
  font-weight: var(--font-weight-light);
  line-height: var(--line-height-mid);
  margin-top: 5px;
}

/* color */
.color__item-block {
  display: flex;
  align-items: center;
  gap: 10px;
}

/* price */
.filters__price-group {
  display: flex;
  justify-content: flex-start;
  padding: 16px;
  gap: 20px;
}

.filters__price-bloc {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 194px;
}

.filters__price-bloc span,
.price__dropdown label {
  color: var(--color-gray);
  font-size: var(--font-span-md);
}

input[type='number']::-webkit-outer-spin-button,
input[type='number']::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
input[type='number'] {
  -moz-appearance: textfield;
}

input[type='number'] {
  border: none;
  border-bottom: 1px solid var(--color-light);
  font-size: var(--font-span-lg);
  font-weight: var(--font-weight-light);
  padding: 0px 0px 6px 0px;
  color: var(--color-black);
}

input[type='number']:focus {
  outline: none;
  border-bottom: 1px solid var(--color-primary);
}

/* APPLY BTN */
.mobile-filters__footer {
  width: 100%;
  padding: 16px;
  position: fixed;
  bottom: 0px;
  background-color: white;
}

/* FILTERS NORMAL -------*/
.filters {
  display: none;
}

/* COLORS */
.filter__color-circle {
  width: 20px;
  height: 20px;
  border-radius: 50px;
}

.isWhite {
  border: 1px solid lightgray;
}

/* ADDED FILTERS --------*/
.filters__button {
  display: none;
}

/* CHILD LINKS ----------*/
.catalog__child-links {
  display: none;
}

/* OFFERS -----------------------*/
.catalog__number-results > p {
  color: var(--color-gray);
}

.catalog__offers {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 20px;
  scroll-margin-top: var(--header-mobile-height);
}

/* PAGINATION -----------*/
.catalog__offers-pagination {
  display: flex;
  border: 1px solid var(--color-light);
  border-radius: var(--radius);
  width: 100%;
  overflow: hidden;
  margin-top: 10px;
}

.offers-pagination__box {
  width: 40px;
  height: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  color: var(--color-gray);
}

.activePage {
  background-color: #fafafb;
  color: var(--color-black);
}

.catalog__offers-pagination svg {
  color: var(--color-gray);
  font-size: var(--font-span-md);
}

.disable {
  opacity: 0.2;
}

/* MEDIUM (>= 720px) */
@media (min-width: 720px) {
  .container {
    padding: 0px 10px;
  }
  h1 {
    padding-bottom: 10px;
    border-bottom: 1px solid var(--color-light);
  }

  /* FILTERS -------------- */
  .filters {
    display: flex;
    margin-top: 16px;
    gap: 10px;
    flex-wrap: wrap;
  }
  .ds-filter-btn {
    margin-top: 0px;
    margin-bottom: 0px;
  }
  .filters__bloc {
    position: relative;
  }
  .filter__dropdown {
    background-color: white;
    width: 340px;
    max-height: 416px;
    position: absolute;
    top: 60px;
    display: flex;
    box-shadow: rgba(21, 25, 26, 0.12) 0px 4px 12px 0px;
    flex-direction: column;
  }
  .filter__list-wrapper {
    overflow-y: auto;
    flex: 1 1 auto;
  }

  .filter__item {
    border-bottom: 1px solid var(--color-light);
    background-color: white;
    transition: background-color 0.3s;
    width: 100%;
    height: 100%;
  }

  .filter__item:hover {
    background-color: var(--color-light);
  }

  .filter__item > label {
    padding: 16px 16px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-weight: var(--font-weight-medium);
    width: 100%;
    height: 100%;
    cursor: pointer;
  }

  .filter__results {
    padding: 16px;
    background: white;
    width: 100%;
    flex: 0 0 auto;
  }

  /* Size */
  .filter__title {
    color: var(--color-gray);
    padding-left: 16px;
    padding-top: 16px;
    margin-bottom: 5px;
  }

  /* Brand search */
  .ds-search-input {
    background-color: white;
    padding: 16px;
    margin-top: 16px;
  }
  .ds-search-input > input[type='text'] {
    background-color: white;
    border-bottom: 1px solid var(--color-light);
    padding: 0px 0px 6px 0px;
  }

  /* Condition */
  .condition__label > div {
    flex: 1 1 0;
  }

  .condition__label > div > p {
    font-size: var(--font-span-lg);
    font-weight: var(--font-weight-light);
    color: var(--color-gray);
    line-height: var(--line-height-mid);
    margin-top: 5px;
  }

  /* Color */
  .filter__color-name {
    display: flex;
    gap: 10px;
    align-items: center;
  }
  .filter__color-name p {
    font-size: var(--font-span-lg);
    font-weight: var(--font-weight-medium);
  }

  /* Price */
  .price__dropdown {
    padding: 16px;
    display: flex;
    gap: 25px;
    width: fit-content;
    flex-direction: row;
    box-shadow: rgba(21, 25, 26, 0.12) 0px 4px 12px 0px;
  }
  .price__dropdown label {
    display: flex;
    flex-direction: column;
    gap: 16px;
    width: 100px;
  }

  /* Material & Sort */
  .filter__dropdown-material,
  .filter__dropdown-sort {
    right: 0;
  }

  /* ADDED FILTERS -------- */
  .filters__button {
    display: flex;
    margin-top: 32px;
    flex-direction: column;
    gap: 16px;
    border-bottom: 1px solid var(--color-light);
  }

  .filters__button-flex {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    align-items: center;
  }

  .filter__clear-all {
    align-self: flex-end;
    color: var(--color-primary);
    cursor: pointer;
    font-weight: var(--font-weight-medium);
    margin-bottom: 16px;
  }

  /* CHILD LINKS ------- */
  .catalog__child-links {
    display: block;
    padding: 16px 0px;
    border-bottom: 1px solid var(--color-light);
  }
  .catalog__child-links > ul {
    columns: 3;
  }
  .catalog__child-links li {
    margin-bottom: 10px;
  }
  .catalog__child-links a {
    text-decoration: none;
    color: var(--color-primary);
    font-size: 13px;
  }

  /* RESULTS */
  .catalog__number-results {
    margin-top: 16px;
  }

  /* OFFERS */
  .catalog__offers {
    gap: 15px;
  }
}

@media (min-width: 844px) {
  .filter__dropdown-material {
    left: 0;
  }
}

/* DESKTOP (>= 960px) */
@media (min-width: 960px) {
  .filter__dropdown-sort {
    left: 0;
  }
}

/* DESKTOP LARGE (>= 1200px) */
@media (min-width: 1200px) {
}
</style>
