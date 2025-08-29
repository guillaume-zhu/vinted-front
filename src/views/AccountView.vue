<script setup>
import { inject, ref, onMounted, watchEffect } from 'vue'
import axios from 'axios'
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const GlobalStore = inject('GlobalStore')
const isLoading = ref(false)
const userInfo = ref(null)
const route = useRoute()

/////// VALEURS FORMULAIRES
const name = ref('')
const gender = ref('')
const day = ref(null)
const month = ref('')
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
        <RouterLink :to="{ name: 'settings' }">
          <li :class="{ activePage: route.name === 'settings' }">Informations du profil</li>
        </RouterLink>
        <RouterLink :to="{ name: 'account' }" :class="{ activePage: route.name === 'account' }">
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
      <!-- MAIL & PHONE -->
      <div class="settings__details-mail-phone">
        <div>
          <div>
            <h2>{{ userInfo.email }}</h2>
            <p v-if="userInfo.confirmed">Vérifié <font-awesome-icon :icon="['fas', 'check']" /></p>
          </div>
          <button class="ds-btn ds-btn--third">Changer</button>
        </div>

        <div>
          <h2>Numéro de téléphone</h2>
          <button class="ds-btn ds-btn--third">Vérifier</button>
        </div>
      </div>

      <p class="phone-text">
        Ton numéro de téléphone ne sera utilisé que pour t'aider à te connecter. Il ne sera pas
        rendu public, ni utilisé à des fins marketing.
      </p>

      <!-- MID NAME & GENDER & BIRTH ------------>
      <div class="settings__form">
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
              class="text-input"
            />
          </div>

          <!-- GENDER -->
          <div>
            <label for="gender">Tu es</label>
            <select name="gender" id="gender" v-model="gender" required>
              <option disabled hidden value="">{{ userInfo.gender || 'Tu es :' }}</option>
              <option value="Homme">Homme</option>
              <option value="Femme">Femme</option>
              <option value="Autre">Autre</option>
            </select>
          </div>

          <!-- BIRTH -->
          <div class="settings__birth">
            <span>Date de naissance</span>
            <div class="settings__birth-inputs">
              <input
                type="number"
                name="day"
                id="day"
                :placeholder="userInfo.birthDate ? userInfo.birthDate.slice(8, 10) : 'Jour'"
                min="1"
                max="31"
                v-model="day"
              />

              <select name="month" id="month" v-model="month" required class="select-month">
                <option disabled hidden value="">{{ month || 'Mois' }}</option>
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
          </div>

          <!-- BOT PASSWORD -->
          <div class="settings__password">
            <h2>Mot de passe</h2>
            <RouterLink :to="{ name: 'password' }">
              <button type="button" class="ds-btn ds-btn--third">Modifier</button>
            </RouterLink>
          </div>

          <!-- BOUTTON UPDATE FORM -->
          <div class="settings__submit">
            <button class="ds-btn ds-btn--primary settings__submit-btn" type="submit">
              Enregistrer
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>

  <div v-else>
    <p class="load-message">En cours de chargement</p>
  </div>
</template>

<style scoped>
/* SMALL / MOBILE (< 720px) */
/* SETTINGS ----------------*/
.settings {
  padding: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  margin-bottom: 32px;
}
.settings__menu ul {
  display: flex;
  width: 100vw;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 36px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--color-lightest-gray);
  cursor: pointer;
}
.settings__menu ul > li {
  font-size: var(--font-span-lg);
  font-weight: var(--font-weight-medium);
  text-decoration: none;
  cursor: pointer;
  color: var(--color-gray);
}
ul > a {
  text-decoration: none;
  color: var(--color-gray);
  font-size: var(--font-span-lg);
  font-weight: var(--font-weight-medium);
}
.activePage {
  color: var(--color-black);
}

/* DETAILS -----------------*/
.settings__details {
  margin-top: 52px;
  width: 100%;
}

