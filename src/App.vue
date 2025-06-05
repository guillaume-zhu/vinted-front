<script setup>
import { RouterView, useRoute } from 'vue-router'

import Header from './components/Header.vue'
import Footer from './components/Footer.vue'

const route = useRoute()
</script>

<template>
  <div>
    <Header />

    <main>
      <RouterView :key="$route.params.id" />
    </main>

    <Footer :hide="route.path.includes('/checkkout')" />
  </div>
</template>

<style scoped></style>
