<script setup>
import { ref, computed, onMounted, watch, onBeforeUnmount, inject } from 'vue'
import axios from 'axios'
import { debounce } from 'lodash'
import { useRouter } from 'vue-router'

// -----------------------------------------
// BASE VARIABLES
// -----------------------------------------

// 1. Import variables
const GlobalStore = inject('GlobalStore')
const router = useRouter()

// 1. Form refs
const pictures = ref(null)
const fileInput = ref(null)
const title = ref(null)
const description = ref(null)
const category = ref(null)
const brand = ref(null)
const customBrand = ref(null)
const size = ref(null)
const condition = ref(null)
const color = ref([])
const material = ref([])
const price = ref([])

// 2. Message and Error
const isSubmitting = ref(false)
const errorMessage = ref({
  pictures: null,
  title: null,
  description: null,
  category: null,
  brand: null,
  size: null,
  condition: null,
  colors: null,
  price: null,
})

// 3. Dropdown state
const dropdowns = ref({
  category: false,
  brand: false,
  size: false,
  condition: false,
  colors: false,
  materials: false,
})

// 4. Category Input
const firstCategories = ref([])
const currentCategories = ref([])
const selectedPath = ref([])
const searchCategory = ref('')
const filteredCategories = ref([])
const noChildrenCategories = ref([])
const breadCrumbArray = ref([])
const categoriesWithBreadCrumb = ref([])

// 5. Brand Input
const availableBrand = ref([])
const searchBrand = ref('')
const filteredBrand = ref([])

// 6. Size Input
const availableSizes = ref([])

// 7. Condition Input
const availableConditions = [
  {
    name: 'Neuf avec étiquette',
    description:
      'Article neuf, jamais porté/utilisé avec étiquettes ou dans son emballage d’origine.',
  },
  {
    name: 'Neuf sans étiquette',
    description: 'Article neuf, jamais porté/utilisé, sans étiquettes ni emballage d’origine.',
  },
  {
    name: 'Très bon état',
    description:
      'Article très peu porté/utilisé qui peut présenter de légères imperfections, mais qui reste en très bon état. Précise avec des photos et une description détaillée, les défauts de ton article.',
  },
  {
    name: 'Bon état',
    description:
      'Article porté/utilisé quelques fois, présentant des imperfections et des signes d’usure. Précise avec des photos et une description détaillée, les défauts de ton article.',
  },
  {
    name: 'Satisfaisant',
    description:
      'Article porté/utilisé plusieurs fois, présentant des imperfections et des signes d’usure. Précise avec des photos et une description détaillée, les défauts de ton article.',
  },
]

// 8. Color Input
const availableColors = ref([])
const colorsDropdownRef = ref(null)

// 9. Material Input
const availableMaterials = ref([])
const materialsDropdownRef = ref(null)

// 10. Categories images
const mainCategoryImages = {
  femmes: '/images/categories/femmes.png',
  hommes: '/images/categories/hommes.png',
  enfants: '/images/categories/enfants.png',
  maison: '/images/categories/maison.png',
  electronique: '/images/categories/electronique.png',
  divertissement: '/images/categories/divertissement.png',
}
const categoryImages = {
  // 🌸 Femmes
  femmes: '/images/categories/femmes.png',
  'femmes-vetements': '/images/categories/femmes-vetements.png',
  'femmes-chaussures': '/images/categories/femmes-chaussures.png',
  'femmes-sacs': '/images/categories/femmes-sacs.png',
  'femmes-accessoires': '/images/categories/femmes-accessoires.png',
  'femmes-beaute': '/images/categories/femmes-beaute.png',

  // 🧔 Hommes
  hommes: '/images/categories/hommes.png',
  'hommes-vetements': '/images/categories/hommes-vetements.png',
  'hommes-chaussures': '/images/categories/hommes-chaussures.png',
  'hommes-accessoires': '/images/categories/hommes-accessoires.png',
  'hommes-soins': '/images/categories/hommes-soins.png',

  // 👶 Enfants
  enfants: '/images/categories/enfants.png',
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
  maison: '/images/categories/maison.png',

  // Divertissement
  divertissement: '/images/categories/divertissement.png',

  // Electronique
  electronique: '/images/categories/electronique.png',
}
// -----------------------------------------
// BASE FUNCTIONS
// -----------------------------------------

// 1. File input
const triggerSelectFile = () => {
  fileInput.value.click()
}

const selectFile = (event) => {
  errorMessage.value.pictures = ''
  const files = Array.from(event.target.files)

  if (files.length <= 20) {
    pictures.value = files
  } else if (files.length > 20) {
    errorMessage.value.pictures = '20 photos maximum'
    pictures.value = null
  } else {
    errorMessage.value.pictures = 'Un problème est survenu'
  }
}

const urlsListPreview = computed(() => {
  const tab = []

  for (const picture of pictures.value) {
    tab.push(URL.createObjectURL(picture))
  }
  return tab
})

const removeAddedImg = (index) => {
  pictures.value.splice(index, 1)
}

