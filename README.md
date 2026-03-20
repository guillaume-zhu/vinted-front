# Vinted — Frontend Clone

Reproduction du front-end de Vinted, connecté à un backend Strapi custom.
Projet réalisé en autonomie dans le cadre d'un exercice full-stack.

👉 Preview : https://vinted-vue.netlify.app/

---

## Objectifs du projet

- Reproduire fidèlement l'UI et les parcours utilisateurs de Vinted
- Connecter le front-end à un backend Strapi personnalisé (routes CRUD, auth, collections)
- Pratiquer la structuration de composants Vue.js sur un projet de taille réelle
- Mettre en place un workflow complet : développement → build → déploiement

---

## Fonctionnalités

- **Home** — listing des offres avec affichage dynamique depuis l'API
- **Catalog / Search** — navigation et recherche dans les annonces
- **Product** — page détail d'une offre
- **Checkout** — tunnel d'achat
- **Sell / Edit** — publier et modifier une annonce
- **Login / Password** — authentification et gestion du mot de passe
- **Account / Profile / Settings** — gestion complète du compte utilisateur
- **Design System** — vue de référence des composants UI

---

## Stack

- **Vue.js** — framework front-end
- **Vite** — bundler et environnement de développement
- **Vue Router** — gestion de la navigation
- **Axios** — communication avec l'API Strapi
- **Netlify** — hébergement et déploiement continu

---

## Structure du projet

```
src/
├── assets/         # Styles globaux (base.css, main.css) et images
├── components/     # Composants réutilisables
├── router/         # Configuration des routes Vue Router
└── views/          # Pages de l'application
    ├── HomeView.vue
    ├── CatalogView.vue
    ├── SearchView.vue
    ├── ProductView.vue
    ├── CheckoutView.vue
    ├── SellView.vue
    ├── EditView.vue
    ├── LoginView.vue
    ├── PasswordView.vue
    ├── AccountView.vue
    ├── ProfileView.vue
    ├── SettingsView.vue
    └── DesignSystemView.vue
```

---

## Backend

Le front-end est connecté à un backend Strapi custom.
→ https://github.com/guillaume-zhu/vinted-backend

Fonctionnalités backend implémentées :

- Collections Strapi (offres, utilisateurs)
- Routes CRUD personnalisées
- Policies d'autorisation
- 596 offres seedées avec leurs champs dédiés
- Déployé sur Northflank avec un serveur PostgreSQL

---

## Installation

# Installer les dépendances

npm install

# Lancer en développement

npm run dev

---

## Déploiement

Le projet est déployé sur **Netlify** avec déploiement continu depuis la branche `main`.

---

## Statut

✅ Projet terminé — V1 complète
