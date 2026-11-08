# Analyse comparée : Les Bracass' face aux jeux du même genre (nov. 2026)

Avis d'un game designer. Pour chaque boss : 2 à 4 jeux connus du même genre, ce qu'ils font de mieux, et ce qu'on peut
leur emprunter (l'idée, pas leurs personnages, images, musiques ou niveaux).
Méthode économe : lecture des réglages et survol du code. Aucune partie de bot, aucune capture, aucun fichier du jeu modifié.
Règles suivies : **rien ne rallonge une partie** ; rien de ce qui est déjà fait ou refusé
(`avis_jouabilite_global.md` : reprise dans la manif, haut de l'écran de Kédric, 2e manche à 40 s, tourner en glissant ;
`greg_avis_fun.md` : rallonger Greg, Dempsey plus rare).

---

## 1. Les 5 grandes leçons de ces jeux
- **Prévenir avant d'agir, avec l'image ET le son** (Punch-Out, Metal Gear, Rhythm Heaven) : le joueur lit l'adversaire, pas un texte.
- **Un geste simple = une action**, sous le pouce, sans viser un petit bouton (Subway Surfers, WarioWare, les FPS mobiles).
- **Chaque réussite se SENT** : arrêt sur image de quelques centièmes, flash, vibration. C'est ce qu'on appelle le « game feel ».
- **Jouable son coupé** : sur téléphone, entre amis, le son est souvent coupé. Toute info sonore doit aussi se voir.
- **Donner envie de rejouer avec un score, pas avec plus de contenu** : une lettre de rang, un chrono à battre, un résultat à montrer aux copains.

---

## 2. Boss par boss

### Hub (écran de sélection)
**Jeux de référence**
- *Mega Man 2 / Mega Man 11* : grille de boss, on voit d'un coup d'œil qui est battu.
- *Street Fighter II* (écran de choix) : le curseur, le portrait, le nom : tout est lisible en une seconde.
- *WarioWare / Mario Party* : avant un mini-jeu, une petite fiche dit le genre, le geste et la durée.
- *Celeste / Angry Birds* : chaque niveau affiche la meilleure note obtenue (fraises, étoiles) : on a envie d'y retourner.

**À emprunter**
1. **La meilleure lettre de rang sur chaque case** (S, A, B… en tampon dans un coin, comme les étoiles d'Angry Birds).
   → `caseBoss()` de `src/hub/HubScene.js` : `Sauvegarde.record(boss.id).rang` est déjà lu pour la ligne d'info ; l'afficher
   aussi sur la case (22 px, contour noir). → **petit**
2. **Une fiche d'une ligne façon Mario Party** sous la grille : « Infiltration · ≈ 4 min · joystick » pour le boss choisi.
   Pour un groupe d'amis, ça aide à choisir quoi lancer.
   → champ `fiche` dans le `index.js` de chaque boss, affiché à la place de `info` dans `majChoix()`. → **petit**
3. **Montrer son résultat aux copains** (tous les jeux mobiles le font) : sur l'écran de fin de chaque boss, un bouton
   « Partager » qui envoie « J'ai eu S contre Greg en 1'12 ! » par WhatsApp / SMS (`navigator.share`, rien si le
   téléphone ne sait pas). → une fonction dans `src/core/`, appelée par les 6 écrans de fin. → **moyen**

### Beufa (infiltration + quiz)
**Jeux de référence**
- *Metal Gear Solid* (PS1) : le « ! », le radar, l'alerte : on sait toujours où on en est.
- *Metal Gear Solid VR Missions* : des salles très courtes et un chrono par salle : on rejoue pour battre son temps.
- *Mark of the Ninja* : le BRUIT et la VUE sont dessinés (cercles de bruit, cônes) : rien à lire.
- *Buzz! / Kahoot* (quiz) : répondre vite rapporte plus : la tension vient toute seule.

**À emprunter**
1. **Le cône change de couleur pendant qu'il te repère** (Mark of the Ninja) : jaune pâle → orange → rouge selon la
   jauge, au lieu d'un petit « ? ». On voit le danger monter dans le cône lui-même.
   → `BeufaInfiltration.js` l. 1158 : couleur de `dessinerCone` calculée avec `g.jauge` (aujourd'hui seulement jaune ou
   rouge en poursuite). → **petit**
2. **Le cercle de bruit visible** (Mark of the Ninja) : quand on sprinte ou qu'on marche dans une flaque, un cercle
   blanc s'élargit autour de Beufa jusqu'à `R.joueur.bruit` (180 px) ou `bruitFlaque` (150 px). On comprend
   « sprint = bruyant » sans lire la consigne du bas. → `BeufaInfiltration.js`, à côté du dessin des cônes. → **petit**
3. **Le temps de chaque pièce à la sortie** (VR Missions) : « PIÈCE 2/4 — PASSÉ ! 0'48 (record 0'41) ». Ça ne rallonge
   rien, ça donne envie d'aller plus vite. → message de la l. 714 + record par pièce dans `Sauvegarde`. → **petit**
4. **Quiz : bonus de rapidité** (Buzz!) : réponse juste en moins de 10 s = quelques points de rang en plus. Les joueurs
   répondent plus vite, donc le quiz raccourcit tout seul. → `quiz.rang` dans `beufa/reglages.js` (nouveau
   `bonusVite`), compté dans `BeufaQuiz.js`. Après chaque changement : `node outils/beufa_verif.mjs`. → **petit**

### Kédric (courses + battle de danse)
**Jeux de référence**
- *Subway Surfers / Temple Run 2* : un glissé = une action, l'obstacle se reconnaît de loin à sa forme.
- *Rhythm Heaven* (Nintendo) : tout le décor bat la mesure ; on peut jouer « à l'œil » autant qu'à l'oreille.
- *Just Dance* : les pictogrammes du prochain pas défilent avant qu'il arrive ; la note (« PERFECT ») est énorme.
- *Friday Night Funkin'* : le duel de flèches : on lit son adversaire, la jauge entre les deux est le seul HUD.

**À emprunter**
1. **Tout bat la mesure** (Rhythm Heaven) : les 4 cibles du battle grossissent d'un poil sur chaque temps
   (`M.tempo.temps` est déjà connu dans `showtime.js`), et le public / le fond pulse aussi. Le battle reste jouable
   téléphone en silencieux, et on tape plus juste. → `showtime.js`, dans `maj()`. → **petit**
2. **Les flèches ont la couleur de leur couloir** (FNF, DDR) : ◀ violet, ▼ bleu, ▲ vert, ▶ rouge (ou au choix), aussi sur les
   cibles. L'œil reconnaît une couleur plus vite qu'une flèche. Attention : garder le ROUGE et l'OR distincts des
   flèches rouges (CHAMPION) et dorées (piège). → `showtime.js`. → **petit**
3. **Le pas de Kédric annonce la flèche suivante** (Just Dance) : sur une flèche sur quatre, Kédric fait déjà la pose
   du côté de la prochaine flèche. On lit le danseur, pas seulement la piste. → `showtime.js` (poses existantes,
   retournées). Seulement si les images actuelles le permettent. → **moyen**

### Julien (manif + lycée + classe)
**Jeux de référence**
- *Wolfenstein 3D / Doom* (1992-93) : le visage du héros regarde d'où vient le coup ; la carte ; les bonus.
- *Doom 64 / Doom II RPG* sur téléphone : contrôles réduits, visée très aidée.
- *Call of Duty Mobile*, « mode simple » : l'arme tire TOUTE SEULE quand la mire est sur un ennemi.
- *Resident Evil 3 / Doom 64* (demi-tour rapide) : un appui = se retourner d'un coup.

**À emprunter**
1. **Tir automatique** (CoD Mobile, mode simple) : quand l'aide à la visée trouve déjà un policier (`oeufs.aideTactile`,
   ≈ 10°) et qu'il est à portée, l'œuf part tout seul à la cadence normale. Le pouce droit ne fait plus que tourner :
   c'est le vrai problème des FPS au doigt. Le bouton LANCER reste (pour viser un sac de farine, par ex.).
   → nouveau réglage `R.joueur.tactile.tirAuto: true` + test dans la boucle de tir de `JulienManif.js`, `JulienLycee.js`,
   `JulienClasse.js`. Après changement : `node outils/julien_verif.mjs`. → **petit à moyen**