// 2. Category Input dropdown
const selectedCategory = (cat) => {
  selectedPath.value.push(cat)

  const enfants = cat.attributes.children?.data || []

  currentCategories.value = Array.isArray(enfants) ? enfants : []

  if (currentCategories.value.length === 0) {
    category.value = cat
    currentCategories.value = firstCategories.value
    dropdowns.value.category = false

    fetchSizes(category.value.attributes.name)
  }

  if (size.value) {
    size.value = null
  }
}

const selectedCategoryBysearch = (cat) => {
  fetchSizes(cat.attributes.name)
  dropdowns.value.category = false

  if (size.value) {
    size.value = null
  }
}

const backCategory = () => {
  if (selectedPath.value.length === 1) {
    currentCategories.value = firstCategories.value
  } else {
    currentCategories.value =
      selectedPath.value[selectedPath.value.length - 2].attributes.children.data
  }

  selectedPath.value.pop()
}

const currentLabel = computed(() => {
  const last = selectedPath.value[selectedPath.value.length - 1]
  return last
})

const getBreadCrumb = (cat, breadCrumb = []) => {
  const parent = cat.attributes.parent?.data

  if (parent) {
    getBreadCrumb(parent, breadCrumb)
  }

  breadCrumb.push(cat.attributes.displayName)
  return breadCrumb.join(' > ')
}

const getAllBreadCrumb = (array) => {
  breadCrumbArray.value = []

  for (const categorie of array) {
    breadCrumbArray.value.push(getBreadCrumb(categorie))
  }
  categoriesWithBreadCrumb.value = noChildrenCategories.value.map((cat, index) => {
    return { id: cat.id, attributes: cat.attributes, breadCrumb: breadCrumbArray.value[index] }
  })
}

// 3. Color Input dropdown
const isDisabledColor = (c) => {
  return color.value.length >= 2 && !color.value.includes(c)
}

// 4. Handle click outdside
const handleClickOutside = (event) => {
  if (
    dropdowns.value.colors &&
    colorsDropdownRef.value &&
    !colorsDropdownRef.value.contains(event.target)
  ) {
    dropdowns.value.colors = false
  }

  if (
    dropdowns.value.materials &&
    materialsDropdownRef.value &&
    !materialsDropdownRef.value.contains(event.target)
  ) {
    dropdowns.value.materials = false
  }
}

// 4. Material Input dropdown
const isDisabledMaterial = (m) => {
  return material.value.length >= 3 && !material.value.includes(m)
}

// -----------------------------------------
// API REQUEST
// -----------------------------------------

// 1. Category Input
const fetchLevel1 = async () => {
  try {
    const response = await axios.get(
      'http://localhost:1337/api/categories?filters[categoryLevel][$eq]=level1&populate[0]=children&populate[1]=children.children&populate[2]=children.children.children&populate[3]=children.children.children.children',
    )

    firstCategories.value = response.data.data
    currentCategories.value = firstCategories.value
  } catch (error) {
    console.log('Erreur fetchLevel1', error)
  }
}

const filterCategories = async (textInput) => {
  try {
    const response = await axios.get(
      `http://localhost:1337/api/categories/?filters[displayName][$containsi]=${textInput}&[populate[0]=parent&populate[1]=parent.parent&populate[2]=parent.parent.parent&populate[3]=parent.parent.parent.parent&populate[4]=parent.parent.parent.parent.parent&populate[5]=children&pagination[pageSize]=200`,
    )
    filteredCategories.value = response.data.data

    noChildrenCategories.value = filteredCategories.value.filter(
      (cat) => cat.attributes.children.data.length === 0,
    )

    getAllBreadCrumb(noChildrenCategories.value)

    if (textInput.length === 0) {
      currentCategories.value = firstCategories.value
    } else if (noChildrenCategories.value.length === 0) {
      currentCategories.value = []
    } else {
      currentCategories.value = categoriesWithBreadCrumb.value
    }
  } catch (error) {
    console.log('Erreur lors de la requete pour afficher les categories par search', error)
  }
}

const debouncedFilterCategories = debounce((value) => {
  filterCategories(value)
}, 400)

// 2. Brand Input
const fetchPopularBrands = async () => {
  try {
    const response = await axios.get(
      `http://localhost:1337/api/brands?filters[isPopular]=true&pagination[pageSize]=50`,
    )

    availableBrand.value = response.data.data
  } catch (error) {
    console.log('Erreur lors de la requete pour afficher des marques populaires')
  }
}

const filterBrands = async (textInput) => {
  try {
    const response = await axios.get(
      `http://localhost:1337/api/brands?filters[displayName][$containsi]=${textInput}&pagination[pageSize]=100`,
    )
    filteredBrand.value = response.data.data
  } catch (error) {
    console.log('Erreur lors de la requete pour afficher des marques par search', error)
  }
}

const debouncedFilterBrands = debounce((value) => {
  filterBrands(value)
}, 400)

// 3. Size Input
const fetchSizes = async (categoryName) => {
  try {
    const response = await axios.get(
      `http://localhost:1337/api/sizes/category/${categoryName}?onlySizes=true`,
    )

    availableSizes.value = response.data

    if (availableSizes.value.length === 0) {
      size.value = null
    }
  } catch (error) {
    console.log('Erreur lors de la requete pour afficher les sizes')
  }
}

// 4. Colors Input
const fetchColors = async () => {
  try {
    const response = await axios.get('http://localhost:1337/api/colors?pagination[pageSize]=50')

    availableColors.value = response.data.data
  } catch (error) {
    console.log(('Erreur lors du chargement des couleurs', error))
  }
}

