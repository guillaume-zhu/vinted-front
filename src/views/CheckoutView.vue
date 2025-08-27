<script setup>
import { ref, onMounted, inject, watch } from 'vue'
import axios from 'axios'
import { computed } from 'vue'
import { loadStripe } from '@stripe/stripe-js'

// -----------------------------------------
// BASE VARIABLES
// -----------------------------------------

// 1. Import
const props = defineProps({ id: String })
const GlobalStore = inject('GlobalStore')

// 2. Offer
const offerInfo = ref(null)

// 3. User
const userInfo = ref(null)

// 4. Delivery Option
const deliveryOptions = [
  { name: 'relais', price: 2.88 },
  { name: 'home', price: 3.99 },
]
const selectedDelivery = ref(deliveryOptions[0])

// 5. Stripe
const stripePromise = loadStripe(
  'pk_test_51Q58cZ2NVg5X1oh2CTsUoI1sny3ABDXB3QP5W41tXH3GA2OlD9REqIJ5Ryy3DyTxAYDuFqzPLKKr2JfbUb15nPh400ZpjYFLWc',
)
const cardElement = ref(null)
const confirmedPayment = ref(false)

// -----------------------------------------
// FUNCTIONS & HELPERS
// -----------------------------------------

// 1. Total price computed
const totalPrice = computed(() => {
  let total = 0
  let deliveryPrice = selectedDelivery.value.price || 0
  total =
    offerInfo.value.attributes.price +
    offerInfo.value.attributes.price * (9.38 / 100) +
    deliveryPrice
  return Math.round(total * 100) / 100
})

// -----------------------------------------
// API REQUEST
// -----------------------------------------

// 1. offerInfo and UserInfo
const fetchOfferInfo = async () => {
  const response = await axios.get(`http://localhost:1337/api/offers/${props.id}?populate=*`)
  offerInfo.value = response.data.data
  console.log('offerInfo ---->', offerInfo.value)

  const responseUser = await axios.get(
    `http://localhost:1337/api/users/${GlobalStore.userInfoCookie.value.id}?populate[0]=country`,
  )
  userInfo.value = responseUser.data
  console.log('userInfo ---->', userInfo.value)
}

// 2. Stripe payement
const handlePayment = async () => {
  try {
    const stripe = await stripePromise
    const { token } = await stripe.createToken(cardElement.value)
    const stripeToken = token.id

    const response = await axios.post(
      `http://localhost:1337/api/offers/buy`,
      {
        token: stripeToken,
        amount: offerInfo.value.attributes.price,
        title: offerInfo.value.attributes.name,
      },
      { headers: { Authorization: 'Bearer ' + GlobalStore.userInfoCookie.value.token } },
    )

    if (response.data.status === 'succeeded') {
      confirmedPayment.value = true
    }
  } catch (error) {
    console.log('Erreur lors du payement', error)
  }
}

// -----------------------------------------
// ONMOUNTED
// -----------------------------------------
onMounted(async () => {
  fetchOfferInfo()
})

// -----------------------------------------
// WATCHER
// -----------------------------------------

watch(
  () => [offerInfo.value, userInfo.value],
  async ([offer, user]) => {
    if (!offer || !user) return

    const stripeInstance = await stripePromise
    const elements = stripeInstance.elements()
    cardElement.value = elements.create('card', {
      style: {
        base: {
          fontSize: '16px',
          fontFamily: 'Inter, Arial, sans-serif',
          color: 'black',
          '::placeholder': {
            color: 'gray',
          },
          iconColor: 'gray',
        },
        invalid: {
          color: 'red',
          iconColor: 'red',
        },
      },
    })

    setTimeout(() => {
      cardElement.value.mount('#card-element')
    }, 0)
  },
)
</script>

