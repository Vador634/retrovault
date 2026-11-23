# RetroVault — ma collection de jeux rétro

Application web **React** pour gérer sa collection de consoles et de jeux vidéo, surtout rétro.
On se connecte, on ajoute ses consoles (avec le modèle exact : PS2 Fat ou Slim, Game Boy DMG ou Pocket…), puis pour chaque console on cherche ses jeux dans la base **RAWG** et on note l'état de son exemplaire : région, en boîte ou loose, complet ou non, prix payé, note perso…

**Version en ligne : https://vador634.github.io/retrovault/**

Pensée **mobile d'abord** : une recherche « Je l'ai déjà ? » toujours visible permet de vérifier en magasin d'occasion qu'on n'achète pas un doublon.

<p align="center">
  <img src="Documentation/captures/00-themes-connexion.png" width="700" alt="Les 3 thèmes : GameCube, Xbox, PlayStation" />
</p>

<p align="center">
  <img src="Documentation/captures/04-mes-consoles.png" width="230" alt="Mes consoles" />
  <img src="Documentation/captures/09-grille-jeux.png" width="230" alt="Jeux d'une console" />
  <img src="Documentation/captures/10-popup-detail.png" width="230" alt="Fiche d'un jeu" />
</p>

---

## Fonctionnalités

**Connexion**
- Inscription / connexion par pseudo et mot de passe, choix du thème dès cet écran.
- Toutes les pages sont protégées, bouton de déconnexion dans la barre de navigation.
- Plusieurs comptes possibles sur le même appareil, chacun avec sa collection.

