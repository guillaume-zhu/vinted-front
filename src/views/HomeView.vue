<script setup>
import { ref, onMounted, computed } from 'vue'
import { RouterLink } from 'vue-router'
import axios from 'axios'
import _ from 'lodash'

import OfferCard from '@/components/OfferCard.vue'
import Dressing from '@/components/Dressing.vue'
import PricePopup from '@/components/PricePopup.vue'

const isLoading = ref(false)
const errorMessage = ref('')

// Variables pour les offres normales
let totalOffer = ''
const allOffersId = ref([])
const randomizedAllOffersId = ref([])

const allOwnersId = ref([])
const randomizedAllOwnersId = ref([])

const firstOffersLine = ref([])
const firstDressingLine = ref()
const secondOffersLine = ref([])
const secondDressingLine = ref()
const thirdOffersLine = ref([])
const thirdDressingLine = ref()
const fourthOffersLine = ref([])

// Variables pour les offres avec voir plus
let page = 1
const offersListPlus = ref([])
let pageSize = 0

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

// Fonction pour découper le tableau d'id en 80-80-80
const cutArray = (array, size) => {
  let result = []
  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size))
  }
  return result
}

const searchDressingWithOffers = async (ownersQueue) => {
  while (ownersQueue.length > 0) {
    const owner = ownersQueue.shift()
    try {
      const response = await axios.get(
        `http://localhost:1337/api/users/${owner.id}?populate[0]=avatar&populate[1]=offers.images&populate[2]=offers.category&populate[3]=offers.brand&populate[4]=offers.size&populate[5]=offers.materials&populate[6]=offers.colors`,
      )

      if (response.data.offers.length > 0) {
        return response.data
      }
    } catch (error) {
      console.log(
        `Erreur lors de la boucle pour récupérer un dressing de l'utilisateur ${owner.id}`,
      )
    }
  }
  return null
}

/////////// REQUETE POUR AFFICHER OFFRES ET DRESSING
onMounted(async () => {
  isLoading.value = true
  try {
    ///////// RÉCUPÉRER LES 80 PREMIÈRES OFFRES
    /////// récupérer le nombre total d'offre avec une requete simple a charger
    const responseTotalOffer = await axios.get(
      `http://localhost:1337/api/offers?pagination[pageSize]=1`,
    )
    totalOffer = responseTotalOffer.data.meta.pagination.total

    /////// récupérer tout les id avec une requete pour pageSize = total offres
    const responseAllOffersId = await axios.get(
      `http://localhost:1337/api/offers?pagination[pageSize]=${totalOffer}&fields[0]=id`,
    )
    /////// stocker id dans tableau
    allOffersId.value = responseAllOffersId.data.data.map((allOffersId) => allOffersId.id)
    // console.log(`allOffersId ---->`, allOffersId.value)

    ///// Mélanger le tableau d'id aléatoirement
    randomizedAllOffersId.value = _.shuffle(allOffersId.value)

    /////// Charger 80 premières offres grace au tableau d'id
    //// Couper le tableau en partie de 80

    const first80OffersId = cutArray(randomizedAllOffersId.value, 80)[0]

    //// requête pour afficher les 80 premières offres en aléatoire
    const { data } = await axios.get(
      `http://localhost:1337/api/offers?pagination[pageSize]=80&populate=*`,
      {
        params: {
          'filters[id][$in]': first80OffersId,
        },
      },
    )

    // Attribution des lines d'offres découpées
    firstOffersLine.value = data.data.slice(0, 10)

    secondOffersLine.value = data.data.slice(10, 35)

    thirdOffersLine.value = data.data.slice(35, 60)

    fourthOffersLine.value = data.data.slice(60)

    ///////// RÉCUPÉRER UN DRESSING ALÉATOIRE
    // Récupérer tout les id des utilisateurs dans un tableau
    const responseAllOwnersId = await axios.get('http://localhost:1337/api/users?[fields][0]=id')
    allOwnersId.value = responseAllOwnersId.data

    // Mélanger ce tableau d'id
    randomizedAllOwnersId.value = _.shuffle(allOwnersId.value)

    // Copie de la liste des tableaux d'id utilisateurs pour la transformer en file d'attente mutable
    const ownersQueue = [...randomizedAllOwnersId.value]

    // Afficher les dressing avec au moins une offre
    firstDressingLine.value = await searchDressingWithOffers(ownersQueue)
    secondDressingLine.value = await searchDressingWithOffers(ownersQueue)
    thirdDressingLine.value = await searchDressingWithOffers(ownersQueue)
  } catch (error) {
    errorMessage.value = error
  } finally {
    isLoading.value = false
  }
})