/* MAIL & PHONE */
.settings__details-mail-phone {
  border: 1px solid var(--color-lightest-gray);
  border-radius: var(--radius);
}
.settings__details-mail-phone > div {
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.settings__details-mail-phone > div p {
  color: var(--color-gray);
  margin-top: 5px;
  display: flex;
  align-items: center;
  gap: 3px;
}
.settings__details-mail-phone svg {
  font-size: 10px;
  color: var(--color-primary);
}
.settings__details-mail-phone > div:first-child {
  border-bottom: 1px solid var(--color-lightest-gray);
}
.settings__details-mail-phone button,
.settings__password button {
  width: fit-content;
  height: 32px;
  font-size: var(--font-p);
  display: flex;
  align-items: center;
  justify-self: center;
}
.phone-text {
  color: var(--color-gray);
  margin-left: 16px;
  margin-top: 8px;
}

/* FORM */
.settings__form {
  border-radius: var(--radius);
  margin-top: 32px;
}
form > div {
  padding: 16px;
  border-top: 1px solid var(--color-lightest-gray);
  border-left: 1px solid var(--color-lightest-gray);
  border-right: 1px solid var(--color-lightest-gray);
  display: flex;
  flex-direction: column;
}
form > div:first-child {
  border-radius: var(--radius) var(--radius) 0px 0px;
}
form .settings__birth {
  border-bottom: 1px solid var(--color-lightest-gray);
  border-radius: 0 0 var(--radius) var(--radius);
}
form > div > span,
form > div > label {
  font-size: var(--font-span-md);
  color: var(--color-gray);
  margin-bottom: 8px;
}
.text-input {
  font-size: var(--font-span-lg);
  font-weight: var(--font-weight-light);
  margin-left: -3px;
  color: var(--color-black);
}
select {
  margin-left: -3px;
}
select:invalid {
  color: var(--color-gray);
}
.select-month {
  margin: 16px 0px 16px -3px;
}

.settings__password {
  margin-top: 16px;
  border: 1px solid var(--color-lightest-gray);
  border-radius: var(--radius);
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}
.settings__password a {
  text-decoration: none;
  cursor: pointer;
}
.settings__submit {
  border: none;
  padding: 0px;
  display: flex;
  margin-top: 16px;
  justify-content: flex-end;
  align-items: flex-end;
}
.settings__submit-btn {
  width: fit-content;
  height: 36px;
  font-size: var(--font-span-md);
  display: flex;
  justify-content: center;
  align-items: center;
}

/* MEDIUM (>= 720px ) */
@media (min-width: 720px) {
  .settings__details-mail-phone > div {
    padding: 24px;
  }
  .select-month {
    margin: 0;
  }
  form > div {
    display: flex;
    flex-direction: row;
    align-items: center;
    padding: 24px;
    justify-content: space-between;
  }
  form > div > label,
  form > div > span {
    width: 310px;
    margin-bottom: 0px;
    font-size: var(--font-h2);
    font-weight: var(--font-weight-medium);
    color: var(--color-black);
  }
  form input,
  select,
  .settings__birth-inputs {
    width: 400px;
  }
  .text-input {
    margin-left: 0px;
  }
  .settings__birth {
    display: flex;
  }
  .settings__birth-inputs {
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    gap: 32px;
  }
  .settings__birth-inputs select {
    margin: 0px 0px;
    width: 80px;
  }
  .settings__birth-inputs input {
    width: 80px;
  }

  .settings__password {
    margin-top: 32px;
  }
}

/* DESKTOP (>= 960px) */
@media (min-width: 960px) {
  .settings {
    display: flex;
    flex-direction: row;
    align-items: flex-start;
    justify-content: space-between;
    gap: 24px;
  }
  .settings__menu {
    padding: 16px;
    width: 100%;
  }
  .settings__menu h1 {
    padding: 16px;
  }
  .settings__menu ul {
    width: 100%;
    gap: 0;
    border-bottom: none;
    align-items: flex-start;
  }
  .settings__menu ul > li,
  .settings__menu ul > a {
    width: 100%;
    padding: 16px;
    border-radius: var(--radius);
    background-color: white;
    transition: background-color 0.3s ease;
    display: flex;
    align-items: center;
    height: 54px;
  }
  .settings__menu ul > li:hover,
  .settings__menu ul > a:hover {
    background-color: var(--color-lightest);
  }

  .settings__details {
    width: 65%;
    justify-content: flex-start;
    margin-top: 16px;
  }
}

/* DESKTOP LARGE (>= 1200px) */
@media (min-width: 1200px) {
}
</style>
