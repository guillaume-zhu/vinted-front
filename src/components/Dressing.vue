<script setup>
///// Partie pour gérer le scroll du dressing
import { ref } from 'vue'
import { RouterLink } from 'vue-router'

const props = defineProps({
  dressingInfo: {
    type: Object,
  },
})

const dressingContainer = ref(null)
const canScrollLeft = ref(false)
const canScrollRight = ref(false)

const checkScroll = () => {
  if (!dressingContainer.value) return

  const container = dressingContainer.value

  // Vérifier si on peut scroll à gauche
  canScrollLeft.value = container.scrollLeft > 0

  // Vérifier so on peut scroll à droite
  canScrollRight.value = container.scrollLeft + container.clientWidth < container.scrollWidth
  //
}

const scrollLeft = () => {
  dressingContainer.value?.scrollBy({ left: -1240, behavior: 'smooth' })
}

const scrollRight = () => {
  dressingContainer.value?.scrollBy({ left: 1240, behavior: 'smooth' })
}
</script>

<template>
  <div class="container offers__dressing" v-if="dressingInfo">
    <div class="offers__dressing-header">
      <RouterLink :to="{ name: 'profile', params: { id: dressingInfo.id } }">
        <div class="offers__dressing-user-info">
          <img class="offers__dressing-user-avatar" :src="dressingInfo.avatar.url" alt="" />
          <p>{{ dressingInfo.username }}</p>
        </div>
      </RouterLink>

      <button>
        <a href="">Explorer le Dressing</a>
      </button>
    </div>

    <div class="offers__dressing-offers" ref="dressingContainer" @scroll="checkScroll">
      <div class="offers__dressing-card" v-for="offer in dressingInfo.offers" :key="offer.id">
        <RouterLink :to="{ name: 'product', params: { id: offer.id } }">
          <img class="offers__dressing-card-image" :src="offer.images[0].url" alt="" />
          <p v-if="offer.brand">{{ offer.brand.displayName }}</p>
          <p v-if="offer.size">{{ offer.size.displayName }}</p>
          <p>{{ offer.price.toFixed(2) }} €</p>
          <p>{{ (offer.price + offer.price * (9.38 / 100)).toFixed(2) }} €</p>
        </RouterLink>
      </div>
    </div>

    <div class="offers__dressing-scroll-group">
      <div class="offers__dressing-scroll-button" v-if="canScrollLeft" @click="scrollLeft">
        <font-awesome-icon :icon="['fas', 'chevron-left']" />
      </div>

      <div class="offers__dressing-scroll-button" v-if="canScrollRight" @click="scrollRight">
        <font-awesome-icon :icon="['fas', 'chevron-right']" />
      </div>
    </div>
  </div>
</template>

<style scoped>
/* DRESSING -----------*/
.offers__dressing {
  border: 1px solid violet;
  margin: 50px 0px;
}

/* DRESSING HEADER */
.offers__dressing-header {
  display: flex;
  justify-content: space-between;
}

.offers__dressing-user-info {
  display: flex;
}

.offers__dressing-user-avatar {
  width: 50px;
}

/* DRESSING CONTENT */
.offers__dressing-offers {
  display: flex;
  gap: 15px;
  overflow-x: auto;
  border: 1px solid blue;
  scrollbar-width: none;
}

.offers__dressing-card-image {
  width: 209px;
  height: 314px;
  object-fit: cover;
}
</style>