/////////// LOGIQUE POUR AJOUTER UN BOUTON VOIR PLUS ET AFFICHER LA SUITE DES REQUÊTES
const loadMoreOffer = async () => {
  pageSize += 80

  const responseOfferPlus = await axios.get(
    `http://localhost:1337/api/offers?pagination[pageSize]=${pageSize}&populate=*`,
    {
      params: {
        'filters[id][$in]': randomizedAllOffersId.value.slice(80),
      },
    },
  )

  offersListPlus.value = responseOfferPlus.data.data
}
</script>

<template>
  <main class="page-content">
    <!-- HERO ---------------------->
    <div class="hero">
      <div class="hero__background">
        <img class="hero__img" src="./../assets/img/home-hero.jpg" alt="" />
      </div>

      <div class="hero__overlay container">
        <div class="hero__card-container">
          <div class="hero__card">
            <div class="hero__card-content">
              <h1>Prêt à faire du tri dans tes placards ?</h1>
            </div>

            <div class="hero__card-buttons">
              <RouterLink :to="{ name: 'sell' }">
                <button class="ds-btn ds-btn--primary">
                  <h2>Commence à vendre</h2>
                </button>
              </RouterLink>
              <button class="ds-btn ds-btn--secondary">
                <h2>Découvrir comment ça marche</h2>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="home__content">
      <!-- BANNER -------------------->
      <div class="banner container">
        <div class="banner__content-text">
          <span class="text-md">NOUVEAU</span>
          <h2>Vends tes appareils électroniques sans frais de vente</h2>
        </div>

        <RouterLink :to="{ name: 'sell' }" class="banner__button"> Commencer à vendre</RouterLink>
      </div>

      <!-- OFFERS -------------------->
      <section class="offers">
        <div v-if="isLoading">
          <p>En cours de chargement</p>
        </div>
        <div v-else-if="errorMessage">
          <p>{{ errorMessage }}</p>
        </div>

        <!-- OFFERSLIST -->

        <div class="container" v-else="offersList">
          <h1>Fil d'actu</h1>

          <!-- FIRST 2 OFFERS LINE -->
          <div class="offers-list">
            <OfferCard
              v-for="offer in firstOffersLine"
              :key="offer.id"
              :offer="offer"
              @price-clicked="handlePriceClick"
            />
          </div>

          <!-- FIRST DRESSING LINE -->
          <Dressing :dressingInfo="firstDressingLine" v-if="firstDressingLine" />

          <!-- SECOND 5 OFFERS LINE -->
          <div class="offers-list">
            <OfferCard
              v-for="offer in secondOffersLine"
              :key="offer.id"
              :offer="offer"
              @price-clicked="handlePriceClick"
            />
          </div>

          <!-- SECOND DRESSING LINE -->
          <Dressing :dressingInfo="secondDressingLine" v-if="secondDressingLine" />

          <!-- THIRD 5 OFFERS LINE -->
          <div class="offers-list">
            <OfferCard
              v-for="offer in thirdOffersLine"
              :key="offer.id"
              :offer="offer"
              @price-clicked="handlePriceClick"
            />
          </div>

          <!-- THIRD DRESSING LINE -->
          <Dressing :dressingInfo="thirdDressingLine" v-if="secondDressingLine" />

          <!-- FOURTH 4 OFFERS LINE -->
          <div class="offers-list">
            <OfferCard
              v-for="offer in fourthOffersLine"
              :key="offer.id"
              :offer="offer"
              @price-clicked="handlePriceClick"
            />
          </div>

          <!-- VOIR PLUS OFFRES  -->
          <div class="offers-list" v-if="offersListPlus">
            <OfferCard
              v-for="offer in offersListPlus"
              :key="offer.id"
              :offer="offer"
              @price-clicked="handlePriceClick"
            />
          </div>

          <div class="offers-load-more">
            <button class="ds-filter-btn" @click="loadMoreOffer">Voir plus</button>
          </div>
        </div>
      </section>
    </div>
  </main>

  <!-- POPUP GLOBAL PRICE DETAIL -->
  <PricePopup
    v-if="selectedOfferForPopup"
    :selectedOfferForPopup="selectedOfferForPopup.attributes"
    :showPricePopup="showPricePopup"
    @closePricePopup="closePricePopup"
  />
