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
    <Breadcrumb v-if="breadCrumb" :category="breadCrumb" class="breadcrumb" />

    <div class="product" v-if="offerInfo">
      <!-- PICTURES & DETAILS BLOC -------------------->
      <div class="product__pictures-details">
        <!-- PICTURES GRID ----->
        <div class="product__pictures-dressing">
          <OfferGalleryV2 :images="offerInfo.attributes.images.data" />

          <div class="dressing dressing-desktop" v-if="ownerOffersFiltered">
            <h2>({{ ownerOffers.length }}) articles disponibles</h2>
            <div class="dressing__offers">
              <OfferCard
                v-for="offer in ownerOffersFiltered.slice(0, sliceOffers)"
                :key="offer.id"
                :offer="offer"
                @price-clicked="handlePriceClick"
              />
            </div>
            <h2 @click="SeeMore()" v-if="sliceOffers < ownerOffers.length">
              Voir tous les articles ({{ ownerOffers.length }})
            </h2>
          </div>
        </div>

        <!-- DETAILS BLOC -------------------------------->
        <div class="details" v-if="offerInfo">
          <!-- PRODUCT INFO -------->
          <div class="details__product">
            <!-- HEADER -->
            <div class="details__header">
              <h2>{{ offerInfo.attributes.name }}</h2>

              <!-- HEADLINES -->
              <div class="details__headlines">
                <span v-if="offerInfo.attributes.condition"
                  >{{ offerInfo.attributes.condition }} ·
                </span>
                <span v-if="offerInfo.attributes.brand?.data">{{
                  offerInfo.attributes.brand.data.attributes.displayName
                }}</span>
              </div>

              <!-- PRICE -->
              <div class="details__price-block">
                <span class="details__price">{{ offerInfo.attributes.price.toFixed(2) }} €</span>
                <span @click="handlePriceClick(offerInfo.attributes)" class="details__price-total">
                  {{
                    (
                      offerInfo.attributes.price +
                      offerInfo.attributes.price * (9.38 / 100)
                    ).toFixed(2)
                  }}
                  €
                </span>
                <span class="details__price-protection">
                  Inclut la Protection acheteurs <font-awesome-icon :icon="['fas', 'shield-alt']" />
                </span>
              </div>
            </div>

            <!-- PROPERTIES -->
            <div class="details__properties">
              <!-- condition -->
              <div class="details__properties-info" v-if="offerInfo.attributes.condition">
                <span>État</span>
                <span>{{ offerInfo.attributes.condition }}</span>
              </div>

              <!-- size -->
              <div class="details__properties-info" v-if="offerInfo.attributes.size.data">
                <span>Taille</span>
                <span>
                  {{ offerInfo.attributes.size.data.attributes.displayName }}
                </span>
              </div>

              <!-- brand -->
              <div class="details__properties-info" v-if="offerInfo.attributes.brand.data">
                <span>Marque</span>
                <span>
                  {{ offerInfo.attributes.brand.data.attributes.displayName }}
                </span>
              </div>

              <!-- color -->
              <div class="details__properties-info" v-if="offerInfo.attributes.colors.data">
                <span>Couleur</span>
                <span>
                  {{
                    offerInfo.attributes.colors.data
                      .map(
                        (color) =>
                          color.attributes.displayName[0].toUpperCase() +
                          color.attributes.displayName.slice(1),
                      )
                      .join(', ')
                  }}
                </span>
              </div>

              <!-- Ajouté -->
              <div class="details__properties-info" v-if="offerInfo.attributes.publishedAt">
                <span>Ajouté</span>
                <span>{{ addedAgo }}</span>
              </div>
            </div>

            <!-- DESCRIPTION -->
            <div
              class="details__description"
              :class="{
                ifNotOwner:
                  GlobalStore.userInfoCookie.value.id !== offerInfo.attributes.owner.data.id,
              }"
              v-if="offerInfo.attributes.description"
            >
              <p>{{ offerInfo.attributes.description }}</p>
            </div>

            <!-- IF OWNER BTN -->
            <div
              class="details__is-owner-btn"
              v-if="GlobalStore.userInfoCookie.value.id === offerInfo.attributes.owner.data.id"
            >
              <RouterLink :to="{ name: 'edit', params: { id: offerInfo.id } }">
                <button class="ds-btn ds-btn--third">Modifier l'annonce</button>
              </RouterLink>
              <button @click="showDeletePopup = true" class="ds-btn ds-btn--danger">
                Supprimer
              </button>
            </div>

            <!-- BUY BTN -->
            <div class="details__btn-buy" v-else>
              <button class="ds-btn ds-btn--primary">Acheter</button>
            </div>
          </div>

          <!-- PROTECTION INFO ----->
          <div class="details__protection">
            <div class="details__protection-shield">
              <font-awesome-icon :icon="['fas', 'shield-alt']" />
            </div>
            <div class="details__protection-text">
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
            <div class="details__owner-info">
              <RouterLink :to="{ name: 'profile', params: { id: ownerInfo.id } }">
                <div class="details__owner-avatar">
                  <img :src="ownerInfo.avatar?.url || fallbackAvatar" alt="avatar utilisateur" />

                  <h3>{{ ownerInfo.username }}</h3>
                </div>
              </RouterLink>

              <RouterLink :to="{ name: 'profile', params: { id: ownerInfo.id } }">
                <font-awesome-icon :icon="['fas', 'chevron-right']" />
              </RouterLink>
            </div>

            <div class="details__owner-localisation">
              <font-awesome-icon :icon="['fas', 'map-marker-alt']" />
              <p>
                {{ ownerInfo.city[0].toUpperCase() + ownerInfo.city.slice(1) }},
                {{ ownerInfo.country.displayName }}
              </p>
            </div>
          </div>
        </div>
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
        <h2 @click="SeeMore()" v-if="sliceOffers < ownerOffers.length">
          Voir tous les articles ({{ ownerOffers.length }})
        </h2>
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
        <h3>
          Supprimer un article vendu via Vinted est contraire aux <span>Termes et Conditions</span>
        </h3>
      </div>

      <div>
        <button @click="showDeletePopup = false"><h2>Annuler</h2></button>
        <button @click="deleteOffer()"><h2>Confirmer et supprimer</h2></button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* SMALL / MOBILE (< 720px) */
