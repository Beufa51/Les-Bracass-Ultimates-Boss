# ASSETS_TODO : visuels et sons à créer

Statut : **provisoire** = forme dessinée par le code ; **définitif** = ton fichier est intégré.
Tailles en pixels. "Images" = nombre de cases d'animation posées côte à côte, de gauche à droite, sur une seule ligne.
Les boss seront ajoutés au fur et à mesure de leur développement. Le guide de style (STYLE_GUIDE.md) viendra à l'étape design.

## Hub
| Nom du fichier | Taille d'une case | Images | Statut | Description pour le générateur d'images |
|---|---|---|---|---|
| hub_heros_immobile.png | 64x64 | 1 | provisoire | Héros vu de dessus en 3/4, debout, immobile, tourné vers la droite, pixel art, fond transparent |
| hub_heros_marche.png | 64x64 | 4 | provisoire | Même héros, 4 étapes d'un cycle de marche vers la droite, pixel art, fond transparent |
| hub_porte.png | 80x100 | 1 | provisoire | Porte en bois vue de face encastrée dans un mur, pixel art, fond transparent |
| hub_sol.png | 64x64 | 1 | provisoire | Dalle de sol carrée qui se répète sans couture, vue de dessus, pixel art |
| hub_mur.png | 64x64 | 1 | provisoire | Morceau de mur de briques qui se répète sans couture, vu de face, pixel art |

## Badges (interface)
| Nom du fichier | Taille | Images | Statut | Description |
|---|---|---|---|---|
| badge_vide.png | 48x48 | 1 | provisoire | Emplacement de badge vide, cercle gris sombre, pixel art |
| badge_beufa.png | 48x48 | 1 | provisoire | Médaille ronde dorée avec une manette de jeu vidéo, pixel art |
| badge_kedric.png | 48x48 | 1 | provisoire | Médaille ronde verte avec un ballon de football américain, pixel art |
| badge_julien.png | 48x48 | 1 | provisoire | Médaille ronde bleue avec un livre ouvert et une plume, pixel art |
| badge_greg.png | 48x48 | 1 | provisoire | Médaille ronde rouge avec un gant de boxe, pixel art |
| badge_remi.png | 48x48 | 1 | provisoire | Médaille ronde orange "Drunk Master" avec une chope, pixel art |
| badge_lionel.png | 48x48 | 1 | provisoire | Médaille ronde violette avec un frisbee, pixel art |

## Greg (combat de boxe, vue Punch-Out)
Style : manga de boxe, comme l'illustration `assets_inbox/greg_manga.jpg` (déjà utilisée pour la présentation).
Greg : peau mate, grosse coupe afro, barbe noire, torse en sueur, tatouages de guerriers de manga sur les bras,
short bleu marine à bandes rouges, ceinture bleu foncé avec une épée, gants blancs avec une croix.
Ton boxeur : vu de dos, cheveux bruns en pics, short vert, gants blancs.

