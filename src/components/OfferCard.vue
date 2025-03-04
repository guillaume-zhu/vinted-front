<script setup>
const props = defineProps({
  offer: {
    type: Object,
    required: true,
  },
})
</script>

<template>
  <div class="offer-card">
    <img v-if="offer.attributes.images" :src="offer.attributes.images.data[0].attributes.url" />
    <p>{{ offer.attributes.brand.data.attributes.displayName }}</p>
    <p>{{ offer.attributes.condition }}</p>
    <p>{{ offer.attributes.price.toFixed(2) }} €</p>
    <p>{{ (offer.attributes.price + offer.attributes.price * (9.38 / 100)).toFixed(2) }} €</p>
  </div>
</template>

<style scoped>
/* CARD --------- */
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
</style>