2. **Demi-tour éclair** (Doom 64, Resident Evil) : toucher deux fois vite ↺ ou ↻ = demi-tour en 0,2 s. Utile quand un
   CRS ou un pion charge dans le dos. → `commandes.js` (double appui), rotation de π animée. → **petit**
3. **Bord rouge du côté du coup** (tous les FPS depuis Doom) : `degats()` sait déjà de quel côté vient le coup
   (`j.regard`, l. 446). Ajouter une lueur rouge 0,3 s sur ce bord de l'écran. Au doigt, on ne regarde pas le petit
   visage en bas. → `JulienManif.js` l. 439 (même chose dans le lycée). → **petit**

### Greg (boxe)
(Rien sur la durée du combat ni le Dempsey : refusé.)
**Jeux de référence**
- *Punch-Out!!* (Wii, 2009) : chaque coup de l'adversaire a sa pose ET son petit son d'annonce : on finit par jouer à l'oreille.
- *Super Punch-Out!!* (SNES) : coups ultra-courts, gros retour à l'impact, on enchaîne les combats vite.
- *Hajime no Ippo* (jeux PS2/Wii) : esquive puis contre, avec un gros effet manga sur le contre.

**À emprunter**
1. **Un son d'annonce par coup de Greg** (Punch-Out Wii) : jab = petit souffle, crochet = grognement, foie = « hop »,
   SMASH = gants qui claquent. Joué au début de `prepa`. On apprend Greg à l'oreille, et ça marche aussi avec le
   « ! » quand on regarde ses doigts. → champ `son` dans `ATTAQUES` (`greg/reglages.js` l. 205), joué dans
   `GregCombat.js` au lancement du coup. Sons à prendre parmi ceux qui existent déjà, ou petits sons libres. → **petit**
