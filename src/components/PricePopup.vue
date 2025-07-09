<script setup>
const props = defineProps({
  selectedOfferForPopup: Object,
  showPricePopup: Boolean,
  fromCatalog: Boolean,
})

const emit = defineEmits(['closePricePopup'])
</script>

<template>
  <div class="price-popup__overlay" v-if="showPricePopup && selectedOfferForPopup">
    <div class="price-popup__content">
      <div class="price-popup__header">
        <div class="price-popup__header-spacer"></div>
        <h2>Détails du prix</h2>
        <font-awesome-icon
          :icon="['fas', 'times']"
          @click="emit('closePricePopup')"
          class="price-popup-header-close"
        />
      </div>

      <div class="price-popup__price">
        <div class="price-popup__price-product">
          <h2>Article</h2>
          <span v-if="fromCatalog && selectedOfferForPopup.attributes?.price != null">
            {{ selectedOfferForPopup.attributes.price.toFixed(2) + ' €' }}
          </span>

          <span v-else-if="!fromCatalog && selectedOfferForPopup.price != null">
            {{ selectedOfferForPopup.price.toFixed(2) + ' €' }}
          </span>

          <span v-else>Chargement ...</span>
        </div>

        <div class="price-popup__price-protection">
          <h2>Frais de Protection acheteurs</h2>
          <span v-if="fromCatalog">
            {{ (selectedOfferForPopup.attributes.price * (9.38 / 100)).toFixed(2) + ' €' }}
          </span>
          <span v-else>{{ (selectedOfferForPopup.price * (9.38 / 100)).toFixed(2) + ' €' }}</span>
        </div>
        <p>Les frais de port sont calculés lors de la commande.</p>
      </div>

      <div class="price-popup__details">
        <p>
          Nos frais de Protection acheteurs sont obligatoires lorsque vous achetez un article sur
          Vinted. Ces derniers sont ajoutés chaque fois qu'un achat est validé via le bouton
          Acheter. Le prix de l'article est quant à lui fixé par le vendeur et peut faire l'objet de
          négociations.
        </p>
      </div>

      <div class="price-popup__close-btn">
        <button class="ds-btn ds-btn--primary" @click="emit('closePricePopup')">Fermer</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* PRICE POPUP ----------------------------- */

/* SMALL / MOBILE (≤ 720px) */
/* overlay & content */
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
  align-items: flex-end;
}

.price-popup__content {
  background-color: white;
  border-radius: 12px;
  max-width: 100%;
}

/* header */
.price-popup__header {
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  height: 52px;
  border-bottom: 1px solid var(--color-light);
}

.price-popup__header-spacer,
.price-popup__header > svg {
  height: 24px;
  width: 24px;
  color: var(--color-primary);
}

/* price */
.price-popup__price {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  border-bottom: 1px solid var(--color-light);
}

.price-popup__price-product,
.price-popup__price-protection {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.price-popup__price span {
  font-size: var(--font-span-lg);
  font-weight: var(--font-weight-light);
  color: var(--color-gray);
}

.price-popup__price p {
  font-size: var(--font-span-md);
  color: var(--color-gray);
}

/* details */
.price-popup__details {
  padding: 16px;
}

.price-popup__details p {
  color: var(--color-gray);
}

/* close btn */
.price-popup__close-btn {
  display: none;
}

/* MEDIUM (> 720px) */
@media (min-width: 721px) {
  /* overlay & content */
  .price-popup__overlay {
    align-items: center;
  }

  .price-popup__content {
    width: 384px;
  }

  /* close btn */
  .price-popup__close-btn {
    display: flex;
    padding: 16px;
  }
}
</style>
