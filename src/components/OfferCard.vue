<script setup>
import { RouterLink } from 'vue-router'
import { ref } from 'vue'

const emit = defineEmits(['price-clicked'])

const props = defineProps({
  offer: {
    type: Object,
    required: true,
  },
  fromProfile: {
    type: Boolean,
  },
  fromCatalog: {
    type: Boolean,
  },
  disablePricePopup: {
    type: Boolean,
  },
})
</script>

<template>
  <!-- FROM HOME & CATALOG -->
  <div
    class="offer-card"
    :class="{ 'offer-card-from-catalog': fromCatalog }"
    v-if="offer.attributes"
  >
    <RouterLink :to="{ name: 'product', params: { id: offer.id } }">
      <div class="offer-card__img-wrapper">
        <img
          :class="{ 'img-from-catalog': fromCatalog }"
          v-if="offer.attributes.images"
          :src="offer.attributes.images.data[0].attributes.url"
        />
      </div>
    </RouterLink>

    <p v-if="offer.attributes.brand.data?.attributes.displayName" class="offer-brand">
      {{ offer.attributes.brand.data.attributes.displayName }}
    </p>

    <span v-if="offer.attributes.size.data?.attributes.displayName">
      {{ offer.attributes.size.data.attributes.displayName }}
    </span>

    <span v-if="offer.attributes.size.data?.attributes.displayName && offer.attributes?.condition">
      ·
    </span>

    <span v-if="offer.attributes?.condition">{{ offer.attributes.condition }}</span>

    <p class="offer-price">{{ offer.attributes.price.toFixed(2) }} €</p>

    <p class="offer-price--shield" @click="emit('price-clicked', offer)">
      {{ (offer.attributes.price + offer.attributes.price * (9.38 / 100)).toFixed(2) }} €
      <span>incl. <font-awesome-icon :icon="['fas', 'shield-alt']" /></span>
    </p>
  </div>

  <!-- FROM PRODUCT & PROFILE -->
  <div
    class="offer-card offer-card-from-product"
    :class="{ 'offer-card-from-profile': fromProfile }"
    v-else
  >
    <RouterLink :to="{ name: 'product', params: { id: offer.id } }">
      <div class="offer-card__img-wrapper">
        <img
          class="img-from-product"
          :class="{ 'img-from-profile': fromProfile }"
          v-if="offer.images"
          :src="offer.images[0].url"
        />
      </div>
    </RouterLink>

    <p v-if="offer.brand?.displayName">
      {{ offer.brand.displayName }}
    </p>

    <span v-if="offer.size?.displayName">
      {{ offer.size.displayName }}
    </span>

    <span v-if="offer.size?.displayName && offer?.condition"> · </span>

    <span v-if="offer.condition && !fromProfile">{{ offer.condition }}</span>

    <p class="offer-price">{{ offer.price.toFixed(2) }} €</p>

    <p class="offer-price--shield" @click="emit('price-clicked', offer)" v-if="!disablePricePopup">
      {{ (offer.price + offer.price * (9.38 / 100)).toFixed(2) }} €
      <span>incl. <font-awesome-icon :icon="['fas', 'shield-alt']" /></span>
    </p>
  </div>
</template>

<style scoped>
/* SMALL / MOBILE (≤ 720px) */

/* CARD --------- */
/* FROM HOME */
.offer-card {
  width: calc((100% - (1 * 10px)) / 2);
  border-radius: var(--radius);
}

.offer-card__img-wrapper {
  aspect-ratio: 2/3;
  overflow: hidden;
  border-radius: var(--radius);
  margin-bottom: 10px;
}

img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

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

/* FROM PROFILE */

/* MEDIUM (720px) */
@media (min-width: 720px) {
  .offer-card {
    width: calc((100% - (2 * 15px)) / 3);
  }
}

/* DESKTOP (960px) */
@media (min-width: 960px) {
  .offer-card {
    width: calc((100% - (3 * 15px)) / 4);
  }
  .offer-card-from-product {
    width: calc((100% - (2 * 15px)) / 3);
  }
}

/* DESKTOP ( > 1200px) */
@media (min-width: 1200px) {
  .offer-card {
    width: calc((100% - (4 * 15px)) / 5);
  }
  .offer-card-from-product {
    width: calc((100% - (3 * 15px)) / 4);
  }

  img {
    height: 352px;
  }
}
</style>
