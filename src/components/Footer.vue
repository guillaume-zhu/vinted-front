<script setup></script>

<template>
  <footer class="container">
    <div class="footer__top">
      <ul>
        <p>Vinted</p>
        <li>À propos de Vinted</li>
        <li>Carrière</li>
        <li>Le développement durable</li>
        <li>Presse</li>
        <li>Publicités</li>
      </ul>

      <ul>
        <p>Découvrir</p>
        <li>Comment ça marche ?</li>
        <li>Vérification de l'article</li>
        <li>Applications mobiles</li>
        <li>Tableau de bord</li>
        <li>Vinted Pro</li>
        <li>Guide Vinted Pro</li>
      </ul>

      <ul>
        <p>Aide</p>
        <li>Centre d'aide</li>
        <li>Vendre</li>
        <li>Acheter</li>
        <li>Confiance et sécurité</li>
      </ul>

      <div></div>
    </div>

    <div class="footer__mid">
      <div class="footer__links">
        <a href=""><font-awesome-icon :icon="['fab', 'facebook-square']" /></a>
        <a href=""> <font-awesome-icon :icon="['fab', 'linkedin']" /></a>
        <a href=""><font-awesome-icon :icon="['fab', 'instagram']" /></a>
      </div>

      <div class="footer__donwload">
        <a href=""> <img src="./../assets/img/footer-download-apple.svg" alt="" /></a>
        <a href=""> <img src="./../assets/img/footer-download-google.svg" alt="" /></a>
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
footer {
  padding: 20px 0px;
}

.footer__top {
  display: flex;
  justify-content: space-between;
}

.footer__mid {
  display: flex;
  justify-content: space-between;
}

.footer__bot {
  display: flex;
  gap: 15px;
}
</style>
