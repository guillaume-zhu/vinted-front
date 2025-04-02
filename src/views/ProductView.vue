<script setup>
import { ref, onMounted, computed } from 'vue'
import axios from 'axios'
import Breadcrumb from '@/components/Breadcrumb.vue'

const props = defineProps({
  id: { type: String },
})

const offerInfo = ref(null)
const isLoading = ref(false)
const category = ref(null)
const breadCrumb = ref(null)

////// REQUETE POUR RÉCUPÉRER offerInfo + category
onMounted(async () => {
  isLoading.value = true

  try {
    const { data } = await axios.get(`http://localhost:1337/api/offers/${props.id}?populate=*`)
    console.log('offerInfo ---->', data.data)

    offerInfo.value = data.data
    category.value = offerInfo.value.attributes.category.data

    // Récupérer category
    const responseCategory = await axios.get(
      `http://localhost:1337/api/categories/${category.value.id}?populate[0]=parent&populate[1]=parent.parent&populate[2]=parent.parent.parent&populate[3]=parent.parent.parent.parent&populate[4]=parent.parent.parent.parent.parent`,
    )

    breadCrumb.value = responseCategory.data.data
    console.log('breadCrumb ---->', breadCrumb.value)
  } catch (error) {
    console.log('Erreur lors du chargement des informations produit', error)
  }
  isLoading.value = false
})

// Calculer 'ajouté il y a X jours'
const addedAgo = computed(() => {
  // vérification erreur
  if (!offerInfo.value?.attributes?.publishedAt) return ''

  // date aujourd'hui
  const today = new Date()

  // date publication du produit
  const createdDate = new Date(offerInfo.value.attributes.publishedAt)

  // calcul différence en ms des dates
  const diffMs = today.getTime() - createdDate.getTime()

  // convert en jour
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  // retourner 'il y a X jours'
  return `il y a ${days} ${days > 1 ? 'jours' : 'jour'}`
})
</script>

<template>
  <div class="container">
    <div class="product">
      <!-- PICTURES & DRESSING BLOC -------------------->
      <div class="pictures-dressing">
        <!-- PICTURES GRID ----->
        <div class="pictures"></div>
        <!-- BREADCRUMB -------->
        <Breadcrumb v-if="breadCrumb" :category="breadCrumb" />
      </div>

      <!-- DETAILS BLOC -------------------------------->
      <div class="details" v-if="offerInfo">
        <!-- TOP PART -->
        <div class="details__top">
          <p>{{ offerInfo.attributes.name }}</p>
          <span v-if="offerInfo.attributes.condition">{{ offerInfo.attributes.condition }} · </span>
          <span>{{ offerInfo.attributes.brand.data.attributes.displayName }}</span>

          <p>{{ offerInfo.attributes.price }} €</p>
          <p>
            {{
              (offerInfo.attributes.price + offerInfo.attributes.price * (9.38 / 100)).toFixed(2)
            }}
            €
          </p>
          <p>Inclut la Protection acheteurs <font-awesome-icon :icon="['fas', 'shield-alt']" /></p>
        </div>

        <!-- MID PART -->
        <div class="details__mid">
          <!-- condition -->
          <div class="details__mid-info" v-if="offerInfo.attributes.condition">
            <p>État</p>
            <p>{{ offerInfo.attributes.condition }}</p>
          </div>

          <!-- size -->
          <div class="details__mid-info" v-if="offerInfo.attributes.size">
            <p>Taille</p>
            <p>
              {{ offerInfo.attributes.size.data.attributes.displayName }}
            </p>
          </div>

          <!-- brand -->
          <div class="details__mid-info" v-if="offerInfo.attributes.brand">
            <p>Marque</p>
            <p>
              {{ offerInfo.attributes.brand.data.attributes.displayName }}
            </p>
          </div>
        </div>

        <!-- color -->
        <div class="details__mid-info" v-if="offerInfo.attributes.colors">
          <p>Couleur</p>
          <p>
            {{
              offerInfo.attributes.colors.data
                .map(
                  (color) =>
                    color.attributes.displayName[0].toUpperCase() +
                    color.attributes.displayName.slice(1),
                )
                .join(', ')
            }}
          </p>
        </div>

        <!-- Ajouté -->
        <div class="details__mid-info" v-if="offerInfo.attributes.publishedAt">
          <p>Ajouté</p>
          <p>{{ addedAgo }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.product {
  border: 1px solid purple;
  display: flex;
}

/* PICTURES & DRESSING BLOC ---------------------------*/
.pictures-dressing {
  border: 1px solid green;
  width: 66%;
  min-height: 600px;
}

/* PICTURES GRID ---------------*/
.pictures {
  height: 625px;
  border: 1px solid salmon;
}

/* DETAILS BLOC ---------------------------------------*/
.details {
  border: 1px solid blue;
  width: 33%;
}

/* TOP PART --------------------*/
.details__top {
  border-bottom: 1px solid grey;
}

/* MID PART ------------------- */
.details__mid-info {
  display: flex;
}
</style>
