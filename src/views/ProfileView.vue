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
const actualSection = ref(1)
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
      <div
        class="sections"
        @click="actualSection = 1"
        :class="{ activeSection: actualSection === 1 }"
      >
        <span class="text-md">Annonces</span>
      </div>
      <div
        class="sections"
        @click="actualSection = 2"
        :class="{ activeSection: actualSection === 2 }"
      >
        <span class="text-md">À propos</span>
      </div>
    </div>

    <!-- OFFERS SECTION ------>
    <!-- PROFILE DETAILS -->
    <div class="profile__offers" v-if="actualSection === 1">
      <div class="profile__details">
        <div class="profile__mobile-header">
          <img :src="userInfo.avatar.url" alt="" v-if="userInfo.avatar?.url" />
          <img src="../assets/img/user-profile.webp" alt="" v-else />
          <h1 class="mobile-only">{{ userInfo.username }}</h1>
        </div>

        <div class="profile__infos">
          <div class="profile__infos-name-edit medium-only">
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
              <p class="medium-only">Informations verifiées</p>
              <font-awesome-icon :icon="['fas', 'check-circle']" />
              <span>Email</span>
            </div>

            <div>
              <p class="medium-only">À propos</p>

              <font-awesome-icon :icon="['fas', 'map-marker-alt']" />
              <span
                >{{ userInfo.city[0].toUpperCase() + userInfo.city.slice(1) }},
                {{ userInfo.country.displayName }}</span
              >
            </div>
          </div>

          <div class="profile__infos-description medium-only">
            <p v-if="userInfo.description">{{ userInfo.description }}</p>
          </div>
        </div>
      </div>

      <!-- DRESSING -->
      <div class="dressing" v-if="userInfo.offers">
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
          <div class="profile__about-edit">
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

          <div class="profile__about-username-description">
            <h1>{{ userInfo.username }}</h1>
            <p v-if="userInfo.description">{{ userInfo.description }}</p>
          </div>

          <div class="profile__about-infos-about">
            <div>
              <font-awesome-icon :icon="['fas', 'check-circle']" />
              <span>Email</span>
            </div>

            <div>
              <font-awesome-icon :icon="['fas', 'map-marker-alt']" />
              <span
                >{{ userInfo.city[0].toUpperCase() + userInfo.city.slice(1) }},
                {{ userInfo.country.displayName }}</span
              >
            </div>
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
  padding: 16px 10px;
}

/* SECTIONS ------ */
.profile__sections {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.sections {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 44px;
  border-bottom: 1px solid var(--color-lightest-gray);
}
.activeSection {
  border-bottom: 2px solid var(--color-primary);
}

/* OFFER SECTION ------ */
/* PROFILE DETAILS */
.profile__details {
  display: flex;
  flex-direction: column;
}
.profile__mobile-header {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  padding: 16px;
  gap: 6px;
  border-bottom: 1px solid var(--color-lightest-gray);
}
.profile__mobile-header img {
  width: 48px;
  height: 48px;
  border-radius: 50%;
}
.profile__infos {
  padding: 16px;
  border-bottom: 1px solid var(--color-lightest-gray);
}
.profile__infos-about,
.profile__about-infos-about {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.profile__infos-about span,
.profile__about-infos-about span {
  color: var(--color-gray);
  font-weight: var(--font-weight-light);
}
.profile__infos-about svg,
.profile__about-infos-about svg {
  margin-right: 6px;
  width: 16px;
  color: var(--color-gray);
}

/* DRESSING */
.dressing {
  margin-top: 16px;
}
.dressing__content {
  margin-top: 8px;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  row-gap: 16px;
  margin-bottom: 16px;
}

/* ABOUT SECTION ----- */
.profile__about-details {
  border-radius: var(--radius);
  border: 1px solid var(--color-lightest-gray);
}
.profile__about-details img {
  width: 100%;
  aspect-ratio: 1/1;
  object-fit: cover;
}
.profile__about-edit {
  padding: 16px;
  border-bottom: 1px solid var(--color-lightest-gray);
}
.profile__about-edit button {
  width: 100%;
  padding: 0px 14px;
  height: 36px;
  border-radius: var(--radius);
  border: 1px solid var(--color-gray);
  background-color: white;
  color: var(--color-gray);
}
.profile__about-username-description {
  padding: 16px;
  border-bottom: 1px solid var(--color-lightest-gray);
}
.profile__about-username-description p {
  font-size: var(--font-span-lg);
  color: var(--color-gray);
  margin-top: 6px;
}
.profile__about-infos-about {
  padding: 16px;
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
