<script setup>
import { inject, ref, onMounted, watchEffect } from 'vue'
import axios from 'axios'
import { slice } from 'lodash'
import { computed } from 'vue'

const GlobalStore = inject('GlobalStore')
const isLoading = ref(false)
const userInfo = ref(null)

/////// VALEURS FORMULAIRES
const name = ref('')
const gender = ref('')
const day = ref(null)
const month = ref(null)
const year = ref(null)
const isSubmiting = ref(null)

/////// INPUT BIRTHDATE
// Liste des mois
const months = [
  'janvier',
  'février',
  'mars',
  'avril',
  'mai',
  'juin',
  'juillet',
  'août',
  'septembre',
  'octobre',
  'novembre',
  'décembre',
]

// Années possibles
const currentYear = new Date().getFullYear()
const minYear = currentYear - 120 // 120 ans max
const maxYear = currentYear
function isLeapYear(year) {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0
}

// Jour possibles
const maxDay = computed(() => {
  let total = 31
  /////// si jamais month existe
  if (month.value) {
    ///// si Janvier / Mars / Mai / Juillet / Aout / Octobre / Decembre
    if (
      month.value === 1 ||
      month.value === 3 ||
      month.value === 5 ||
      month.value === 7 ||
      month.value === 8 ||
      month.value === 10 ||
      month.value === 12
    ) {
      /// alors maxDay = 31
      return total

      ///// si Avril / Juin / Septembre / Novembre
    } else if (month.value === 4 || month.value === 6 || month.value === 9 || month.value === 10) {
      /// alors maxDay = 30
      total = 30
      return total

      ///// si Février
    } else if (month.value === 2) {
      if (year.value) {
        /// si année bissex
        if (isLeapYear(year.value) === true) {
          // alors maxDay = 29
          total = 29
          return total

          /// sinon maxDay = 28
        } else {
          total = 28
          return total
        }
        /////// sinon maxday = 31
      } else return total
    }
  } else {
    return total
  }
})

// Requête pour récupérer userInfo
onMounted(async () => {
  isLoading.value = true

  try {
    const response = await axios.get(
      `http://localhost:1337/api/users/${GlobalStore.userInfoCookie.value.id}?populate[0]=country`,
    )

    userInfo.value = response.data
  } catch (error) {
    console.log('Erreur lors de la récupération des informations utilisateurs')
  } finally {
    isLoading.value = false
  }
})

// Requête formulaire pour update info utilisateur
const handleSubmit = async () => {
  isSubmiting.value = true
  let body = {}

  if (name.value) {
    body.name = name.value
  }

  if (gender.value) {
    body.gender = gender.value
  }

  if (day.value && month.value && year.value) {
    const birthDateConvert = `${year.value}-${String(month.value).padStart(2, '0')}-${String(day.value).padStart(2, '0')}`
    body.birthDate = birthDateConvert
  }

  try {
    console.log('body ---->', body)

    const response = await axios.put(`http://localhost:1337/api/users/${userInfo.value.id}`, body, {
      headers: { Authorization: `Bearer ` + GlobalStore.userInfoCookie.value.token },
    })

    console.log('Réponse requete update body account ---->', response.data)
  } catch (error) {
    console.log(`Erreur lors de la requête d'envoi du formilaire`, error)
  } finally {
    isSubmiting.value = false
  }
}

// Remplir les ref du formulaires si userInfo existre
watchEffect(() => {
  if (userInfo.value && userInfo.value.birthDate) {
    const date = new Date(userInfo.value.birthDate)
    month.value = date.getMonth() + 1
    day.value = date.getDate()
    year.value = date.getFullYear()
  }
  if (userInfo.value && userInfo.value.name) {
    name.value = userInfo.value.name
  }
})
</script>

<template>
  <div class="container settings" v-if="userInfo">
    <!-- MENU PARAMÈTRES GAUCHE ---------------------------->
    <div class="settings__menu">
      <ul>
        <h1>Mes paramètres</h1>
        <li>Détails du profil</li>
        <RouterLink :to="{ name: 'account' }">
          <li>Paramètres du compte</li>
        </RouterLink>
        <li>Envoi</li>
        <li>Paiements</li>
        <li>Réductions sur les lots</li>
        <li>Notifications</li>
        <li>Paramètres de confidentialité</li>
        <li>Sécurité</li>
      </ul>
    </div>

    <!-- PARTIE DÉTAILS DROITE ---------------------------->
    <div class="settings__details">
      <!-- TOP EMAIL & PHONE -------------------->
      <!-- <div> -->
      <!-- EMAIL -->
      <!-- <div>
        <p>{{ userInfo.email }}</p>
        <div>Changer</div>
      </div> -->

      <!-- PHONE -->
      <!-- <div>
        <p>{{ userInfo.phone ? userInfo.phone : 'Numéro de téléphone' }}</p>
        <div>Changer</div>
      </div>
      <p>
        Ton numéro de téléphone ne sera utilisé que pour t'aider à te connecter. Il ne sera pas
        rendu public, ni utilisé à des fins marketing.
      </p>
      </div> -->

      <!-- MID NAME & GENDER & BIRTH ------------>
      <form @submit.prevent="handleSubmit()">
        <!-- NAME -->
        <div>
          <label for="name">Nom complet</label>
          <input
            type="text"
            :placeholder="userInfo.name ? userInfo.name : 'Nom Prénom'"
            name="name"
            id="name"
            v-model="name"
          />
        </div>

        <!-- GENDER -->
        <div>
          <label for="gender">Tu es</label>
          <select name="gender" id="gender" v-model="gender">
            <option disabled hidden value="">{{ userInfo.gender || 'Tu es :' }}</option>
            <option value="Homme">Homme</option>
            <option value="Femme">Femme</option>
            <option value="Autre">Autre</option>
          </select>
        </div>

        <!-- BIRTH -->
        <div>
          <p>Date de naissance</p>
          <input
            type="number"
            name="day"
            id="day"
            :placeholder="userInfo.birthDate ? userInfo.birthDate.slice(8, 10) : 'Jour'"
            min="1"
            max="31"
            v-model="day"
          />

          <select name="month" id="month" v-model="month">
            <option disabled value="">Mois</option>
            <option v-for="(m, index) in months" :key="index" :value="index + 1">
              {{ m }}
            </option>
          </select>

          <input
            type="number"
            name="year"
            id="year"
            :placeholder="userInfo.birthDate ? userInfo.birthDate.slice(0, 3) : 'Année'"
            :min="minYear"
            :max="maxYear"
            v-model="year"
          />
        </div>

        <!-- BOT PASSWORD -->
        <div>
          <p>Mot de passe</p>
          <RouterLink :to="{ name: 'password' }">
            <button type="button">Modifier</button>
          </RouterLink>
        </div>

        <!-- DELETE ACCOUNT
        <div>
          <button type="button" @click="deleteUser()">Supprimer mon compte</button>
        </div> -->

        <!-- BOUTTON UPDATE FORM -->
        <button type="submit">Enregistrer</button>
      </form>
    </div>
  </div>

  <div class="container" v-else>
    <p>En cours de chargement</p>
  </div>
</template>

<style scoped>
/* SETTINGS ----------------------------*/
.settings {
  display: flex;
}

/* MENU -----------*/
.settings__menu {
  border: 1px solid blue;
  max-width: 413px;
}

/* DETAILS ------- */
.settings__details {
  border: 1px solid red;
  flex: 1;
}

.settings__details img {
  width: 100px;
  height: 100px;
  border-radius: 100px;
  object-fit: cover;
}
</style>
