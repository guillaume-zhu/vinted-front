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
  <div class="pictures">
    <div class="gallery__thumbnail">
      <img
        :src="image.attributes.url"
        alt=""
        v-for="(image, index) in images"
        :key="image.index"
        @click="goTo(index)"
        :class="{ activeThumb: currentIndex === index }"
      />
    </div>

    <div class="gallery">
      <!-- prev -->
      <div class="gallery__arrow-box gallery__arrow-box--left">
        <font-awesome-icon :icon="['fas', 'chevron-left']" @click="prev" />
      </div>

      <!-- actual img -->
      <div class="image__wrapper">
        <transition :name="direction > 0 ? 'slide-next' : 'slide-prev'">
          <img
            class="gallery__img"
            :key="currentIndex"
            :src="images[currentIndex].attributes.url"
            alt="Image produit"
          />
        </transition>
      </div>

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
  </div>
</template>

<style scoped>
/* SMALL / MOBILE (≤ 720px) */
.gallery__thumbnail {
  display: none;
}

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

/* MEDIUM (> 720px) */
@media (min-width: 720px) {
  .pictures {
    display: flex;
    gap: 30px;
    height: 600px;
    overflow: hidden;
  }

  /* THUMBNAILS */
  .gallery__thumbnail {
    display: flex;
    flex-direction: column;
    width: 66px;
    height: 100%;
    overflow-y: auto;
    gap: 20px;
  }
  .gallery__thumbnail img {
    border-radius: var(--radius);
    width: 100%;
    height: 85px;
  }
  .activeThumb {
    border: 1px solid var(--color-black);
  }

  /* GALLERY */
  .gallery {
    height: 100%;
    padding: 0px 48px;
  }
  .image__wrapper {
    overflow: hidden;
    border-radius: var(--radius);
    height: 100%;
    position: relative;
  }
  .gallery__img {
    width: 100%;
  }

  .gallery__arrow-box {
    background-color: white;
    color: var(--color-black);
    border: 1px solid var(--color-light-gray);
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .gallery__arrow-box--left {
    left: 5px;
  }
  .gallery__arrow-box--right {
    right: 5px;
  }
}

/* DESKTOP (> 960px) */
@media (min-width: 960px) {
  .pictures {
    min-width: 613px;
  }
}

/* DESKTOP LARGE (> 1200px) */
@media (min-width: 1200px) {
}
</style>
