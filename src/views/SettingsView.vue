<script setup>
import { ref, onMounted, inject, watchEffect } from 'vue'
import { RouterLink } from 'vue-router'
import axios from 'axios'
import vSelect from 'vue-select'
import 'vue-select/dist/vue-select.css'
import { computed } from 'vue'

const GlobalStore = inject('GlobalStore')
const userInfo = ref('')
const isLoading = ref(false)
const errorMessage = ref('')

// Requête pour récupérer userInfo
onMounted(async () => {
  isLoading.value = true
  try {
    const { data } = await axios.get(
      `http://localhost:1337/api/users/${GlobalStore.userInfoCookie.value.id}?populate[0]=country`,
    )

    userInfo.value = data
    console.log('userInfo ---->', userInfo.value)

    errorMessage.value = ''
  } catch (error) {
    errorMessage.value = error
  } finally {
    isLoading.value = false
  }
})

////// V-SELECT COUNTRY
// Variables pour country select
const selectedCountry = ref(null)
const countries = ref([])

// Requête fonction pour récupérer la liste des pays depuis le back
const fetchCountries = async () => {
  try {
    const { data } = await axios.get('http://localhost:1337/api/countries')
    console.log('data --->', data)
    countries.value = data.data.map((country) => {
      return {
        value: country.id,
        displayName: country.attributes.displayName,
        isoCode: country.attributes.isoCode,
      }
    })

    console.log('countries after mapping ---->', countries.value)
  } catch (error) {
    console.log('Erreur lors du chargement des pays :', error)
  }
}

// Charger country au montage
onMounted(fetchCountries)

////// V-SELECT CITY
// Variables pour city select
const selectedCity = ref(null)
const cities = ref([])
const cityData = {
  DE: [
    'Berlin',
    'Munich',
    'Frankfurt',
    'Hamburg',
    'Cologne',
    'Düsseldorf',
    'Stuttgart',
    'Leipzig',
    'Dresden',
    'Bremen',
  ],
  AT: [
    'Vienna',
    'Graz',
    'Linz',
    'Salzburg',
    'Innsbruck',
    'Klagenfurt',
    'Villach',
    'Wels',
    'St. Pölten',
    'Dornbirn',
  ],
  BE: [
    'Brussels',
    'Antwerp',
    'Ghent',
    'Charleroi',
    'Liège',
    'Bruges',
    'Namur',
    'Mons',
    'Aalst',
    'Mechelen',
  ],
  HR: [
    'Zagreb',
    'Split',
    'Rijeka',
    'Osijek',
    'Zadar',
    'Pula',
    'Slavonski Brod',
    'Karlovac',
    'Varaždin',
    'Šibenik',
  ],
  DK: [
    'Copenhagen',
    'Aarhus',
    'Odense',
    'Aalborg',
    'Esbjerg',
    'Randers',
    'Kolding',
    'Vejle',
    'Horsens',
    'Roskilde',
  ],
  FI: [
    'Helsinki',
    'Espoo',
    'Tampere',
    'Vantaa',
    'Oulu',
    'Turku',
    'Jyväskylä',
    'Lahti',
    'Kuopio',
    'Pori',
  ],
  FR: [
    'Paris',
    'Marseille',
    'Lyon',
    'Toulouse',
    'Nice',
    'Nantes',
    'Strasbourg',
    'Montpellier',
    'Bordeaux',
    'Lille',
  ],
  GR: [
    'Athens',
    'Thessaloniki',
    'Patras',
    'Heraklion',
    'Larissa',
    'Volos',
    'Ioannina',
    'Chania',
    'Kavala',
    'Rhodes',
  ],
  HU: [
    'Budapest',
    'Debrecen',
    'Szeged',
    'Miskolc',
    'Pécs',
    'Győr',
    'Nyíregyháza',
    'Kecskemét',
    'Székesfehérvár',
    'Eger',
  ],
  CZ: [
    'Prague',
    'Brno',
    'Ostrava',
    'Plzeň',
    'Liberec',
    'Olomouc',
    'Ústí nad Labem',
    'Hradec Králové',
    'Pardubice',
    'Zlín',
  ],
  ES: [
    'Madrid',
    'Barcelona',
    'Valencia',
    'Seville',
    'Zaragoza',
    'Málaga',
    'Murcia',
    'Palma',
    'Bilbao',
    'Alicante',
  ],
  IE: [
    'Dublin',
    'Cork',
    'Limerick',
    'Galway',
    'Waterford',
    'Drogheda',
    'Swords',
    'Dundalk',
    'Bray',
    'Navan',
  ],
  IT: [
    'Rome',
    'Milan',
    'Naples',
    'Turin',
    'Palermo',
    'Genoa',
    'Bologna',
    'Florence',
    'Bari',
    'Catania',
  ],
  LT: [
    'Vilnius',
    'Kaunas',
    'Klaipėda',
    'Šiauliai',
    'Panevėžys',
    'Alytus',
    'Marijampolė',
    'Mažeikiai',
    'Jonava',
    'Utena',
  ],
  LU: [
    'Luxembourg City',
    'Esch-sur-Alzette',
    'Differdange',
    'Dudelange',
    'Ettelbruck',
    'Diekirch',
    'Wiltz',
    'Remich',
    'Mersch',
    'Grevenmacher',
  ],
  NL: [
    'Amsterdam',
    'Rotterdam',
    'The Hague',
    'Utrecht',
    'Eindhoven',
    'Tilburg',
    'Groningen',
    'Almere',
    'Breda',
    'Nijmegen',
  ],
  PL: [
    'Warsaw',
    'Kraków',
    'Łódź',
    'Wrocław',
    'Poznań',
    'Gdańsk',
    'Szczecin',
    'Bydgoszcz',
    'Lublin',
    'Katowice',
  ],
  PT: [
    'Lisbon',
    'Porto',
    'Braga',
    'Coimbra',
    'Funchal',
    'Aveiro',
    'Leiria',
    'Faro',
    'Viseu',
    'Guimarães',
  ],
  RO: [
    'Bucharest',
    'Cluj-Napoca',
    'Timișoara',
    'Iași',
    'Constanța',
    'Craiova',
    'Brașov',
    'Galați',
    'Ploiești',
    'Oradea',
  ],
  SK: [
    'Bratislava',
    'Košice',
    'Prešov',
    'Žilina',
    'Nitra',
    'Banská Bystrica',
    'Trnava',
    'Martin',
    'Poprad',
    'Prievidza',
  ],
  GB: [
    'London',
    'Manchester',
    'Birmingham',
    'Liverpool',
    'Edinburgh',
    'Bristol',
    'Glasgow',
    'Leeds',
    'Sheffield',
    'Nottingham',
  ],
  SE: [
    'Stockholm',
    'Gothenburg',
    'Malmö',
    'Uppsala',
    'Västerås',
    'Örebro',
    'Linköping',
    'Helsingborg',
    'Jönköping',
    'Norrköping',
  ],
  US: [
    'New York',
    'Los Angeles',
    'Chicago',
    'Houston',
    'Phoenix',
    'Philadelphia',
    'San Antonio',
    'San Diego',
    'Dallas',
    'San Jose',
  ],
}

