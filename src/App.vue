<script setup>
import { RouterView } from 'vue-router'

import Header from './components/Header.vue'
import Footer from './components/Footer.vue'
</script>

<template>
  <div>
    <Header />

    <main>
      <RouterView :key="$route.params.id" />
    </main>

    <Footer />
  </div>
</template>

<style scoped></style>
