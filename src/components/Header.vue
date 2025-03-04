<script setup>
import { RouterLink } from 'vue-router'
</script>

<template>
  <header>
    <div class="header-main container">
      <img src="./../assets/img/logo.svg" alt="" />

      <div class="header-main__search-group">
        <label for="searchbar">Articles</label>
        <input type="text" name="searchbar" id="searchbar" />
      </div>

      <div class="header-main__buttons">
        <button>
          <a href="">S'inscrire | Se connecter</a>
        </button>

        <button>
          <a href="">Vends tes articles</a>
        </button>

        <div class="header-main__help"><span>?</span></div>
      </div>
    </div>

    <div class="header-nav container">
      <RouterLink to="">Femmes</RouterLink>
      <RouterLink to="">Hommes</RouterLink>
      <RouterLink to="">Enfants</RouterLink>
      <RouterLink to="">Maison</RouterLink>
      <RouterLink to="">Électronique</RouterLink>
      <RouterLink to="">À propos</RouterLink>
      <RouterLink to="">Notre plateforme</RouterLink>
    </div>
  </header>
</template>

<style scoped>
/* HEADER BASE ------------------------------------------------*/
header {
  height: var(--header-height);
  max-width: 100vw;
  /* border: 1px solid black;  */
}

/* HEADER MAIN --------------------------*/
.header-main {
  border: 1px solid blue;
  height: var(--header-main-height);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-main__buttons {
  display: flex;
}

.header-nav {
  border: 1px solid red;
  height: var(--header-nav-height);
}
</style>
