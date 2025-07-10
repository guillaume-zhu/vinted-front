<script setup>
import { ref, onMounted, computed, inject } from 'vue'
import axios from 'axios'
import { RouterLink, useRouter } from 'vue-router'

import Breadcrumb from '@/components/Breadcrumb.vue'
import OfferGalleryV2 from '@/components/OfferGalleryV2.vue'
import OfferCard from '@/components/OfferCard.vue'
import PricePopup from '@/components/PricePopup.vue'

import fallbackAvatar from '@/assets/img/user-profile.webp'

// -----------------------------------------
// BASE VARIABLES
// -----------------------------------------

// 1. Import variables
const GlobalStore = inject('GlobalStore')
const props = defineProps({
  id: { type: String },
})
const router = useRouter()

// 2. Offer and category
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

// 3. Popup price detail
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

// 4. Popup delete
const showDeletePopup = ref(false)

// -----------------------------------------
// BASE FUNCTIONS
// -----------------------------------------

// 1. Offer detail
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
  return days === 0 ? 'aujourd’hui' : `il y a ${days} ${days > 1 ? 'jours' : 'jour'}`
})

// 2. Dressing see more
const SeeMore = () => {
  sliceOffers.value += 100
}

// -----------------------------------------
// API REQUEST
// -----------------------------------------

// 1. Offer, category and dressing info
onMounted(async () => {
  isLoading.value = true

  try {
    // Récupérer offerInfo
    const { data } = await axios.get(`http://localhost:1337/api/offers/${props.id}?populate=*`)

    offerInfo.value = data.data
    category.value = offerInfo.value.attributes.category.data

    offerPictures.value = offerInfo.value.attributes.images.data
    ownerId.value = offerInfo.value.attributes.owner.data.id

    // Récupérer category breadcrumb
    const responseCategory = await axios.get(
      `http://localhost:1337/api/categories/${category.value.id}?populate[0]=parent&populate[1]=parent.parent&populate[2]=parent.parent.parent&populate[3]=parent.parent.parent.parent&populate[4]=parent.parent.parent.parent.parent`,
    )

    breadCrumb.value = responseCategory.data.data

    // Récupérer ownerInfo
    const responseOwnerInfo = await axios.get(
      `http://localhost:1337/api/users/${ownerId.value}?populate[0]=avatar&populate[1]=offers.images&populate[2]=offers.category&populate[3]=offers.brand&populate[4]=offers.size&populate[5]=offers.materials&populate[6]=offers.colors&populate[7]=country`,
    )

    ownerInfo.value = responseOwnerInfo.data

    ownerOffers.value = ownerInfo.value.offers

    ownerOffersFiltered.value = ownerOffers.value.filter((offer) => offer.id.toString() != props.id)
  } catch (error) {
    console.log('Erreur lors du chargement des informations produit', error)
  }
  isLoading.value = false
})

// 2. Delete offer
const deleteOffer = async () => {
  try {
    const response = await axios.delete(`http://localhost:1337/api/offers/${props.id}`, {
      headers: { Authorization: 'Bearer ' + GlobalStore.userInfoCookie.value.token },
    })

    router.push({ name: 'profile', params: { id: GlobalStore.userInfoCookie.value.id } })
  } catch (error) {
    console.log(`Erreur lors de la suppression de l'offre`)
  }
}
</script>

<template>
  <div class="container">
    <!-- BREADCRUMB -------->
    <Breadcrumb v-if="breadCrumb" :category="breadCrumb" />
    <div class="product" v-if="offerInfo">
      <!-- PICTURES & DRESSING BLOC -------------------->
      <div class="pictures-dressing">
        <!-- PICTURES GRID ----->
        <div class="pictures">
          <OfferGalleryV2 :images="offerInfo.attributes.images.data" />
        </div>

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
            <span v-if="offerInfo.attributes.brand?.data">{{
              offerInfo.attributes.brand.data.attributes.displayName
            }}</span>

            <p>{{ offerInfo.attributes.price.toFixed(2) }} €</p>
            <p @click="handlePriceClick(offerInfo.attributes)">
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
            <div class="details__mid-info" v-if="offerInfo.attributes.condition">
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
              <button @click="showDeletePopup = true">Supprimer</button>
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
                <img :src="ownerInfo.avatar?.url || fallbackAvatar" alt="avatar utilisateur" />

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

  <!-- POPUP DELETE -->
  <div class="product__popup-delete" v-if="showDeletePopup">
    <div class="product__popup-content">
      <div>
        <h2>Supprimer l'article</h2>
      </div>

      <div>
        <p>
          Supprimer un article vendu via Vinted est contraire aux <span>Termes et Conditions</span>
        </p>
      </div>

      <div>
        <button @click="showDeletePopup = false">Annuler</button>
        <button @click="deleteOffer()">Confirmer et supprimer</button>
      </div>
    </div>
  </div>
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

/* POPUP DELETE OFFER ------------------------*/
.product__popup-delete {
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  width: 100vw;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.product__popup-content {
  background-color: white;
  padding: 2rem;
  border-radius: 10px;
  max-width: 90%;
}
</style>
