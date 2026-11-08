# Avis JOUABILITÉ et GAME DESIGN : tout le jeu (nov. 2026)

Avis d'un game designer, centré sur la prise en main, surtout AU DOIGT. Méthode économe : lecture du code et des
réglages, chiffres des audits existants (aucune nouvelle partie de bot), 7 captures sur un téléphone simulé
(915 × 412, tactile). Aucun fichier du jeu n'a été modifié. Règle suivie : **on ne rallonge rien**, on signale ce qui traîne.
Les idées refusées dans `greg_avis_fun.md` (rythme du combat, Dempsey) ne sont pas reprises ici.

---

## 1. En 5 lignes
- **Ce qui marche** : 6 jeux vraiment différents, et chacun a une bonne idée centrale facile à comprendre. Les retours sont forts quand on réussit (ralentis, secousses, « CONTRE !! », « PARFAIT »). REJOUER saute les intros, c'est bien.
- **Ce qui gêne le plus** : **trop d'écrans avant de jouer**. Il faut passer règles, présentation, difficulté (et parfois coin / cinématique) À CHAQUE visite depuis le hub. C'est ce qui donne l'impression que « c'est long ».
- **Au doigt** : les écrans de texte ne se ferment qu'avec le petit bouton OK en bas à droite. Toucher l'écran ne fait rien, alors que c'est le premier réflexe.
- **Lisibilité** : beaucoup de textes en 14-16 px. Sur téléphone, ils font 10-12 px : illisibles en pleine action.
- **Julien** est de loin le boss le plus long (≈ 8-9 min). Si on perd tard dans la manif, on recommence toute la manif.

---

## 2. Problèmes communs à tout le jeu

| # | Problème ressenti | Solution | Effort |
|---|---|---|---|
| C1 | **On relit tout à chaque visite.** Au 2e essai depuis le hub, on repasse règles + présentation + difficulté (+ coin chez Greg, cinématique chez Beufa) : 3 ou 4 appuis avant de jouer. | Dans `src/core/BossScene.js` : `afficherIntro` et `afficherPresentation` ne s'affichent que la **1re fois** (`Sauvegarde.fait('intro_' + id)`). Les fois suivantes, on va droit à la difficulté, déjà placée sur la dernière choisie. Pour relire les règles : une ligne « Revoir les règles » dans le menu pause (`PauseScene.js`). | petit |
| C2 | **Toucher l'écran ne ferme pas les écrans de texte.** Règles, présentation, coin de Greg, dialogues : seul le bouton OK marche, et il est dans le coin. | Dans `afficherIntro` / `afficherPresentation` : un toucher **n'importe où**, après 0,4 s, vaut OK. Penser à attendre que le doigt soit levé avant de lancer le jeu, comme le fait déjà `attendreRelache` de la porte de Rémi : sinon le toucher qui ferme l'écran frappe aussi. | petit |
| C3 | **Choisir la difficulté demande 2 gestes différents** : toucher une carte, puis aller chercher OK. Au hub, au contraire, on retouche la case. | Retoucher la carte déjà choisie = valider, comme au hub. Les 5 `difficulte.js` sont des copies (`beufa`, `greg`, `kedric`, `lionel`, `remi`) : la ligne `cartes.forEach(... pointerdown ...)` est à changer partout. Mieux : en faire un seul fichier dans `src/core/`. | petit |
| C4 | **Textes trop petits sur téléphone.** Le jeu fait 960 × 540 et il est réduit d'environ 0,76 : un texte de 14 px s'affiche en 10 px. Exemples : aide du hub, bandeau du bas de Beufa (« Sprint : bruyant… »), « NORMAL » de Beufa, haut de l'écran de Kédric, conseils du coin de Greg (16 px). | Règle simple : **18 px minimum** pour tout ce qu'on doit lire en jouant, **22 px** pour une consigne d'action. Une ligne courte vaut mieux qu'une longue phrase en petit. Cela fait environ 30 lignes `texte(..., 14/15/16, ...)` à revoir. | moyen |
| C5 | **Règles trop longues** : Kédric en a 9 lignes, Beufa 8, Julien et Greg 5 à 7. Personne ne retient 9 règles avant d'avoir joué. | Modèle Lionel : **4 lignes au plus** (le but, et seulement les commandes), puis le reste s'apprend en jouant avec des messages « 1re fois » (Rémi le fait déjà pour la 1re roulette et la 1re balle folle). | moyen |
| C6 | **Le bouton pause « II » change de place** : en haut au milieu (hub, Kédric, Julien, Rémi), en haut à droite (Beufa, Greg, Lionel). Au hub, il **cache le titre** ; chez Rémi, il cache le score. | Toujours **en haut à droite** (Greg le fait déjà avec `rangerBoutonPause`, à mettre dans `src/core/tactile.js` pour tous). **Caché au hub**. | petit |
| C7 | **Vibrations seulement chez Greg et Kédric.** Au doigt, une petite vibration est le retour le plus direct, et elle ne coûte rien. | Une fonction `vibrer(ms)` dans `src/core/` (qui ne fait rien si le téléphone ne sait pas vibrer). À appeler : Beufa repéré « ! » (60) et attrapé (120) ; Julien touché (40) ; Rémi chute à vélo (80), but marqué ou encaissé (50), coup dans la porte (30) ; Lionel point marqué (50), arrêt parfait (30). Un réglage dev pour la couper. | petit |
| C8 | **Boutons qui ne servent à rien** : la croix ▲◀▼▶ au hub (on touche les cases), et OK pendant l'infiltration de Beufa (Espace n'y fait rien). Un bouton inutile, c'est un pouce qui hésite. | Hub : `etiquettesTactiles({ espace: 'Combattre', z: null, x: null, haut: null, bas: null, gauche: null, droite: null })` dans `HubScene.js` l. 29. Beufa : `espace: null` dans `boutonsJeu` (`BeufaInfiltration.js` l. 58). | petit |

