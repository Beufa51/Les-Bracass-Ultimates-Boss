# NOTES : état du projet "Les Bracass'"

## Où on en est
**Étape 0 terminée : squelette jouable.**
**Étape 1 terminée : boss Greg TERMINÉ** (illustrations, sons, équilibrage testé par bots, écran de victoire avec trophée).
Copie de référence de la version finale : branche `greg-termine` (`version-1-greg` = état un peu plus ancien).

## Décisions
- Moteur : **Phaser 3.90** (gratuit, licence MIT), copié dans `lib/`. Aucune installation pour jouer.
- Jeu en ligne : GitHub Pages (lien dans README.md).
- Greg : **vue Punch-Out** (ton boxeur de dos, Greg de face) + **règles façon Hajime no Ippo**.
  C'est le **premier boss développé**.

## Ce qui est fini
- Hub vue du dessus : héros mobile, 6 portes (Beufa, Kédric, Julien, Greg, Rémi, Lionel), noms, "Bientôt".
- Barre de 6 badges, sauvegarde dans le navigateur.
- Retour au hub devant la porte du boss après chaque combat.
- Modèle de boss commun (`src/core/BossScene.js`) : écran des commandes, victoire (badge), défaite, retour hub.
- Boss "Modèle" de test (menu F1 uniquement) : Z = gagner, X = perdre.
- Menu de test caché (F1) : lancer n'importe quel boss / phase, remettre la sauvegarde à zéro.
- **Smartphone / tablette** : boutons tactiles à l'écran (`src/core/tactile.js`), qui "appuient" sur
  les touches du clavier. Chaque scène choisit le texte de ses boutons (`etiquettesTactiles`).
  Le menu de test (F1) n'existe que sur ordinateur.
- PAUSE (Échap / P, bouton II sur mobile) : reprendre, volumes musique / bruitages / voix (enregistrés),
  abandonner. `src/core/PauseScene.js`. Volumes et records dans `src/core/sauvegarde.js`.
- Le hub affiche le record (rang + temps) sous la porte de chaque boss gagné.
- Téléphone tenu en vertical : message « Tourne ton téléphone » (index.html).
- Allègement : musique de Greg en 64 kbit/s (2,5 Mo), clip du Dempsey en MP4 (190 Ko au lieu du GIF de 1 Mo).
- Manifeste unique des visuels/sons : `assets/manifeste.js`. Tant qu'un visuel n'a pas de fichier,
  il est dessiné par le code dans `src/core/dessins.js` (style manga : contours, ombres, reflets).
  Option `pixel: 3` possible (dessin fait en petit puis agrandi, style pixel art).
  Greg en combat = ses illustrations détourées (fond retiré avec rembg, modèle u2net / isnet-anime) :
  garde basse `greg_combat.png`, garde haute `greg_garde_haute.png`, coup au corps `greg_coup_corps.png`,
  coup au visage `greg_coup_visage.png`, K.O. `greg_ko.png` (originaux dans `assets_inbox/`).
  Chaque image est calée sur la tête (réglages `illustre` dans `src/bosses/greg/reglages.js`).
  Planche de poses EN PIED (assets_inbox/greg_planche_1.jpg et _2.jpg, détourées par remplissage du fond
  blanc) : garde basse, jab, crochet, coup au corps, SMASH, touché, étourdi (aussi essoufflé), victoire.
  Elles sont posées sur leurs pieds (`solY`), toutes à la même taille ; les images de coup sont
  retournées selon le côté du coup. Garde haute = greg_garde_pied.png.
  Greg est vu en entier : garde (haute ET basse) = `greg_garde_pied.png` (en pied, gants levés),
  un cadre blanc + bouclier montre la zone protégée (visage ou ventre) ;
  garde basse / touché / essoufflé = image complète `greg_entier.png` ;
  pour la garde haute et les coups, le haut du corps est coupé à la ceinture (gants gardés) et
  posé sur les jambes `greg_jambes.png` (réglages `ceinture` dans `src/bosses/greg/reglages.js`).
  Quand il prépare un coup, on voit l'image du coup grossir vers toi avant l'impact.
  Au tapis : Greg s'effondre sur le ring (greg_ko_debout.png, 0,9 s, poussière), puis une case de manga
  (greg_ko) s'affiche pendant le compte.
  L'illustration complète sert aussi pour la présentation (`greg_portrait`) et l'annonce du SMASH (`greg_visage`).
