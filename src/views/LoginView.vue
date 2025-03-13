<script setup>
import { ref, inject } from 'vue'
import axios from 'axios'
import router from '@/router'

const GlobalStore = inject('GlobalStore')
// console.log('GlobalStore ---->', GlobalStore)

const tryConnection = ref('')
const wantSignUp = ref('')
const wantLogIn = ref('')
const signPage = ref('')

const tryLogIn = () => {
  wantLogIn.value = true
  tryConnection.value = true
}

const trySignUp = () => {
  wantSignUp.value = true
  tryConnection.value = true
}

const goSignUp = () => {
  wantSignUp.value = false
  signPage.value = true
}

// FORM VALUES
const email = ref('')
const password = ref('')
const username = ref('')

const showPassword = ref(false)
const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value
}

//////////////// LOG IN
const errorMessage = ref('')
const isLogging = ref(false)
const userToken = ref('')

const logIn = async () => {
  if (!email.value || !password.value) {
    errorMessage.value = 'Veuillez remplir tout les champs'
    return
  } else {
    isLogging.value = true

    // Requête pour se connecter
    try {
      const { data } = await axios.post('http://localhost:1337/api/auth/local', {
        identifier: email.value,
        password: password.value,
      })

      console.log('data log in response ---->', data)

      // Stockage de l'id
      const userId = data.user.id
      console.log('user id from request ---->', userId)

      // Stockage du token
      const userToken = data.jwt
      console.log('user token from request ---->', userToken)

      // Requête avec l'id pour obtenir l'objet utilisateur
      const dataUserInfos = await axios.get(
        `http://localhost:1337/api/users/${userId}?populate[0]=avatar`,
      )

      // Stockage des infos objet utilisateur
      const userInfo = dataUserInfos.data
      console.log('userInfo object ---->', userInfo)

      // Appel et création du cookie avec les infos de l'utilisateur au GlobalStore
      GlobalStore.setUserInfoCookie(userToken, userId, userInfo.username, userInfo.avatar.url)
      console.log('Cookie utilisateur créee ---->', $cookies.get('userToken'))

      // Mettre à jour la valeur userInfoCookie pour actualiser la ref
      GlobalStore.updateInfoCookie()

      router.push({ name: 'home' })
    } catch (error) {
      errorMessage.value = 'Identifiants incorrects ou erreur serveur'
    } finally {
      isLogging.value = false
    }
  }
}

//////////////// SIGN UP
const signUp = async () => {
  if (!username.value || !email.value || !password.value) {
    errorMessage.value = 'Veuillez remplir tout les champs'
    return
  } else {
    isLogging.value = true
    try {
      const { data } = await axios.post('http://localhost:1337/api/auth/local/register', {
        username: username.value,
        email: email.value,
        password: password.value,
      })

      console.log('data sign up response ---->', data)

      // Stockage des informations utilisateurs
      const userInfo = data

      // Appel et création du cookie avec les infos de l'utilisateur au GlobalStore
      GlobalStore.setUserInfoCookie(userInfo.jwt, userInfo.user.id, userInfo.user.username, '')
      console.log('Cookie utilisateur créee ---->', $cookies.get('userToken'))

      // Mettre à jour la valeur userInfoCookie pour actualiser la ref
      GlobalStore.updateInfoCookie()

      router.push({ name: 'home' })
    } catch (error) {
      errorMessage.value = error.message
    } finally {
      isLogging.value = false
    }
  }
}
</script>