.container {
  padding: 10px;
}
.breadcrumb {
  margin-bottom: 25px;
}

/* DETAILS */
.details {
  margin-top: 16px;
}
.details__product {
  padding: 16px;
  border-radius: var(--radius);
  border: 1px solid var(--color-lightest-gray);
}

/* header */
.details__header {
  border-bottom: 1px solid var(--color-lightest-gray);
  padding-bottom: 16px;
}
.details__headlines > span {
  color: var(--color-gray);
  font-weight: var(--font-weight-light);
  line-height: var(--line-height-mid);
}
.details__price-block {
  margin-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.details__price {
  font-size: var(--font-span-md);
  font-weight: var(--font-weight-light);
  color: var(--color-gray);
}
.details__price-total {
  font-size: var(--font-h2);
  font-weight: var(--font-weight-mid);
  color: var(--color-primary);
}
.details__price-protection {
  font-size: var(--font-span-md);
  font-weight: var(--font-weight-light);
  color: var(--color-primary);
  margin-top: 5px;
}
.details__price-protection svg {
  font-size: 12px;
}

/* properties */
.details__properties {
  margin-top: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--color-lightest-gray);
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.details__properties-info {
  display: flex;
}
.details__properties-info > span {
  flex: 1;
  font-size: var(--font-span-md);
  font-weight: var(--font-weight-light);
  color: var(--color-gray);
}
.details__properties-info > span:nth-child(2) {
  font-weight: var(--font-weight-medium);
}

/* description part */
.details__description {
  margin-top: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--color-lightest-gray);
}
.details__description > p {
  font-size: var(--font-span-lg);
  line-height: var(--line-height-mid);
  font-weight: var(--font-weight-light);
  color: var(--color-gray);
}
.ifNotOwner {
  padding-bottom: 0px;
  border-bottom: none;
}