// 5. Materials Input
const fetchMaterials = async () => {
  try {
    const response = await axios.get('http://localhost:1337/api/materials?pagination[pageSize]=100')

    availableMaterials.value = response.data.data.sort((a, b) =>
      a.attributes.displayName.localeCompare(b.attributes.displayName),
    )
  } catch (error) {
    console.log('Erreur lors du chargements des materials', error)
  }
}

// 6. Submission formData
const handleSubmit = async () => {
  isSubmitting.value = true
  Object.keys(errorMessage.value).forEach((key) => {
    errorMessage.value[key] = ''
  })

  if (!pictures.value || pictures.value?.length === 0) {
    errorMessage.value.pictures = 'Ajoute au moins une photo'
  }
  if (!title.value) {
    errorMessage.value.title = 'Titre : doit être renseigné'
  }
  if (!category.value) {
    errorMessage.value.category = 'Catégorie : doit être renseigné'
  }
  if (!brand.value) {
    errorMessage.value.brand = 'Marque : doit être renseigné'
  }
  if (!size.value && availableSizes.value.length > 0) {
    errorMessage.value.size = 'Taille : doit être renseigné'
  }
  if (!condition.value) {
    errorMessage.value.condition = 'État : doit être renseigné'
  }
  if (color.value.length === 0 || !color.value) {
    errorMessage.value.colors = 'Couleur : doit être renseigné'
  }
  if (!price.value || price.value < 1) {
    errorMessage.value.price = 'Prix : doit être supérieur ou égal à 1.0'
  }

  if (
    !pictures.value ||
    !title.value ||
    !category.value ||
    (!size.value && availableSizes.value.length > 0) ||
    !condition.value ||
    !color.value ||
    !price.value
  ) {
    isSubmitting.value = false
    return
  }
  const formData = new FormData()

  for (const picture of pictures.value) {
    formData.append('files.images', picture)
  }

  const offerData = {
    name: title.value,
    description: description.value,
    category: category.value.id,
    brand: brand.value.id,
    customBrand: customBrand.value || null,
    size: size.value?.id || null,
    condition: condition.value.name,
    colors: {
      connect: color.value.map((c) => ({ id: c.id })),
    },
    materials: {
      connect: material.value.map((m) => ({ id: m.id })),
    },
    price: price.value,
    owner: GlobalStore.userInfoCookie.value.id,
  }

  formData.append('data', JSON.stringify(offerData))

  try {
    const response = await axios.post('http://localhost:1337/api/offers?populate=*', formData, {
      headers: { Authorization: 'Bearer ' + GlobalStore.userInfoCookie.value.token },
      // 'Content-Type': 'multipart/form-data',
    })

    const newOffer = response.data.data
    console.log('response newOffer--->', newOffer)

    router.push({ name: 'product', params: { id: newOffer.id } })
  } catch (error) {
    console.log('Erreur lors de la soumission du formulaire', error)
  }

  isSubmitting.value = false
}

// -----------------------------------------
// WATCHERS
// -----------------------------------------
watch(searchCategory, (newValue) => {
  debouncedFilterCategories(newValue)
})

watch(searchBrand, (newValue) => {
  debouncedFilterBrands(newValue)
})

