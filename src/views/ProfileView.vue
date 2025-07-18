<script setup>
import { inject } from 'vue'
import { RouterLink } from 'vue-router'
import { ref, onMounted } from 'vue'
import axios from 'axios'
import OfferCard from '@/components/OfferCard.vue'

const GlobalStore = inject('GlobalStore')
console.log('userInfoCookie ---->', GlobalStore.userInfoCookie.value)

const userInfo = ref('')
const isLoading = ref(false)
const errorMessage = ref('')
const actualSection = ref(null)
const props = defineProps({
  id: {
    type: String,
  },
})

// REQUETE POUR RÉCUPÉRER LES INFORMATIONS DE L'UTILISATEUR
onMounted(async () => {
  isLoading.value = true

  try {
    const { data } = await axios.get(
      `http://localhost:1337/api/users/${props.id}?populate[0]=country&populate[1]=offers.images&populate[2]=avatar`,
    )
    userInfo.value = data
    console.log('userInfo ---->', userInfo.value)
  } catch (error) {
    errorMessage.value = error
  } finally {
    isLoading.value = false
    errorMessage.value = ''
  }
})
</script>

<template>
  <div class="container profile" v-if="userInfo">
    <!-- SECTIONS ------>
    <div class="profile__sections">
      <div class="sections" @click="actualSection = 1">
        <span>Annonces</span>
      </div>
      <div class="sections" @click="actualSection = 2">
        <span>À propos</span>
      </div>
    </div>

    <!-- OFFERS SECTION ------>
    <!-- PROFILE DETAILS -->
    <div class="profile__offers" v-if="actualSection === 1">
      <div class="profile__details">
        <img :src="userInfo.avatar.url" alt="" v-if="userInfo.avatar?.url" />
        <img src="../assets/img/user-profile.webp" alt="" v-else />

        <div class="profile__infos">
          <div class="profile__infos-name-edit">
            <h1>{{ userInfo.username }}</h1>

            <RouterLink
              :to="{ name: 'settings' }"
              v-if="
                GlobalStore.userInfoCookie.value &&
                GlobalStore.userInfoCookie?.value?.id.toString() === id
              "
            >
              <button><font-awesome-icon :icon="['fas', 'pen']" /> Modifier mon profil</button>
            </RouterLink>
          </div>

          <div class="profile__infos-about">
            <div>
              <p>À propos</p>

              <font-awesome-icon :icon="['fas', 'map-marker-alt']" />
              <span
                >{{ userInfo.city[0].toUpperCase() + userInfo.city.slice(1) }},
                {{ userInfo.country.displayName }}</span
              >
            </div>

            <div>
              <p>Informations verifiées</p>
              <font-awesome-icon :icon="['fas', 'check-circle']" />
              <span>Email</span>
            </div>
          </div>

          <div class="profile__infos-description">
            <p v-if="userInfo.description">{{ userInfo.description }}</p>
          </div>
        </div>
      </div>

      <!-- DRESSING -->
      <div class="dressing" v-if="userInfo.offers">
        <div>
          <h3>Dressing</h3>
        </div>

        <h2>
          {{ userInfo.offers.length > 0 ? userInfo.offers.length + ' articles' : `Pas d'articles` }}
        </h2>

        <div class="dressing__content">
          <OfferCard
            v-for="offer in userInfo.offers"
            :key="offer.id"
            :offer="offer"
            :fromProfile="true"
            :disablePricePopup="true"
          />
        </div>
      </div>
    </div>

    <!-- ABOUT SECTION ----->
    <div class="profile__about" v-if="actualSection === 2">
      <div class="profile__about-details">
        <img :src="userInfo.avatar.url" alt="" v-if="userInfo.avatar?.url" />
        <img src="../assets/img/user-profile.webp" alt="" v-else />

        <div class="profile__about-infos">
          <div class="profile__about-infos-name-edit">
            <h1>{{ userInfo.username }}</h1>

            <RouterLink
              :to="{ name: 'settings' }"
              v-if="
                GlobalStore.userInfoCookie.value &&
                GlobalStore.userInfoCookie?.value?.id.toString() === id
              "
            >
              <button><font-awesome-icon :icon="['fas', 'pen']" /> Modifier mon profil</button>
            </RouterLink>
          </div>

          <div class="profile__about-infos-about">
            <div>
              <p>À propos</p>

              <font-awesome-icon :icon="['fas', 'map-marker-alt']" />
              <span
                >{{ userInfo.city[0].toUpperCase() + userInfo.city.slice(1) }},
                {{ userInfo.country.displayName }}</span
              >
            </div>

            <div>
              <p>Informations verifiées</p>
              <font-awesome-icon :icon="['fas', 'check-circle']" />
              <span>Email</span>
            </div>
          </div>

          <div class="profile__about-infos-description">
            <p v-if="userInfo.description">{{ userInfo.description }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>

  <h1 v-else>En cours de chargement</h1>
</template>

<style scoped>
/* SMALL / MOBILE (< 720px) */
.profile {
  padding: 0px 10px;
}

/* PROFILE DETAILS -------------------------- */
img {
  width: 40px;
  height: 40px;
}
/* MEDIUM (>= 720px ) */
@media (min-width: 720px) {
}

/* DESKTOP (>= 960px) */
@media (min-width: 960px) {
}

/* DESKTOP LARGE (>= 1200px) */
@media (min-width: 1200px) {
}
</style>