| Nom du fichier | Taille d'une case | Images | Statut | Description pour le générateur d'images |
|---|---|---|---|---|
| greg_combat.png | 274x470 | 1 | **définitif** | Greg garde basse (illustration détourée) |
| greg_garde_haute.png | 343x517 | 1 | **définitif** | Greg garde haute / bloque / touché |
| greg_coup_corps.png | 380x519 | 1 | **définitif** | Greg envoie un coup au corps |
| greg_coup_visage.png | 439x524 | 1 | **définitif** | Greg envoie un coup au visage (et le SMASH) |
| greg_ko.png | 341x410 | 1 | **définitif** | Greg K.O. au tapis |
| greg_ring.png | 960x540 | 1 | provisoire | Ring de boxe vu depuis un coin (face aux cordes du fond), public dans l'ombre, projecteurs, tapis bleu clair, style manga |
| greg_coach.png | 160x160 | 1 | provisoire | Portrait d'un vieux coach de boxe chauve à moustache blanche, avec une canne, style manga |
| heros_boxe_garde.png | 280x340 | 1 | provisoire | Boxeur vu de DOS, en garde, les deux gants levés de chaque côté de la tête, fond transparent |
| heros_boxe_jab.png | 280x340 | 1 | provisoire | Boxeur vu de DOS, jab : bras gauche tendu vers l'avant et vers le haut, fond transparent |
| heros_boxe_crochet.png | 280x340 | 1 | provisoire | Boxeur vu de DOS, crochet du droit, buste tourné, fond transparent |
| heros_boxe_corps.png | 280x340 | 1 | provisoire | Boxeur vu de DOS, coup au corps, légèrement accroupi, bras droit tendu à mi-hauteur, fond transparent |
| heros_boxe_esquive.png | 280x340 | 1 | provisoire | Boxeur vu de DOS, esquive : accroupi, buste penché (le jeu le fait glisser sur le côté), fond transparent |
| heros_boxe_bloque.png | 280x340 | 1 | provisoire | Boxeur vu de DOS, garde fermée, les deux gants collés devant le visage, fond transparent |
| heros_boxe_touche.png | 280x340 | 1 | provisoire | Boxeur vu de DOS, sonné, gants écartés, tête rejetée, fond transparent |
| heros_boxe_sol.png | 280x340 | 1 | provisoire | Boxeur vu de DOS, allongé au tapis, fond transparent |
| heros_boxe_victoire.png | 280x340 | 1 | provisoire | Boxeur vu de DOS, les deux bras levés, fond transparent |
| heros_boxe_dempsey_g.png | 280x340 | 1 | provisoire | Boxeur vu de DOS, Dempsey Roll : buste plongé à gauche, crochet, fond transparent |
| heros_boxe_dempsey_d.png | 280x340 | 1 | provisoire | Boxeur vu de DOS, Dempsey Roll : buste plongé à droite, crochet, fond transparent |
| greg_garde.png (facultatif, remplacé par greg_combat.png) | 360x420 | 1 | provisoire | Greg vu de FACE, coupé aux genoux, garde haute, gants devant le menton, fond transparent |
| greg_garde_basse.png | 360x420 | 1 | provisoire | Greg vu de FACE, coupé aux genoux, garde basse, gants au niveau du ventre, fond transparent |
| greg_prepare.png | 360x420 | 1 | provisoire | Greg vu de FACE, coupé aux genoux, arme un coup au visage : bras droit tiré en arrière en hauteur, fond transparent |
| greg_prepare_bas.png | 360x420 | 1 | provisoire | Greg vu de FACE, coupé aux genoux, arme un coup au corps : bras droit tiré en arrière en bas, fond transparent |
| greg_prepare_smash.png | 360x420 | 1 | provisoire | Greg vu de FACE, coupé aux genoux, arme le SMASH : accroupi, gant droit très bas, fond transparent |
| greg_jab.png | 360x420 | 1 | provisoire | Greg vu de FACE, coupé aux genoux, jab : gant gauche qui fonce vers l'écran (gros, en raccourci), fond transparent |
| greg_crochet.png | 360x420 | 1 | provisoire | Greg vu de FACE, coupé aux genoux, crochet : gant droit qui balaie vers la gauche de l'écran, fond transparent |
| greg_corps.png | 360x420 | 1 | provisoire | Greg vu de FACE, coupé aux genoux, coup au foie : gant droit vers le bas de l'écran, fond transparent |
| greg_uppercut.png | 360x420 | 1 | provisoire | Greg vu de FACE, coupé aux genoux, SMASH : uppercut, gant droit très haut, fond transparent |
| greg_bloque.png | 360x420 | 1 | provisoire | Greg vu de FACE, coupé aux genoux, garde fermée, deux gants devant le visage, fond transparent |
| greg_touche.png | 360x420 | 1 | provisoire | Greg vu de FACE, coupé aux genoux, touché : tête projetée sur le côté, yeux en croix, fond transparent |
| greg_essouffle.png | 360x420 | 1 | provisoire | Greg vu de FACE, coupé aux genoux, à bout de souffle : voûté, gants bas, bouche ouverte, fond transparent |
| greg_sol.png | 360x420 | 1 | provisoire | Greg vu de FACE, coupé aux genoux, K.O. allongé sur le dos, étoiles au-dessus de la tête, fond transparent |
| greg_victoire.png | 360x420 | 1 | provisoire | Greg vu de FACE, coupé aux genoux, lève le poing droit, fond transparent |

Clip : `dempsey.gif` (dans `assets/sprites/greg/`) : **intégré**, joué au lancement du Dempsey Roll (2 boucles = 2,46 s).

