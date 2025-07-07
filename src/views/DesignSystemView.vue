<script setup>
import { ref } from 'vue'
import Breadcrumb from '@/components/Breadcrumb.vue'

const categoryData = ref({
  id: '15',
  attributes: {
    name: 'jacket-coats',
    displayName: 'Vestes & Manteaux',
    categoryLevel: 'level3',
    parent: {
      data: {
        id: '8',
        attributes: {
          name: 'outerwear',
          displayName: 'Hauts',
          categoryLevel: 'level2',
          parent: {
            data: {
              id: '1',
              attributes: {
                name: 'clothing',
                displayName: 'Vêtements',
                categoryLevel: 'level1',
                parent: {
                  data: null,
                },
              },
            },
          },
        },
      },
    },
    children: { data: [] },
  },
})
</script>

<template>
  <div class="container">
    <h1>Design system</h1>

    <div class="content">
      <!-- Filter button -->
      <section>
        <h2>ds-filter-btn</h2>
        <div class="ds-filter-btn">
          <span>Test</span>
        </div>
      </section>

      <!-- Filter added button -->
      <section>
        <h2>ds-filter-btn</h2>
        <button class="ds-filter-btn ds-filter-btn--added">
          Added
          <font-awesome-icon :icon="['fas', 'times']" />
        </button>
      </section>

      <!-- Button -->
      <section>
        <h2>btn</h2>
        <button class="ds-btn ds-btn--primary">
          <h2>Vends maintenant</h2>
        </button>
        <button class="ds-btn ds-btn--secondary">
          <h2>Découvrir comment ça marche</h2>
        </button>
      </section>

      <!-- Breadcrumb -->
      <section>
        <h2>Breadcrumb</h2>
        <Breadcrumb :category="categoryData" />
      </section>

      <!-- SearchInput -->
      <section class="ds-search-input">
        <font-awesome-icon :icon="['fas', 'search']" />
        <input
          type="text"
          name="searchbar"
          id="searchbar"
          @keydown.enter="OnSearch"
          placeholder="Rechercher des articles"
          v-model="searchTerm"
          class="text-lg"
        />
        <font-awesome-icon :icon="['fas', 'times']" v-if="searchTerm" @click="searchTerm = ''" />
      </section>
    </div>
  </div>
</template>

<style scoped>
h1 {
  font-size: 100px;
  line-height: 150px;
}

h2 {
  text-align: center;
  margin-bottom: 20px;
}

section {
  margin: 20px 0px;
}

.content {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
}
</style>
