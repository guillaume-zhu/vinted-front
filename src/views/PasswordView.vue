<script setup>
import { ref, onMounted, inject } from 'vue'
import axios from 'axios'

const GlobalStore = inject('GlobalStore')
const currentPassword = ref(null)
const newPassword = ref(null)
const confirmPassword = ref(null)
const errorMessage = ref('')
const successMessage = ref('')

const handleChangePassword = async () => {
  /////// Requete changePassword ( vérifie s'il manque un mdp / vérifie si currentPassword correspond au compte / met à jour le mdp hash  )

  //// Vérifier que tout les champs sont remplis sinon return erreur
  if (!currentPassword.value || !newPassword.value || !confirmPassword.value) {
    errorMessage.value = 'Mot de passe actuel et nouveau requis'
    return
  }

  //// Vérifier que newPassword === confirmPassword
  if (newPassword.value !== confirmPassword.value) {
    errorMessage.value = 'Les mots de passe doivent correspondre'
    return
  }
  // si oui lancer la requête
  try {
    const response = await axios.post(
      'http://localhost:1337/api/users-permissions/change-password',
      { currentPassword: currentPassword.value, newPassword: newPassword.value },
      {
        headers: {
          Authorization: `Bearer ` + GlobalStore.userInfoCookie.value.token,
        },
      },
    )
    console.log('Réponse requête changePassword ---->', response.data)

    currentPassword.value = ''
    newPassword.value = ''
    confirmPassword.value = ''

    successMessage.value = 'Mot de passe modifié'
  } catch (error) {
    console.log('Erreur lors du changement de mot de passe', error)

    const status = error?.response?.status
    const message = error?.response?.data?.error?.message

    if (status === 400 && message === 'Mot de passe actuel incorrect') {
      errorMessage.value = message
    } else {
      errorMessage.value = message || 'Une erreur est survenue'
    }
  }
}
</script>

<template>
  <div class="container">
    <h1>Modifier le mot de passe</h1>

    <div>
      <div class="password__details">
        <ol>
          <p>Pour créer un mot de passe sécurisé :</p>
          <li>
            Quand tu décides d'un mot de passe, choisis un mot qui ne soit pas évident. Ce peut être
            une combinaison de chiffres, de caractères spéciaux, de majuscules et de minuscules. Le
            mot de passe doit être long d'au moins <span>7 caractères</span>
          </li>
          <li>
            N'utilise pas <span>ton nom ou ta date de naissance, ni ceux d'un proche ! </span>
          </li>
          <li>
            Sois certain.e de pouvoir te remémorer ton mot de passe.
            <span>N'en garde aucune trace écrite ou enregistrée , et ne le dis à personne.</span>
          </li>
          <li>Essaie aussi de modifier ton mot de passe régulièrement.</li>
          <li>Assure-toi que personne ne te voit changer ton mot de passe.</li>
        </ol>
      </div>

      <div class="password__form">
        <p v-if="errorMessage">{{ errorMessage }}</p>
        <p v-if="successMessage">{{ successMessage }}</p>
        <form @submit.prevent="handleChangePassword()">
          <input
            type="password"
            name="currentPassword"
            id="currentPassword"
            placeholder="Mot de passe actuel"
            v-model="currentPassword"
            @input="errorMessage = ''"
          />

          <input
            type="password"
            name="newPassword"
            id="newPassword"
            placeholder="Nouveau mot de passe"
            v-model="newPassword"
            @input="errorMessage = ''"
          />

          <input
            type="password"
            name="confirmPassword"
            id="confirmPassword"
            placeholder="Confirmer mot de passe"
            v-model="confirmPassword"
            @input="errorMessage = ''"
          />

          <button>Modifier le mot de passe</button>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
span {
  font-weight: bold;
}

.container > div {
  display: flex;
  gap: 50px;
}

/* DETAILS -------------*/
.password__details {
  flex: 1;
}

/* FORM ----------------*/
.password__form {
  flex: 1;
}

form {
  display: flex;
  flex-direction: column;
}
</style>
