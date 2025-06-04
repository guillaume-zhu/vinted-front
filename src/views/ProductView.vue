<script setup>
import { ref, onMounted, computed, inject } from 'vue'
import axios from 'axios'
import { RouterLink } from 'vue-router'

import Breadcrumb from '@/components/Breadcrumb.vue'
import OfferGallery from '@/components/OfferGallery.vue'
import OfferCard from '@/components/OfferCard.vue'
import PricePopup from '@/components/PricePopup.vue'

// Main variables
const GlobalStore = inject('GlobalStore')
console.log('Global store userInfoCookie.id ---->', GlobalStore.userInfoCookie.value.id)

const props = defineProps({
  id: { type: String },
})

const offerInfo = ref(null)
const isLoading = ref(false)
const category = ref(null)
const breadCrumb = ref(null)
const offerPictures = ref(null)
const ownerId = ref(null)
const ownerInfo = ref(null)
const ownerOffers = ref([])
const ownerOffersFiltered = ref([])
const sliceOffers = ref(100)

// Variable pour le popup price details
const showPricePopup = ref(false)
const selectedOfferForPopup = ref(null)

const handlePriceClick = (offer) => {
  selectedOfferForPopup.value = offer
  showPricePopup.value = true
}

const closePricePopup = () => {
  showPricePopup.value = false
  selectedOfferForPopup.value = null
}

////// REQUETE POUR RÉCUPÉRER offerInfo + category BREADCRUMB + dressing
onMounted(async () => {
  isLoading.value = true

  try {
    // Récupérer offerInfo
    const { data } = await axios.get(`http://localhost:1337/api/offers/${props.id}?populate=*`)
    console.log('offerInfo ---->', data.data)

    offerInfo.value = data.data
    category.value = offerInfo.value.attributes.category.data

    offerPictures.value = offerInfo.value.attributes.images.data
    ownerId.value = offerInfo.value.attributes.owner.data.id
    // console.log('offerPictures', offerPictures.value)

    // Récupérer category breadcrumb
    const responseCategory = await axios.get(
      `http://localhost:1337/api/categories/${category.value.id}?populate[0]=parent&populate[1]=parent.parent&populate[2]=parent.parent.parent&populate[3]=parent.parent.parent.parent&populate[4]=parent.parent.parent.parent.parent`,
    )

    breadCrumb.value = responseCategory.data.data
    console.log('breadCrumb ---->', breadCrumb.value)

    // Récupérer ownerInfo
    const responseOwnerInfo = await axios.get(
      `http://localhost:1337/api/users/${ownerId.value}?populate[0]=avatar&populate[1]=offers.images&populate[2]=offers.category&populate[3]=offers.brand&populate[4]=offers.size&populate[5]=offers.materials&populate[6]=offers.colors&populate[7]=country`,
    )

    ownerInfo.value = responseOwnerInfo.data
    console.log('ownerInfo ---->', ownerInfo.value)

    ownerOffers.value = ownerInfo.value.offers
    console.log('ownerOffers ---->', ownerOffers.value)

    ownerOffersFiltered.value = ownerOffers.value.filter((offer) => offer.id.toString() != props.id)
  } catch (error) {
    console.log('Erreur lors du chargement des informations produit', error)
  }
  isLoading.value = false
})

// Calculer 'ajouté il y a X jours'
const addedAgo = computed(() => {
  // vérification erreur
  if (!offerInfo.value?.attributes?.publishedAt) return ''

  // date aujourd'hui
  const today = new Date()

  // date publication du produit
  const createdDate = new Date(offerInfo.value.attributes.publishedAt)

  // calcul différence en ms des dates
  const diffMs = today.getTime() - createdDate.getTime()

  // convert en jour
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  // retourner 'il y a X jours'
  return `il y a ${days} ${days > 1 ? 'jours' : 'jour'}`
})

// Voir plus dressing
const SeeMore = () => {
  sliceOffers.value += 100
}
</script>

