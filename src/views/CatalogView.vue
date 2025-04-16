<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import Breadcrumb from '@/components/Breadcrumb.vue'

const props = defineProps({
  id: {
    type: String,
  },
})

console.log('main category id ---->', props.id)

// Variables
const categoriesId = ref([])
const offersList = ref([])
const isLoading = ref(false)
const allCategoriesId = []

const collectCategoryIds = (category) => {
  if (!allCategoriesId.includes(category.id)) {
    allCategoriesId.push(category.id)
  }

  if (category?.attributes?.children?.data?.length > 0)
    for (const child of category.attributes.children.data) {
      collectCategoryIds(child)
    }
}

// Requete pour récupérer les id de la category et des enfants
onMounted(async () => {
  isLoading.value = true
  try {
    const response = await axios.get(
      `http://localhost:1337/api/categories/${props.id}?populate[0]=children&populate[1]=children.children&populate[2]=children.children.children&populate[3]=children.children.children.children`,
    )
    categoriesId.value = response.data.data
    console.log('categoriesId ---->', categoriesId.value)

    collectCategoryIds(categoriesId.value)
    console.log('allCategoriesId ---->', allCategoriesId)

    const categoriesQuery = allCategoriesId
      .map((id, index) => `&filters[$or][${index}][category][id][$eq]=${id}`)
      .join('')
    // console.log('categoriesQuery ---->', categoriesQuery)

    const responseOffers = await axios.get(
      `http://localhost:1337/api/offers?populate=*${categoriesQuery}&pagination[pageSize]=96`,
    )

    offersList.value = responseOffers.data
    console.log('offersList ---->', offersList.value)
  } catch (error) {
    console.log('Erreur lors du chargement des offres')
  }
})

// Récupérer props id de la catégorie selectionnée
// Faire une requête pour récupérer un tableau d'id des catégories ainsi que de tout les enfants puis stocker dans une variable
// Fonction pour récupérer les id des enfants et de leurs enfants
// Faire une requête pour chercher les offres avec tout les id de categoriesId + pagination 96 offres par page
// -

// Stocker la réponse dans une variable
// Faire une requête pour récupérer dressing en ciblant une des offres parmis offersList puis remonter a avatar pour obtenir un dressing
</script>

<template>
  <div class="container">Catalog</div>
</template>

<style scoped></style>
