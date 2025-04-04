<script setup>
import { RouterLink } from 'vue-router'

const props = defineProps({
  offer: {
    type: Object,
    required: true,
  },
  fromProfile: {
    type: Boolean,
  },
})
</script>

<template>
  <!-- FROM HOME -->
  <div class="offer-card" v-if="offer.attributes">
    <RouterLink :to="{ name: 'product', params: { id: offer.id } }">
      <img v-if="offer.attributes.images" :src="offer.attributes.images.data[0].attributes.url" />
      <p v-if="offer.attributes.brand.data?.attributes.displayName">
        {{ offer.attributes.brand.data.attributes.displayName }}
      </p>
      <p v-if="offer.attributes.size.data?.attributes.displayName">
        {{ offer.attributes.size.data.attributes.displayName }}
      </p>
      <p v-else>{{ offer.attributes.condition }}</p>
      <p>{{ offer.attributes.price.toFixed(2) }} €</p>
      <p>{{ (offer.attributes.price + offer.attributes.price * (9.38 / 100)).toFixed(2) }} €</p>
    </RouterLink>
  </div>

  <!-- FROM PRODUCT & PROFILE -->
  <div class="offer-card-from-product" :class="{ 'offer-card-from-profile': fromProfile }" v-else>
    <RouterLink :to="{ name: 'product', params: { id: offer.id } }">
      <img
        class="img-from-product"
        :class="{ 'img-from-profile': fromProfile }"
        v-if="offer.images"
        :src="offer.images[0].url"
      />
      <p v-if="offer.brand?.displayName">
        {{ offer.brand.displayName }}
      </p>
      <p v-if="offer.size?.displayName">
        {{ offer.size.displayName }}
      </p>
      <p v-else>{{ offer.condition }}</p>
      <p>{{ offer.price.toFixed(2) }} €</p>
      <p>{{ (offer.price + offer.price * (9.38 / 100)).toFixed(2) }} €</p>
    </RouterLink>
  </div>

  <!-- FROM PROFILE -->
</template>

<style scoped>
/* CARD --------- */
/* FROM HOME */
.offer-card {
  border: 1px solid turquoise;
  width: calc((100% - (4 * 15px)) / 5);
  height: 447px;
}

img {
  width: 100%;
  height: 352px;
  object-fit: cover;
}

/* FROM PRODUCT */
.offer-card-from-product {
  border: 1px solid royalblue;
  width: calc((100% - (4 * 15px)) / 4);
  height: 372px;
}

.img-from-product {
  width: 100%;
  height: 278px;
  object-fit: cover;
}

/* FROM PROFILE */
.offer-card-from-profile {
  border: 1px solid royalblue;
  width: calc((100% - (4 * 15px)) / 5);
  height: 450px;
}

.img-from-profile {
  width: 100%;
  height: 339px;
  object-fit: cover;
}
</style>