2. **Micro-arrêt sur image à chaque coup qui touche** (tous les jeux de combat) : 0,05 s figé (`figer(0.05)` existe,
   l. 217) sur un coup normal, 0,1 s sur un contre. Les coups « pèsent » sans changer un seul chiffre de dégâts ni la
   durée du combat (50 coups x 0,05 s = 2,5 s). → `GregCombat.js`, là où un coup du joueur touche. → **petit**

### Rémi (vélo, babyfoot, porte)
**Jeux de référence**
- *WarioWare: Touched!* (DS) : avant chaque jeu, UN verbe géant (« SAUTE ! ») et le dessin du geste. 1 seconde, compris.
- *Mario Party* : on peut essayer les commandes PENDANT qu'on lit la règle ; résultats avec des « étoiles bonus » rigolotes.
- *Canabalt / Alto's Adventure* : runner à un seul geste, le décor dit tout.
- *Mario Golf* (barre de puissance) : maintenir, lâcher au bon moment : la porte de Rémi est de cette famille.

**À emprunter**
1. **Le verbe + le dessin du geste** (WarioWare) : le bandeau de 3 s devient 1 mot énorme + un doigt dessiné au code qui
   tape / maintient / glisse (« SAUTE ! », « ARRÊTE ! », « COGNE ! »). Plus court à lire que la phrase actuelle.
   → `bandeauRegle()` de `src/bosses/remi/commun.js` (paramètre `geste`). Réutilisable dans les autres boss. → **petit**