// -----------------------------------------
// ONMOUNTED
// -----------------------------------------
onMounted(() => {
  fetchLevel1()
  fetchPopularBrands()
  document.addEventListener('click', handleClickOutside)
  fetchColors()
  fetchMaterials()
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <main>
    <div class="container sell">
      <h1>Vends ton article</h1>

      <!-- FORMULAIRE -------------------->
      <form class="form" @submit.prevent="handleSubmit" v-if="!isSubmitting">
        <!-- PHOTO ------------->
        <div class="form__photo">
          <div class="form__photo-box">
            <label>
              <input
                type="file"
                name="pictures"
                id="pictures"
                multiple
                @input="selectFile"
                ref="fileInput"
              />

              <button
                type="button"
                @click="triggerSelectFile"
                class="ds-btn ds-btn--third"
                v-if="!pictures"
              >
                <font-awesome-icon class="form__photo-button-svg" :icon="['fas', 'plus']" />
                <span>Ajoute des photos</span>
              </button>
            </label>

            <!-- PREVIEW -->
            <div class="form__preview-box" v-if="pictures?.length > 0">
              <div v-for="(url, index) in urlsListPreview" class="form__preview-item">
                <img :src="url" />

                <div class="form__preview-remove" @click="removeAddedImg(index)">
                  <font-awesome-icon :icon="['fas', 'times']" />
                </div>
              </div>

              <div class="form__preview-item form__preview-addbox">
                <button
                  type="button"
                  @click="triggerSelectFile"
                  class="ds-btn ds-btn--third form__preview-add"
                >
                  <font-awesome-icon :icon="['fas', 'plus']" />
                </button>
              </div>
            </div>
          </div>

          <span v-if="errorMessage.pictures" class="form__error-message text-lg">
            {{ errorMessage.pictures }}
          </span>

          <div class="form__photo-advice">
            <font-awesome-icon :icon="['fas', 'tshirt']" />
            <span class="text-md">Attire l'œil des acheteurs : utilise des photos de qualité.</span>
          </div>
        </div>

        <!-- TITLE ------------->
        <div class="form__title form-flex">
          <h2>Titre</h2>
          <input
            type="text"
            name="title"
            id="title"
            v-model="title"
            placeholder="ex : Chemise Sézanne verte"
            class="text-input"
          />
          <p v-if="errorMessage.title" class="form__error-message">{{ errorMessage.title }}</p>
        </div>

        <!-- DESCRIPTION ------------->
        <div class="form__description form-flex">
          <h2>Décris ton article</h2>
          <textarea
            name="description"
            id="description"
            v-model="description"
            placeholder="ex : porté quelques fois, taille correctement"
          ></textarea>
          <p v-if="errorMessage.description" class="form__error-message">
            {{ errorMessage.description }}
          </p>
        </div>

        <!-- DETAILS ------------->
        <div class="form__details">
          <!-- CATEGORY ---------->
          <div class="form__category form-flex">
            <h2>Catégorie</h2>

            <!-- Toggle dropdown -->
            <div class="form__category-toggle" @click="dropdowns.category = !dropdowns.category">
              <span :class="{ placeholder: !category }">{{
                category ? category.attributes.displayName : 'Sélectionne une catégorie'
              }}</span>

              <font-awesome-icon :icon="['fas', 'chevron-down']" v-if="!dropdowns.category" />
              <font-awesome-icon :icon="['fas', 'chevron-up']" v-if="dropdowns.category" />
            </div>

            <!-- Categorie dropdown -->
            <div class="form__dropdown-overlay" v-if="dropdowns.category">
              <div class="container form__dropdown-content">
                <h2>Catégorie</h2>
                <font-awesome-icon :icon="['fas', 'times']" @click="dropdowns.category = false" />
                <!-- search -->
                <div class="form__search-input-box">
                  <input
                    type="text"
                    name="searchCategory"
                    id="searchCategory"
                    placeholder="Trouver une catégorie"
                    v-model="searchCategory"
                    class="ds-search-input ds-search-input--rounded"
                  />
                  <font-awesome-icon
                    :icon="['fas', 'times']"
                    v-if="searchCategory"
                    @click="searchCategory = ''"
                  />
                </div>

                <!-- results ------->
                <div>
                  <ul class="form__category-list">
                    <!-- by click -->
                    <div class="form__category-click" v-if="!searchCategory">
                      <!-- click label -->
                      <div class="form__category-click-header" v-if="selectedPath.length > 0">
                        <font-awesome-icon :icon="['fas', 'arrow-left']" @click="backCategory()" />
                        <span>{{ currentLabel.attributes.displayName }}</span>
                      </div>

                      <!-- click list -->
                      <ul class="form__category-click-list">
                        <li
                          class="form__category-click-item"
                          v-for="cat in currentCategories"
                          :key="cat.id"
                          @click="selectedCategory(cat)"
                        >
                          <div>
                            <img
                              :src="categoryImages[cat.attributes.name]"
                              alt="Icône de catégorie"
                              v-if="categoryImages[cat.attributes.name]"
                            />

                            <span>{{ cat.attributes.displayName }}</span>
                          </div>

                          <font-awesome-icon
                            :icon="['fas', 'chevron-right']"
                            v-if="cat.attributes.children?.data?.length"
                          />
                        </li>
                      </ul>
                    </div>

                    <!-- by search -->
                    <div
                      class="form__category-search"
                      v-else-if="currentCategories[0]?.breadCrumb && currentCategories.length"
                    >
                      <!-- search list -->
                      <li
                        class="form__category-search-item"
                        v-for="cat in currentCategories"
                        :key="cat.id"
                      >
                        <label>
                          <div>
                            <span>{{ cat.attributes.displayName }}</span>
                            <p>{{ cat.breadCrumb }}</p>
                          </div>
                          <input
                            type="radio"
                            name="category"
                            id="category"
                            v-model="category"
                            :value="cat"
                            @change="selectedCategoryBysearch(cat)"
                          />
                        </label>
                      </li>
                    </div>

                    <!-- if not found -->
                    <div v-else class="form__category-no-result">
                      <font-awesome-icon :icon="['fas', 'search']" />
                      <h1>Aucune catégorie trouvée</h1>
                      <p>
                        Aucun article ne correspond à ta recherche. Essaie avec un autre mot-clé.
                      </p>
                    </div>
                  </ul>
                </div>
              </div>
            </div>

            <p v-if="errorMessage.category" class="form__error-message">
              {{ errorMessage.category }}
            </p>
          </div>

          <!-- if category selected -->
          <div class="form__details-ifcategory" v-if="category">
            <!-- BRAND -->
            <div class="form__brand form-flex">
              <h2>Marque</h2>

              <!-- Toggle dropdown -->
              <div @click="dropdowns.brand = !dropdowns.brand">
                <span class="placeholder" v-if="!brand && !customBrand"
                  >Sélectionne une marque</span
                >
                <span v-else-if="brand && !customBrand">{{ brand.attributes.displayName }}</span>
                <span v-else-if="!brand && customBrand">{{ customBrand }}</span>

                <font-awesome-icon :icon="['fas', 'chevron-down']" v-if="!dropdowns.brand" />
                <font-awesome-icon :icon="['fas', 'chevron-up']" v-if="dropdowns.brand" />
              </div>

              <!-- Brand dropdown -->
              <div v-if="availableBrand && dropdowns.brand" class="form__dropdown-overlay">
                <div class="form__dropdown-content form__dropdown-content--details">
                  <h2>Marque</h2>
                  <font-awesome-icon :icon="['fas', 'times']" @click="dropdowns.brand = false" />
                  <!-- search -->
                  <div class="form__search-input-box">
                    <input
                      type="text"
                      name="searchBrand"
                      id="searchBrand"
                      placeholder="Trouver une marque"
                      v-model="searchBrand"
                      class="ds-search-input ds-search-input--rounded"
                    />
                  </div>

                  <!-- results ------->
                  <div class="form__details-scroll">
                    <ul class="form__brand-list">
                      <!-- by click -->
                      <div class="form__details-click" v-if="!searchBrand">
                        <!-- click label -->
                        <span>Marques populaires</span>
                        <!-- click list -->
                        <li v-for="b in availableBrand" :key="b.id" class="form__details-item">
                          <label
                            >{{ b.attributes.displayName }}
                            <input
                              type="radio"
                              name="brand"
                              id="brand"
                              v-model="brand"
                              :value="b"
                              @change="dropdowns.brand = false"
                          /></label>
                        </li>
                      </div>

                      <!-- by search -->
                      <div class="form__brand-search form__details-scroll" v-if="filteredBrand">
                        <!-- search list -->
                        <ul class="form__brand-list">
                          <div class="form__details-click form__details-search">
                            <li v-for="b in filteredBrand" :key="b.id" class="form__details-item">
                              <label
                                >{{ b.attributes.displayName }}
                                <input
                                  type="radio"
                                  name="searchBrand"
                                  id="searchBrand"
                                  v-model="brand"
                                  :value="b"
                                  @change="
                                    () => {
                                      ;(dropdowns.brand = false), (customBrand = null)
                                    }
                                  "
                              /></label>
                            </li>
                          </div>
                        </ul>
                        <!-- custom brand -->
                        <div class="form__details-search-custom">
                          <p>Marque non disponible</p>
                          <div class="form__details-search-custom-text-group">
                            <span class="form__details-search-custom-text">
                              Utiliser "{{ searchBrand }}" comme marque
                            </span>
                            <input
                              type="radio"
                              name="customBrand"
                              id="customBrand"
                              v-model="customBrand"
                              :value="searchBrand"
                              @change="
                                () => {
                                  ;(dropdowns.brand = false), (brand = null)
                                }
                              "
                            />
                          </div>
                        </div>
                      </div>
                    </ul>
                  </div>
                </div>
              </div>
              <p v-if="errorMessage.brand" class="form__error-message">{{ errorMessage.brand }}</p>
            </div>

            <!-- SIZE -->
            <div class="form__size form-flex" v-if="availableSizes.length > 0">
              <h2>Taille</h2>

              <!-- Toggle dropdown -->
              <div @click="dropdowns.size = !dropdowns.size">
                <span :class="{ placeholder: !size }">{{
                  size?.displayName || 'Sélectionne une taille'
                }}</span>

                <font-awesome-icon :icon="['fas', 'chevron-down']" v-if="!dropdowns.size" />
                <font-awesome-icon :icon="['fas', 'chevron-up']" v-if="dropdowns.size" />
              </div>

              <!-- Size dropdown -->
              <!-- results -->
              <div v-if="dropdowns.size && availableSizes" class="form__dropdown-overlay">
                <div class="form__dropdown-content form__dropdown-content--details">
                  <h2>Marque</h2>
                  <font-awesome-icon :icon="['fas', 'times']" @click="dropdowns.size = false" />
                  <span class="form__dropdown-size--text"
                    >Choisis la taille qui correspond à l'étiquette de l'article</span
                  >
                  <div class="form__details-scroll">
                    <ul class="form__brand-list form__size_list">
                      <div class="form__details-click">
                        <span class="form__size-text-group">{{
                          availableSizes[0].displayCategoryName
                        }}</span>

                        <li v-for="s in availableSizes" :key="s.id" class="form__details-item">
                          <label>
                            {{ s.displayName }}
                            <input
                              type="radio"
                              name="size"
                              id="size"
                              v-model="size"
                              :value="s"
                              @change="dropdowns.size = false"
                            />
                          </label>
                        </li>
                      </div>
                    </ul>
                  </div>
                </div>
                <p v-if="errorMessage.size" class="form__error-message">{{ errorMessage.size }}</p>
              </div>
            </div>

            <!-- CONDITION -->
            <div class="form__condition form-flex">
              <h2>État</h2>

              <!-- Toggle dropdown -->
              <div @click="dropdowns.condition = !dropdowns.condition">
                <span :class="{ placeholder: !condition }">{{
                  condition?.name || 'Sélectionne un état'
                }}</span>

                <font-awesome-icon :icon="['fas', 'chevron-down']" v-if="!dropdowns.condition" />
                <font-awesome-icon :icon="['fas', 'chevron-up']" v-if="dropdowns.condition" />
              </div>

              <!-- Condtion dropdown -->
              <!-- results -->
              <div v-if="dropdowns.condition && availableConditions" class="form__dropdown-overlay">
                <div
                  class="form__dropdown-content form__dropdown-content--details form__dropdown-content--condition"
                >
                  <h2>État</h2>
                  <font-awesome-icon
                    :icon="['fas', 'times']"
                    @click="dropdowns.condition = false"
                  />
                  <div class="form__details-scroll">
                    <ul class="form__condition-list">
                      <div class="form__details-click">
                        <li
                          v-for="(c, index) in availableConditions"
                          :key="index"
                          class="form__details-item form__condition-item"
                        >
                          <label>
                            <div>
                              <p class="form__condition-item-name">{{ c.name }}</p>
                              <p class="form__condition-item-description">{{ c.description }}</p>
                            </div>
                            <input
                              type="radio"
                              name="condition"
                              id="condition"
                              v-model="condition"
                              :value="c"
                              @change="dropdowns.condition = false"
                            />
                          </label>
                        </li>
                      </div>
                    </ul>
                  </div>
                </div>
              </div>
              <p v-if="errorMessage.condition" class="form__error-message">
                {{ errorMessage.condition }}
              </p>
            </div>

            <!-- COLOR -->
            <div class="form__color form-flex" ref="colorsDropdownRef">
              <h2>Couleur</h2>

              <!-- Toggle dropdown -->
              <div @click="dropdowns.colors = !dropdowns.colors">
                <span class="placeholder" v-if="color.length === 0">
                  {{ 'Sélectionne 2 couleurs maximum' }}
                </span>
                <span v-if="color" v-for="c in color" :key="c.id">
                  {{ c.attributes.displayName }}
                </span>

                <font-awesome-icon :icon="['fas', 'chevron-down']" v-if="!dropdowns.colors" />
                <font-awesome-icon :icon="['fas', 'chevron-up']" v-if="dropdowns.colors" />
              </div>

              <!-- Color dropdown -->
              <div v-if="availableColors && dropdowns.colors" class="form__dropdown-overlay">
                <div class="form__dropdown-content form__dropdown-content--details">
                  <h2>Couleur</h2>
                  <font-awesome-icon :icon="['fas', 'times']" @click="dropdowns.colors = false" />

                  <!-- results -->
                  <div class="form__details-scroll">
                    <ul class="form__colors-list">
                      <li v-for="c in availableColors" :key="c.id" class="form__details-item">
                        <label>
                          <div class="form__colors-group">
                            <div
                              class="form__colors-circle"
                              :class="{
                                colorBorder:
                                  c.attributes.name === 'blanc' || c.attributes.name === 'creme',
                              }"
                              :style="
                                c.attributes.hex
                                  ? { backgroundColor: c.attributes.hex }
                                  : { background: c.attributes.style }
                              "
                            ></div>
                            <span>{{ c.attributes.displayName }}</span>
                          </div>
                          <input
                            type="checkbox"
                            name="color"
                            id="color"
                            v-model="color"
                            :value="c"
                            :disabled="isDisabledColor(c)"
                        /></label>
                      </li>
                    </ul>
                  </div>
                </div>
                <p v-if="errorMessage.colors" class="form__error-message">
                  {{ errorMessage.colors }}
                </p>
              </div>
            </div>

            <!-- MATERIAL -->
            <div class="form__material form-flex" ref="materialsDropdownRef">
              <h2>Matière (recommandé)</h2>

              <!-- Toggle dropdown -->
              <div @click="dropdowns.materials = !dropdowns.materials">
                <span v-for="m in material" :key="m.id" v-if="material">
                  {{ m.attributes.displayName }}
                </span>
                <span v-if="material?.length === 0" class="placeholder">
                  {{ `Séléctionne jusqu'à 3 options` }}
                </span>

                <font-awesome-icon :icon="['fas', 'chevron-down']" v-if="!dropdowns.materials" />
                <font-awesome-icon :icon="['fas', 'chevron-up']" v-if="dropdowns.materials" />
              </div>

              <!-- Material dropdown -->
              <div v-if="availableMaterials && dropdowns.materials" class="form__dropdown-overlay">
                <div class="form__dropdown-content form__dropdown-content--details">
                  <h2>Matière (recommandé)</h2>
                  <font-awesome-icon
                    :icon="['fas', 'times']"
                    @click="dropdowns.materials = false"
                  />
                  <!-- results -->
                  <div class="form__details-scroll">
                    <ul class="form__materials-list">
                      <div class="form__details-click">
                        <li v-for="m in availableMaterials" :key="m.id" class="form__details-item">
                          <label>
                            {{ m.attributes.displayName }}
                            <input
                              type="checkbox"
                              name="material"
                              id="material"
                              v-model="material"
                              :value="m"
                              :disabled="isDisabledMaterial(m)"
                            />
                          </label>
                        </li>
                      </div>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- PRICE -->
        <div class="form__price form-flex">
          <h2>Prix</h2>
          <input type="number" name="price" id="price" v-model="price" placeholder="0,00€" />
          <p v-if="errorMessage.price" class="form__error-message">{{ errorMessage.price }}</p>
        </div>

        <!-- BUTTON SUBMIT FORM -->
        <button class="ds-btn ds-btn--primary">Ajouter</button>
      </form>

      <div v-else-if="isSubmitting">
        <p>En cours de chargement</p>
      </div>
    </div>
  </main>
</template>

<style scoped>
/* SMALL / MOBILE (< 720px) */
main {
  background-color: var(--color-light);
}
.container {
  padding: 32px 10px;
}
h1 {
  margin-bottom: 16px;
}
h2 {
  font-size: var(--font-span-md);
  color: var(--color-gray);
  font-weight: var(--font-weight-light);
  margin-bottom: 5px;
}

/* ----------------------------- */
/* FORMULAIRE                    */
/* ----------------------------- */
form {
  display: flex;
  flex-direction: column;
  gap: 32px;
}
form > div {
  padding: 16px;
  background-color: white;
  border-radius: var(--radius);
}

/* Photo -------*/
.form__photo-box {
  border: 2px dashed var(--color-light);
  min-height: 176px;
  display: flex;
  justify-content: center;
  align-items: center;
}
.form__photo-button-svg {
  margin-right: 8px;
}
.form__photo-advice {
  background-color: #c9f0ee;
  padding: 16px;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: 8px;
  margin-top: 16px;
  border-radius: var(--radius);
}
.form__photo-advice svg {
  color: var(--color-primary);
}
.form__photo-advice span {
  color: var(--color-gray);
  font-weight: var(--font-weight-light);
}

/* Photo preview */
.form__preview-box {
  height: 100%;
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  padding: 5px;
}
.form__preview-item {
  border-radius: var(--radius);
  width: calc(((100% - (2 * 10px)) / 3));
  aspect-ratio: 1/1;
  position: relative;
  overflow: hidden;
}
.form__preview-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.form__preview-remove {
  background-color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 8px;
  height: 32px;
  aspect-ratio: 1/1;
  position: absolute;
  right: 5px;
  top: 5px;
  border-radius: var(--radius);
}
.form__preview-add {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 0px !important;
}
.form__preview-addbox {
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
}
/* Description ----*/
textarea {
  height: 120px;
}

/* Details Inputs -------*/
.form__details {
  padding: 0px;
}

.form__category-toggle,
.form__details-ifcategory > div > div {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--color-lightest-gray);
  padding-bottom: 8px;
}

