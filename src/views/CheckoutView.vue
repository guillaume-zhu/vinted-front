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
          fontSize: '20px',
          fontFamily: 'Inter, Arial, sans-serif',
          color: 'purple',
          '::placeholder': {
            color: 'coral',
          },
          iconColor: 'aqua',
        },
        invalid: {
          color: 'blue',
          iconColor: 'gold',
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
          <div>
            <p>{{ offerInfo.attributes.name }}</p>
            <p>
              {{
                offerInfo.attributes.condition +
                ' · ' +
                offerInfo.attributes.brand.data.attributes.displayName
              }}
            </p>
          </div>

          <p>{{ offerInfo.attributes.price.toFixed(2) }} €</p>
        </div>
      </div>

      <!-- USER INFO ADRESS -->
      <div class="checkout__section checkout__section--user">
        <h2>Adresse</h2>
        <div class="checkout__user checkout__section-content"></div>
        <div>
          <p>{{ userInfo.username }}</p>
          <p>
            {{ userInfo.city[0].toUpperCase() + userInfo.city.slice(1) }},
            {{ userInfo.country.displayName }}
          </p>
        </div>

        <div><font-awesome-icon :icon="['fas', 'pen']" /></div>
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
          <div>
            <font-awesome-icon :icon="['fas', 'map-marker-alt']" />
            <div>
              <p>Envoi au point relais</p>
              <p>À partir de 2,88€</p>
            </div>
          </div>
          <div class="checkout__delivery-check">
            <font-awesome-icon :icon="['fas', 'check']" />
          </div>
        </div>

        <!-- Domicile -->
        <div
          class="checkout__section-content"
          @click="selectedDelivery = deliveryOptions.find((opt) => opt.name === 'home')"
          :class="{ selected: selectedDelivery?.name === 'home' }"
        >
          <div>
            <font-awesome-icon :icon="['fas', 'house-user']" />
            <div>
              <p>Envoi à domicile</p>
              <p>À partir de 3,99€</p>
            </div>
          </div>
          <div class="checkout__delivery-check">
            <font-awesome-icon :icon="['fas', 'check']" />
          </div>
        </div>
      </div>

      <!-- Stripe payment -->
      <div class="checkout__payment">
        <p v-if="confirmedPayment">Commande effectué</p>
        <div id="card-element" v-else></div>
      </div>
    </div>

    <!-- RESUME BLOC -->
    <div class="checkout__resume">
      <h2>Résumé de la commande</h2>
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

      <div class="flex">
        <p>Total</p>
        <p>
          {{ totalPrice }}
          €
        </p>
      </div>

      <button @click="handlePayment">Payer</button>

      <div>
        <font-awesome-icon :icon="['fas', 'shield-alt']" />
        <span>Ce paiement est crypté et sécurisé</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
img {
  width: 50px;
  height: 50px;
}

.flex {
  display: flex;
  justify-content: space-between;
}

.selected {
  background-color: #f3fcfc;
}
</style>
