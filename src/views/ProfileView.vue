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

// REQUETE POUR RÉCUPÉRER LES INFORMATIONS DE L'UTILISATEUR
onMounted(async () => {
  isLoading.value = true

  try {
    const { data } = await axios.get(
      `http://localhost:1337/api/users/${GlobalStore.userInfoCookie.value.id}?populate[0]=country&populate[1]=offers.images`,
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
    <div class="profile__details">
      <img :src="GlobalStore.avatarUrl.value" alt="" />

      <div class="profile__infos">
        <div class="profile__infos-name-edit">
          <h1>{{ userInfo.username }}</h1>

          <RouterLink :to="{ name: 'settings' }">
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
        />
      </div>
    </div>
  </div>

  <p v-else>En cours de chargement</p>
</template>

<style scoped>
/* PROFILE ------------------------------------ */
.profile__details {
  border: 1px solid blue;
  display: flex;
  width: 100%;
  height: fit-content;
}

/* DETAIL -------------------- */
.profile__details > img {
  width: 192px;
  height: 192px;
  border-radius: 200px;
}

.profile__infos {
  border: 1px solid red;
  width: 100%;
  height: 100%;
}

.profile__infos-name-edit {
  border: 1px solid peru;
  display: flex;
  justify-content: space-between;
  width: 100%;
}

.profile__infos-about {
  display: flex;
  gap: 50px;
}

/* DRESSING ------------------ */
.dressing__content {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
}
</style>