.form__category-toggle > span,
.form__details-ifcategory > div > div > span {
  color: var(--color-black);
}
.form__category-toggle > .placeholder,
.form__details-ifcategory > div > div > .placeholder {
  color: var(--color-gray);
}
.form__category-toggle > svg,
.form__details-ifcategory > div > div > svg {
  color: var(--color-gray);
}

.form__details-ifcategory > div,
.form__category {
  padding: 16px;
  border-bottom: 1px solid var(--color-light);
}

/* Category -------*/

/* Dropdown */
.form__dropdown-overlay {
  background-color: var(--color-overlay);
  position: fixed;
  width: 100vw;
  height: 100vh;
  top: 0;
  left: 0;
  z-index: 2000;
  display: flex;
  justify-content: center !important;
  align-items: center;
}
.form__dropdown-content {
  width: 70%;
  max-height: 650px;
  background-color: white;
  border-radius: var(--radius);
  padding: 16px 0px 0px 0px;
  position: relative;
}
.form__dropdown-content > h2 {
  font-size: var(--font-h2);
  font-weight: var(--font-weight-medium);
  color: var(--color-black);
  text-align: center;
  margin-bottom: 0px;
}
.form__dropdown-content > svg {
  font-size: var(--font-h1);
  color: var(--color-primary);
  position: absolute;
  right: 16px;
  top: 16px;
}