</template>

<style scoped>
/* SMALL / MOBILE (≤ 720px) */

/* HERO -----------------*/
.hero {
  max-width: 100%;
  display: flex;
  position: relative;
  justify-content: center;
}

.hero__background {
  max-width: 100%;
}

.hero__overlay {
  display: contents;
}

.hero__background > img {
  max-width: 100%;
  object-fit: cover;
}

.hero__card-container {
  background-color: white;
  padding: 8px;
  border-radius: var(--radius);
  position: absolute;
  width: 97%;
  bottom: -150px;
}

.hero__card {
  padding: 16px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 10px;
}

.hero__card-buttons {
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 10px;
}

.hero__card-buttons a {
  width: 100%;
}

/* BANNER -----------------*/
.home__content {
  padding: 0px 10px 0px 10px;
}

.banner {
  margin-top: 174px;
  width: 100%;
  height: 200px;
  padding: 16px;
  border-radius: var(--radius);
  background-image: url('/src/assets/img/home-banner.jpg');
  background-size: cover;
  background-position: left;
  background-repeat: no-repeat;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: start;
  margin-bottom: 20px;
}

.banner__content-text > span,
.banner__content-text > h2 {
  color: white;
}

.banner__content-text > h2 {
  margin-top: 10px;
  width: 80%;
}

.banner__button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 30px;
  padding: 0 12px;
  border-radius: var(--radius);
  background: white;
  text-decoration: none;
  color: var(--color-black);
  font-size: 12px;
  line-height: 1;
}

/* OFFERS ---------------------- */
.offers-list {
  display: flex;
  flex-wrap: wrap;
  width: 100%;
  gap: 10px;
}

.container > h1 {
  margin-bottom: 10px;
}

/* BTN VOIR PLUS */
.offers-load-more {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.ds-filter-btn {
  margin-top: 15px;
  margin-bottom: 10px;
}

/* MEDIUM (721px à 960px) */
@media (min-width: 720px) {
  /* HERO -----------------*/
  .hero__background {
    max-height: 80vh;
    width: 100vw;
  }

  .hero__background > img {
    height: 100%;
    width: 100%;
  }

  .hero__card-container {
    width: 384px;
    height: 260px;
    padding: 32px;
    left: 20px;
    top: 50%;
    transform: translateY(-50%);
  }

  .hero__card {
    padding: 0px 0px 0px 0px;
    gap: 30px;
  }

  /* BANNER ---------------*/
  .home__content {
    padding: 0px 20px;
  }

  .banner {
    margin-top: 30px;
    margin-bottom: 30px;
    height: 312px;
    padding: 30px;
  }

  .banner__content-text > h2 {
    font-size: var(--font-h1);
    line-height: var(--line-height-heading);
  }

  .banner__button {
    font-size: var(--font-span-md);
    height: 34px;
  }

  /* OFFERS ---------------*/
  .offers-list {
    gap: 15px;
  }
}

/* DESKTOP (960px à 1200px) */
@media (min-width: 960px) {
  /* HERO ----------------- */
  .hero__background {
    height: 776px;
  }

  .hero__card-container {
    top: 50%;
    left: 20px;
    transform: translateY(-50%);
  }

  /* BANNER ---------------*/
  .home__content {
    padding: 0px 20px;
  }

  .banner {
    padding: 32px;
    height: 312px;
  }

  /* OFFERS ---------------------- */
  .offers-list {
    gap: 15px;
  }
}

/* DESKTOP ( > 1200px) */
@media (min-width: 1200px) {
  /* HERO ----------------- */
  .hero__card-container {
    left: 20;
  }

  /* BANNER ------------- */
  .banner {
    margin-top: 60px;
  }

  /* OFFERS LIST -------- */
  .offers {
    margin: 50px 0px;
  }
}

@media (min-width: 1281px) {
  /* HERO ----------------- */
  .hero {
    position: relative;
  }
  .hero__overlay {
    height: 100%;
    width: 1240px;
    position: absolute;
    top: 0;
    left: calc((100vw - 1240px) / 2);
    display: initial;
  }
  .hero__card-container {
    left: 0;
  }
}
</style>