<template>
  <div class="container flex" v-if="offerInfo && userInfo">
    <!-- INFOS BLOC -->
    <div class="checkout__infos">
      <!-- OFFER INFO -->
      <div class="checkout__section checkout__section--offer">
        <h2>Commande</h2>
        <div class="checkout__offer checkout__section-content">
          <img :src="offerInfo.attributes.images.data[0].attributes.url" alt="" />
          <div class="checkout__offer-text">
            <div>
              <p class="checkout__offer-name">{{ offerInfo.attributes.name }}</p>

              <p class="checkout__offer-brand" v-if="offerInfo.attributes?.brand">
                {{ offerInfo.attributes.brand.data.attributes.displayName }}
              </p>

              <p class="checkout__offer-condition" v-if="offerInfo.attributes?.condition">
                {{ offerInfo.attributes.condition }}
              </p>
            </div>

            <p class="checkout__offer-price">{{ offerInfo.attributes.price.toFixed(2) }} €</p>
          </div>
        </div>
      </div>

      <!-- USER INFO ADRESS -->
      <div class="checkout__section checkout__section--user">
        <h2>Adresse</h2>
        <div class="checkout__user checkout__section-content" v-if="userInfo">
          <div>
            <p class="checkout__user-name">{{ userInfo.username }}</p>
            <p class="checkout__user-adress">
              {{ userInfo.city[0].toUpperCase() + userInfo.city.slice(1) }},
              {{ userInfo.country.displayName }}
            </p>
          </div>

          <div><font-awesome-icon :icon="['fas', 'pen']" /></div>
        </div>
      </div>

      <!-- DELIVERY OPTION -->
      <div class="checkout__section checkout__section--delivery">
        <h2>Options de livraison</h2>

        <!-- Point relais -->
        <div
          class="checkout__section-content"
          @click="selectedDelivery = deliveryOptions.find((opt) => opt.name === 'relais')"
          :class="{ selected: selectedDelivery?.name === 'relais' }"
        >
          <div class="checkout__delivery-info">
            <div>
              <font-awesome-icon :icon="['fas', 'map-marker-alt']" />
            </div>

            <div class="checkout__delivery-text">
              <p>Envoi au point relais</p>
              <p>À partir de 2,88€</p>
            </div>
          </div>

          <div
            class="checkout__delivery-check"
            :class="{ selectedSvg: selectedDelivery?.name === 'relais' }"
          >
            <font-awesome-icon :icon="['fas', 'check']" />
          </div>
        </div>

        <!-- Domicile -->
        <div
          class="checkout__section-content"
          @click="selectedDelivery = deliveryOptions.find((opt) => opt.name === 'home')"
          :class="{ selected: selectedDelivery?.name === 'home' }"
        >
          <div class="checkout__delivery-info">
            <div>
              <font-awesome-icon :icon="['fas', 'house-user']" />
            </div>

            <div class="checkout__delivery-text">
              <p>Envoi à domicile</p>
              <p>À partir de 3,99€</p>
            </div>
          </div>
          <div
            class="checkout__delivery-check"
            :class="{ selectedSvg: selectedDelivery?.name === 'home' }"
          >
            <font-awesome-icon :icon="['fas', 'check']" />
          </div>
        </div>
      </div>

      <!-- Stripe payment -->
      <div class="checkout__payment">
        <h2>Paiement</h2>
        <div>
          <p v-if="confirmedPayment">Commande effectué</p>
          <div id="card-element" v-else></div>
        </div>
      </div>
    </div>

    <!-- RESUME BLOC -->
    <div class="checkout__resume">
      <h2>Prix</h2>
      <div class="flex">
        <p>Commande</p>
        <p>{{ offerInfo.attributes.price.toFixed(2) }} €</p>
      </div>

      <div class="flex">
        <p>Frais de Protection acheteurs</p>
        <p>
          {{ (offerInfo.attributes.price * (9.38 / 100)).toFixed(2) }}
          €
        </p>
      </div>

      <div class="flex">
        <p>Frais de port</p>
        <p>{{ selectedDelivery.price }} €</p>
      </div>

      <div class="checkout__resume-separator"></div>

      <div class="flex">
        <p class="total">Total à payer</p>
        <p class="total">
          {{ totalPrice }}
          €
        </p>
      </div>

      <div class="checkout__pay only-mid">
        <button @click="handlePayment" class="ds-btn ds-btn--green">Payer</button>

        <div class="checkout__pay-text">
          <font-awesome-icon :icon="['fas', 'shield-alt']" />
          <span>Ce paiement est crypté et sécurisé</span>
        </div>
      </div>
    </div>

    <!-- PAY BTN -->
    <div class="checkout__pay only-mobile">
      <button @click="handlePayment" class="ds-btn ds-btn--green">Payer</button>

      <div class="checkout__pay-text">
        <font-awesome-icon :icon="['fas', 'shield-alt']" />
        <span>Ce paiement est crypté et sécurisé</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* SMALL / MOBILE (< 720px) */
.container {
  padding: 16px;
}

h2 {
  margin-bottom: 16px;
  font-size: 18px;
}

/* INFO BLOC -------- */
.checkout__infos {
  display: flex;
  flex-direction: column;
  gap: 32px;
}
.checkout__section {
  /* border: 1px solid red; */
}

/* OFFER */
.checkout__section--offer {
  display: flex;
  flex-direction: column;
}

.checkout__offer {
  display: flex;
  gap: 8px;
}
.checkout__offer img {
  width: 128px;
  height: 170px;
  object-fit: cover;
  border-radius: var(--radius);
}

