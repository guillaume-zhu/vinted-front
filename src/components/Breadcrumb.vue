<script setup>
import { ref, onMounted, watch } from 'vue'
import { RouterLink } from 'vue-router'

const props = defineProps({
  category: { type: Object },
})

const breadCrumbArray = ref([])

// FONCTION POUR RÉCUPÉRER LES PARENTS DANS UN TABLEAU
const buildBreadCrumbArray = () => {
  let current = props.category.attributes // catégorie actuelle
  let currentId = props.category.attributes // pour récupérer l'id
  let levelDeep = null // i pour remonter dans les parents

  // Attribuer la catégorie actuelle
  breadCrumbArray.value.unshift({
    id: props.category.id,
    name: props.category.attributes.name,
    displayName: props.category.attributes.displayName,
    categoryLevel: props.category.attributes.categoryLevel,
  })

  // Définir jusqu'où remonter
  if (props.category.attributes.categoryLevel === 'level5') {
    levelDeep = 5
  } else if (props.category.attributes.categoryLevel === 'level4') {
    levelDeep = 4
  } else if (props.category.attributes.categoryLevel === 'level3') {
    levelDeep = 3
  } else if (props.category.attributes.categoryLevel === 'level2') {
    levelDeep = 2
  }

  // Boucle pour ajouter chaque parent
  for (let i = 0; i < levelDeep; i++) {
    if (!current?.parent?.data?.attributes) break

    currentId = current.parent.data
    current = current.parent.data.attributes

    breadCrumbArray.value.unshift({
      id: currentId.id,
      name: current.name,
      displayName: current.displayName,
      categoryLevel: current.categoryLevel,
    })
  }

  console.log('breadCrumbArray ---->', breadCrumbArray.value)
}

onMounted(buildBreadCrumbArray)
watch(() => props.category, buildBreadCrumbArray)
</script>

<template>
  <nav>
    <!-- <RouterLink :to="{ name: 'home' }"></RouterLink> -->
    <span v-for="item in breadCrumbArray" :key="item.id">
      <RouterLink :to="{ name: 'catalog', params: { id: item.id } }">
        {{ item.displayName }}
      </RouterLink>
      &nbsp;/&nbsp;
    </span>
  </nav>
</template>

<style scoped>
nav {
  display: block;
  width: 100%;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

a {
  text-decoration: underline;
}

span,
a {
  font-size: var(--font-span-md);
  color: var(--color-gray);
}
</style>