---

## 3. Boss par boss

### Hub (écran de sélection)
- **La croix couvre la case de Greg et la barre des badges** (capture) → retirer la croix (C8). Garder seulement « Combattre ». · petit
- **« II » couvre le titre** → le cacher au hub (C6). · petit
- **La case choisie se voit mal** (cadre pâle sur fond bleu vif) → cadre jaune épais qui pulse, et la case légèrement agrandie (×1,05) dans `majChoix()`. · petit
- L'entrée façon Mega Man (≈ 1,6 s) est courte et fait plaisir : à garder.

### Beufa (infiltration + quiz)
- **Le quiz traîne** : après CHAQUE réponse, il faut toucher pour passer la réplique de Beufa (10 fois). → Après une bonne réponse, la réplique passe toute seule au bout de 1,5 s (toucher = plus vite). Les moqueries après une erreur restent à toucher, c'est le moment drôle. (`BeufaQuiz.js` l. 272.) · petit
- **60 s par question, c'est un chrono qui ne met aucune pression** (déjà noté dans `beufa_audit.md`) → NORMAL 60 → **30 s**, EASY 75 → 45, VERY EASY 90 → 60 (`DIFFICULTES.*.temps` dans `beufa/reglages.js`). Le quiz devient plus court ET plus tendu. · petit
- **Bouton OK inutile pendant l'infiltration** (C8). En option : pousser le joystick **jusqu'au bord** = sprint, ce qui libère un pouce (`joystick.js` de Beufa, seuil ≈ 90 % du rayon). Le bouton Sprint resterait pour ceux qui le préfèrent. · petit / moyen
- Le bandeau du bas (« Sprint : bruyant… ») est illisible sur téléphone (C4).