// Fonction pour récupérer la liste des villes en fonction du pays séléctionné
const fetchCities = async () => {
  if (!selectedCountry.value || !selectedCountry.value.isoCode) return

  try {
    console.log('Recherche de villes par country isoCode ---->', selectedCountry.value.isoCode)

    const countryCode = selectedCountry.value.isoCode
    cities.value = cityData[countryCode].map((city) => ({
      value: city,
      name: city,
    }))

    console.log('cities populaires disponibles ---->', cities.value)
  } catch (error) {
    console.log('Erreur lors du chargement des villes populaires :', error)
  }
}

// Fonction Geonames pour récupérer toutes les villes dynamiques
const fetchDynamicCities = async (searchQuery) => {
  if (!selectedCountry.value || !selectedCountry.value.isoCode || searchQuery.length < 2) return

  try {
    console.log(
      `🔎 Recherche de villes pour ${selectedCountry.value.isoCode} contenant : ${searchQuery}`,
    )

    const url = `http://api.geonames.org/searchJSON?name_startsWith=${searchQuery}&country=${selectedCountry.value.isoCode}&featureClass=P&maxRows=20&username=khyimz&style=short`
    // console.log('URL request ---->', url)

    const response = await axios.get(url)
    console.log('Réponse API Geonames:', response.data.geonames)

    // Vérifier que la réponse est bien sous forme de tableau
    if (!Array.isArray(response.data.geonames)) {
      console.error("Erreur : la réponse de l'API n'est pas un tableau")
      return
    }

    // Transformer la réponse API en format pour v-select
    const apiCities = response.data.geonames.map((city) => ({
      value: city.name,
      name: city.name,
    }))

    // Récup les villes populaires du pays sélectionné
    const popularCities =
      cityData[selectedCountry.value.isoCode]?.map((city) => ({
        value: city,
        name: city,
      })) || []

    // Fusionner les deux listes en supprimant les doublons
    const existingCities = new Set(popularCities.map((city) => city.value))
    const newCities = apiCities.filter((city) => !existingCities.has(city.value))

    // Mise a jour des options de v-select
    cities.value = [...newCities, ...popularCities]
  } catch (error) {
    console.log('Erreur lors du chargement des villes API dynamiques :', error)
  }
}

////// SUBMISSION UPDATE FORM
// Variables pour form
const image = ref(null)
const description = ref('')
const isPublishing = ref(false)

