<script setup>
import { ref, onMounted, watchEffect, watch } from 'vue'
import { RouterLink } from 'vue-router'
import axios from 'axios'
import Breadcrumb from '@/components/Breadcrumb.vue'
import OfferCard from '@/components/OfferCard.vue'

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
const categoryChildren = []

const totalPage = ref(null)
const page = ref(1)

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

// Fonction pour trouver les enfants de la catégorie actuelle
const collectCategoryNames = (category) => {
  console.log('category in collectCategoryNames ---->', category)

  if (category?.attributes?.children?.data?.length > 0) {
    for (const child of category.attributes.children.data) {
      categoryChildren.push({ displayName: child.attributes.displayName, id: child.id })
    }
  }
}

// Requete pour récupérer les id de la category et des enfants
onMounted(async () => {
  isLoading.value = true
  try {
    const response = await axios.get(
      `http://localhost:1337/api/categories/${props.id}?populate[0]=children&populate[1]=children.children&populate[2]=children.children.children&populate[3]=children.children.children.children?populate[4]=parent&populate[5]=parent.parent&populate[6]=parent.parent.parent&populate[7]=parent.parent.parent.parent&populate[8]=parent.parent.parent.parent.parent`,
    )
    categoryData.value = response.data.data
    console.log('categoryData ---->', categoryData.value)

    collectCategoryNames(categoryData.value)
    console.log('categoryChildren ---->', categoryChildren)

    watchEffect(async () => {
      if (!categoryData.value.attributes) return

      const categoryName = categoryData.value.attributes.name
      console.log('categoryName ---->', categoryName)

      const responseOffers = await axios.get(
        `http://localhost:1337/api/offers?populate=*&filters[category][name][$containsi]=${categoryName}&pagination[pageSize]=96&pagination[page]=${page.value}`,
      )

      offersList.value = responseOffers.data
      console.log('offersList ---->', offersList.value)

      totalPage.value = offersList.value.meta.pagination.pageCount
    })
  } catch (error) {
    console.log('Erreur lors du chargement des offres')
  }
})

// Pagination
const changePage = (order, actualNum) => {
  if (order === 'prev' && page.value > 1) {
    page.value -= 1
  } else if (order === 'next' && page.value < totalPage.value) {
    page.value += 1
  } else if (order === 'num' && page.value !== actualNum) {
    page.value = actualNum
  }
}

// récupérer le nom de la catégorie
// faire une requête des offres qui contient le nom de la catégorie par 96
// afficher les offres avec une pagination
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
        <div>FILTERS & TRI</div>

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
        <div @click="changePage('prev')">
          <p>prev</p>
        </div>
        <div v-for="num in totalPage">
          <p @click="changePage('num', num)">{{ num }}</p>
        </div>
        <div @click="changePage('next')">
          <p>next</p>
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

/* OFFERS */
.catalog__offers {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
}
</style>
