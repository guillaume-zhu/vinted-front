<script setup>
const props = defineProps({
  hide: Boolean,
})
</script>

<template>
  <footer class="container">
    <div class="footer__top" v-if="!hide">
      <ul>
        <h2>Vinted</h2>
        <li>À propos de Vinted</li>
        <li>Carrière</li>
        <li>Le développement durable</li>
        <li>Presse</li>
        <li>Publicités</li>
        <li>Accessibilité</li>
      </ul>

      <ul>
        <h2>Découvrir</h2>
        <li>Comment ça marche ?</li>
        <li>Vérification de l'article</li>
        <li>Applications mobiles</li>
        <li>Tableau de bord</li>
        <li>Vinted Pro</li>
        <li>Guide Vinted Pro</li>
      </ul>

      <ul>
        <h2>Aide</h2>
        <li>Centre d'aide</li>
        <li>Vendre</li>
        <li>Acheter</li>
        <li>Confiance et sécurité</li>
      </ul>

      <div></div>
    </div>

    <div class="footer__mid">
      <div class="footer__download">
        <a href=""> <img src="./../assets/img/footer-download-apple.svg" alt="" /></a>
        <a href=""> <img src="./../assets/img/footer-download-google.svg" alt="" /></a>
      </div>

      <div class="footer__links">
        <a href=""><font-awesome-icon :icon="['fab', 'facebook-square']" /></a>
        <a href=""> <font-awesome-icon :icon="['fab', 'linkedin']" /></a>
        <a href=""><font-awesome-icon :icon="['fab', 'instagram']" /></a>
      </div>
    </div>

    <div class="footer__bot">
      <p>Politique de Confidentialité</p>
      <p>Politique de cookies</p>
      <p>Paramètres des cookies</p>
      <p>Termes et Conditions</p>
      <p>Notre plateforme</p>
      <p>Termes et conditions de Vinted Pro</p>
    </div>
  </footer>
</template>

<style scoped>
/* RESPONSIVE STYLES -------------------*/
footer {
  padding: 0px 8px 0px 8px;
}

/* FOOTER TOP */
.footer__top {
  border-bottom: 1px solid var(--color-light-gray);
}

footer h2 {
  color: var(--color-gray);
  font-weight: var(--font-weight-light);
  font-size: 18px;
  margin-bottom: 5px;
}

footer li {
  color: var(--color-gray);
  font-weight: var(--font-weight-light);
  font-size: 15px;
  padding: 10px 0px 10px 0px;
}

footer ul {
  padding: 12px;
}

/* FOOTER MID */
.footer__mid {
  padding: 20px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  border-bottom: 1px solid var(--color-light-gray);
}

.footer__download {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
}

.footer__download img {
  width: 140px;
  height: 40px;
}

.footer__links {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
  margin-top: 20px;
}

.footer__links svg {
  color: var(--color-light-gray);
  font-size: 30px;
}

/* FOOTER BOT */
.footer__bot {
  padding: 20px 12px 20px 12px;
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
  row-gap: 30px;
}

.footer__bot p {
  color: var(--color-gray);
  font-weight: var(--font-weight-light);
  font-size: 15px;
  width: fit-content;
}

/* SMALL / MOBILE (≤ 720px) */
@media (max-width: 720px) {
  footer {
    margin-bottom: 75px;
  }
}

/* MEDIUM (721px à 960px) */
@media (min-width: 721px) {
  .footer__top {
    display: flex;
    justify-content: space-between;
    padding-bottom: 10px;
  }
  .footer__mid {
    flex-direction: row-reverse;
    justify-content: space-between;
  }
  .footer__links {
    margin-top: 0px;
  }
}

/* DESKTOP (>960px) */
@media (min-width: 961px) {
  footer {
    padding: 20px 20px 20px 20px;
  }

  .footer__mid {
    padding: 20px 12px;
  }
  .footer__bot {
    margin-top: 16px;
  }
  footer ul {
    padding: 12px;
  }
}

/* DESKTOP (>1200px) */
@media (min-width: 1200px) {
  footer {
    padding: 20px 0px 20px 0px;
  }

  .footer__mid {
    padding: 20px 12px;
  }
  .footer__bot {
    margin-top: 16px;
  }
  footer ul {
    padding: 12px;
  }
}
</style>
