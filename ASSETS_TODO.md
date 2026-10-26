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
(générés par `outils/generer_sons.py`, remplaçables par de vrais fichiers).

## Lionel (frisbee façon Windjammers, vue de 3/4)
Planches manga reçues (maillot vert/crème n°93) : **à déposer dans `assets_inbox/`** pour être découpées et détourées.
Chaque pose remplace le dessin provisoire du même nom (`assets/sprites/lionel/`, fond transparent, pieds en bas de l'image).

| Nom du fichier | Statut | Pose (planche d'origine) |
|---|---|---|
| lionel_tient.png | provisoire | Garde, frisbee tenu à deux mains (planche 1, image 1) |
| lionel_course.png | provisoire | Course (planche 1, image 2) |
| lionel_lance.png | provisoire | Lancer, bras tendu (planche 1, image 3) |
| lionel_rattrape.png | provisoire | Rattrape au-dessus de la tête (planche 1, image 4) |
| lionel_plongeon.png | provisoire | Plongeon (planche 2, image 1) |
| lionel_super.png | provisoire | Super lancer, tourbillon vert (planche 2, image 2) |
| lionel_touche.png | provisoire | Touché par le frisbee (planche 2, image 3) |
| lionel_defaite.png | provisoire | À genoux, mains sur le visage (planche 2, image 4) |
| lionel_victoire.png / lionel_nargue.png | provisoire | Frisbee levé, main sur la hanche (planche 2, image 5) |
| lionel_portrait.png | provisoire | En pied, frisbee à la main (image seule) : écran de présentation |
| lionel_garde.png | provisoire | Attente sans frisbee (à tirer de la course ou de l'image seule) |

Toi au frisbee : `heros_frisbee_*` (mêmes poses), dessinés par le code pour l'instant.
Sons Lionel : frisbee_lancer, frisbee_attrape, frisbee_rebond, frisbee_but, frisbee_sifflet, frisbee_super, frisbee_plongeon, frisbee_sol
(générés par `outils/generer_sons_lionel.py`).

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