/* if owner btn */
.details__is-owner-btn {
  margin-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.ds-btn {
  font-size: var(--font-span-md);
}

/* delete popup */
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
  border-radius: 12px;
  max-width: 90%;
  overflow: hidden;
}
.product__popup-content > div:nth-child(1) {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 16px;
}
.product__popup-content > div:nth-child(2) {
  border: 1px solid var(--color-lightest-gray);
  padding: 16px;
}
h3 > span {
  color: var(--color-primary);
  text-decoration: underline;
  cursor: pointer;
}
.product__popup-content > div:nth-child(3) {
  display: flex;
}
.product__popup-content > div:nth-child(3) > button {
  background-color: white;
  border: none;
  flex: 1 1 auto;
  height: 44px;
}
.product__popup-content > div:nth-child(3) > button:nth-child(1) {
  border-right: 1px solid var(--color-lightest-gray);
}
.product__popup-content > div:nth-child(3) > button:nth-child(1) > h2 {
  color: var(--color-gray);
}
.product__popup-content > div:nth-child(3) > button:nth-child(2) > h2 {
  color: var(--color-danger);
}

/* buy btn */
.details__btn-buy {
  position: fixed;
  bottom: 0px;
  left: 0;
  width: 100%;
  padding: 16px;
  background-color: white;
  border-top: 1px solid var(--color-lightest-gray);
}

.details img {
  width: 32px;
  height: 32px;
}

/* PROTECTION INFO */
.details__protection {
  margin-top: 16px;
  padding: 16px;
  border: 1px solid var(--color-lightest-gray);
  display: flex;
  align-items: top;
  gap: 10px;
  border-radius: var(--radius);
}
.details__protection-shield {
  width: 32px;
  height: 32px;
  background-color: var(--color-third);
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 50px;
  flex: 0 0 auto;
  color: var(--color-primary);
  margin-top: 3px;
}
.details__protection-text > p {
  font-size: var(--font-span-md);
  line-height: var(--line-height-body);
  color: var(--color-gray);
}

/* OWNER INFO */
.details__owner {
  border-radius: var(--radius);
  border: 1px solid var(--color-lightest-gray);
  margin-top: 16px;
}
.details__owner-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid var(--color-lightest-gray);
}
.details__owner-info a {
  text-decoration: none;
}
.details__owner-avatar {
  display: flex;
  align-items: center;
  gap: 10px;
}
.details__owner-avatar img {
  width: 48px;
  height: 48px;
  border-radius: 50%;
}
.details__owner-avatar h3 {
  text-decoration: none;
  color: var(--color-black);
  font-weight: var(--font-weight-medium);
}
.details__owner-localisation {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 16px;
  color: var(--color-gray);
}
.details__owner-localisation p {
  font-size: var(--font-span-lg);
}

/* DRESSING */
.dressing-desktop {
  display: none;
}
.dressing {
  margin-top: 32px;
}
.dressing__offers {
  margin-top: 16px;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 10px;
}

/* MEDIUM (>= 720px ) */
@media (min-width: 720px) {
  .container {
    padding: 20px;
  }
  .details__description {
    padding-bottom: 16px;
  }
  .details button {
    max-width: 50%;
  }
  .details__btn-buy {
    position: relative;
    padding: 16px 0px 0px 0px;
  }
  .dressing {
    margin-bottom: 40px;
  }
}

/* DESKTOP (>= 960px) */
@media (min-width: 960px) {
  .dressing {
    display: none;
  }
  .product__pictures-details {
    display: flex;
    justify-content: space-between;
    gap: 30px;
  }
  .product__pictures-dressing {
    flex: 2;
    display: flex;
    flex-direction: column;
  }
  .details {
    flex: 1;
    margin-top: 0px;
  }
  .details button {
    max-width: 100%;
  }
  .dressing-desktop {
    display: initial;
  }
}

/* DESKTOP LARGE (>= 1200px) */
@media (min-width: 1200px) {
}
</style>
