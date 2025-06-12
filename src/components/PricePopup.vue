<script setup>
const props = defineProps({
  selectedOfferForPopup: Object,
  showPricePopup: Boolean,
  fromCatalog: Boolean,
})

const emit = defineEmits(['closePricePopup'])
</script>

<template>
  <div class="price-popup__overlay" v-if="showPricePopup">
    <div class="price-popup__content">
      <div>
        <h2>Details du prix</h2>
        <font-awesome-icon :icon="['fas', 'times']" @click="emit('closePricePopup')" />
      </div>

      <div>
        <div>
          <h3>Article</h3>
          <p v-if="fromCatalog">{{ selectedOfferForPopup.attributes.price.toFixed(2) + ' €' }}</p>
          <p v-else>{{ selectedOfferForPopup.price.toFixed(2) + ' €' }}</p>
        </div>

        <div>
          <h3>Frais de Protection acheteurs</h3>
          <p v-if="fromCatalog">
            {{ (selectedOfferForPopup.attributes.price * (9.38 / 100)).toFixed(2) + ' €' }}
          </p>
          <p v-else>{{ (selectedOfferForPopup.price * (9.38 / 100)).toFixed(2) + ' €' }}</p>
        </div>
        <p>Les frais de port sont calculés lors de la commande.</p>
      </div>

      <div>
        <p>
          Nos frais de Protection acheteurs sont obligatoires lorsque vous achetez un article sur
          Vinted. Ces derniers sont ajoutés chaque fois qu'un achat est validé via le bouton
          Acheter. Le prix de l'article est quant à lui fixé par le vendeur et peut faire l'objet de
          négociations.
        </p>
        <button @click="emit('closePricePopup')">Fermer</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* PRICE POPUP ----------------------------- */
.price-popup__overlay {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1000;
  height: 100vh;
  width: 100vw;
  background-color: rgba(0, 0, 0, 0.6); /* fond sombre semi-transparent */
  display: flex;
  justify-content: center;
  align-items: center;
}

.price-popup__content {
  background-color: white;
  padding: 2rem;
  border-radius: 10px;
  max-width: 90%;
}
</style>
