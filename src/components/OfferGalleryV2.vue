<script setup>
import { ref } from 'vue'

const props = defineProps({
  images: {
    type: Array,
  },
})

const currentIndex = ref(0)
const prev = () => {
  currentIndex.value = currentIndex.value > 0 ? currentIndex.value - 1 : props.images.length - 1
}
const next = () => {
  currentIndex.value = currentIndex.value < props.images.length - 1 ? currentIndex.value + 1 : 0
}
const goTo = (i) => {
  currentIndex.value = i
}
</script>

<template>
  <div class="gallery">
    <!-- prev -->
    <font-awesome-icon :icon="['fas', 'chevron-left']" @click="prev" class="arrow left" />

    <!-- actual img -->
    <img class="gallery__img" :src="images[currentIndex].attributes.url" alt="Image produit" />

    <!-- next -->
    <font-awesome-icon :icon="['fas', 'chevron-right']" @click="next" class="arrow right" />

    <!-- dots pagination -->
    <div class="gallery__dots">
      <span
        v-for="(_, i) in images"
        :key="i"
        :class="{ active: currentIndex === i }"
        @click="goTo(i)"
      ></span>
    </div>
  </div>
</template>

<style scoped>
/* SMALL / MOBILE (≤ 720px) */
@media (max-width: 720px) {
  .gallery {
    position: relative;
    width: 100%;
    height: 600px;
  }

  .gallery__img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  .arrow {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    cursor: pointer;
    z-index: 10;
  }
  .left {
    left: 10px;
  }
  .right {
    right: 10px;
  }

  .gallery__dots {
    position: absolute;
    bottom: 15px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    gap: 8px;
    border: 1px solid red;
  }
  .gallery__dots span {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.6);
    border: 1px solid red;
    cursor: pointer;
  }
  .dots span.active {
    background: rgba(255, 255, 255, 1);
  }
}

/* MEDIUM (721px à 960px) */
@media (min-width: 721px) and (max-width: 960px) {
}

/* DESKTOP (> 961px) */
@media (min-width: 961px) {
}

/* DESKTOP LARGE (> 1200px) */
@media (min-width: 1200px) {
}
</style>