### Kédric (courses + battle de danse)
- **Le glissé du doigt ne réagit qu'au LEVER du doigt** (`installerBalayage`, `pointerup`) : on perd 0,1 à 0,2 s, alors que le jeu récompense l'esquive « au dernier moment ». → Déclencher dès que le doigt a parcouru 40 px (`pointermove`), une seule fois par toucher. · petit
- **Le haut de l'écran est surchargé** pendant la course : portrait du coach, bulle, TOUCHDOWNS, consigne, COURSE 1/3, « en-but à 152 », score, plus les jauges VITESSE et GHOST sur les côtés. → Pendant la course, ne garder que COURSE 1/3 et la barre de progression. Le score et les touchdowns s'affichent entre les courses. Message « reste synchro » (`KedricCourse.js` l. 286) : il parle d'une règle jamais expliquée → « Réception ratée : tu pars lentement. Esquive pour accélérer ! ». · petit
- **9 lignes de règles** (C5) → garder 4 lignes : « Traverse le terrain », « ◀ ▶ couloir, ▲ saute, ▼ tourne », « Fais ce que dit le symbole », « Puis le BATTLE de danse ». GHOST, poursuivant et super réception s'expliquent la 1re fois qu'ils arrivent. · petit
- **Le battle dure 2 min et c'est la plus grosse partie du boss** (audit : ≈ 75 % du temps). → 2e manche 60 → **40 s** (`showtime.manches[1].duree`), en coupant la musique sur une fin de phrase. Les « SUPER POUVOIR » de Kédric ne doivent pas arrêter le jeu plus de 1 s. · petit

### Julien (manif + lycée + classe)
- **Le boss le plus long** : manif (temps de référence 3:30) + lycée (2-3 min) + classe (≈ 2:30), soit ≈ 8-9 min. Et **perdre dans la manif = tout recommencer**, alors que la classe a déjà son point de reprise. → **Point de reprise à l'entrée de chaque zone de la manif** (les `ZONES` existent déjà dans `niveau_manif.js` ; même principe que `this.reprise` de la classe : vie pleine, munitions de l'entrée de la zone). C'est la plus grosse source de frustration du jeu. · moyen
- **Tourner avec ↺ ↻, c'est le point faible des FPS sur téléphone** : on tourne à vitesse fixe, on vise mal, et le pouce droit doit choisir entre tourner et LANCER. → **Glisser le pouce sur la moitié droite de l'écran = tourner** (comme tous les jeux de tir mobiles). LANCER reste un bouton. ↺ ↻ peuvent rester en option (réglage `R.joueur.tactile`). Bonus : les boutons ↺ ↻ cachent aujourd'hui la boussole « LYCÉE » de la barre du bas (capture). · moyen
- **Le lycée rallonge la chaîne** → une fois fini, il devient facultatif : dans le menu de difficulté, « direct à la classe », comme ce qui existe déjà pour la manif (touche 2 / ▶). · petit

