<script setup>
import { ref, inject } from 'vue'
import axios from 'axios'
import { useRoute, useRouter } from 'vue-router'

import { apiUrl } from '@/config'

const router = useRouter()
const route = useRoute()
const GlobalStore = inject('GlobalStore')

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

// EMIT CLOSE
const emit = defineEmits(['close'])

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
      const { data } = await axios.post(`${apiUrl}/api/auth/local`, {
        identifier: email.value,
        password: password.value,
      })

      // Stockage de l'id
      const userId = data.user.id

      // Stockage du token
      const userToken = data.jwt

      // Requête avec l'id pour obtenir l'objet utilisateur
      const dataUserInfos = await axios.get(`${apiUrl}/api/users/${userId}?populate[0]=avatar`)

      // Stockage des infos objet utilisateur
      const userInfo = dataUserInfos.data

      // Appel et création du cookie avec les infos de l'utilisateur au GlobalStore
      GlobalStore.setUserInfoCookie(userToken, userId, userInfo.username, userInfo.avatar.url)

      // Mettre à jour la valeur userInfoCookie pour actualiser la ref
      GlobalStore.updateInfoCookie()

      router.push({ path: route.fullPath || '/' })
      emit('close')
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
      const { data } = await axios.post(`${apiUrl}/api/auth/local/register`, {
        username: username.value,
        email: email.value,
        password: password.value,
      })

      // Stockage des informations utilisateurs
      const userInfo = data

      // Appel et création du cookie avec les infos de l'utilisateur au GlobalStore
      GlobalStore.setUserInfoCookie(userInfo.jwt, userInfo.user.id, userInfo.user.username, '')

      // Mettre à jour la valeur userInfoCookie pour actualiser la ref
      GlobalStore.updateInfoCookie()

      router.push({ path: route.fullPath || '/' })
      emit('close')
    } catch (error) {
      errorMessage.value = error.message
    } finally {
      isLogging.value = false
    }
  }
}
</script>

<template>
  <div class="login__overlay">
    <div class="login__content container">
      <!-- CLOSE BUTTON ---------------------------------->
      <div class="login__close">
        <font-awesome-icon :icon="['fas', 'times']" @click="emit('close')" />
      </div>

      <!-- NOT CONNECTED ----------------------------------->
      <div class="login__choice" v-if="!tryConnection">
        <h1>Bienvenue !</h1>

        <div class="login__social-group">
          <div>
            <img src="./../assets/img/logo-apple.png" alt="" />
            <span>Continuer avec Apple</span>
          </div>

          <div>
            <img src="./../assets/img/logo-google.png" alt="" />
            <span>Continuer avec Google</span>
          </div>

          <div>
            <img src="./../assets/img/logo-facebook.png" alt="" />
            <span>Continuer avec Facebook</span>
          </div>
        </div>

        <div class="login__not-connected-text-group">
          <p>Ou connecte-toi avec ton <span @click="tryLogIn">e-mail</span></p>
          <p>Tu n'as pas de compte Vinted ? <span @click="trySignUp">S'inscrire</span></p>
        </div>
      </div>

      <!-- WANT TO LOG IN + LOG IN PAGE --------------------------------->
      <div class="login__login" v-else-if="wantLogIn">
        <h1>Se connecter</h1>
        <p class="error-message" v-if="errorMessage">{{ errorMessage }}</p>
        <form @submit.prevent="logIn" v-if="!isLogging" class="login__form">
          <input
            type="email"
            name="email"
            id="email"
            placeholder="E-mail ou nom d'utilisateur"
            v-model="email"
            class="login__input"
          />

          <div class="login__password-group">
            <input
              :type="showPassword ? 'text' : 'password'"
              name="password"
              id="password"
              placeholder="Mot de passe"
              v-model="password"
              class="login__input"
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

          <button class="ds-btn ds-btn--primary">Continuer</button>
        </form>

        <p class="loading" v-else-if="isLogging">En cours de connexion</p>

        <div class="login__login-text">
          <span>Mot de passe oublié ?</span>
          <span>Un problème ?</span>
        </div>
      </div>

      <!-- WANT TO SIGN UP  -------------------------------->
      <div v-else-if="wantSignUp" class="login__sign-choice">
        <h1>Rejoins le mouvement de la seconde main et vends sans frais !</h1>

        <div class="login__social-group">
          <div>
            <img src="./../assets/img/logo-apple.png" alt="" />
            <span>Continuer avec Apple</span>
          </div>

          <div>
            <img src="./../assets/img/logo-google.png" alt="" />
            <span>Continuer avec Google</span>
          </div>

          <div>
            <img src="./../assets/img/logo-facebook.png" alt="" />
            <span>Continuer avec Facebook</span>
          </div>
        </div>

        <div class="login__not-connected-text-group">
          <p>Ou inscris-toi avec ton <span @click="goSignUp">e-mail</span></p>
          <p>Tu as déjà un compte Vinted ? <span @click="tryLogIn">Se connecter</span></p>
        </div>
      </div>

      <!-- SIGN UP PAGE -------------------------------->
      <div v-else-if="signPage">
        <div v-if="!isLogging" class="login__sign">
          <h1>Inscris-toi avec ton email</h1>
          <p class="error-message" v-if="errorMessage">{{ errorMessage }}</p>

          <form @submit.prevent="signUp">
            <div>
              <input
                type="text"
                name="name"
                id="name"
                placeholder="Nom d'utilisateur"
                v-model="username"
                class="login__input"
              />
              <p>
                Utilise des chiffres, des lettres ou les deux. Choisis un nom d'utilisateur qui te
                plaît, car tu ne pourras plus le modifier.
              </p>
            </div>

            <div>
              <input
                type="email"
                name="email"
                id="email"
                placeholder="Email"
                v-model="email"
                class="login__input"
              />
              <p>Saisis l'adresse e-mail que tu souhaites utiliser sur Vinted</p>
            </div>

            <div>
              <div class="login__password-group">
                <input
                  :type="showPassword ? 'text' : 'password'"
                  name="password"
                  id="password"
                  placeholder="Mot de passe"
                  v-model="password"
                  class="login__input"
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
              <p>Saisis au moins 7 caractères, dont au moins 1 lettre et 1 chiffre</p>
            </div>

            <button class="ds-btn ds-btn--primary">Continuer</button>
          </form>
          <span>Besoin d'aide?</span>
        </div>

        <p class="loading" v-if="isLogging">En cours de connexion</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* SMALL / MOBILE (< 720px) */
