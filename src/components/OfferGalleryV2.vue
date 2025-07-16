<script setup>
import { ref } from 'vue'

const props = defineProps({
  images: {
    type: Array,
  },
})

const currentIndex = ref(0)
const direction = ref(0)

const prev = () => {
  direction.value = -1
  currentIndex.value = currentIndex.value > 0 ? currentIndex.value - 1 : props.images.length - 1
}

const next = () => {
  direction.value = +1
  currentIndex.value = currentIndex.value < props.images.length - 1 ? currentIndex.value + 1 : 0
}

const goTo = (i) => {
  direction.value = i > currentIndex.value ? 1 : -1
  currentIndex.value = i
}
</script>

<template>
  <div class="gallery">
    <!-- prev -->
    <div class="gallery__arrow-box gallery__arrow-box--left">
      <font-awesome-icon :icon="['fas', 'chevron-left']" @click="prev" />
    </div>

    <!-- actual img -->
    <transition :name="direction > 0 ? 'slide-next' : 'slide-prev'">
      <img
        class="gallery__img"
        :key="currentIndex"
        :src="images[currentIndex].attributes.url"
        alt="Image produit"
      />
    </transition>

    <!-- next -->
    <div class="gallery__arrow-box gallery__arrow-box--right">
      <font-awesome-icon :icon="['fas', 'chevron-right']" @click="next" />
    </div>

    <!-- dots pagination -->
    <div class="gallery__dots">
      <span
        v-for="(_, i) in images"
        :key="i"
        :class="{
          active: currentIndex === i,
          nearActive: currentIndex + 1 === i || currentIndex - 1 === i,
          farActive: currentIndex + 2 === i || currentIndex - 2 === i,
        }"
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
    height: 470px;
    overflow: hidden;
  }

  .gallery__img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: var(--radius);
    position: absolute;
    top: 0;
    left: 0;
  }

  /* SLIDE ANIMATIONS */

  .transition {
    display: flex;
  }

  /* next */
  .slide-next-enter-from {
    transform: translateX(100%);
  }
  .slide-next-enter-to {
    transform: translateX(0);
  }
  .slide-next-leave-from {
    transform: translateX(0);
  }
  .slide-next-leave-to {
    transform: translateX(-100%);
  }

  /* prev */
  .slide-prev-enter-from {
    transform: translateX(-100%);
  }
  .slide-prev-enter-to {
    transform: translateX(0);
  }
  .slide-prev-leave-from {
    transform: translateX(0);
  }
  .slide-prev-leave-to {
    transform: translateX(100%);
  }

  /* timing */
  .slide-next-enter-active,
  .slide-next-leave-active,
  .slide-prev-enter-active,
  .slide-prev-leave-active {
    transition: transform 0.3s ease;
  }

  .gallery__arrow-box {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    cursor: pointer;
    z-index: 10;
    display: flex;
    justify-content: center;
    align-items: center;
    color: white;
    background-color: rgba(0, 0, 0, 0.3);
    width: 32px;
    height: 32px;
    border-radius: 50%;
    font-size: 14px;
  }

  .gallery__arrow-box--left {
    left: 10px;
  }
  .gallery__arrow-box--right {
    right: 10px;
  }

  .gallery__dots {
    position: absolute;
    bottom: 15px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    gap: 8px;
  }
  .gallery__dots span {
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.6);
    cursor: pointer;
  }
  .gallery__dots span.active {
    background: rgba(255, 255, 255, 1);
    width: 8px;
    height: 8px;
  }
  .gallery__dots span.nearActive {
    width: 8px;
    height: 8px;
  }
  .gallery__dots span.farActive {
    width: 6px;
    height: 6px;
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
