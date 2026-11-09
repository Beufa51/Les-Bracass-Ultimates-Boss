# FINALE : le MÉCHA DES BRACASS' (proposition, nov. 2026)

Choix de Fabien : **le héros, dans son vaisseau, contre le mécha formé par les 6 Bracass'**, en shoot'em up.
Ce document attend sa validation (points ❓ en fin de fichier). Prompts d'images : `propositions/finale_prompts_images.md`.

## 1. Quand et comment on y joue
- Au retour au hub après le **6e badge** : l'écran tremble, sirène, bandeau « ALERTE : LES BRACASS' FUSIONNENT ! »,
  puis départ direct vers la finale (au lieu de l'écran fixe actuel).
- Ensuite, à rejouer depuis le hub : la **grande case du MILIEU** (FAIT, nov. 2026 : 3 boss à gauche, 3 à droite, façon
  Mega Man). Verrouillée (« ? » + 🔒 x / 6) tant que les 6 ne sont pas battus ; en attendant le mécha, elle lance la fin
  actuelle.
- Durée visée : **3 à 4 min** en NORMAL. C'est la récompense, pas un mur.

## 2. Vue et commandes
- **Vue du dessus, défilement de gauche à droite** : ton vaisseau à gauche, le mécha occupe le tiers droit. (Le jeu est en
  paysage 960 x 540 : un défilement vertical ne laisserait que 540 px de haut pour esquiver ; à l'horizontale on a 960 px.)
- **Téléphone** : un doigt n'importe où, le vaisseau suit le mouvement du doigt **en décalé** (on ne le cache jamais
  sous le pouce). **Tir automatique**. Un 2e doigt (ou le bouton BOMBE) = **BOMBE**.
- **Clavier** : flèches pour bouger, tir automatique, ESPACE = BOMBE.
- **Point d'impact minuscule** (un point lumineux au centre du vaisseau) : seuls les tirs qui touchent ce point comptent.
  C'est la règle qui rend les shoot'em up justes.
- **5 cœurs** (FACILE 7, CHAMPION 3), 1,5 s d'invincibilité clignotante après un coup.
- **BOMBE** (2 par partie, +1 à chaque partie du mécha détruite) : efface tous les tirs à l'écran, « LE CRI DES BRACASS' ».

## 3. Le mécha : 6 parties, 6 potes, 6 phases
Chaque partie a sa barre de vie et ses attaques, **toujours annoncées** comme dans le reste du jeu (ligne rouge, couloir
qui clignote, « ! » façon MGS). Une partie détruite : le pote est **éjecté en parachute** avec une réplique.

| Ordre | Partie | Pote | Attaques (douce → technique) |
|---|---|---|---|
| 1 | Jambe droite | **Kédric** | ballons en spirale ; **BLITZ** : une rangée de défenseurs-missiles charge dans un couloir annoncé |
| 2 | Jambe gauche | **Rémi** | pintes en cloche qui laissent une flaque de mousse (te ralentit) ; **TOURNÉE GÉNÉRALE** : 8 pintes en éventail |
| 3 | Bras gauche | **Lionel** | frisbees qui rebondissent sur les bords ; **SUPER LANCER** enflammé (trait d'annonce, puis traversée éclair) |
| 4 | Bras droit | **Greg** | **POING-FUSÉE** (ligne rouge, puis le poing traverse) ; **DEMPSEY ROLL** : le poing balaie l'écran en 8 |
| 5 | Tête | **Julien** | pluie de copies et d'œufs ; **INTERRO SURPRISE** : rafale lente mais dense de « 20/20 » |
| 6 | Cœur (cockpit) | **Beufa** | **CÔNE DE VISION** qui balaie : dedans, rafale ciblée « ! » ; hors du cône, rien. Dernières 20 s : tous les motifs en version douce |

Fin : le mécha explose, puis la **cinématique de fin** (§ 5).

## 4. Difficulté, rang, défis
- **FACILE** (proposé par défaut la 1re fois) / **NORMAL** / **CHAMPION**. Pas d'entraînement.
- **Reprise** : un GAME OVER propose « CONTINUER » à la partie du mécha atteinte (sans record), ou « tout recommencer ».
  Même logique que la reprise du hub.
- **Rang** (format du jeu « NOM (lettre) ») : vie restante + temps + bombes gardées. Noms proposés ❓ :
  S « ULTIME BRACASS' », A « RANGER ROUGE », B « CADET DE L'ESPACE », C « PILOTE DU DIMANCHE ».
- **Défis** (dans PROGRÈS) : « Sans être touché », « Sans utiliser de bombe », « En moins de 3 minutes ».
- Réglage au **bot** (méthode habituelle) : un pilote qui esquive (expert, moyen, enfant) et 30 parties par difficulté.
  But en NORMAL : le joueur moyen gagne en 1 à 3 essais.

## 5. La vraie FIN (remplace l'écran fixe)
1. Le mécha explose au ralenti ; les 6 potes tombent en tas, un peu sonnés (dessin au code ou image n° 4).
2. **Photo de groupe** : les 6 poses de l'intro (`intro_pose_*.png`, DÉJÀ là) qui arrivent une par une, avec ton vaisseau
   posé à côté, puis flash « LES BRACASS' AU COMPLET ! ».
3. **Bilan de ta partie entière** : les 6 rangs (« BIG BOSS (S) »...), défis x/21, temps du mécha.
4. **Générique** qui défile (`CREDITS.md`) avec une réplique culte de chaque boss.
5. Retour au hub. Le mécha et la fin restent rejouables.

## 6. Comment je le construirais (par étapes, chacune jouable)
1. **Prototype au code** (1 séance) : vaisseau, tirs, les 6 parties en formes simples, les attaques, la difficulté.
   Les images ne sont pas nécessaires pour jouer (`fichier: null` = dessin provisoire, comme les autres boss).
2. **Images** : tu génères les 6 parties + le vaisseau (prompts prêts), je les découpe et je les branche.
3. **Cinématique de fin** (1 séance).
4. **Bot + équilibrage + vérification** (1 séance) → rapport, puis tes retours.

Fichiers prévus : `src/finale/` (`FinaleMecha.js`, `reglages.js`, `motifs.js`, `manifeste.js`), `FinaleScene.js` refaite,
`outils/finale_bot.mjs`. Le mécha n'est PAS une 7e case du hub (la grille reste à 6).

## ❓ À valider par Fabien
1. Le défilement **horizontal** (vue du dessus) : OK ?
2. L'**ordre des potes** et leurs **attaques** (tableau § 3) : à changer ?
3. Les **noms de rang** (§ 4) : ceux-là ou les tiens ?
4. **Musique** : laquelle ? (ex. un générique Power Rangers / Bioman / Goldorak ; tu fournis le mp3 comme pour les autres.)
5. On lance l'étape 1 (prototype au code) ?