.login__overlay {
  background-color: rgba(0, 0, 0, 0.6);
  width: 100vw;
  height: 100vh;
  position: fixed;
  z-index: 2000;
  top: 0;
  padding: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.login__content {
  margin: 0 auto;
  background-color: white;
  border-radius: 12px;
  width: 100%;
  padding: 16px 16px 24px 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.login__content > div {
  width: 100%;
}

h1 {
  text-align: center;
}

.error-message {
  color: red;
  font-size: var(--font-span-lg);
}

.loading {
  font-size: var(--font-span-lg);
  color: var(--color-gray);
  text-align: center;
}

/* CLOSE ------------------- */
.login__close {
  display: flex;
  justify-content: flex-end;
}
.login__close svg {
  font-size: 24px;
  color: var(--color-primary);
}

/* LOGIN WELCOME CHOICE */
.login__choice,
.login__login,
.login__sign-choice,
.login__sign {
  display: flex;
  flex-direction: column;
  gap: 24px;
}
.login__social-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.login__social-group > div {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  border: 1px solid black;
  height: 42px;
  border-radius: var(--radius);
}
.login__social-group img {
  width: 20px;
  height: 20px;
  object-fit: contain;
}
.login__social-group span {
  font-weight: var(--font-weight-medium);
}
.login__not-connected-text-group {
  display: flex;
  flex-direction: column;
  gap: 16px;
  align-items: center;
}
.login__not-connected-text-group p {
  font-size: var(--font-span-lg);
  font-weight: var(--font-weight-light);
  color: var(--color-gray);
}
.login__not-connected-text-group span {
  color: var(--color-primary);
  text-decoration: underline;
  cursor: pointer;
}

/* LOGIN */
form {
  display: flex;
  flex-direction: column;
  gap: 32px;
}
.login__login-text {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 16px;
}
.login__login-text span {
  cursor: pointer;
  font-size: var(--font-span-lg);
  font-weight: var(--font-weight-light);
  color: var(--color-primary);
}

/* SIGN */
.login__sign > form > div > p {
  color: var(--color-gray);
  margin-top: 5px;
  margin-left: 2px;
}
.login__sign > span {
  color: var(--color-primary);
  text-align: center;
  cursor: pointer;
  font-weight: var(--font-weight-light);
}

/* MEDIUM (>= 720px ) */
@media (min-width: 720px) {
  .login__content {
    width: 375px;
  }
}

/* DESKTOP (>= 960px) */
@media (min-width: 960px) {
}

/* DESKTOP LARGE (>= 1200px) */
@media (min-width: 1200px) {
}
</style>