Sons Greg : greg_coup, greg_coup_fort, greg_bloque, greg_esquive, greg_cloche, greg_compte, greg_alerte, greg_tapis
(générés par `outils/greg/generer_sons.py`, remplaçables par de vrais fichiers).

## Lionel (frisbee façon Windjammers, vue de 3/4)
Planches manga (maillot vert/crème n°93) : **intégrées**. Originaux dans `assets_inbox/lionel_mains_vides_1.jpg`, `_2.jpg` (mains vides : le jeu met son propre frisbee dans ses mains), `lionel_entier.jpg` (portrait),
découpés par `outils/lionel/decouper_planches.py` dans `assets/sprites/lionel/` (fond transparent, tournés vers la gauche).

| Nom du fichier | Statut | Pose (planche d'origine) |
|---|---|---|
| lionel_tient.png | intégré | Garde, frisbee tenu à deux mains (planche 1) |
| lionel_course.png | intégré | Course (planche 1) ; sert aussi d'attente |
| lionel_lance.png | intégré | Lancer, bras tendu (planche 1) |
| lionel_rattrape.png | intégré | Rattrape au-dessus de la tête (planche 1) |
| lionel_plongeon.png | intégré | Plongeon (planche 2) |
| lionel_super.png | intégré | Super lancer, tourbillon vert (planche 2) |
| lionel_touche.png | intégré | Touché par le frisbee (planche 2) |
| lionel_defaite.png | intégré | À genoux, mains sur le visage (planche 2) |
| lionel_victoire.png | intégré | Frisbee levé, main sur la hanche (planche 2) ; sert aussi à narguer |
| lionel_portrait.png | intégré | En pied, frisbee à la main : écran de présentation |
| lionel_garde.png | manquant (facultatif) | Attente SANS frisbee, prêt à courir (même style, fond blanc) |

Toi au frisbee : `heros_frisbee_*` : **intégrés** depuis `assets_inbox/heros_frisbee_planche.jpg` (blond, maillot rouge).
À refaire si possible : une course SANS frisbee, et la défaite avec les cheveux blonds.
Surprises du terrain (dessinées par le code en style manga ombré, remplaçables par une planche Gemini) :

| Nom du fichier | Taille d'une case | Images | Statut | Description |
|---|---|---|---|---|
| lionel_mouette.png | 128x96 | 4 | provisoire | Mouette vue de profil tournée vers la droite, 4 positions d'ailes (haut, milieu, bas, remonte) |
| lionel_chateau.png | 140x128 | 1 | provisoire | Château de sable vu de 3/4, trois tours, coquillages, petit drapeau violet |
| lionel_ballon.png | 80x80 | 12 | provisoire | Ballon de plage rouge/blanc/bleu/jaune qui roule (un tour complet), lumière fixe en haut à gauche |

Sons Lionel : frisbee_lancer, frisbee_attrape, frisbee_rebond, frisbee_but, frisbee_sifflet, frisbee_super, frisbee_pret, frisbee_plongeon, frisbee_sol
(générés par `outils/lionel/generer_sons.py`).

## Kédric (course de football américain façon Eyeshield 21, vue de dos)
Style : manga sportif façon **Eyeshield 21** (traits nets, ombres en aplats, mouvement).
Kédric : coach showman — banane gominée noire, lunettes noires, micro-casque, veste de sport verte à liseré doré avec un « K »,
t-shirt noir, chaîne en or, pantalon blanc, baskets dorées. Ses joueurs : maillot vert à numéros dorés, casque blanc à bande verte.
Ton coureur : vu de DOS, maillot rouge n°21, casque rouge à bande blanche, pantalon blanc, ballon sous le bras droit.
Planches sur **fond blanc uni**, poses bien espacées.
**Personnages : définitifs** (images du propriétaire, détourées par `outils/kedric/preparer_images.py`). Reste : trophée, stade, pelouse illustrée. Décor du battle de danse : définitif.

| Nom du fichier | Taille d'une case | Images | Statut | Description pour le générateur d'images |
|---|---|---|---|---|
| kedric_portrait.png | 360x400 | 1 | **définitif** | Kédric en pied, de face, il te pointe du doigt, micro dans l'autre main, grand sourire |
| kedric_coach.png | 120x120 | 2 | **définitif** | Buste de Kédric : 1) sourire de star 2) il crie dans son micro-casque |
| kedric_danse.png | 300x300 | 2 | **définitif** | Kédric qui danse (pose disco, un bras vers le ciel), 2 images |
| kedric_defaite.png | 300x300 | 1 | **définitif** | Kédric à genoux, lunettes fêlées, une larme |
| kedric_toi_course6.png | 197x326 | 6 | **définitif** | Ton coureur vu de DOS qui court (6 images tirées de la planche du propriétaire, jambes retournées pour la jambe droite) |
| kedric_toi_saut / rotation / plaque / victoire | 180x220 | 1 | **définitif** | De dos : saut genoux repliés ; baissé en tournant ; plaqué (bras en l'air) ; ballon levé |
| kedric_def_course.png | 220x200 | 4 | **définitif** | Défenseur de face qui fonce vers toi (4 images) |
| kedric_def_garde / bas / plonge / bras / rate | 220x200 | 1 | **définitif** | De face : prêt à plaquer bras ouverts ; accroupi ; plongeon vers toi ; bras tendus en l'air ; assis sonné |
| kedric_star_* | 220x200 | 1-4 | **définitif** | Mêmes poses pour Kédric en joueur (maillot doré n°1, casque vert à étoile, lunettes) |
| kedric_scene.jpg | 1365x768 | 1 | **définitif** | Décor du battle de danse : scène de concert Devil Bats, public, projecteurs (image du propriétaire) |
| kedric_trophee.png | 220x260 | 1 | provisoire | Ballon de football américain en or sur un socle |

**Prompts pour Gemini** (une planche par prompt) :
1. *« Planche de personnage style manga Eyeshield 21, fond blanc uni, 6 poses en pied bien séparées, même personnage : un coach
   de football américain showman, banane gominée noire, lunettes de soleil noires, micro-casque, veste de sport verte à liseré doré
   avec un K sur la poitrine, t-shirt noir, chaîne en or, pantalon blanc, baskets dorées. Poses : 1) il pointe le spectateur du doigt
   en tenant un micro 2) il crie dans son micro 3) danse disco bras vers le ciel 4) danse bras sur la hanche 5) bras croisés, sourire
   arrogant 6) à genoux, lunettes fêlées, il pleure. Contours noirs épais, ombres en aplats. »*
