<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const props = defineProps({
  id: {
    type: String,
  },
})

console.log('main category id ---->', props.id)

// Variables
const categoryData = ref([])
const offersList = ref([])
const isLoading = ref(false)
const allCategoriesId = []

// Fonction récursive pour trouver les id en arborescence
// const collectCategoryIds = (category) => {
//   if (!allCategoriesId.includes(category.id)) {
//     allCategoriesId.push(category.id)
//   }

//   if (category?.attributes?.children?.data?.length > 0)
//     for (const child of category.attributes.children.data) {
//       collectCategoryIds(child)
//     }
// }

// Requete pour récupérer les id de la category et des enfants
onMounted(async () => {
  isLoading.value = true
  try {
    const response = await axios.get(
      `http://localhost:1337/api/categories/${props.id}?populate[0]=children&populate[1]=children.children&populate[2]=children.children.children&populate[3]=children.children.children.children`,
    )
    categoryData.value = response.data.data
    console.log('categoryData ---->', categoryData.value)

    const categoryName = categoryData.value.attributes.name
    console.log('categoryName ---->', categoryName)

    const responseOffers = await axios.get(
      `http://localhost:1337/api/offers?populate=*&filters[category][name][$containsi]=${categoryName}&pagination[pageSize]=96`,
    )

    offersList.value = responseOffers.data
    console.log('offersList ---->', offersList.value)
  } catch (error) {
    console.log('Erreur lors du chargement des offres')
  }
})

// récupérer le nom de la catégorie
// faire une requête des offres qui contient le nom de la catégorie par 96
// afficher les offres avec une pagination
</script>

<template>
  <div class="container">
    <p v-if="categoryData.attributes">
      {{ categoryData.attributes.name }}
    </p>
  </div>
</template>

<style scoped></style>