/* Search */
.form__search-input-box {
  padding: 16px;
  position: relative;
}
.form__search-input-box svg {
  color: var(--color-gray);
  position: absolute;
  right: 26px;
  top: 26px;
}
.ds-search-input {
  border-radius: var(--radius);
  font-size: var(--font-span-lg);
  font-weight: var(--font-weight-light);
}

/* By Click */
/* header */
.form__category-click-header {
  padding: 16px;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  border-bottom: 1px solid var(--color-light);
}
.form__category-click-header span {
  font-weight: var(--font-weight-medium);
}
.form__category-click-header svg {
  position: absolute;
  left: 16px;
  color: var(--color-primary);
  font: var(--font-h1);
}

/* item */
.form__category-click-list {
  overflow: scroll;
  max-height: 480px;
}
.form__category-click-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-bottom: 1px solid var(--color-light);
}

.form__category-click-item > div {
  display: flex;
  align-items: center;
}
.form__category-click-item img {
  width: 24px;
  height: 24px;
  margin-right: 8px;
  object-fit: cover;
}
.form__category-click-item span {
  font-weight: var(--font-weight-medium);
  line-height: var(--line-height-mid);
}
.form__category-click-item svg {
  color: var(--color-gray);
}

/* By search */
/* item */
.form__category-search {
  max-height: 480px;
  overflow-y: scroll;
}

