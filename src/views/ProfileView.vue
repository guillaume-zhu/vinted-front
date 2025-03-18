<script setup>
import { inject } from 'vue'
import { RouterLink } from 'vue-router'
import { ref, onMounted } from 'vue'
import axios from 'axios'

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
    <div class="profile__detail">
      <div>
        <img :src="GlobalStore.avatarUrl.value" alt="" />
        <h1>{{ GlobalStore.userInfoCookie.value.username }}</h1>
      </div>

      <div>
        <p>À propos :</p>
        <font-awesome-icon :icon="['fas', 'map-marker-alt']" />
        <span>
          {{ userInfo.city[0].toUpperCase() }}{{ userInfo.city.slice(1) }},
          {{ userInfo.country.displayName }}</span
        >
      </div>

      <div>
        <RouterLink :to="{ name: 'settings' }">
          <button><font-awesome-icon :icon="['fas', 'pen']" /> Modifier mon profil</button>
        </RouterLink>
      </div>
    </div>
    <div class="profile__dressing">
      <h3>Dressing</h3>

      <h2>
        {{ userInfo.offers.length > 0 ? userInfo.offers.length + ' articles' : `Pas d'articles` }}
      </h2>

      <div class="profile__dressing-content">
        <div class="profile__dressing-card" v-for="offer in userInfo.offers" :key="offer.id">
          <img :src="offer.images[0].url" alt="offer image" />
          <p>{{ offer.price.toFixed(2) }} €</p>
        </div>
      </div>
    </div>
  </div>

  <p v-else>En cours de chargement</p>
</template>

<style scoped>
/* PROFILE ------------------------------------ */
.profile {
  display: flex;
  gap: 50px;
}

/* DETAIL -------------------- */
.profile__detail {
  border: 1px solid pink;
  max-width: 360px;
  padding: 20px;
}

.profile__detail img {
  width: 200px;
  height: 200px;
  object-fit: cover;
  border-radius: 200px;
}

/* DRESSING ------------------ */
.profile__dressing {
  border: 1px solid green;
  flex: 1;
}

.profile__dressing-content {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
}

.profile__dressing-card {
  width: calc(((100% - 45px) / 4));
  border: 1px solid salmon;
}

.profile__dressing-card img {
  width: 100%;
  height: 276px;
  object-fit: cover;
}
</style>
