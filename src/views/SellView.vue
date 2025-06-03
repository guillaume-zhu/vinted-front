<script setup>
//// FORMDATA
// isSubmitting + error
// créer formdata vide
// append les images au formdata en bouclant + if hasOwnProperty
// stringifier les autres infos
// lancer la requete avec clé image + clé data avec stringified infos + authorization
// ajouter prévisualisation avec un computed et URL générer + boucler + if hasOwnProperty
// router.push a l'offre créée

//// A faire next
// soumission formulaire formdata + boutons

//// A ne pas oublier
// Ajouter display en fonction details si category a été choisi
// Verification lors de la soumission du formulaire que certains inputs sont bien remplis
// Gestion errorMessage

// Problemes
// no owner + no material + no colors
// fix no search category

import { ref, computed, onMounted, watch, onBeforeUnmount, inject } from 'vue'
import axios from 'axios'
import { debounce } from 'lodash'

// -----------------------------------------
// BASE VARIABLES
// -----------------------------------------

// 1. Import variables
const GlobalStore = inject('GlobalStore')

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

// -----------------------------------------
// BASE FUNCTIONS
// -----------------------------------------

// 1. File input
const triggerSelectFile = () => {
  fileInput.value.click()
}

const selectFile = (event) => {
  errorMessage.value.pictures = ''

  if (event.target.files.length <= 20) {
    pictures.value = event.target.files
    // console.log('pictures ---->', pictures.value)
  } else if (event.target.files.length > 20) {
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

// 2. Category Input dropdown
const selectedCategory = (cat) => {
  selectedPath.value.push(cat)

  const enfants = cat.attributes.children?.data || []

  currentCategories.value = Array.isArray(enfants) ? enfants : []

  // console.log(
  //   'Chemin actuel : selectedPath ---->',
  //   selectedPath.value,
  //   ' | Prochain niveau : currentCategories ---->',
  //   currentCategories.value,
  // )

  if (currentCategories.value.length === 0) {
    category.value = cat
    currentCategories.value = firstCategories.value
    dropdowns.value.category = false

    // console.log('Category value end ---->', category.value)
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
  // console.log('breadCrumbArray ---->', breadCrumbArray.value)
  categoriesWithBreadCrumb.value = noChildrenCategories.value.map((cat, index) => {
    return { id: cat.id, attributes: cat.attributes, breadCrumb: breadCrumbArray.value[index] }
  })

  // console.log('categoriesWithBreadCrumb ---->', categoriesWithBreadCrumb.value)
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
    // console.log('Catégories lvl1 chargée ---->', currentCategories.value)
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
    // console.log('Categories filtrées ---->', filteredCategories.value)

    noChildrenCategories.value = filteredCategories.value.filter(
      (cat) => cat.attributes.children.data.length === 0,
    )
    // console.log('No child categories ---->', noChildrenCategories.value)

    getAllBreadCrumb(noChildrenCategories.value)
    // console.log('getBreadCrumb --->', getBreadCrumb(noChildrenCategories.value[0]))

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
    console.log('availableBrand ---->', availableBrand.value)
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
    console.log('FilteredBrand ---->', filteredBrand.value)
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
    // console.log('availableSizes ---->', availableSizes.value)

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
    console.log('availableColors ---->', availableColors.value)
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

  for (const [key, value] of formData.entries()) {
    console.log(`${key}:`, value)
  }

  try {
    const response = await axios.post('http://localhost:1337/api/offers?populate=*', formData, {
      headers: { Authorization: 'Bearer ' + GlobalStore.userInfoCookie.value.token },
      // 'Content-Type': 'multipart/form-data',
    })

    console.log('response --->', response.data)
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
  document.addEventListener('click', handleClickOutside)
})
</script>

<template>
  <div class="container sell">
    <h1>Vends ton article</h1>

    <!-- FORMULAIRE -------------------->
    <form class="form" @submit.prevent="handleSubmit" v-if="!isSubmitting">
      <!-- PHOTO ------------->
      <div class="form__photo">
        <label>
          <input
            type="file"
            name="pictures"
            id="pictures"
            multiple
            @input="selectFile"
            ref="fileInput"
          />

          <button type="button" @click="triggerSelectFile">
            <font-awesome-icon :icon="['fas', 'plus']" />
            <span>Ajoute des photos</span>
          </button>
        </label>

        <p v-if="pictures">{{ pictures }}</p>

        <div v-if="pictures">
          <img :src="url" v-for="url in urlsListPreview" />
        </div>

        <p v-if="errorMessage.pictures" class="form__error-message">{{ errorMessage.pictures }}</p>
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
        <div class="form__details-category form-flex">
          <h2>Catégorie</h2>

          <!-- Toggle dropdown -->
          <div @click="dropdowns.category = !dropdowns.category">
            <p>{{ category ? category.attributes.displayName : 'Sélectionne une catégorie' }}</p>

            <font-awesome-icon :icon="['fas', 'chevron-down']" v-if="!dropdowns.category" />
            <font-awesome-icon :icon="['fas', 'chevron-up']" v-if="dropdowns.category" />
          </div>

          <!-- Categorie dropdown -->
          <div class="container" v-if="dropdowns.category">
            <!-- search -->
            <input
              type="text"
              name="searchCategory"
              id="searchCategory"
              placeholder="Trouver une catégorie"
              v-model="searchCategory"
            />
            <font-awesome-icon
              :icon="['fas', 'times']"
              v-if="searchCategory"
              @click="searchCategory = ''"
            />

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
                  <li
                    class="form__category-click-item"
                    v-for="cat in currentCategories"
                    :key="cat.id"
                    @click="selectedCategory(cat)"
                  >
                    {{ cat.attributes.displayName }}
                    <span v-if="cat.attributes.children?.data?.length">></span>
                  </li>
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
                      <p>{{ cat.attributes.displayName }}</p>
                      <p>{{ cat.breadCrumb }}</p>
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
                  <p>Aucun article ne correspond à ta recherche. Essaie avec un autre mot-clé.</p>
                </div>
              </ul>
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
              <p v-if="!brand && !customBrand">Sélectionne une marque</p>
              <p v-else-if="brand && !customBrand">{{ brand.attributes.displayName }}</p>
              <p v-else-if="!brand && customBrand">{{ customBrand }}</p>

              <font-awesome-icon :icon="['fas', 'chevron-down']" v-if="!dropdowns.brand" />
              <font-awesome-icon :icon="['fas', 'chevron-up']" v-if="dropdowns.brand" />
            </div>

            <!-- Brand dropdown -->
            <div v-if="availableBrand && dropdowns.brand">
              <!-- search -->
              <input
                type="text"
                name="searchBrand"
                id="searchBrand"
                placeholder="Trouver une marque"
                v-model="searchBrand"
              />

              <!-- results ------->
              <div>
                <ul class="form__brand-list">
                  <!-- by click -->
                  <div class="form__brand-click" v-if="!searchBrand">
                    <!-- click label -->
                    <span>Marques populaires</span>
                    <!-- click list -->
                    <li v-for="b in availableBrand" :key="b.id">
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
                  <div class="form__brand-search" v-if="filteredBrand">
                    <!-- search list -->
                    <li v-for="b in filteredBrand" :key="b.id">
                      <label>{{ b.attributes.displayName }}</label>
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
                      />
                    </li>
                    <!-- custom brand -->
                    <div class="form__brand-search-custom">
                      <p>Marque non disponible</p>
                      <p>Utiliser "{{ searchBrand }}" comme marque</p>
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
                </ul>
              </div>
            </div>
            <p v-if="errorMessage.brand" class="form__error-message">{{ errorMessage.brand }}</p>
          </div>

          <!-- SIZE -->
          <div class="form__size form-flex" v-if="availableSizes.length > 0">
            <h2>Taille</h2>

            <!-- Toggle dropdown -->
            <div @click="dropdowns.size = !dropdowns.size">
              <p>{{ size?.displayName || 'Sélectionne une taille' }}</p>

              <font-awesome-icon :icon="['fas', 'chevron-down']" v-if="!dropdowns.size" />
              <font-awesome-icon :icon="['fas', 'chevron-up']" v-if="dropdowns.size" />
            </div>

            <!-- Size dropdown -->
            <!-- results -->
            <div v-if="dropdowns.size && availableSizes">
              <ul class="form__size_list">
                <span>Choisis la taille qui correspond à l'étiquette de l'article</span>
                <p>{{ availableSizes[0].displayCategoryName }}</p>

                <li v-for="s in availableSizes" :key="s.id">
                  <label>
                    <p>{{ s.displayName }}</p>
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
              </ul>
            </div>
            <p v-if="errorMessage.size" class="form__error-message">{{ errorMessage.size }}</p>
          </div>

          <!-- CONDITION -->
          <div class="form__condition form-flex">
            <h2>État</h2>

            <!-- Toggle dropdown -->
            <div @click="dropdowns.condition = !dropdowns.condition">
              <p>{{ condition?.name || 'Sélectionne un état' }}</p>

              <font-awesome-icon :icon="['fas', 'chevron-down']" v-if="!dropdowns.condition" />
              <font-awesome-icon :icon="['fas', 'chevron-up']" v-if="dropdowns.condition" />
            </div>

            <!-- Condtion dropdown -->
            <!-- results -->
            <div v-if="dropdowns.condition && availableConditions">
              <ul class="form__condition-list">
                <li v-for="(c, index) in availableConditions" :key="index">
                  <label>
                    <p>{{ c.name }}</p>
                    <p>{{ c.description }}</p>
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
              </ul>
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
              <p v-if="color.length === 0">
                {{ 'Sélectionne 2 couleurs maximum' }}
              </p>
              <p v-if="color" v-for="c in color" :key="c.id">
                {{ c.attributes.displayName }}
              </p>

              <font-awesome-icon :icon="['fas', 'chevron-down']" v-if="!dropdowns.colors" />
              <font-awesome-icon :icon="['fas', 'chevron-up']" v-if="dropdowns.colors" />
            </div>

            <!-- Color dropdown -->
            <div v-if="availableColors && dropdowns.colors">
              <!-- results -->
              <div>
                <ul class="form__colors-list">
                  <li v-for="c in availableColors" :key="c.id">
                    <label>
                      <div
                        class="form__colors-circle"
                        :style="
                          c.attributes.hex
                            ? { backgroundColor: c.attributes.hex }
                            : { backgroundColor: c.attributes.style }
                        "
                      ></div>
                      <p>{{ c.attributes.displayName }}</p>
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
            <p v-if="errorMessage.colors" class="form__error-message">{{ errorMessage.colors }}</p>
          </div>

          <!-- MATERIAL -->
          <div class="form__material form-flex" ref="materialsDropdownRef">
            <h2>Matière (recommandé)</h2>

            <!-- Toggle dropdown -->
            <div @click="dropdowns.materials = !dropdowns.materials">
              <p v-for="m in material" :key="m.id" v-if="material">
                {{ m.attributes.displayName }}
              </p>
              <p v-if="material.length === 0">
                {{ `Séléctionne jusqu'à 3 options` }}
              </p>

              <font-awesome-icon :icon="['fas', 'chevron-down']" v-if="!dropdowns.materials" />
              <font-awesome-icon :icon="['fas', 'chevron-up']" v-if="dropdowns.materials" />
            </div>

            <!-- Material dropdown -->
            <div v-if="availableMaterials && dropdowns.materials">
              <!-- results -->
              <div>
                <ul class="form__materials-list">
                  <li v-for="m in availableMaterials" :key="m.id">
                    <label>
                      <p>{{ m.attributes.displayName }}</p>
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
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- PRICE -->
      <div class="form-price form-flex">
        <h2>Prix</h2>
        <input type="number" name="price" id="price" v-model="price" placeholder="0,00€" />
        <p v-if="errorMessage.price" class="form__error-message">{{ errorMessage.price }}</p>
      </div>

      <!-- BUTTON SUBMIT FORM -->
      <button>Ajouter</button>
    </form>

    <div v-else-if="isSubmitting">
      <p>En cours de chargement</p>
    </div>
  </div>
</template>

<style scoped>
input[type='file'] {
  display: none;
}

.form-flex {
  display: flex;
  padding: 10px;
}

.form__colors-circle {
  width: 20px;
  height: 20px;
  border: 1px solid black;
  border-radius: 50px;
}

.form__error-message {
  color: red;
}
</style>