<template>
  <div class="container login">
    <div class="login__content">
      <!-- NOT CONNECTED ----------------------------------->
      <div v-if="!tryConnection">
        <h1>Bienvenue !</h1>

        <div class="login__social-group">
          <div>
            <img src="./../assets/img/logo-apple.png" alt="" />
            <p>Continuer avec Apple</p>
          </div>

          <div>
            <img src="./../assets/img/logo-google.png" alt="" />
            <p>Continuer avec Google</p>
          </div>

          <div>
            <img src="./../assets/img/logo-facebook.png" alt="" />
            <p>Continuer avec Facebook</p>
          </div>
        </div>

        <div class="login__not-connected-text-group">
          <p>Ou connecte-toi avec ton <span @click="tryLogIn">e-mail</span></p>
          <p>Tu n'as pas de compte Vinted ? <span @click="trySignUp">S'inscrire</span></p>
        </div>
      </div>

      <!-- WANT TO LOG IN + LOG IN PAGE --------------------------------->
      <div v-else-if="wantLogIn">
        <h1>Se connecter</h1>
        <p v-if="errorMessage">{{ errorMessage }}</p>
        <form @submit.prevent="logIn" v-if="!isLogging">
          <input
            type="email"
            name="email"
            id="email"
            placeholder="E-mail ou nom d'utilisateur"
            v-model="email"
          />

          <div class="login__password-group">
            <input
              :type="showPassword ? 'text' : 'password'"
              name="password"
              id="password"
              placeholder="Mot de passe"
              v-model="password"
            />
            <font-awesome-icon
              :icon="['far', 'eye-slash']"
              v-if="!showPassword"
              @click="togglePasswordVisibility"
            />
            <font-awesome-icon
              :icon="['far', 'eye']"
              v-else-if="showPassword"
              @click="togglePasswordVisibility"
            />
          </div>

          <button>Continuer</button>

          <p>Mot de passe oublié ?</p>
          <p>Un problème ?</p>
        </form>

        <p v-else-if="isLogging">En cours de connexion</p>
      </div>

      <!-- WANT TO SIGN UP  -------------------------------->
      <div v-else-if="wantSignUp">
        <h1>Rejoins le mouvement de la seconde main et vends sans frais !</h1>

        <div class="login__social-group">
          <div>
            <img src="./../assets/img/logo-apple.png" alt="" />
            <p>Continuer avec Apple</p>
          </div>

          <div>
            <img src="./../assets/img/logo-google.png" alt="" />
            <p>Continuer avec Google</p>
          </div>

          <div>
            <img src="./../assets/img/logo-facebook.png" alt="" />
            <p>Continuer avec Facebook</p>
          </div>
        </div>

        <div class="login__not-connected-text-group">
          <p>Ou inscris-toi avec ton <span @click="goSignUp">e-mail</span></p>
          <p>Tu as déjà un compte Vinted ? <span @click="tryLogIn">Se connecter</span></p>
        </div>
      </div>

      <!-- SIGN UP PAGE -------------------------------->
      <div v-else-if="signPage">
        <div v-if="!isLogging">
          <h1>Inscris-toi avec ton email</h1>
          <p v-if="errorMessage">{{ errorMessage }}</p>

          <form @submit.prevent="signUp">
            <input
              type="text"
              name="name"
              id="name"
              placeholder="Nom d'utilisateur"
              v-model="username"
            />
            <p>
              Crée ton nom d'utilisateur en n'utilisant que des lettres et des chiffres. Choisis-en
              un qui te plaît, tu ne pourras plus le changer.
            </p>

            <input type="email" name="email" id="email" placeholder="Email" v-model="email" />
            <p>Saisis l'adresse e-mail que tu souhaites utiliser sur Vinted</p>

            <div class="login__password-group">
              <input
                :type="showPassword ? 'text' : 'password'"
                name="password"
                id="password"
                placeholder="Mot de passe"
                v-model="password"
              />
              <font-awesome-icon
                :icon="['far', 'eye-slash']"
                v-if="!showPassword"
                @click="togglePasswordVisibility"
              />
              <font-awesome-icon
                :icon="['far', 'eye']"
                v-else-if="showPassword"
                @click="togglePasswordVisibility"
              />
            </div>

            <button>Continuer</button>
            <p>Besoin d'aide ?</p>
          </form>
        </div>

        <p v-if="isLogging">En cours de connexion</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login {
  margin-top: 50px;
  margin-bottom: 50px;
  border: 1px solid blue;
}

.login__content {
  width: 375px;
  margin: 0 auto;
  border: 1px solid red;
}

.login__social-group img {
  width: 20px;
  height: 20px;
  object-fit: contain;
}

.login__social-group > div {
  display: flex;
  align-items: center;
  gap: 10px;
  border: 1px solid black;
}
</style>