.form__category-search-item > label {
  display: flex;
  justify-content: space-between;
  padding: 16px;
  align-items: center;
  gap: 8px;
  border-bottom: 1px solid var(--color-light);
}
.form__category-search-item > label > div {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.form__category-search-item > label > div > span {
  font-size: var(--font-span-lg);
  color: var(--color-black);
  font-weight: var(--font-weight-medium);
}
.form__category-search-item > label > div > p {
  font-size: var(--font-span-lg);
  font-weight: var(--font-weight-light);
  color: var(--color-gray);
  line-height: var(--line-height-mid);
}

/* if not found */
.form__category-no-result {
  padding: 16px 16px 32px 16px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 16px;
}
.form__category-no-result svg {
  font-size: 60px;
  color: var(--color-primary);
}
.form__category-no-result p {
  font-size: var(--font-span-lg);
  line-height: var(--line-height-mid);
  color: var(--color-gray);
  text-align: center;
}

/* Details dropdown ------*/
/* brand */
.form__dropdown-content--details {
  display: flex;
  flex-direction: column;
  max-height: 80vh;
  overflow: hidden;
  position: relative;
  padding: 16px 0 0;
  border-radius: var(--radius);
  background: #fff;
}
.form__details-scroll {
  overflow-y: auto;
  min-height: 0;
}
.form__details-click {
  padding: 16px 0px;
}
.form__details-search {
  padding: 0px 0px 16px 0px;
}

.form__details-click > span {
  color: var(--color-gray);
  font-size: var(--font-span-md);
  margin: 16px;
}

.form__details-item > label {
  padding: 16px 16px;
  display: flex;
  justify-content: space-between;
  border-bottom: 1px solid var(--color-lightest-gray);
  line-height: var(--line-height-mid);
}
.form__details-search-custom {
  padding: 0px 16px 16px 16px;
}
.form__details-search-custom > p:first-child {
  font-size: var(--font-span-md);
  color: var(--color-gray);
}
.form__details-search-custom-text-group {
  display: flex;
  justify-content: space-between;
}
.form__details-search-custom-text {
  color: var(--color-black);
  font-size: var(--font-span-lg);
  font-weight: var(--font-weight-medium);
  margin-top: 16px;
}

/* size */
.form__dropdown-size--text {
  font-size: var(--font-p);
  color: var(--color-gray);
  padding: 16px;
}
.form__size-text-group {
  font-size: var(--font-span-md);
  color: var(--color-gray);
}

/* condition */
.form__dropdown-content--condition {
  max-height: 700px;
}
.form__condition-item {
  margin-top: 0px;
}
.form__condition-item-name {
  color: var(--color-black);
  font-size: var(--font-span-lg);
  font-weight: var(--font-weight-medium);
  margin-bottom: 8px;
}
.form__condition-item-description {
  color: var(--color-gray);
  font-size: var(--font-span-lg);
  line-height: var(--line-height-mid);
}

/* colors */
.form__colors-circle {
  width: 22px;
  height: 22px;
  border-radius: 50%;
}
.colorBorder {
  border: 1px solid var(--color-gray);
}
.form__colors-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

/* Autres */
input[type='file'] {
  display: none;
}
.form__error-message {
  color: red;
}
.ds-btn {
  margin-bottom: 6px;
}

/* MEDIUM (>= 720px ) */
@media (min-width: 720px) {
  .container {
    padding: 24px;
  }

  .form__preview-item {
    width: calc(((100% - (4 * 10px)) / 5));
  }

  /* all div input */
  .form__photo,
  .form__title,
  .form__description,
  .form__category,
  .form__details-ifcategory .form__brand,
  .form__details-ifcategory .form__size,
  .form__details-ifcategory .form__condition,
  .form__details-ifcategory .form__color,
  .form__details-ifcategory .form__material,
  .form__price {
    padding: 24px;
  }

  /* all duv input except photo */
  .form__title,
  .form__description,
  .form__category,
  .form__details-ifcategory .form__brand,
  .form__details-ifcategory .form__size,
  .form__details-ifcategory .form__condition,
  .form__details-ifcategory .form__color,
  .form__details-ifcategory .form__material,
  .form__price {
    columns: 2;
  }

  /* input h2 */
  form > div > h2,
  .form__details > div > h2,
  .form__details > div > div > h2 {
    color: var(--color-black);
    font-size: var(--font-span-lg);
    font-weight: var(--font-weight-medium);
  }

  /* details dropdown -----*/
  /* category */
  .form__category,
  .form__brand,
  .form__size,
  .form__condition,
  .form__color,
  .form__material {
    position: relative;
  }
  .form__dropdown-overlay {
    position: absolute;
    width: 46%;
    height: 100%;
    top: 50px;
    left: auto;
    right: 24px;
  }
  .form__dropdown-content,
  .form__dropdown-content--details {
    position: absolute;
    top: -1px;
    left: 0px;
    padding: 0px;
    width: 100%;
    box-shadow: rgba(21, 25, 26, 0.12) 0px 4px 12px 0px;
    max-height: 500px;
  }
  .form__dropdown-content > h2,
  .form__dropdown-content > svg {
    display: none;
  }
}

/* DESKTOP (>= 960px) */
@media (min-width: 960px) {
  .container {
    max-width: 960px;
  }

  .form__dropdown-overlay {
    width: 47%;
  }
  .ds-btn {
    width: fit-content;
    margin-left: auto;
  }
}

/* DESKTOP LARGE (>= 1200px) */
@media (min-width: 1200px) {
}
</style>