// Requete UPDATE
const handleSubmit = async () => {
  isPublishing.value = true

  ///// Si le formulaire contient IMAGE
  if (image.value) {
    //// Création du formdata
    const formData = new FormData()

    //// Ajout de l'image au formData
    formData.append('avatar', image.value)

    /// S'il contient DESCRIPTION
    if (description.value) {
      formData.append('description', description.value)
      // console.log('added description ---->', formData)
    }
    /// S'il contient COUNTRY/CITY
    if (selectedCountry.value && selectedCity.value) {
      formData.append('country', selectedCountry.value.value)
      formData.append('city', selectedCity.value.name)
      // console.log('added country & city ---->', formData)
    }

    console.log('formData a envoyer ---->', formData)
    formData.forEach((value, key) => {
      console.log(`${key}:`, value)
    })

    //// Faire la requête
    try {
      const response = await axios.put(
        `http://localhost:1337/api/users/${userInfo.value.id}?populate[0]=avatar`,
        formData,
        {
          headers: {
            Authorization: `Bearer ` + GlobalStore.userInfoCookie.value.token,
            'Content-Type': 'multipart/form-data',
          },
        },
      )

      console.log('Réponse requete update formData ---->', response.data)

      if (response.data.avatar) {
        GlobalStore.userInfoCookie.value = {
          ...GlobalStore.userInfoCookie.value,
          avatarUrl: response.data.avatar.url,
        }

        GlobalStore.setUserInfoCookie(
          GlobalStore.userInfoCookie.value.token,
          response.data.id,
          response.data.username,
          response.data.avatar.url,
        )
      }

      // console.log(
      //   'Avatar mis à jour dans GlobalStore ---->',
      //   GlobalStore.userInfoCookie.value.avatarUrl,
      // )
    } catch (error) {
      console.log(`Erreur lors de l'update formData`, error)
    }
  }

  ///// Si le formulaire contient DESCRIPTION ou COUNTRY/CITY
  else if (description.value || (selectedCountry.value && selectedCity.value)) {
    /// Déclarer le body vide a envoyer
    let body = {}

    /// S'il contient DESCRIPTION, ajouter au body
    if (description.value) {
      body.description = description.value
    }
    /// S'il contient COUNTRY/CITY, ajouter au body
    if (selectedCountry.value && selectedCity.value) {
      body.country = selectedCountry.value.value
      body.city = selectedCity.value.name
    }

    console.log('body a envoyer ---->', body)

    /// Faire la requête

    try {
      const response = await axios.put(
        `http://localhost:1337/api/users/${userInfo.value.id}`,
        body,
        {
          headers: { Authorization: `Bearer ` + GlobalStore.userInfoCookie.value.token },
        },
      )

      console.log('Réponse requete update body ---->', response.data)
    } catch (error) {
      console.log(`Erreur lors de l'update des informations sans avatar`)
    }
  }
  isPublishing.value = false
}

// COMPUTED POUR CRÉER PREVIEW UPLOAD IMAGE
const imagePreview = computed(() => {
  return URL.createObjectURL(image.value)
})
</script>

<template>
  <div class="container settings" v-if="userInfo">
    <!-- MENU PARAMÈTRES GAUCHE ---------------------------->
    <div class="settings__menu">
      <ul>
        <h1>Mes paramètres</h1>
        <li>Détails du profil</li>
        <li>Paramètres du compte</li>
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
      <!-- TOP AVATAR & DESCRIPTION -->
      <form @submit.prevent="handleSubmit()">
        <div>
          <div>
            <h2>Ta photo de profil</h2>
            <div>
              <img :src="imagePreview" alt="avatar utilisateur" v-if="image" />
              <img :src="GlobalStore.avatarUrl.value" alt="avatar utilisateur" v-else />
              <input type="file" @change="(event) => (image = event.target.files[0])" />
            </div>
          </div>

          <div>
            <h2>À propos de toi</h2>
            <textarea
              placeholder="Présente-toi aux autres membres"
              v-model="description"
            ></textarea>
          </div>
        </div>

        <!-- MID COUNTRY & CITY --------->
        <div>
          <p>Ma position</p>
          <!-- Sélecteur de pays -->
          <div>
            <label for="country">Pays</label>
            <v-select
              v-model="selectedCountry"
              :options="countries"
              label="displayName"
              :placeholder="userInfo.country ? userInfo.country.displayName : 'Sélectionne un pays'"
              @update:modelValue="fetchCities"
            />
          </div>

          <!-- Sélecteur de villes -->
          <div>
            <label for="city">Ville</label>
            <v-select
              v-model="selectedCity"
              :options="cities"
              label="name"
              :placeholder="
                userInfo.city
                  ? userInfo.city[0].toUpperCase() + userInfo.city.slice(1)
                  : 'Sélectionne une ville'
              "
              :filterable="true"
              :no-options-text="'Aucune ville trouvée'"
              @search="fetchDynamicCities"
            ></v-select>
          </div>
          <button>Mettre à jour</button>
        </div>
      </form>
    </div>
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