2. **Essayer en lisant** (Mario Party) : sur l'écran de règles d'un mini-jeu lancé seul, le geste marche déjà (le vélo
   saute sur place, le gardien suit le doigt). On apprend sans perdre une vie, et sans écran en plus.
   → les 3 scènes, un état « essai » pendant `attendreOK`. Penser à `remi_baby_bot.mjs` si on touche au babyfoot. → **moyen**
3. **Des « étoiles bonus » à la fin de la soirée** (Mario Party) : 1 ou 2 titres drôles tirés des chiffres déjà comptés
   (« Roi de la gamelle », « 0 chute », « Videur ? Jamais vu »). Une ligne de plus sur le bilan, pas un écran de plus.
   → `bilanDe()` / `noterJeu()` de `commun.js`. → **petit**

### Lionel (frisbee)
**Jeux de référence**
- *Windjammers* (Neo Geo, 1994) : déjà la base du boss : sets courts, lancers droits / biais / lob, supers.
- *Rocket League Sideswipe* (mobile) : matchs de 2 min, 2 gros boutons, joystick qui apparaît sous le pouce.
- *Mario Tennis Aces* : le « coup spécial prêt » se voit sur le joueur lui-même, pas seulement dans une jauge.

**À emprunter** (Lionel est validé : seulement de la finition)
1. **Le bouton Lancer prend feu quand le super est prêt** (Mario Tennis) : bord orange qui pulse sur le bouton tactile
   lui-même. Le pouce sait sans regarder la jauge en haut. → `LionelMatch.js` + classe CSS dans `tactile.js`. → **petit**
2. **Après un point, arrêt sur image + zoom léger sur le mur touché** (Rocket League, l'explosion du but) dans les
   1,7 s de pause qui existent déjà (`pauseApresPoint`) : même durée, plus de plaisir. → `LionelMatch.js`. → **petit**

---

## 3. Les choix pour Fabien (gros gain / petit effort d'abord)

1. **Julien : tir automatique quand la mire est sur un policier** (le pouce droit ne fait que tourner). Petit à moyen.
2. **Kédric : tout bat la mesure au battle** (cibles et fond qui pulsent sur le temps : jouable son coupé). Petit.
3. **Greg : micro-arrêt sur image à chaque coup qui touche** (0,05 s, 0,1 s sur un contre). Petit.
4. **Beufa : cône qui passe du jaune au rouge pendant qu'il te repère**. Petit.
5. **Hub : meilleure lettre de rang affichée sur chaque case**. Petit.
6. **Greg : un son d'annonce différent pour chaque coup de Greg**. Petit.
7. **Julien : bord rouge du côté d'où vient le coup** + **demi-tour éclair** (double appui sur ↺ ou ↻). Petit.
8. **Beufa : cercle de bruit visible quand on sprinte ou marche dans une flaque**. Petit.
9. **Rémi : verbe géant + doigt dessiné au lieu de la phrase du bandeau** (à étendre ensuite aux autres boss). Petit.
10. **Kédric : flèches de couleur selon le couloir**. Petit.
11. **Beufa : temps de chaque pièce affiché à la sortie (avec record)** + **bonus de rapidité au quiz**. Petit.
12. **Lionel : bouton Lancer en feu quand le super est prêt** + **arrêt sur image après un point**. Petit.
13. **Hub : fiche d'une ligne (genre · durée · commandes) pour le boss choisi**. Petit.
14. **Rémi : « étoiles bonus » drôles sur le bilan de la soirée**. Petit.
15. **Partager son résultat aux copains** (bouton sur les 6 écrans de fin) ; **Rémi : essayer le geste sur l'écran de
    règles** ; **Kédric : la pose de Kédric annonce la flèche suivante**. Moyen chacun.

Images : aucune nouvelle image n'est nécessaire pour ces choix (doigts, cercles, couleurs et lettres se dessinent au code).
Seule exception possible : le choix 15 (pose de Kédric) si les poses actuelles ne suffisent pas ; on vérifiera avant.