**Mes consoles**
- Grille de mes consoles avec une carte « + Ajouter une console ».
- Ajout en 3 étapes : choix dans un catalogue de **28 consoles** (de l'Atari 2600 à la PS4, la Xbox One, la Wii U et la Switch) → **modèle** → état, boîte, couleur/édition, commentaire.
- Plusieurs exemplaires de la même console possibles (ex. une PS2 Fat et une Slim).
- Chaque carte affiche la photo de la console, le nom, le modèle et le nombre de jeux.
- **Ordre libre** : on range ses consoles comme on veut en les faisant glisser (souris, ou appui long au doigt). L'ordre est enregistré.
- **Tris** : mon ordre, par marque (avec un titre par fabricant), plus anciennes / plus récentes, nombre de jeux, nom. Le tri choisi est mémorisé.

**Jeux d'une console** (une seule page dynamique `/console/:id`)
- En-tête avec le modèle, les caractéristiques techniques et le nombre de jeux.
- Recherche RAWG **filtrée automatiquement sur la plateforme** (pas besoin de taper « ps2 »), avec filtres par genre et par année. Sans texte, la pop-up affiche les jeux les plus populaires de la console.
- Badge « Dans ma collection » sur les résultats déjà possédés.
- Options de mon exemplaire : région (PAL / NTSC-U / NTSC-J), format (**CIB / Loose / Neuf sous blister**), contenu boîte / notice / jeu → badge **Complet / Incomplet** automatique, état, prix, date et lieu d'achat.
- Fiche d'un jeu en pop-up : infos RAWG (résumé, genres, développeur, éditeur, date de sortie) + mes infos, note sur 5 ou sur 10, commentaire, modification et suppression avec confirmation.
- Filtres (région, complets / incomplets) et tri (ajout récent, A→Z, note, année).

**Bonus**
- **« Je l'ai déjà ? »** : recherche instantanée dans ma collection, sans réseau, qui répond console, région, format et état, ou « ⭐ Dans ta wishlist ».
- **Wishlist** : un jeu peut être « Recherché » au lieu de « Possédé ». Bouton « Je l'ai trouvé ! » pour le passer dans la collection.
- **Statistiques** (Recharts) : jeux par console, répartition CIB / Loose / Blister, % de jeux complets, répartition par région, total dépensé, top des jeux les mieux notés.
- **3 thèmes « console »**, chacun avec son propre logo, au choix dans les réglages ou dès l'écran de connexion :
  - **GameCube** : logo en cube, indigo brillant, tout est arrondi, petits cubes en fond, bouton principal vert comme le bouton A ;
  - **Xbox** : logo en sphère verte lumineuse, noir et vert lime, boutons à coins coupés, équerres vertes sur les panneaux, quadrillage en fond ;
  - **PlayStation** : logo aux 4 symboles, gris clair comme le plastique de la console, boutons en relief qui s'enfoncent, rainures en fond, trait aux 4 couleurs sous les titres.
- **Réglages** : thème, note sur 5 ou 10.
- **Sauvegarde** : export et import de la collection en JSON.

## Stack technique

| Rôle | Outil |
|---|---|
| Interface | React 19 + Vite |
| Navigation | React Router |
| Style | Tailwind CSS 4 + variables CSS pour les 3 thèmes ; Inter (texte), Rubik / Michroma / Saira (titres selon le thème) |
| Animations | Framer Motion |
| État + persistance | Zustand (middleware `persist` → localStorage) |
| Graphiques | Recharts |
| Glisser-déposer | dnd-kit (grille triable, souris + tactile + clavier) |
| Données des jeux | [API RAWG](https://rawg.io/apidocs) |

Pas de serveur : l'application est entièrement côté navigateur. Les comptes, la collection et les réglages sont enregistrés dans le `localStorage` de l'appareil.

## Installation

**Prérequis** : Node.js 20 ou plus.

1. Cloner le dépôt et installer les dépendances :
   ```bash
   git clone https://github.com/Vador634/retrovault.git
   cd retrovault
   npm install
   ```
2. Récupérer une clé API RAWG (gratuite) :
   - aller sur [rawg.io/apidocs](https://rawg.io/apidocs) et cliquer sur **Get API Key** ;
   - créer un compte, remplir le petit formulaire (nom de l'appli, description) ;
   - copier la clé affichée.
3. Copier `.env.example` en `.env` et y coller la clé :
   ```
   VITE_RAWG_KEY=ta_cle_ici
   ```
4. Lancer en développement :
   ```bash
   npm run dev
   ```
   puis ouvrir http://localhost:5173 et créer un compte.

**Version de production** :
```bash
npm run build     # génère le dossier dist/
npm run preview   # sert dist/ sur http://localhost:4173
```
Le dossier `dist/` est un site statique.

**Mise en ligne (GitHub Pages)** : le workflow `.github/workflows/deploy.yml` lance les tests, construit le site et le publie à chaque push sur `main`. La clé RAWG est lue depuis le secret `RAWG_KEY` du dépôt (*Settings → Secrets and variables → Actions*), elle n'est jamais dans le code.

> Le mot de passe est chiffré avec l'API Web Crypto du navigateur, qui n'est disponible qu'en **https** ou sur **localhost**. Sur téléphone, il faut donc passer par la version en ligne (https) et pas par l'adresse IP du PC.

**Tests** de la logique métier (badge complet, recherche sans accents, notes) :
```bash
npm test
```

## Architecture

![Architecture](Documentation/architecture.png)

```
src/
├── main.jsx              Point d'entrée (thème appliqué avant le premier rendu)
├── App.jsx               Routes + protection des pages (RequireAuth)
├── index.css             Les 3 thèmes (GameCube, Xbox, PlayStation) en variables CSS + composants de base
├── data/consoles.json    Catalogue des 28 consoles : modèles, specs, ID de plateforme RAWG
├── lib/
│   ├── rawg.js           Appels à l'API RAWG + mise en cache
│   ├── cache.js          Cache localStorage avec date d'expiration
│   ├── games.js          Régions, formats, états, « complet ? », formatage prix/dates, recherche sans accents
│   ├── consoles.js       Accès au catalogue
│   └── password.js       Hash PBKDF2 des mots de passe
├── store/
│   ├── auth.js           Comptes et utilisateur connecté
│   ├── collection.js     Consoles et jeux de chaque compte (ajouter / modifier / supprimer)
│   ├── settings.js       Thème, échelle de note
│   └── toast.js          Notifications
├── components/           Modal, formulaires, cartes, badges, recherche rapide…
└── pages/                Login, Consoles, ConsoleGames, Stats, Wishlist, Settings, NotFound

public/consoles/          Photos des 28 consoles (.webp) + credits.json (source et licence de chaque photo)
.github/workflows/        Mise en ligne automatique sur GitHub Pages
```

Le parcours d'un ajout : la page `ConsoleGames` ouvre `SearchGameModal` → `rawg.js` interroge `/games?platforms=15&search=…` → on choisit un résultat → `GameForm` → `ajouterJeu()` dans le store `collection` → Zustand enregistre dans le localStorage et toutes les pages se mettent à jour.

## Modèle de données

![Modèle de données](Documentation/modele-de-donnees.png)

- Un **jeu** est rattaché à la console du **catalogue** (`consoleId: 'ps2'`) et pas à un exemplaire précis : si on a deux PS2, les jeux sont partagés entre les deux.
- Retirer le dernier exemplaire d'une console retire aussi ses jeux (après confirmation).
- L'ordre choisi à la main est simplement l'ordre du tableau `consoles` : glisser une carte réécrit ce tableau (`reordonnerConsoles()`). Les autres tris ne le modifient pas, ils trient une copie à l'affichage.
- Les notes sont toujours stockées **sur 10** ; l'affichage sur 5 divise simplement par 2.
- On ne garde de RAWG que ce qui sert à l'affichage de la grille (titre, image, date, genres). La fiche complète est rechargée à l'ouverture de la pop-up, avec un cache de 7 jours.

| Clé localStorage | Contenu |
|---|---|
| `retrovault-auth` | comptes (pseudo, sel, hash) + utilisateur connecté |
| `retrovault-collection` | consoles et jeux, rangés par pseudo |
| `retrovault-reglages` | thème, échelle de note, tri de la page Mes consoles |
| `rv-cache:*` | réponses RAWG mises en cache (genres, fiches de jeux) |

## Choix techniques

- **RAWG plutôt qu'IGDB** : IGDB demande un échange de jetons OAuth avec un secret et refuse les appels directs depuis un navigateur (CORS). Il faudrait donc un serveur. RAWG s'utilise directement depuis le front avec une simple clé.
- **ID de plateformes** : les 28 ID de `consoles.json` ont été vérifiés un par un avec l'endpoint `/platforms` de RAWG.
- **Régions** : RAWG ne fournit pas les dates de sortie par région, la région est donc une information de **mon exemplaire** (et sert aux filtres et aux statistiques).
- **Photos des consoles** : photos d'Evan Amos sur Wikimedia Commons, libres de droits (voir Crédits). Elles ont été recadrées et converties en WebP (≈ 15 Ko chacune). Elles sont sur fond blanc : avec `mix-blend-mode: multiply`, le blanc se fond dans le dégradé de la carte, quel que soit le thème.
- **Thèmes** : chaque thème ne fait que redéfinir des variables CSS (couleurs, arrondis, police des titres, motif de fond) sur `<html data-theme="...">`. Les composants n'utilisent que ces variables (`bg-panel`, `text-accent`, `rounded-lg`…), donc ajouter un thème = ajouter un bloc de variables. Les couleurs des graphiques ont été vérifiées pour le daltonisme sur le fond de chaque thème.
- **Glisser-déposer** : avec dnd-kit, la souris doit bouger de 8 px avant que la carte parte (sinon un simple clic ne marcherait plus), et au doigt il faut un appui de 250 ms (sinon on ne pourrait plus faire défiler la page). Piège rencontré : en lâchant une carte, le navigateur envoie un clic sur son lien et ouvrait la console ; ce clic est annulé pendant le déplacement.
- **Performance** : la page Statistiques (et Recharts) n'est chargée qu'à l'ouverture, les vignettes RAWG sont demandées redimensionnées, les recherches sont gardées en mémoire et annulées quand on tape plus vite que le réseau.

## Sécurité et limites

| Point | Ce qui est fait |
|---|---|
| Mots de passe | Jamais stockés en clair : PBKDF2-SHA256, 100 000 itérations, sel aléatoire par compte |
| Message d'erreur de connexion | Identique que le pseudo existe ou non |
| XSS | Tout l'affichage passe par React (pas de `dangerouslySetInnerHTML`) |
| Import de sauvegarde | Fichier vérifié (format, consoles connues) avant de remplacer la collection, avec confirmation |
| Clé RAWG | Dans `.env` (ignoré par git). Elle reste visible dans le code envoyé au navigateur : c'est le fonctionnement prévu par RAWG pour une clé gratuite |

Limite assumée : sans serveur, les données sont propres à un navigateur. L'export / import JSON sert à les sauvegarder ou à les transférer sur un autre appareil.

## Captures

![Les 3 thèmes sur la page Mes consoles](Documentation/captures/00-themes-consoles.png)

| Connexion | Catalogue | Recherche RAWG | Options d'ajout |
|---|---|---|---|
| ![](Documentation/captures/01-connexion.png) | ![](Documentation/captures/03-catalogue.png) | ![](Documentation/captures/07-recherche-just-cause.png) | ![](Documentation/captures/08-options-ajout.png) |

| « Je l'ai déjà ? » | Statistiques | Thème Xbox | Thème PlayStation |
|---|---|---|---|
| ![](Documentation/captures/11-recherche-rapide-wishlist.png) | ![](Documentation/captures/13-stats.png) | ![](Documentation/captures/16-consoles-xbox.png) | ![](Documentation/captures/17-consoles-playstation.png) |

Version ordinateur :

![Page d'une console sur ordinateur](Documentation/captures/21-desktop-console.png)
![Statistiques sur ordinateur](Documentation/captures/23-desktop-stats.png)
![Thème Xbox sur ordinateur](Documentation/captures/25-desktop-console-xbox.png)
![Thème PlayStation sur ordinateur](Documentation/captures/25-desktop-console-ps1.png)

## Crédits

Données et images des jeux : [RAWG.io](https://rawg.io).

Photos des consoles, via Wikimedia Commons :
- **Evan Amos** ([Vanamo Online Game Museum](https://commons.wikimedia.org/wiki/User:Evan-Amos)) pour 27 consoles : 24 photos dans le **domaine public**, celles de la Mega Drive, de la Dreamcast et de la Neo Geo sous licence **CC BY-SA 3.0** ;
- **Takimata** (retouches Tokyoship) pour la Wii U, sous licence **CC BY-SA 3.0**.

Le lien, l'auteur et la licence de chaque photo sont dans `public/consoles/credits.json`.

Les noms et marques des consoles appartiennent à leurs propriétaires ; les thèmes s'en inspirent librement, sans logo officiel.

## Auteur

**Kilian Carasco** — étudiant en Bachelor Concepteur Développeur d'Applications (EPSI Bordeaux)
[Portfolio](https://kiliandev.netlify.app) · [GitHub](https://github.com/Vador634) · [LinkedIn](https://www.linkedin.com/in/kilian-carasco-029915399/)
