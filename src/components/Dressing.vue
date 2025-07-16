<script setup>
///// Partie pour gérer le scroll du dressing
import { ref, onMounted, nextTick, onUnmounted } from 'vue'
import { RouterLink } from 'vue-router'

const props = defineProps({
  dressingInfo: {
    type: Object,
  },
})

const dressingContainer = ref(null)
const canScrollLeft = ref(false)
const canScrollRight = ref(false)

const scrollAmount = ref(1240) // par défaut pour desktop

const updateScrollAmount = () => {
  const width = window.innerWidth

  if (width < 480) {
    scrollAmount.value = 220 // largeur de 2 cartes env. pour mobile
  } else if (width < 768) {
    scrollAmount.value = 440 // pour tablette portrait
  } else {
    scrollAmount.value = 1240 // desktop
  }
}

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
  dressingContainer.value?.scrollBy({
    left: -scrollAmount.value,
    behavior: 'smooth',
  })
}

const scrollRight = () => {
  dressingContainer.value?.scrollBy({
    left: scrollAmount.value,
    behavior: 'smooth',
  })
}

onMounted(() => {
  updateScrollAmount()
  window.addEventListener('resize', updateScrollAmount)
  nextTick(() => {
    checkScroll()
  })
})

onUnmounted(() => {
  window.removeEventListener('resize', updateScrollAmount)
})
</script>

<template>
  <div class="container offers__dressing" v-if="dressingInfo">
    <div class="offers__dressing-header">
      <RouterLink :to="{ name: 'profile', params: { id: dressingInfo.id } }">
        <div class="offers__dressing-user-info">
          <img class="offers__dressing-user-avatar" :src="dressingInfo.avatar.url" alt="" />
          <h2>{{ dressingInfo.username }}</h2>
        </div>
      </RouterLink>

      <button>Explorer le Dressing</button>
    </div>

    <div class="offers__dressing-offers" ref="dressingContainer" @scroll="checkScroll">
      <div class="offers__dressing-card" v-for="offer in dressingInfo.offers" :key="offer.id">
        <RouterLink :to="{ name: 'product', params: { id: offer.id } }">
          <img class="offers__dressing-card-image" :src="offer.images[0].url" alt="" />
          <p class="offer-brand" v-if="offer.brand">{{ offer.brand.displayName }}</p>
          <span v-if="offer.size?.displayName">
            {{ offer.size.displayName }}
          </span>

          <span v-if="offer.size?.displayName && offer?.condition"> · </span>

          <span v-if="offer.condition">{{ offer.condition }}</span>
          <p class="offer-price">{{ offer.price.toFixed(2) }} €</p>
          <p class="offer-price--shield">
            {{ (offer.price + offer.price * (9.38 / 100)).toFixed(2) }} €
          </p>
        </RouterLink>
      </div>
    </div>

    <div
      class="offers__dressing-scroll-group"
      :class="{ ifSolo: canScrollRight && !canScrollLeft }"
    >
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
/* SMALL / MOBILE (< 720px) */

/* DRESSING -----------*/
.offers__dressing {
  margin: 50px 0px;
  position: relative;
}

/* DRESSING HEADER */
.offers__dressing-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px;
}

.offers__dressing-header a {
  text-decoration: none;
}

.offers__dressing-header button {
  background-color: white;
  font-size: var(--font-p);
  border: 1px solid var(--color-primary);
  color: var(--color-primary);
  padding: 6px 12px 6px 12px;
  border-radius: var(--radius);
}

.offers__dressing-user-info {
  display: flex;
  align-items: center;
}

.offers__dressing-user-avatar {
  width: 32px;
  height: 32px;
  object-fit: cover;
  border-radius: 50px;
  margin-right: 5px;
}

/* DRESSING CONTENT */
p,
span {
  font-size: var(--font-p);
  line-height: var(--line-height-small);
  color: var(--color-gray);
}

.offer-brand {
  margin-top: 5px;
}

.offer-price {
  margin-top: 10px;
}

.offer-price--shield {
  font-size: var(--font-span-md);
  color: var(--color-primary);
  margin-bottom: 10px;
}

.offer-price--shield span,
.offer-price--shield svg {
  color: var(--color-primary);
}

.offers__dressing-offers {
  display: flex;
  gap: 10px;
  overflow-x: auto;
  scrollbar-width: none;
  width: 100%;
  height: auto;
}

.offers__dressing-card {
  flex: 0 0 calc(51% - 10px);
  max-width: 240px;
}

.offers__dressing-card a {
  text-decoration: none;
  cursor: pointer;
}

.offers__dressing-card-image {
  width: 100%;
  aspect-ratio: 2 / 3;
  object-fit: cover;
  border-radius: var(--radius);
}

/* SCROLL */
.offers__dressing-scroll-group {
  display: flex;
  justify-content: space-between;
  padding: 0px 10px;
  width: 100%;
  position: absolute;
  top: 50%;
}

.offers__dressing-scroll-button {
  background-color: white;
  padding: 8px;
  border-radius: 50px;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 34px;
  height: 34px;
}

.offers__dressing-scroll-button svg {
  color: var(--color-gray);
}

.ifSolo {
  justify-content: flex-end;
}

/* MEDIUM (>= 720px) */
@media (min-width: 720px) {
  .offers__dressing-offers {
    gap: 15px;
  }

  .offers__dressing-card {
    flex: 0 0 calc(34% - 15px);
    max-width: 270px;
  }
}

/* DESKTOP (>= 960px) */
@media (min-width: 960px) {
  .offers__dressing-card {
    flex: 0 0 calc(25% - 15px);
  }
}

/* DESKTOP (>= 1200px) */
@media (min-width: 1200px) {
  .offers__dressing-card {
    max-width: 235px;
    aspect-ratio: 2/3;
    border-radius: var(--radius);
  }
}
</style>
