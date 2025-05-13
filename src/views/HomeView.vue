<script setup>
import { ref, onMounted, computed } from 'vue'
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
    console.log('totalOffer --->', totalOffer)

    /////// récupérer tout les id avec une requete pour pageSize = total offres
    const responseAllOffersId = await axios.get(
      `http://localhost:1337/api/offers?pagination[pageSize]=${totalOffer}&fields[0]=id`,
    )
    /////// stocker id dans tableau
    allOffersId.value = responseAllOffersId.data.data.map((allOffersId) => allOffersId.id)
    // console.log(`allOffersId ---->`, allOffersId.value)

    ///// Mélanger le tableau d'id aléatoirement
    randomizedAllOffersId.value = _.shuffle(allOffersId.value)
    console.log(`randomizedAllOffersId ---->`, randomizedAllOffersId.value)

    /////// Charger 80 premières offres grace au tableau d'id
    //// Couper le tableau en partie de 80
    console.log(
      ` randomizedAllOffersId cuted in 80 ---->`,
      cutArray(randomizedAllOffersId.value, 80),
    )
    const first80OffersId = cutArray(randomizedAllOffersId.value, 80)[0]
    console.log('first80OffersId ---->', first80OffersId)

    //// requête pour afficher les 80 premières offres en aléatoire
    const { data } = await axios.get(
      `http://localhost:1337/api/offers?pagination[pageSize]=80&populate=*`,
      {
        params: {
          'filters[id][$in]': first80OffersId,
        },
      },
    )
    console.log('data offers ---->', data)

    // Attribution des lines d'offres découpées
    firstOffersLine.value = data.data.slice(0, 10)
    console.log('firstOffersLine ---->', firstOffersLine.value)

    secondOffersLine.value = data.data.slice(10, 35)
    console.log('secondOffersLine ---->', secondOffersLine.value)

    thirdOffersLine.value = data.data.slice(35, 60)
    console.log('thirdOffersLine ---->', thirdOffersLine.value)

    fourthOffersLine.value = data.data.slice(60)
    console.log('fourthOffersLine ---->', fourthOffersLine.value)

    ///////// RÉCUPÉRER UN DRESSING ALÉATOIRE
    // Récupérer tout les id des utilisateurs dans un tableau
    const responseAllOwnersId = await axios.get('http://localhost:1337/api/users?[fields][0]=id')
    allOwnersId.value = responseAllOwnersId.data
    console.log('allOwnersId ---->', allOwnersId.value)

    // Mélanger ce tableau d'id
    randomizedAllOwnersId.value = _.shuffle(allOwnersId.value)
    console.log('randomizedAllOwnersId ---->', randomizedAllOwnersId.value)

    // Copie de la liste des tableaux d'id utilisateurs pour la transformer en file d'attente mutable
    const ownersQueue = [...randomizedAllOwnersId.value]

    // Afficher les dressing avec au moins une offre
    firstDressingLine.value = await searchDressingWithOffers(ownersQueue)
    secondDressingLine.value = await searchDressingWithOffers(ownersQueue)
    thirdDressingLine.value = await searchDressingWithOffers(ownersQueue)

    console.log('firstDressingLine ---->', firstDressingLine.value)
    console.log('secondDressingLine ---->', secondDressingLine.value)
    console.log('thirdDressingLine ---->', thirdDressingLine.value)
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
  console.log('offersListPlus ---->', offersListPlus.value)
}
</script>

<template>
  <div>
    <!-- HERO ---------------------->
    <div class="hero">
      <div class="hero__background">
        <img class="hero__img" src="./../assets/img/home-hero.jpg" alt="" />

        <div class="hero__overlay"></div>
      </div>

      <div class="hero__card-container container">
        <div class="hero__card">
          <div class="hero__card-content">
            <h1>Prêts à faire du tri dans vos placards ?</h1>
          </div>

          <button>
            <a href="">Vends maintenant</a>
          </button>
          <button>
            <a href="">Découvrir comment ça marche</a>
          </button>
        </div>
      </div>
    </div>

    <!-- BANNER -------------------->
    <div class="banner container">
      <div class="banner__content-text">
        <h2>NOUVEAU</h2>
        <p>Vends tes appareils électroniques sans frais de vente</p>
      </div>

      <button class="banner__button">
        <a href="">Commencer à vendre</a>
      </button>
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
        <h2>Fil d'actu</h2>

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

        <button @click="loadMoreOffer">Voir plus</button>
      </div>
    </section>
  </div>

  <!-- POPUP GLOBAL PRICE DETAIL -->
  <PricePopup
    v-if="selectedOfferForPopup"
    :selectedOfferForPopup="selectedOfferForPopup.attributes"
    :showPricePopup="showPricePopup"
    @closePricePopup="closePricePopup"
  />
</template>

<style scoped>
/* HERO ---------------------------------- */
.hero {
  height: 405px;
  max-width: 100%;
  /* border: 1px solid black; */
}

.hero__background {
  height: 100%;
  width: 100%;
  border: 1px solid red;
  position: relative;
}

/* IMAGE ---------------*/

.hero__img {
  height: 100%;
  width: 100%;
  object-fit: cover;
}

.hero__overlay {
  width: 50%;
  height: 100%;
  /* border: 3px solid purple; */
  position: absolute;
  background-image: url(./../assets/img/home-hero-ripped.svg);
  background-repeat: no-repeat;
  background-position: bottom;
  top: 0;
  margin-left: 50%;
}

/* CARD ---------------*/
.hero__card {
  background-color: pink;
  position: absolute;
  top: 300px;
}

/* BANNER ---------------------------------- */
.banner {
  width: 100%;
  height: 312px;
  background-image: url(./../assets/img/home-banner.jpg);
  background-size: cover;
}

/* OFFERS LIST ----------------------------- */
.offers {
  margin: 50px 0px;
  border: 1px solid black;
}

.offers-list {
  border: 1px solid red;
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
}
</style>
