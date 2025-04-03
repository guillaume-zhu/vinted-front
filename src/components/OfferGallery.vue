<script setup>
import { ref } from 'vue'

const props = defineProps({
  offerPictures: {
    type: Array,
  },
})

console.log('offerPictures', props.offerPictures)

// PREVIEW
const isPreviewOpen = ref(false)
const previewIndex = ref(0)

const openPreview = (index) => {
  previewIndex.value = index
  isPreviewOpen.value = true
}

const closePreview = () => {
  isPreviewOpen.value = false
}

const prevImg = () => {
  previewIndex.value--
}

const navImg = (direction) => {
  // Si previous
  if (direction === 'prev') {
    // -> index - 1
    previewIndex.value--

    // --> si previewIndex = 0
    if (previewIndex.value < 0) {
      // --> previewIndex = offerPictures.value.length - 1
      previewIndex.value = props.offerPictures.length - 1
    }
  }

  // Si next
  if (direction === 'next') {
    // -> index + 1
    previewIndex.value++

    // --> si previewIndex = offerPicture.value.length + 1
    if (previewIndex.value > props.offerPictures.length - 1) {
      // --> previewIndex = offerPictures.value.length - 1
      previewIndex.value = 0
    }
  }
}
</script>

<template>
  <!-- SI 1 IMAGE -->
  <div v-if="offerPictures.length === 1" class="gallery">
    <img :src="offerPictures[0].attributes.url" alt="" />
  </div>

  <!-- SI 2 IMAGES -->
  <div v-if="offerPictures.length === 2" class="gallery">
    <div class="gallery__double-column">
      <img :src="offerPictures[0].attributes.url" alt="" />
    </div>

    <div class="gallery__double-column">
      <img :src="offerPictures[1].attributes.url" alt="" />
    </div>
  </div>

  <!-- SI 3 IMAGES -->
  <div v-if="offerPictures.length === 3" class="gallery">
    <div class="gallery__double-column">
      <img :src="offerPictures[0].attributes.url" alt="" />
    </div>

    <div class="gallery__double-column flex-column">
      <div class="height-split">
        <img :src="offerPictures[1].attributes.url" alt="" />
      </div>

      <div class="height-split">
        <img :src="offerPictures[2].attributes.url" alt="" />
      </div>
    </div>
  </div>

  <!-- SI 4 IMAGES -->
  <div v-if="offerPictures.length === 4" class="gallery">
    <div class="gallery__double-column">
      <img :src="offerPictures[0].attributes.url" alt="" />
    </div>

    <div class="gallery__double-column flex-column">
      <div class="height-split">
        <img :src="offerPictures[1].attributes.url" alt="" />
      </div>

      <div class="height-split flex">
        <img :src="offerPictures[2].attributes.url" alt="" class="width-split" />
        <img :src="offerPictures[3].attributes.url" alt="" class="width-split" />
      </div>
    </div>
  </div>

  <!-- SI 5 IMAGES -->
  <div v-if="offerPictures.length === 5" class="gallery">
    <div class="gallery__double-column">
      <img :src="offerPictures[0].attributes.url" alt="" />
    </div>

    <div class="gallery__double-column flex-column">
      <div class="height-split flex">
        <img :src="offerPictures[1].attributes.url" alt="" class="width-split" />
        <img :src="offerPictures[2].attributes.url" alt="" class="width-split" />
      </div>

      <div class="height-split flex">
        <img :src="offerPictures[3].attributes.url" alt="" class="width-split" />
        <img :src="offerPictures[4].attributes.url" alt="" class="width-split" />
      </div>
    </div>
  </div>

  <!-- SI +5 IMAGES -->
  <div v-if="offerPictures.length > 5" class="gallery">
    <div class="gallery__double-column">
      <img :src="offerPictures[0].attributes.url" alt="" />
    </div>

    <div class="gallery__double-column flex-column">
      <div class="height-split flex">
        <img :src="offerPictures[1].attributes.url" alt="" class="width-split" />
        <img :src="offerPictures[2].attributes.url" alt="" class="width-split" />
      </div>

      <div class="height-split flex">
        <img :src="offerPictures[3].attributes.url" alt="" class="width-split" />

        <div class="width-split last-image" @click="openPreview(4)">
          <img :src="offerPictures[4].attributes.url" alt="" />
          <div class="overlay">+ {{ offerPictures.length - 5 }}</div>
        </div>
      </div>
    </div>

    <!-- PREVIEW -->
    <div v-if="isPreviewOpen">
      <div class="lightbox" @click="closePreview()">
        <div class="preview-img-absolute" @click.stop>
          <div class="nav-arrow-box left-position" @click="navImg('prev')">
            <font-awesome-icon :icon="['fas', 'chevron-left']" class="left" />
          </div>

          <img :src="offerPictures[previewIndex].attributes.url" alt="" class="preview-img" />

          <div class="nav-arrow-box right-position" @click="navImg('next')">
            <font-awesome-icon :icon="['fas', 'chevron-right']" class="right" />
          </div>

          <div class="nav-arrow-box close-position">
            <font-awesome-icon :icon="['fas', 'times']" @click="closePreview()" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.gallery {
  /* border: 1px solid red; */
  width: 100%;
  height: 100%;
  display: flex;
  gap: 2px;
}

.gallery__double-column {
  width: 100%;
  height: 100%;
  /* border: 1px solid blue; */
}

.flex-column {
  display: flex;
  flex-direction: column;
}

.height-split {
  height: 50%;
}

.width-split {
  width: 50%;
}

.flex {
  display: flex;
}

img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 5px;
}

/* PREVIEW -------------------------------*/
.last-image {
  border: 2px solid red;
  cursor: pointer;
  position: relative;
}

.last-image .overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.4);
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 24px;
  font-weight: bold;
  border-radius: 5px;
}

.lightbox {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  /* color: white; */
}

.preview-img {
  max-width: 90vw;
  max-height: 90vh;
  width: auto;
  height: auto;
  object-fit: contain;
  border-radius: 10px;
}

.preview-img-absolute {
  border: 1px solid blue;
  position: relative;
}

/* NAV BUTTONS */
.nav-arrow-box {
  position: absolute;
  top: 50%;
  width: 30px;
  height: 30px;
  background-color: rgba(0, 0, 0, 0.3);
  /* padding: 10px; */
  border-radius: 50px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
}

.nav-arrow-box > svg {
  color: white;
}

.left {
  margin-right: 2px;
}

.right {
  margin-left: 2px;
}

.left-position {
  left: 10px;
}

.right-position {
  right: 10px;
}

.close-position {
  right: 10px;
  top: 10px;
}
</style>
