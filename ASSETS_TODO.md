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