<template>
  <div class="container">
    <div class="product">
      <!-- PICTURES & DRESSING BLOC -------------------->
      <div class="pictures-dressing">
        <!-- PICTURES GRID ----->
        <div class="pictures">
          <OfferGallery v-if="offerPictures" :offerPictures="offerPictures" />
        </div>
        <!-- BREADCRUMB -------->
        <Breadcrumb v-if="breadCrumb" :category="breadCrumb" />
        <!-- DRESSING  --------->
        <div class="dressing" v-if="ownerOffersFiltered">
          <h2>({{ ownerOffers.length }}) articles disponibles</h2>
          <div class="dressing__offers">
            <OfferCard
              v-for="offer in ownerOffersFiltered.slice(0, sliceOffers)"
              :key="offer.id"
              :offer="offer"
              @price-clicked="handlePriceClick"
            />
          </div>
          <p @click="SeeMore()" v-if="sliceOffers < ownerOffers.length">
            Voir tous les articles ({{ ownerOffers.length }})
          </p>
        </div>
      </div>

      <!-- DETAILS BLOC -------------------------------->
      <div class="details" v-if="offerInfo">
        <!-- PRODUCT INFO -------->
        <div class="details__product">
          <!-- TOP PART -->
          <div class="details__top">
            <p>{{ offerInfo.attributes.name }}</p>
            <span v-if="offerInfo.attributes.condition"
              >{{ offerInfo.attributes.condition }} ·
            </span>
            <span>{{ offerInfo.attributes.brand.data.attributes.displayName }}</span>

            <p>{{ offerInfo.attributes.price.toFixed(2) }} €</p>
            <p>
              {{
                (offerInfo.attributes.price + offerInfo.attributes.price * (9.38 / 100)).toFixed(2)
              }}
              €
            </p>
            <p>
              Inclut la Protection acheteurs <font-awesome-icon :icon="['fas', 'shield-alt']" />
            </p>
          </div>

          <!-- MID PART -->
          <div class="details__mid">
            <!-- condition -->
            <div class="details__mid-info" v-if="offerInfo.attributes.condition.data">
              <p>État</p>
              <p>{{ offerInfo.attributes.condition }}</p>
            </div>

            <!-- size -->
            <div class="details__mid-info" v-if="offerInfo.attributes.size.data">
              <p>Taille</p>
              <p>
                {{ offerInfo.attributes.size.data.attributes.displayName }}
              </p>
            </div>

            <!-- brand -->
            <div class="details__mid-info" v-if="offerInfo.attributes.brand.data">
              <p>Marque</p>
              <p>
                {{ offerInfo.attributes.brand.data.attributes.displayName }}
              </p>
            </div>

            <!-- color -->
            <div class="details__mid-info" v-if="offerInfo.attributes.colors.data">
              <p>Couleur</p>
              <p>
                {{
                  offerInfo.attributes.colors.data
                    .map(
                      (color) =>
                        color.attributes.displayName[0].toUpperCase() +
                        color.attributes.displayName.slice(1),
                    )
                    .join(', ')
                }}
              </p>
            </div>

            <!-- Ajouté -->
            <div class="details__mid-info" v-if="offerInfo.attributes.publishedAt">
              <p>Ajouté</p>
              <p>{{ addedAgo }}</p>
            </div>
          </div>

          <!-- DESCRIPTION PART -->
          <div class="details__description" v-if="offerInfo.attributes.description">
            <p>{{ offerInfo.attributes.description }}</p>
          </div>

          <!-- BOT PART -->
          <div class="details__bot">
            <div v-if="GlobalStore.userInfoCookie.value.id === offerInfo.attributes.owner.data.id">
              <RouterLink :to="{ name: 'edit', params: { id: offerInfo.id } }">
                <button>Modifier l'annonce</button>
              </RouterLink>
              <button>Supprimer</button>
            </div>
            <button v-else>Acheter</button>
          </div>
        </div>

        <!-- PROTECTION INFO ----->
        <div class="details__protection">
          <div>
            <font-awesome-icon :icon="['fas', 'shield-alt']" />
          </div>
          <div>
            <h2>Frais de Protection acheteurs</h2>
            <p>
              Pour tout achat effectué par le biais du bouton Acheter, nous appliquons des frais
              couvrant notre Protection acheteurs. Cette Protection acheteurs comprend notre
              Politique de remboursement.
            </p>
          </div>
        </div>

        <!-- OWNER INFO --------->
        <div class="details__owner" v-if="ownerInfo">
          <div>
            <RouterLink :to="{ name: 'profile', params: { id: ownerInfo.id } }">
              <div class="details__owner-avatar">
                <img :src="ownerInfo.avatar.url" alt="" />
                <p>{{ ownerInfo.username }}</p>
              </div>
            </RouterLink>

            <RouterLink :to="{ name: 'profile', params: { id: ownerInfo.id } }">
              <font-awesome-icon :icon="['fas', 'chevron-right']" />
            </RouterLink>
          </div>

          <div>
            <font-awesome-icon :icon="['fas', 'map-marker-alt']" />
            <p>
              {{ ownerInfo.city[0].toUpperCase() + ownerInfo.city.slice(1) }},
              {{ ownerInfo.country.displayName }}
            </p>
          </div>

          <div>
            <a href="">Suivre</a>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- POPUP GLOBAL PRICE DETAIL -->
  <PricePopup
    v-if="selectedOfferForPopup"
    :selectedOfferForPopup="selectedOfferForPopup"
    :showPricePopup="showPricePopup"
    @closePricePopup="closePricePopup"
  />

  <p v-if="selectedOfferForPopup">{{ selectedOfferForPopup.price }}</p>
</template>

<style scoped>
.product {
  /* border: 1px solid purple; */
  display: flex;
}

/* PICTURES & DRESSING BLOC ---------------------------*/
.pictures-dressing {
  border: 1px solid green;
  width: 790px;
  min-height: 600px;
}

/* PICTURES GRID ---------------*/
.pictures {
  height: 625px;
  /* border: 1px solid salmon; */
}

/* DRESSING BLOC ---------------*/
.dressing__offers {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

/* DETAILS BLOC ---------------------------------------*/
.details {
  border: 1px solid blue;
  width: 33%;
}

/* PRODUCT INFO ---------------------------*/

/* TOP PART --------------------*/
.details__top {
  border-bottom: 1px solid grey;
}

/* MID PART ------------------- */
.details__mid {
  border-bottom: 1px solid grey;
}

.details__mid-info {
  display: flex;
}

/* DESCRIPTION PART ----------- */
.details__description {
  border-bottom: 1px solid grey;
}

/* BOT PART ------------------- */
.details__bot {
  border-bottom: 1px solid grey;
}

/* PROTECTION INFO ---------------------------*/

/* OWNER INFO --------------------------------*/
.details__owner > div {
  display: flex;
  justify-content: space-between;
  border: 1px solid grey;
}

.details__owner-avatar {
  display: flex;
}

.details__owner-avatar > img {
  width: 48px;
  height: 48px;
  border-radius: 50px;
}
</style>
