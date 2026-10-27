# NOTES : état du projet "Les Bracass'"

## Où on en est
**Étape 0 terminée : squelette jouable.**
**Étape 1 terminée : boss Greg TERMINÉ** (illustrations, sons, équilibrage testé par bots, écran de victoire avec trophée).
Copie de référence de la version finale : branche `greg-termine` (`version-1-greg` = état un peu plus ancien).
**Étape 2 terminée : boss Lionel VALIDÉ par le propriétaire** (match de frisbee façon Windjammers, illustrations manga
mains vides, entraînement, joystick, jauges du public, 3 supers, surprises, difficulté PERSO). En ligne sur `main`.
**Étape 3 : boss Kédric — v4 après 3 essais du propriétaire + audit joueur/développeur** (à réessayer). Choix du propriétaire : tu portes le ballon
et tu traverses le terrain en esquivant les défenseurs qui reçoivent les ordres du coach Kédric, VUE DE DOS, esquives ◀ ▶ ▲ ▼,
plus tu esquives plus tu accélères jusqu'au DEVIL BAT GHOST, référence graphique **Eyeshield 21**, Kédric = **showman frimeur**.
ILLUSTRATIONS INTÉGRÉES (personnages) : 24 images Gemini du propriétaire, renommées `assets_inbox/kedric_*.jpg`, détourées par
`outils/kedric/preparer_images.py` dans `assets/sprites/kedric/`. Musique intégrée. Manquent encore : le décor (stade + pelouse illustrés), le trophée.
Rappel : Kédric a son propre dossier (`src/bosses/kedric/`), ne touche ni Greg ni Lionel.
Le site a un service worker (`sw.js`) qui revérifie chaque fichier : les mises à jour apparaissent sans vider le cache.

## Décisions
- Moteur : **Phaser 3.90** (gratuit, licence MIT), copié dans `lib/`. Aucune installation pour jouer.
- Jeu en ligne : GitHub Pages (lien dans README.md).
- Greg : **vue Punch-Out** (ton boxeur de dos, Greg de face) + **règles façon Hajime no Ippo**.
  C'est le **premier boss développé**.

## Ce qui est fini
- Hub vue du dessus : héros mobile, 6 portes (Beufa, Kédric, Julien, Greg, Rémi, Lionel), noms, "Bientôt".
- Barre de 6 badges, sauvegarde dans le navigateur.
- Retour au hub devant la porte du boss après chaque combat.
- Démarrage rapide : au lancement, seuls le hub et les badges sont chargés ; chaque boss charge SES fichiers
  en entrant chez lui (barre « Chez Greg... »), une seule fois (`BossScene.preload`).
- Modèle de boss commun (`src/core/BossScene.js`) : écran des commandes, victoire (badge), défaite, retour hub.
- Boss "Modèle" de test (menu F1 uniquement) : Z = gagner, X = perdre.
- Menu de test caché (F1) : lancer n'importe quel boss / phase, remettre la sauvegarde à zéro.
- **Smartphone / tablette** : boutons tactiles à l'écran (`src/core/tactile.js`), qui "appuient" sur
  les touches du clavier. Chaque scène choisit le texte de ses boutons (`etiquettesTactiles`).
  Le menu de test (F1) n'existe que sur ordinateur.
- PAUSE (Échap / P, bouton II sur mobile ; pendant Greg et Lionel, le bouton II est rangé en haut à droite) : reprendre, volumes musique / bruitages / voix (enregistrés),
  abandonner. `src/core/PauseScene.js`. Volumes et records dans `src/core/sauvegarde.js`.