- Bruitages du combat : générés par `outils/generer_sons.py` (Python + numpy) dans `assets/audio/`.
- Rendu lissé (`pixelArt: false` dans `src/main.js`).
- Combat de Greg inspiré de Super Punch-Out (SNES) : bandeau avec portraits et « VS », public dense,
  tapis bleu avec logo, ton boxeur de dos = illustrations (heros_garde / heros_coup / heros_uppercut,
  réglages `herosIllustre`), sinon dessin façon Little Mac (dos large, touffe, gants verts, contour cyan,
  transparent ; réglages `tailleJoueur`, `transparenceJoueur`), public façon SNES (visages, flashs, pixel art).
- **Greg** (`src/bosses/greg/`) : combat de boxe en 3 rounds de 60 s.
  - Commandes : ◀ ▶ esquive, Espace = coup au visage, Z = coup au corps, Bas (maintenu) = garde,
    X = Dempsey Roll (quand la jauge d'esprit est pleine).
  - Les coups au visage partent de GAUCHE ou de DROITE (le « ! », Greg et l'image du coup sont de ce côté) :
    il faut esquiver du côté OPPOSÉ ; une flèche « ESQUIVE » l'indique. Le SMASH part du centre.
  - Greg prévient avant de frapper : « ! » jaune = visage (esquive ou garde),
    « ! ▼ » violet = corps (garde seulement), « !! » rouge = SMASH (esquive seulement, round 3).
  - Esquive réussie = fenêtre de CONTRE (dégâts x3). Garde de Greg haute = vise le corps, basse = le visage.
  - 3 coups encaissés d'affilée : Greg se couvre puis riposte.
  - Greg joue des ENCHAÎNEMENTS écrits par round (`ENCHAINEMENTS` dans reglages.js), dans l'ordre,
    et change de garde à la fin de chacun. Avant le SMASH, il tape ses gants (« TAP ! TAP ! »).
  - Aides : flèche ESQUIVE/GARDE et cible qui se resserre, à tous les rounds (réglables : aideFleche, aideCible).
  - Jauge d'esprit : ne se remplit QU'avec les esquives réussies.
  - Dempsey Roll : boule sur un « ∞ » (◀ à gauche, ▶ à droite, bip au bon moment) ;
    2 ratés pardonnés, timing serré, environ 50 dégâts max.
  - Moment secret : une fois par round, à un moment au hasard, Greg baisse la garde 0,6 s (discret : « hé... »).
    Il faut un COUP AU CORPS lancé après qu'il a baissé la garde (fenêtre 0,7 s) : 1re fois = COUP SECRET (tapis direct),
    ensuite dégâts x3. Coup au visage ou coup lancé trop tôt = il esquive (« Raté, hé hé ! »).
  - La cloche de fin de round arrête un Dempsey Roll en cours.
  - Équilibrage (après audit avec bots) : Greg se relève avec 100 PV à chaque fois (300 PV au total) ;
    tes coups font 3, le contre x3 ; Greg pare tes coups pendant qu'il arme, et pare 40-60 % des coups
    « libres » ; après « Il se couvre » il riposte aussitôt ; il n'est plus bloqué en boucle par tes coups.
    La garde coûte : 30 % des dégâts passent, 22 de souffle par coup bloqué, pas de récupération en garde ;
    le SMASH bloqué brise toujours la garde.
  - Inspiré de Super Punch-Out (structure du jeu original, sans rien copier) :
    ÉTOURDISSEMENT (jauge cachée remplie par les coups qui touchent ; pleine = Greg titube 1,8 s,
    étoiles, tous les coups passent), annonceur vocal (voix de synthèse du navigateur : « Box ! »,
    compte en japonais « ichi, ni, san… » (voix japonaise du navigateur si elle existe), « K.O. ! »,
    `src/core/annonceur.js`, désactivable avec `annonceur: false`),
    clameur du public, répliques de ton boxeur, chrono au centième dans le classement.
  - Greg ÉNERVÉ après son 2e tapis : nouveaux enchaînements avec des FEINTES (`ENCHAINEMENTS_ENERVE`).
  - Les appuis faits pendant ton coup ou quand tu es sonné sont gardés 0,15 s ; on peut couper la fin
    de son coup pour esquiver.
  - Record : seulement pour un combat complet (pas depuis le menu F1 au round 2 / 3).
  - Résultats des bots : parfait K.O. au round 2 (rang S), moyen K.O. au round 2 (A/B),
    débutant K.O. au round 2 (C), spam / garde seule / tortue PERDENT.
  - Au tapis : alterner ◀ ▶ pour se relever.
  - Écran de victoire : rayons, trophée, Greg amoché, badge, rang, temps, record (`ecranVictoire`,
    BossScene permet à chaque boss d'avoir le sien).
  - Fin : classement S/A/B/C (coups reçus, tapis, temps) + record gardé dans le navigateur.
  - Esquive : protège 0,45 s ; « Trop tôt ! » / « Mauvais côté ! » s'affichent ; le coach commente
    tes erreurs entre les rounds. Garde avec souffle à 0 = garde brisée.
  - Hit-stop (image figée 60-150 ms) à chaque impact, zoom sur les contres, vibration sur mobile.
  - Coups au corps = vident le souffle de Greg ; à bout de souffle, il est grand ouvert.
  - Jauge d'esprit combatif pleine : DEMPSEY ROLL = jeu de rythme. La boule attend dans le cercle de droite :
    ▶ lance le roll, puis ◀ quand elle arrive à gauche, ▶ à droite (PARFAIT / BIEN). Chaque coup accélère
    et frappe plus fort, 10 coups = FINISH. 2 ratés pardonnés, le 3e arrête le roll.
    Round 3 : Greg contre (boule rouge) → ▼ pour freiner.
  - Lancement du Dempsey Roll : joue `assets/sprites/greg/dempsey.gif` s'il existe (voir « clips »
    dans le manifeste), sinon une animation dessinée par le code.
  - Au tapis : compte de l'arbitre, alterner ◀ ▶. 3 tapis = K.O. Greg : 3 tapis = victoire.
  - Le coach (portraits de Kamogawa, expression selon tes erreurs) donne des conseils avant chaque round. Fin du round 3 sans K.O. = décision aux points.
  - Tout l'équilibrage est dans `src/bosses/greg/reglages.js`.
  - Ambiance de public en continu (greg_ambiance.wav), plus forte quand Greg est en difficulté.
  - Musique de fond : `assets/audio/greg_musique.mp3` (chargée au début du combat, en boucle, volume dans le manifeste).
  - Menu de test F1 : commencer directement au round 1, 2 ou 3.

## Ordre de développement (mis à jour)
1. ~~Greg (style Hajime no Ippo)~~ fait
2. **Lionel**  ← prochaine étape (choisi avant Beufa)
3. Beufa, phase quiz (plus tard)
3. Julien
4. Kédric
5. Rémi
6. Lionel
7. Beufa, phase infiltration
8. Phase design (STYLE_GUIDE.md, ASSETS_TODO.md complet, intégration des visuels)
9. Finitions

## Plan des dossiers
| Dossier | Contenu |
|---|---|
| `index.html` | page du jeu |
| `lib/` | moteur Phaser (ne pas toucher) |
| `src/main.js` | démarrage du jeu |
| `src/core/` | code partagé : sauvegarde, clavier, badges, modèle de boss, menu de test |
| `src/hub/` | le hub (+ `reglages.js`) |
| `src/bosses/<boss>/` | un dossier par boss : `index.js` (fiche), `reglages.js` (équilibrage), scènes |
| `src/bosses/liste.js` | ordre des portes |
| `data/` | données (questions du quiz, plus tard) |
| `assets/manifeste.js` | LA liste de tous les visuels et sons |
| `assets/sprites/<boss>/`, `assets/ui/`, `assets/audio/` | fichiers définitifs |
| `assets_inbox/` | où tu déposes tes fichiers bruts |

## Ajouter un boss (rappel technique)
Copier `src/bosses/modele/`, renommer, puis dans `src/bosses/<boss>/index.js` : `pret: true`, `phases`, `scenes`.