### Greg (boxe)
(Rien sur le rythme ni le Dempsey : déjà refusé.)
- **4 écrans avant le premier coup** : règles, présentation, difficulté, puis le COIN du round 1 avec 4 conseils serrés en 16 px. → Le coin du round 1 ne montre qu'**1 conseil** en gros. Aux rounds 2 et 3, il se ferme tout seul après 3 s (toucher = plus vite). `CONSEILS` dans `greg/reglages.js` et `coin` dans `GregCombat.js` l. 1195. · petit
- **Les gestes sont invisibles** : la moitié gauche défend, la moitié droite tape, et la ligne visage / corps ne se voit pas. → Pendant le round 1, montrer la ligne de séparation (pointillés très légers) et les deux moitiés (« ESQUIVE / GARDE » à gauche, « VISAGE / CORPS » à droite) en 20 px, puis les faire disparaître. (`gestes.js`, le texte d'aide en 15 px existe déjà.) · petit

### Rémi (vélo, babyfoot, porte)
- **3 écrans de règles en ≈ 3 min de jeu** (un par mini-jeu), plus la présentation et la difficulté. → Pendant la soirée complète, les règles du babyfoot et de la porte deviennent un **bandeau de 3 s dans le jeu** (« Place ton gardien du côté où Rémi se penche ! »), au lieu d'un écran à fermer. L'écran complet reste pour l'accès direct. · petit
- **Le babyfoot reste le moment qui traîne** (avis précédent : près de la moitié du temps passé à viser). → `BABY.buts` 5 → **4** : environ 25 % de temps en moins sans changer une règle. · petit
- Le vélo (≈ 45 s) et la porte (≈ 20 s) ont la bonne durée : ne pas les rallonger.

### Lionel (frisbee)
- **C'est le modèle à suivre** : 4 lignes de règles, « le reste, l'entraînement te le montre », sets de 30 s, joystick + 2 boutons.
- Seul point : « Lob » et « Lancer » font la même taille, alors que Lancer sert 5 fois plus. → Lancer plus gros (≈ 1,3 ×), Lob plus petit au-dessus (CSS de `tactile.js` : classe propre à Lionel, ou `disposition` dédiée). · petit

---

## 4. Ce qu'il ne faut PAS toucher
- **La boucle de chaque boss** : esquive → contre (Greg), rondes → passer dans le dos (Beufa), symbole → bon geste (Kédric), viser au billard (Rémi), cercle vert → lancer (Lionel), dos tourné = fonce (Julien classe).
- **Les durées de Lionel (sets de 30 s), du vélo (≈ 45 s) et de la porte (≈ 20 s)** : bonnes.
- **REJOUER qui saute les intros**, et le point de reprise de la classe de Julien.
- **Les réglages du tactile déjà calés à la main** : compensation du toucher et fenêtres ×1,5 du battle de Kédric, mémoire d'esquive de Greg, boutons géants de Kédric.
- **Les gestes de Greg** (choisis par Fabien) : on ajoute seulement de quoi les voir (point Greg 2).
- **L'entrée façon Mega Man du hub** et l'ombre des boss pas encore battus.

---

## 5. Les choix pour Fabien (gros gain / petit effort d'abord)

1. **Règles et présentation seulement la 1re fois** (on peut les revoir depuis la pause) : C1. Petit effort, le plus gros gain contre « c'est long ».
2. **Toucher n'importe où = OK** sur les écrans de texte : C2. Petit.
3. **Julien : point de reprise à chaque zone de la manif**. Moyen.
4. **Retirer les boutons inutiles** (croix du hub, OK de Beufa) et **pause toujours en haut à droite, cachée au hub** : C6 + C8. Petit.
5. **Beufa quiz : 30 s par question en NORMAL** et réplique après une bonne réponse qui passe toute seule. Petit.
6. **Kédric : glissé qui réagit tout de suite** (sans attendre le lever du doigt). Petit.
7. **Retoucher la carte de difficulté = valider** (comme au hub) : C3. Petit.
8. **Vibrations dans tous les boss** : C7. Petit.
9. **Kédric : haut de l'écran allégé + règles en 4 lignes + 2e manche du battle à 40 s**. Petit.
10. **Greg : coin du round 1 avec 1 seul conseil, coins suivants fermés au bout de 3 s ; zones des gestes visibles au round 1**. Petit.
11. **Rémi : règles du babyfoot et de la porte en bandeau dans le jeu ; babyfoot en 4 buts**. Petit.
12. **Julien : tourner en glissant le pouce à droite** (↺ ↻ en option). Moyen.
13. **Textes de 18 px minimum en jeu** (passe sur les 6 boss) : C4. Moyen.
14. **Julien : lycée facultatif une fois fini**. Petit.
15. **Lionel : bouton Lancer plus gros que Lob ; hub : case choisie bien visible**. Petit.

Images : aucune nouvelle image n'est nécessaire pour ces choix. Tout se fait au code ou dans les réglages.