- Le hub affiche le record (rang + temps) sous la porte de chaque boss gagné.
- Téléphone tenu en vertical : message « Tourne ton téléphone » (index.html).
- PLEIN ÉCRAN sur téléphone (`src/core/pleinEcran.js`, tout le jeu) : automatique au premier toucher (Android/tablettes,
  bloqué à l'horizontale), bouton ⛶ en haut à gauche pour y revenir ; sur iPhone (pas de plein écran dans Safari),
  astuce une fois : « Partager → Sur l'écran d'accueil » ; `manifest.webmanifest` + icônes `assets/ui/icone_*.png`
  => depuis l'écran d'accueil, le jeu s'ouvre en plein écran comme une appli.
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
- Bruitages du combat : générés par `outils/greg/generer_sons.py` (Python + numpy) dans `assets/audio/greg/`.
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
  - Musique de fond : `assets/audio/greg/greg_musique.mp3` (chargée au début du combat, en boucle, volume dans le manifeste).
  - Menu de test F1 : commencer directement au round 1, 2 ou 3.
  - Choix de difficulté après la présentation : FACILE / NORMAL / CHAMPION (`DIFFICULTES` dans reglages.js), dernier choix retenu, record séparé par difficulté.
  - Héros illustré : garde, coup, uppercut (victoire), touché (tête en arrière), au sol (assis) — `herosIllustre` dans reglages.js.

- **Lionel** (`src/bosses/lionel/`) : match de frisbee en 1 contre 1, façon **Windjammers** (Neo Geo, 1994).
  Règles vérifiées sur le remake https://github.com/Historn/Project-1 (sets de 30 s, 3/5/2 points, plongeon = lancer + direction).
  - Vue de 3/4 au-dessus d'un terrain de plage : TOI à gauche (maillot bleu), Lionel à droite (maillot vert/crème n°93).
  - Commandes (simplifiées à 2 boutons après essai : « trop dur avec Z, X et Espace ») : flèches = courir
    (immobile quand on tient le frisbee) ; Espace = lancer (▲/▼ maintenu = en biais, il rebondit sur les murs ;
    déclenche le super quand il est prêt) ; Z = lob ; Espace en courant vers le frisbee qui arrive = plongeon.
    Le lancer courbe n'est plus que pour Lionel.
  - Points : frisbee derrière l'adversaire = 3 points (côtés, jaune) ou 5 points (milieu, rouge) ; lob qui touche le sable = 2 points.
  - Set : 12 points ou 30 s (égalité = POINT EN OR) ; 2 sets gagnants. Celui qui encaisse sert.
  - Relancer tout de suite après avoir attrapé = lancer PUISSANT (+22 %). Le frisbee accélère à chaque lancer de l'échange.
  - Rattraper un lob juste en dessous (cercle au sol) = SUPER LANCER (Espace) : le tien = « TORNADE DE FEU »,
    TÉLÉGUIDÉE avec ▲ ▼ pendant tout son vol (`pilotage`, `reactivite` dans reglages.js).
  - LOB VISÉ : ▲ ▼ = côté, ◀ = court (près du filet), ▶ = profond (près du mur de Lionel) = 3 points au lieu de 2.
    Viseur (cible blanche, dorée si profond) quand tu tiens le frisbee ; gerbe de sable + « BOUM ! » quand il tombe ;
    Lionel lit mal tes lobs (`lentLob` par difficulté) et râle quand il en rate un.
  - JAUGES DU PUBLIC : une pour toi (orange, à gauche) et une pour LIONEL (verte, à droite). Elles montent avec les
    beaux gestes : plongeon +2, contre parfait +3, attrape à partir du 3e lancer d'un échange +1, lancer puissant +1,
    point marqué +1 (un « +2 PUBLIC : plongeon » s'affiche au-dessus du joueur ; explication la première fois).
    Pleine = SUPER PRÊT (« LE PUBLIC EST EN FEU ! » / « LE PUBLIC ACCLAME LIONEL ! »). Encaisser ne la vide pas.
    La jauge de Lionel monte moins vite en FACILE (x0,5) et NORMAL (x0,8) : `publicLionel`.
  - CONTRE PARFAIT : Espace appuyé au plus 0,1 s avant d'attraper (pas en plongeon) = ralenti 0,45 s, « CONTRE PARFAIT ! »,
    relance x1,4 (`parfait`).
  - 3 SUPERS DE LIONEL au hasard (`supersLionel`) : LE CHAMBREUR (s'arrête au filet puis repart), LE DÉDOUBLEUR (un vrai
    frisbee + un faux sans ombre qui fait « POF ! » juste avant toi), LE BOOMERANG (part d'un côté, revient en crochet loin de toi).
  - Difficulté PERSO (4e carte) : (`src/bosses/lionel/perso.js`) : écran de curseurs (vitesse, réflexes, puissance, agressivité, ta zone d'attrape, aide, surprises),
    niveau 5 = comme en NORMAL, réglages retenus dans le navigateur (clé `bracass_lionel_perso`).
  - SURPRISES (`src/bosses/lionel/surprises.js`, une à la fois, toutes les 16-24 s en FACILE, 12-20 en NORMAL, 10-16 en CHAMPION) :
    mouette qui traverse (« COUAC ! »), château de sable (« PAF ! », il s'écroule), ballon de plage qui roule (« BOING ! »).
    Le frisbee touché est dévié mais garde son sens ; les supers passent à travers ; les lobs volent au-dessus.
  - AUDIT 2 (développeur + joueur) : super prêt gardé après un point, entraînement / ralenti / gel remis à zéro à chaque
    visite, écouteurs de pause retirés, fin de la scène du super calée sur le jeu (téléphones lents), jauge plus lente
    (15, attrape comptée à partir du 3e lancer), contre parfait plus large en FACILE (0,2 s) / NORMAL (0,15 s) et visable
    avec ▲ ▼, flèches ignorées après une attrape tant qu'on ne les a pas lâchées (plus de biais involontaires), aide sans
    points pendant les supers de Lionel, Chambreur plus rapide, textes du HUD redessinés seulement s'ils changent.
  - AUDIT 2 (joueur) : entraînement en 9 étapes (~30 s) avec CONTRE PARFAIT, PLONGEON et super à GUIDER ; le cercle vert
    devient BLEU au moment d'appuyer pour un contre parfait ; tornade en vol avec de vraies flammes + « ▲ ▼ : guide ta
    tornade ! » ; tir de Lionel jamais dévié à moins de 200 px de toi ; mouette plus grosse ; jauge PUBLIC plus grosse,
    qui clignote presque pleine, et encaisser ne la vide plus ; Dédoubleur : 2e cercle pour le faux frisbee jusqu'au
    « POF » ; joueur en haut du terrain : HUD transparent et message sous lui ; NORMAL : Lionel se trompe plus et lit
    moins bien les lobs, frisbee +4 % par lancer (les échanges finissent par passer) ; CHAMPION : aide après le filet.
  - SCÈNE DU SUPER (`cinematiqueSuper`, 1,6 s, jeu figé) : fond sombre, lignes de vitesse qui tournent, le lanceur en grand
    (pose « super » de la planche) avec images rémanentes, étincelles, gros titre, zoom, onde de choc ; puis traînée
    lumineuse et étincelles pendant le vol (orange pour toi, vert pour Lionel).
  - Ton joueur qui tient / rattrape le frisbee : pose de côté (course), frisbee dans le poing avant.
  - Musique de fond : `assets/audio/lionel/lionel_musique.mp3` (Windjammers, « Lawn Court », 64 kbit/s, 2,3 Mo, en boucle,
    volume 0,4 dans le manifeste de Lionel).
  - Pas de voix (annonceur) dans le match de Lionel, à la demande du propriétaire (Greg garde les siennes).
  - Supers de Lionel : il les obtient au hasard (`superHasard`, dès le set 1), et en CHAMPION aussi en rattrapant tes lobs.
  - Lionel chambreur : bulles de moquerie quand il marque / encaisse, il garde parfois le frisbee pour te narguer.
  - IA de Lionel : il devine où arrive le frisbee (simulation du vol) avec un temps de réaction et une erreur selon la difficulté,
    plonge s'il est trop loin, se replace en suivant ta position.
  - Aides : cercle vert au sol là où le frisbee va arriver (FACILE et NORMAL : dès le lancer ;
    CHAMPION : aucune). Le point de chute des lobs est toujours montré.
  - Difficulté FACILE / NORMAL / CHAMPION (`src/bosses/lionel/difficulte.js`, copie propre à Lionel), record par difficulté.
  - Fin : rang S/A/B/C (points encaissés, sets perdus, temps), écran de victoire (trophée, Lionel à genoux, badge violet au frisbee).
  - Menu F1 : match depuis le set 1, ou directement au set décisif (1-1).
  - Tout l'équilibrage dans `src/bosses/lionel/reglages.js` ; dessins provisoires dans `src/bosses/lionel/dessins.js` ;
    bruitages générés par `outils/lionel/generer_sons.py`. Effets manga : `src/bosses/lionel/effets.js` (copie propre à Lionel).
  - Toute la logique avance dans update() (pas de minuteries Phaser) : les bots de test peuvent jouer en accéléré.
  - Lionel en illustrations : planches `assets_inbox/lionel_planche_1.jpg` (4 poses), `_2.jpg` (5 poses), `lionel_entier.jpg`,
    découpées par `outils/lionel/decouper_planches.py` (fond blanc retiré, poses tournées vers la GAUCHE, réduites de moitié)
    dans `assets/sprites/lionel/`. Taille à l'écran : `echelleIllustre` dans reglages.js.
    Pas de pose d'attente sans frisbee : « garde » = la course (avec de petits bonds) ; « nargue » = la victoire.
    Ton joueur (blond, maillot rouge) : planche `assets_inbox/heros_frisbee_planche.jpg` (9 poses légendées en anglais),
    découpée par le même outil (`outils/lionel/decouper_planches.py`) dans `assets/sprites/lionel/heros_frisbee_*.png`, tournée vers la DROITE.
    Sa course tient un frisbee : on affiche l'attente mains vides avec de petits bonds. (Sur la planche, la pose « défaite » a les cheveux bruns.)
  - Équilibrage (bots « humains » qui voient le frisbee avec du retard, et lisent l'aide quand elle est affichée) :
    FACILE = un enfant gagne ; NORMAL = bon joueur gagne, moyen ~1 fois sur 3, enfant perd ; CHAMPION = très dur.
    Après essai du propriétaire (« trop dur en normal ») : NORMAL adouci (aide dès le lancer, Lionel plus lent, moins de courbes).
    Lionel se trompe davantage quand le frisbee va vite ; ses courbes sont son arme principale.

  - AUDIT (développeur + joueur testeur, agents) après « trop dur en NORMAL » : frisbee plus lent (+3 %/échange, max 900),
    zone d'attrape plus grande à la forme du corps, ralenti à l'approche (FACILE/NORMAL), plus de traversée (sous-pas),
    plongeon dirigé vers le frisbee, trajet en pointillés (rebonds compris) + cercle vert, premiers lancers de Lionel sans
    rebond et visant à côté de toi, chrono arrêté quand on tient le frisbee, « Prêt ? » avant chaque service,
    « ESPACE : lance ! » / SUPER PRÊT au-dessus du joueur, plus de lancer courbe en FACILE/NORMAL.
  - ENTRAÎNEMENT (src/bosses/lionel/entrainement.js) : 7 étapes (~20 s) avec Lionel qui lance lentement
    (attraper, lancer, biais, lob, super), automatique la première fois après la difficulté, F1 « Entraînement puis match »,
    X (ou « Passer » sur téléphone) pour le sauter. Pas de points ni de chrono pendant l'entraînement.
  - TÉLÉPHONE : JOYSTICK VIRTUEL qui suit le pouce (moitié gauche de l'écran), SEULEMENT pendant le match de Lionel
    (`src/bosses/lionel/joystick.js`) ; pause rangée en haut à droite pendant ce match.
    Le hub, Greg et les menus gardent la croix et la pause au milieu.
  - DÉCOR PERSO (assets_inbox/lionel_decor.jpg, recadré dans assets/sprites/lionel/lionel_terrain.jpg) : le terrain
    (TERRAIN dans reglages.js) est calé sur ses bords de sable et sa ligne jaune ; bandes 3/5/3 ajoutées sur les murs de but.
    Sans ce fichier, le terrain dessiné par le code revient tout seul.
  - Ton joueur au repos : vu de côté (pose de course) au lieu de face.
  - Déplacement de TON joueur : COURSE en 6 images (assets_inbox/heros_frisbee_course_6.jpg → heros_frisbee_course6.png)
    quand il avance ou monte/descend ; PAS CHASSÉ face à Lionel quand il RECULE (4 poses de heros_frisbee_chasse_1.jpg
    jouées 1-2-3-4-3-2 → heros_frisbee_chasse.png, clé `heros_frisbee_recul`) ; la pose 1 du pas chassé sert d'attente.
    Bandes faites par `outils/lionel/decouper_animation.py` (planche → bande d'images alignées sur les pieds).
    (heros_frisbee_chasse_2.jpg : 2e série, pas utilisée.)
  - Lionel : COURSE en 6 images (assets_inbox/lionel_course_6.jpg → lionel_course6.png, cases retournées pour regarder
    vers la gauche). Sur la planche, des poses se touchaient : `decouper_animation.py --par-ligne 3` les sépare (petits
    défauts sur 4 images : bout de pied en trop / jambe coupée) et efface la ligne de sol. Une planche aux poses bien
    espacées les supprimerait.
  - Lionel : PAS CHASSÉ face à toi quand il recule (5 poses de assets_inbox/lionel_chasse.jpg jouées 1-2-3-4-5-4-3-2,
    cases retournées → lionel_chasse.png, clé `lionel_recul`) ; sa 1re pose (bras ouverts) sert d'attente (lionel_attente.png).
  - Terrain dessiné par le code (secours) dans l'esprit de Windjammers 2 (cage grillagée, rambardes, palmiers, ombres de palmes, public,
    ligne centrale jaune, poteaux jaunes rembourrés) : dessin du code, pas d'image du vrai jeu (droits d'auteur).
  - Ton joueur : nouvelle planche mains vides (le jeu pose le frisbee dans ses mains quand il le tient).
- **Kédric** (`src/bosses/kedric/`) : MATCH de football américain façon **Eyeshield 21**, vu de DOS (perspective : 3 couloirs).
  - Historique des essais du propriétaire : v1 (course en 3 actions) « trop de défenseurs, trop court, Ghost trop facile, pas fun » ;
    v2 (vrai match à essais) « pas lisible, fouillis, pas moyen d'accélérer, trop court, ajouter une réception, Kédric trop peu présent » ;
    v3 (coup d'envoi, sprint, finale) « les arrières qui reviennent par derrière sont insupportables, le sprint ne sert à rien, terrain
    trop court, plus de défenseurs vers l'en-but, Kédric seul quand il arrive, patterns de Kédric durs à lire, réception mal exploitée ».
    → AUDIT par 2 agents (joueur testeur + développeur, ~40 matchs simulés) puis v4 (actuelle). Bug trouvé : ◀ ▶ esquivait TOUT,
    y compris les plongeons, les bras tendus et Kédric (les feintes ne servaient à rien) ; des poursuivants restaient pendant le duel.
  - v4.1, après « trop dur en NORMAL : pas le temps d'anticiper, défenseurs trop près, ils changent au dernier moment, on ne
    voit rien avec plusieurs lignes » : symbole 1,45 s avant le contact en NORMAL (1,8 FACILE, 0,95 CHAMPION), rangs espacés d'au
    moins 8 yards (6 en zone rouge), défenseurs qui foncent moins vite (`charge` 1,5), trou des murs visible dès le placement
    et ligne qui ne se décale plus (sauf CHAMPION : `murTardif`, `decalage`), pot de colle figé 0,75 s avant, rangs derrière le
    prochain défenseur ESTOMPÉS, symbole placé à la hauteur de la pose (plus bas quand il plonge). Duel : tu restes face à Kédric
    (le terrain ne défile plus pendant le duel), sa charge dure toujours ≈ 1,2 s (avant, le bout du terrain la ralentissait).
  - v5 : KÉDRIC NE PLAQUE PLUS (« une star ne se salit pas les mains ») : on l'affronte au SHOWTIME, un DUEL DE FRIME EN
    RYTHME façon PaRappa / Simon (`showtime.js`, idée du joueur testeur validée par le propriétaire). Kédric montre ses pas
    (une pose, une grosse flèche de couleur ◀ bleu ▶ orange ▲ jaune ▼ violet, une note par direction), il tend le micro
    « À TOI ! », tu refais les pas sur les mêmes temps : un cercle se resserre sur la flèche à jouer (BLEU = appuie,
    BLANC = pile). FLÈCHE ROUGE = fais l'INVERSE. Jauge PUBLIC en tir à la corde (-100 Kédric / +100 toi) : parfait +11,
    bien +7, raté -12, chaque pas qu'il montre -2. FINALE = 3 manches (4, 6, 8 pas ; 0, 1, 2 flèches rouges ; 88, 96,
    104 bpm) ; gagnée si la jauge finit au-dessus de 0 (-100 = perdu tout de suite) ; chaque touchdown d'avance = +15 au
    départ (30 au plus). Après chacun de tes touchdowns : REVANCHE de 4 pas sans risque (réussie = +1 Ghost) pour apprendre.
    Fenêtres de timing x1,35 FACILE / x0,8 CHAMPION (`fenetreShow`). Plus de duel d'esquive (le code reste, option
    `kedric: true` sur une attaque). Images provisoires : ses 2 poses de danse (retournée pour ▶, écrasée pour ▼) et ton
    saut / ta rotation / ta victoire penchée. IMAGES REÇUES ET INTÉGRÉES : planches `assets_inbox/kedric_frime_planche.jpg`
    (Kédric : pointe à gauche / à droite, doigt au ciel, grand écart, micro « à toi ! », clin d'œil = pose des flèches rouges)
    et `kedric_toi_frime_planche.jpg` (toi de dos : ballon à gauche / à droite, saut, à genoux), découpées par
    `outils/kedric/decouper_frime.py` → `kedric_frime_*.png`, `kedric_toi_frime_*.png`. (`kedric_toi_course_seul.png` reçu
    aussi : pas encore utilisé, à demander au propriétaire.) Bots : finale NORMAL moyen gagne nettement, enfant 2 fois sur 3, CHAMPION enfant perd.
  - v4.2 : BUG corrigé : le trou de la ligne (et des murs) était tiré au hasard POUR CHAQUE COULOIR → parfois 3 défenseurs
    = ligne complète impassable avec le symbole ◀ ▶ (détecté par un bot qui cherche les rangs qui bouchent les 3 couloirs).
    Terrain du KÉDRIC SHOW rallongé à 140 yards (réglage `terrain`, le milieu est le 70) ; finale à 40 yards de son en-but.
    En attente de la décision du propriétaire : remplacer le duel d'esquive contre Kédric (une seule illustration penchée,
    pas lisible) par un DUEL DE FRIME EN RYTHME (proposition du joueur testeur, voir conversation).
  - v4 : 3 ATTAQUES puis la FINALE. Chaque attaque : COUP D'ENVOI (le ballon arrive du fond, le VENT peut le faire changer de couloir
    à 60 % du vol ; cercle de timing qui se resserre, BLEU = appuie, BLANC = pile ; ▲ à ±0,12 s = RÉCEPTION PARFAITE vitesse 3 + Ghost,
    ±0,3 s = BIEN vitesse 2, sinon attrapé vitesse 0 ; hors du couloir = BOING, tu ramasses) puis RETOUR, limité à 40 yards
    (« POUSSÉ EN TOUCHE »). Ensuite 4 ESSAIS pour 10 yards ; ballon perdu = Kédric marque 7.
  - PASSES : ▲ pendant le placement (avant le « HUT ! ») = jeu de passe (2 par attaque) : tu pars 8 yards plus loin, la ligne est
    derrière toi, le ballon arrive (même réception à 3 niveaux) ; ratée = PASSE INCOMPLÈTE (essai perdu, aucun gain).
  - DERNIER RIDEAU : passé le dernier défenseur d'une formation, ses arrières te POUSSENT EN TOUCHE 6 yards plus loin (pas un
    plaquage). Seul le DEVIL BAT GHOST perce le rideau (grande percée). Formations moins profondes (≤ 22 yards) : 6 à 9 actions par attaque.
  - ZONE ROUGE (en-but à 22 yards ou moins) : `ZONE_ROUGE`, rangs serrés et réguliers jusqu'à la ligne d'en-but ; en 2e et 3e
    attaques, ses gars s'arrêtent à 13 yards de l'en-but et KÉDRIC GARDE L'EN-BUT, SEUL (duel, 2 vies).
  - Plus d'arrières qui reviennent en diagonale. UN SEUL poursuivant possible (rare : NORMAL 12 %), qui part 6 yards derrière toi
    à ta vitesse + 1,2 ; toujours visible (son casque remonte du bas de l'écran) ; jauge « POURSUIVANT ▮▮▮▯ Z Z Z ! » ; SPRINT
    (Z tapé vite, jusqu'à +3,5) = SEMÉ à 11 yards. Jamais de poursuivant quand Kédric est là.
  - ▲ / ▼ OBLIGATOIRES : un plongeon ou des bras tendus seuls dans ton couloir te suivent (◀ ▶ ne suffit pas) ; idem Kédric.
  - LISIBILITÉ : seul le PROCHAIN défenseur a son symbole + anneau de couleur ; UN SEUL message au centre à la fois (`messageCentre`) ;
    Kédric danse à côté de la jauge de vitesse (plus dessus).
  - KÉDRIC télégraphié, toujours pareil : il DANSE 1 s → POSE 0,7 s immobile à 7 yards (gros symbole de couleur, anneau, son nom
    d'attaque dans sa bulle : « LE PLONGEON DORÉ ! ») → CHARGE (≈ 0,85 s). Feinte ANNONCÉE (flash rouge + « FEINTE ! ») à 0,6 s
    du contact, au plus 1 charge sur 3, seulement en acte 3 de la finale (et dans les duels en CHAMPION).
  - FINALE « SHOWTIME » (1 contre 1, depuis ses 40) en 3 ACTES : il a 6 vies (+1 par touchdown de retard) ; toi 3 en NORMAL
    (+1 par touchdown d'avance, 2 au plus). Acte 1 (6-5) attaques simples ; acte 2 (4-3) COMBOS de 2 attaques annoncés dans sa
    bulle (« ▲ puis ▼ ! ») ; acte 3 (2-1) feintes. Encart à chaque nouvel acte. Gagner la finale = badge.
  - VITESSE : 2 esquives d'affilée = +1 niveau (5) ; à chaque nouvelle action tu gardes ton élan moins 2 niveaux (`elan`).
  - DEVIL BAT GHOST : jauge = esquives / réceptions PARFAITES (FACILE 3, NORMAL 5, CHAMPION 6) ; Espace : vitesse max, le prochain
    défenseur est passé, et le rideau ne t'arrête pas ; contre Kédric = une seule esquive.
  - Durée mesurée (bots, temps réel) : NORMAL moyen ≈ 3 à 4 min (15 à 30 actions), finale seule ≈ 40 s pour un bon joueur.
  - Aides (FACILE / NORMAL) : « ▲ SAUTE ! » en bas de l'écran ; la première fois qu'un type de plaquage arrive (1re attaque), RALENTI
    + explication (une seule fois : `Sauvegarde.fait('kedric_tuto')`). CHAMPION : aucune aide.
  - HUD : score « TOI 7 - 0 KÉDRIC », essai et distance, attaque et en-but, barre avec la ligne du premier essai ; vitesse à gauche,
    jauge GHOST à droite ; Kédric au micro en haut à gauche (bulles), il surgit en dansant après certains plaquages.
  - Téléphone : croix tactile ▲ ◀ ▼ ▶ + bouton « Ghost » ; on peut aussi GLISSER le doigt sur l'écran.
  - Difficulté FACILE / NORMAL / CHAMPION (`difficulte.js`, copie propre à Kédric), record par difficulté.
  - Fin : rang S/A/B/C (écart au score, plaquages, parfaites, temps), écran de victoire (ballon en or, Kédric à genoux en larmes).
  - Menu F1 : match complet, ou directement la finale (7-7).
  - Tout l'équilibrage dans `src/bosses/kedric/reglages.js` (difficultés, match, FORMATIONS, ordre des formations par attaque, duel).
    Dessins provisoires : `dessins.js` ; bruitages : `outils/kedric/generer_sons.py` ; effets : `effets.js` (copie).
  - Le stade (tribunes, projecteurs) est dessiné une fois dans une image (des milliers de ronds redessinés à chaque image = jeu lent).
  - Toute la logique avance dans `pas(dt, touches)` (pas de minuteries Phaser) : les bots de test jouent en accéléré.
  - Musique de fond : `assets/audio/kedric/kedric_musique.mp3` (Eyeshield 21, « Code Name Eyeshield 21 », donnée par le propriétaire,
    réduite en 64 kbit/s : 1,3 Mo, en boucle, volume 0,4 dans le manifeste de Kédric) + ambiance de stade générée, plus discrète ;
    badge provisoire = médaille verte au ballon (`icone: 'football'`).
  - ILLUSTRATIONS (assets_inbox/kedric_*.jpg → `outils/kedric/preparer_images.py` : fond retiré avec rembg isnet-anime, bords
    nettoyés, recadrées, enregistrées 1,5 fois plus grandes que l'écran, le jeu les réduit avec ZOOM_ILLUSTRE) :
    toi de dos (saut, rotation, plaqué avec le plaqueur déjà dessus, victoire), défenseurs de face (course, garde, accroupi,
    plongeon, bras tendus, sonné), Kédric en joueur (une seule image `kedric_star` : le jeu la penche / la couche selon l'attaque),
    Kédric coach (portrait qui te pointe, buste bras croisés / au micro, danse 2 images, défaite à genoux en larmes).
    Le plongeon illustré est retourné s'il vient de ta gauche ; la course d'un défenseur (une image) rebondit à chaque foulée.
  - TA COURSE = 6 images (`kedric_toi_course6.png`, `outils/kedric/decouper_course.py`) tirées de la planche du propriétaire
    (`assets_inbox/kedric_toi_course_planche.jpg`, 16 cases). Historique : 16 poses à la suite = « la jambe se replie à chaque pas »
    (la planche lève presque toujours la jambe GAUCHE) ; 4 poses = « on dirait qu'il glisse » puis « trop saccadé ».
    Solution : jambe gauche (talon levé, genou qui revient, appui), puis les MÊMES poses avec seulement les JAMBES retournées
    (le haut du corps, le 21 et le ballon restent en place ; fondu à la ceinture), puis appui. Rebond du corps CONTINU calé sur
    l'animation (au plus bas à chaque appui), petite bascule, crampons (`kedric_pas`) et touffe d'herbe à chaque appui.
    Images non utilisées : course de loin (kedric_toi_course_loin / _tres_loin / _2), autres courses du défenseur (_2 à _5 ;
    _4 porte des logos « Deimon / Devil Bats » d'Eyeshield 21, à éviter). Sur la danse « main sur la hanche », il reste un petit
    trait gris du décor près des jambes.
  - RÈGLE : chaque boss est indépendant ; une modification pour un boss ne doit JAMAIS changer un autre boss (Greg !).
    Le code commun (src/core) ne reçoit que des AJOUTS optionnels, que seul le boss concerné active.

## Ordre de développement (mis à jour)
1. ~~Greg (style Hajime no Ippo)~~ fait
2. ~~Lionel (Windjammers)~~ fait et validé
3. **Kédric**  ← EN COURS : refait en vrai match après le 1er essai ; manquent le décor (stade, pelouse) et le trophée
   Ancienne fiche Lionel, pour mémoire :
   - Jeu : **exactement comme Windjammers** (Neo Geo, 1994) — lancer de frisbee en 1 contre 1, vue de 3/4 au-dessus du terrain,
     buts à 3 et 5 points, lancers courbes, lob, super lancer quand on rattrape au bon moment, sets.
   - Badge : médaille violette avec un frisbee.
   - Images : le propriétaire a un pixel art de Lionel et demande à Gemini une version manga (planches de poses, fond blanc).
   - Personnalité : **un peu chambreur** (il se moque gentiment du joueur, nargue après ses points, fait le malin).
   - Prompt Gemini (planche manga 9 poses, fond blanc, tourné vers la gauche) déjà donné au propriétaire.
3. Beufa, phase quiz (plus tard)
3. Julien
4. Kédric
5. Rémi
6. Lionel
7. Beufa, phase infiltration
8. Phase design (STYLE_GUIDE.md, ASSETS_TODO.md complet, intégration des visuels)
9. Finitions

## Plan des dossiers
**Règle : chaque boss est INDÉPENDANT.** Tout ce qui sert à un boss est dans SON dossier ; modifier un boss
ne peut pas changer un autre boss. Le seul lien entre les boss : le hub, les badges et le moteur commun
(sauvegarde, sons, clavier / boutons tactiles, pause, menu F1), qu'on ne modifie pas pour un boss.

| Dossier | Contenu |
|---|---|
| `index.html` | page du jeu |
| `lib/` | moteur Phaser (ne pas toucher) |
| `src/main.js` | démarrage du jeu (enregistre les visuels du moteur puis ceux de chaque boss) |
| `src/core/` | MOTEUR COMMUN : hub/boss de base (BossScene : intro, victoire, badge), sauvegarde, sons, musique, annonceur, clavier, boutons tactiles, pause, menu F1, chargement, dessins du hub et des badges |
| `src/hub/` | le hub (+ `reglages.js`) |
| `src/bosses/<boss>/` | TOUT le boss : `index.js` (fiche), `reglages.js` (équilibrage), scènes, `manifeste.js` (ses visuels et sons), `dessins.js` (ses dessins provisoires), `effets.js`, `difficulte.js`… |
| `src/bosses/liste.js` | ordre des portes |
| `assets/manifeste.js` | visuels et sons du MOTEUR COMMUN (hub, badges, interface) |
| `assets/sprites/<boss>/`, `assets/audio/<boss>/` | fichiers de chaque boss |
| `assets/sprites/hub/`, `assets/ui/` | fichiers du hub et de l'interface |
| `outils/<boss>/` | outils d'un boss (génération des sons, découpe des planches) |
| `data/` | données (questions du quiz, plus tard) |
| `assets_inbox/` | où tu déposes tes fichiers bruts |

Fichiers de chaque boss :
- **Greg** : `src/bosses/greg/` (GregCombat, reglages, manifeste, dessins, effets, difficulte), `assets/sprites/greg/`,
  `assets/audio/greg/`, `outils/greg/generer_sons.py`.
- **Lionel** : `src/bosses/lionel/` (LionelMatch, reglages, entrainement, manifeste, dessins, effets, difficulte, joystick),
  `assets/sprites/lionel/` (Lionel ET ton joueur au frisbee), `assets/audio/lionel/`,
  `outils/lionel/generer_sons.py`, `outils/lionel/decouper_planches.py`.
- **Kédric** : `src/bosses/kedric/` (KedricCourse, reglages, manifeste, dessins, effets, difficulte), `assets/audio/kedric/`,
  `outils/kedric/generer_sons.py` (pas encore d'images : `assets/sprites/kedric/` viendra avec les planches).

## Ajouter un boss (rappel technique)
Copier `src/bosses/modele/` (avec son `manifeste.js`), renommer, puis dans `src/bosses/<boss>/index.js` : `pret: true`, `phases`, `scenes`.
Ses visuels et sons vont dans SON `manifeste.js` (noms commençant par le nom du boss), ses fichiers dans
`assets/sprites/<boss>/` et `assets/audio/<boss>/`. Si on a besoin d'un effet ou d'un écran d'un autre boss,
on le COPIE dans le dossier du nouveau boss (pas de partage entre boss).