.checkout__offer-text {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
.checkout__offer-text > div {
  display: flex;
  flex-direction: column;
  gap: 3px;
}
.checkout__offer-name,
.checkout__offer-price {
  font-size: var(--font-span-lg);
  font-weight: var(--font-weight-medium);
  line-height: var(--line-height-mid);
}
.checkout__offer-brand,
.checkout__offer-condition {
  font-size: var(--font-span-md);
  color: var(--color-gray);
}

/* ADRESS */
.checkout__user {
  border: 1px solid var(--color-lightest-gray);
  border-radius: var(--radius);
  display: flex;
  justify-content: space-between;
  padding: 16px;
}
.checkout__user-name {
  font-size: var(--font-span-lg);
  font-weight: var(--font-weight-medium);
  line-height: var(--line-height-mid);
  margin-bottom: 3px;
}
.checkout__user-adress {
  font-size: var(--font-span-lg);
  font-weight: var(--font-weight-light);
  line-height: var(--line-height-mid);
  color: var(--color-gray);
}

/* DELIVERY */
.checkout__section--delivery {
  display: flex;
  flex-direction: column;
}

/* boxes */
.checkout__section--delivery > div {
  border: 1px solid var(--color-lightest-gray);
  border-radius: var(--radius);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
}
.checkout__section--delivery > div:first-of-type {
  margin-bottom: 16px;
}
.selected {
  background-color: var(--color-light-primary);
  border: 1px solid var(--color-primary) !important;
}

/* text */
.checkout__delivery-info {
  display: flex;
  gap: 16px;
}
.checkout__delivery-text > p:first-child {
  font-size: var(--font-span-lg);
  font-weight: var(--font-weight-medium);
  line-height: var(--line-height-mid);
  margin-bottom: 4px;
}
.checkout__delivery-text > p:last-child {
  font-size: var(--font-span-lg);
  color: var(--color-gray);
  font-weight: var(--font-weight-light);
}

/* delivery option svg */
.checkout__delivery-info div:first-of-type {
  width: 24px;
  display: flex;
  justify-content: center;
  align-items: center;
}
.checkout__delivery-info svg {
  font-size: 24px;
}

/* check svg */
.checkout__delivery-check {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--color-gray);
}
.checkout__delivery-check svg {
  font-size: 10px;
  color: white;
}
.selectedSvg {
  background-color: var(--color-primary);
}

/* PAYMENT */
.checkout__payment > div {
  border: 1px solid var(--color-lightest-gray);
  border-radius: var(--radius);
  padding: 16px;
}

/* RESUME ---- */
.checkout__resume {
  padding: 32px 0px 16px 0px;
}
.checkout__resume > div {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}
.checkout__resume > div:last-child {
  margin-bottom: 0px;
}
.checkout__resume > div > p {
  font-size: var(--font-span-lg);
  line-height: var(--line-height-mid);
  font-weight: var(--font-weight-light);
}
.checkout__resume > div > .total {
  font-weight: var(--font-weight-medium);
}
.checkout__resume-separator {
  width: 100%;
  border: 1px solid var(--color-lightest-gray);
  margin-top: 16px;
  margin-bottom: 16px !important;
}

/* PAY BTN ----- */
.checkout__pay {
  border-bottom: 1px solid var(--color-lightest-gray);
}
.checkout__pay-text {
  padding: 16px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 6px;
}
.checkout__pay-text span {
  font-size: var(--font-p);
  color: var(--color-gray);
}
.checkout__pay-text svg {
  color: var(--color-gray);
}

.only-mid {
  display: none !important;
}

/* MEDIUM (>= 720px ) */
@media (min-width: 720px) {
  .only-mobile {
    display: none;
  }
  .only-mid {
    display: initial !important;
  }
  .container {
    display: flex;
    justify-content: space-between;
    gap: 24px;
    padding: 16px 16px 48px 16px;
  }

  .checkout__infos {
    flex: 1;
  }
  .checkout__resume {
    flex: 1;
    border: 1px solid var(--color-lightest-gray);
    padding: 24px;
    height: fit-content;
    border-radius: var(--radius);
  }
  .checkout__pay-text {
    padding: 16px 0px 0px 0px;
  }
  .checkout__pay {
    border: none;
    margin-top: 8px;
  }
  .ds-btn {
    margin-top: 8px;
  }
}

/* DESKTOP (>= 960px) */
@media (min-width: 960px) {
  .container {
    padding: 24px 24px 48px 24px;
  }
  .checkout__infos {
    flex: 2;
  }
}

/* DESKTOP LARGE (>= 1200px) */
@media (min-width: 1200px) {
}
</style>