2. *« Planche style manga Eyeshield 21, fond blanc uni, poses bien séparées : un joueur de football américain vu DE DOS, maillot rouge
   numéro 21 dans le dos, casque rouge à bande blanche, pantalon blanc, chaussettes rouges, ballon serré sous le bras droit.
   Poses : 4 images d'une course vers le fond de l'image, 1 saut genoux repliés, 1 accroupi en pleine rotation, 1 plaqué bras en l'air,
   1 victoire ballon levé. »*
3. *« Planche style manga Eyeshield 21, fond blanc uni, poses bien séparées : un joueur de défense de football américain vu DE FACE,
   maillot vert numéro 55 doré, casque blanc à bande verte avec grille, pantalon blanc. Poses : 4 images de course vers le spectateur,
   prêt à plaquer bras ouverts, accroupi prêt à plonger, plongeon vers le spectateur bras tendus, debout bras tendus en l'air,
   assis par terre sonné avec des étoiles. »*

## Sons
| Nom du fichier | Statut | Description (pour sfxr / jfxr) |
|---|---|---|
| ui_valider.wav | provisoire | Petit "bip" court et joyeux de validation |
| ui_badge.wav | provisoire | Jingle court de victoire / obtention de badge |
| ui_defaite.wav | provisoire | Son grave et descendant de défaite |
| hub_porte.wav | provisoire | Porte qui s'ouvre, court |

## Procédure d'intégration
1. Tu déposes tes PNG ou sons dans `assets_inbox/` (n'importe quel nom).
2. Tu me dis à quoi ils correspondent.
3. Je les redimensionne à la bonne taille, je les découpe en planche, je les renomme selon ce tableau,
   je les range dans `assets/...` et je mets à jour `assets/manifeste.js` (et seulement lui).
4. Je te confirme ce qui a changé et je passe le statut à "définitif".
