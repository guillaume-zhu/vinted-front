<script setup>
// Créer tout les inputs de la page
// Créer les refs et les attribuer aux input en v-model
// Ajouter submit form fonction pour envoyer la requête du formulaire

//// FORMDATA
// isSubmitting + error
// créer formdata vide
// append les images au formdata en bouclant + if hasOwnProperty
// stringifier les autres infos
// lancer la requete avec clé image + clé data avec stringified infos + authorization
// ajouter prévisualisation avec un computed et URL générer + boucler + if hasOwnProperty
// router.push a l'offre créée

//// A faire next
// ajouter un debounce

import { ref, computed, onMounted, watch } from 'vue'
import axios from 'axios'
import { debounce } from 'lodash'

// -----------------------------------------
// BASE VARIABLES
// -----------------------------------------

// 1. Form refs
const pictures = ref(null)
const fileInput = ref(null)
const title = ref(null)
const description = ref(null)
const category = ref(null)
const brand = ref(null)
const size = ref(null)
const condition = ref(null)
const color = ref([])
const material = ref([])

// 2. Message and Error
const isSubmitting = ref(false)
const errorMessage = ref('')

// 3. Category Input dropdown
const firstCategories = ref([])
const currentCategories = ref([])
const selectedPath = ref([])
const showCatDropdown = ref(false)
const searchTerm = ref('')
const filteredCategories = ref([])
const noChildrenCategories = ref([])
const breadCrumbArray = ref([])
const categoriesWithBreadCrumb = ref([])

// 4. Brand Input
const availableBrand = ref([])
const showBrandDropdown = ref(false)

// -----------------------------------------
// BASE FUNCTIONS
// -----------------------------------------

// 1. File input
const triggerSelectFile = () => {
  fileInput.value.click()
}

const selectFile = (event) => {
  errorMessage.value = ''

  if (event.target.files.length <= 20) {
    pictures.value = event.target.files
    // console.log('pictures ---->', pictures.value)
  } else if (event.target.files.length > 20) {
    errorMessage.value = '20 photos maximum'
    pictures.value = null
  } else {
    errorMessage.value = 'Un problème est survenu'
  }
}

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
    showCatDropdown.value = false

    // console.log('Category value end ---->', category.value)
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

    currentCategories.value = categoriesWithBreadCrumb.value
  } catch (error) {
    console.log('Erreur lors de la requete pour afficher les categories par search', error)
  }
  if (textInput.length === 0) {
    currentCategories.value = firstCategories.value
  }
}

const debouncedFilterCategories = debounce((value) => {
  filterCategories(value)
}, 400)

// 3. Brand input
const fetchPopularBrand = async () => {
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
// créer un input marque avec un texte pour chercher les marques disponibles, si la marque n'existe pas la créer
// sinon afficher de base les marques populaires au clic
// créer availableBrand
// lancer requete pour afficher les marques les plus connues et stocker dans availableBrand
// template = v for de li sur availableBrand

// -----------------------------------------
// WATCHERS
// -----------------------------------------
watch(searchTerm, (newValue) => {
  debouncedFilterCategories(newValue)
})

// -----------------------------------------
// ONMOUNTED
// -----------------------------------------
onMounted(() => {
  fetchLevel1()
  fetchPopularBrand()
})
</script>

<template>
  <div class="container sell">
    <h1>Vends ton article</h1>

    <!-- FORMULAIRE -------------------->
    <form class="form">
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
        <p v-if="errorMessage">{{ errorMessage }}</p>
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
      </div>

      <!-- DETAILS ------------->
      <div class="form__details">
        <!-- CATEGORY ---------->
        <div class="form__details-category form-flex">
          <h2>Catégorie</h2>

          <!-- Toggle dropdown -->
          <div @click="showCatDropdown = !showCatDropdown">
            <p>{{ category ? category.attributes.displayName : 'Sélectionne une catégorie' }}</p>

            <font-awesome-icon :icon="['fas', 'chevron-down']" v-if="!showCatDropdown" />
            <font-awesome-icon :icon="['fas', 'chevron-up']" v-if="showCatDropdown" />
          </div>

          <!-- Categorie dropdown -->
          <div class="container" v-if="showCatDropdown">
            <!-- categorie search -->
            <input
              type="text"
              name="search"
              id="search"
              placeholder="Trouver une catégorie"
              v-model="searchTerm"
            />

            <div v-if="currentCategories.length">
              <ul class="form__category-list">
                <!-- by click -->
                <div class="form__category-click" v-if="!currentCategories[0].breadCrumb">
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
                <div class="form__category-search" v-else-if="currentCategories[0].breadCrumb">
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
                        @change="showCatDropdown = !showCatDropdown"
                      />
                    </label>
                  </li>
                </div>
              </ul>
            </div>
          </div>
        </div>

        <!-- if category selected -->
        <!-- brand -->
        <div class="form__brand form-flex">
          <h2>Marque</h2>

          <div @click="showBrandDropdown = !showBrandDropdown">
            <p>Sélectionne une catégorie</p>

            <font-awesome-icon :icon="['fas', 'chevron-down']" v-if="!showBrandDropdown" />
            <font-awesome-icon :icon="['fas', 'chevron-up']" v-if="showBrandDropdown" />
          </div>

          <div v-if="availableBrand">
            <ul class="form__brand-list">
              <div class="form__brand-click">
                <li v-for="b in availableBrand" :key="b.id">
                  <label>{{ b.attributes.displayName }}</label>
                  <input type="radio" name="brand" id="brand" v-model="brand" :value="brand" />
                </li>
              </div>
            </ul>
          </div>
        </div>

        <!-- size -->
        <div class="form__size form-flex">
          <h2>Taille</h2>
          <input type="text" name="size" id="size" v-model="size" placeholder="" />
        </div>

        <!-- condition -->
        <div class="form__condition form-flex">
          <h2>État</h2>
          <input type="text" name="condition" id="condition" v-model="condition" placeholder="" />
        </div>

        <!-- color -->
        <div class="form__color form-flex">
          <h2>Couleur</h2>
          <input type="text" name="price" id="price" v-model="color" placeholder="" />
        </div>

        <!-- material -->
        <div class="form__material form-flex">
          <h2>Matière (recommandé)</h2>
          <input type="text" name="price" id="price" v-model="material" placeholder="" />
        </div>
      </div>

      <!-- price -->
      <div class="form-price form-flex">
        <h2>Prix</h2>
        <input type="number" name="price" id="price" />
      </div>
    </form>
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
</style>
