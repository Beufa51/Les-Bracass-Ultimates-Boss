# Beufa — audit (développeur + joueur bot), même méthode que Kédric et Lionel

Méthode : relecture du code (`BeufaInfiltration.js`, `BeufaQuiz.js`, `reglages.js`, `difficulte.js`,
`data/beufa_quiz.js`) + bot `outils/beufa_bot.mjs` qui joue l'INFILTRATION complète (4 pièces) : il calcule un
chemin dans le temps hors des cônes de vue et des halos, avec 3 profils de joueur (EXPERT : réagit vite, chemin
optimal ; MOYEN : un peu lent et imprécis ; ENFANT : lent, se trompe souvent), 4 difficultés, 2 parties par case.
Le QUIZ est simulé à part (20 000 parties par case, joueur qui connaît 50 / 70 / 90 % des réponses).
L'audit précédent (`beufa_audit_final.md`, V91) est entièrement fait (V92).

## Chiffres du bot — infiltration

| Difficulté | Expert | Moyen | Enfant |
|---|---|---|---|
| ENTRAÎNEMENT | 52 s, 0 alerte | 60-77 s, 0-1 alerte | 80-99 s, 1-2 alertes |
| FACILE | 50 s, 0 alerte | 55-74 s, 0 alerte | 102-181 s, **4 et 15 alertes** (9 renvois dans le parc) |
| NORMAL | 50 s, 0 alerte | 84-112 s, 1 alerte | 132-140 s, **6 et 9 alertes** |
| CHAMPION (EXTREME) | **146 s**, 0 alerte (dont 105 s à l'arsenal) | pas joué (voir ci-dessous) | pas joué |

- Temps par pièce (expert) : quai 6 s, parc 16 s, arsenal 9-14 s, QG 15-19 s. L'infiltration complète dure 1 à 3 min.
- **FACILE et NORMAL donnent EXACTEMENT le même parcours expert** (50,0 s, mêmes temps par pièce) : pour un bon
  joueur la difficulté ne change presque rien à l'infiltration.
- **La pièce 2 (le parc, les projecteurs) fait toutes les grosses notes** : FACILE enfant = 13 alertes et 9 renvois
  rien que dans le parc. Une partie de ces alertes vient du bug A1 (halo qui compte une alerte toutes les 0,4 s).
- **Arsenal (pièce 3) en NORMAL** : même l'expert ne trouve aucun chemin sans entrer un instant dans un cône
  (« frôle ») ; en ENTRAÎNEMENT il passe proprement. Le joueur moyen y reste bloqué 61 s (54 fois « pas de chemin »)
  et l'enfant y prend 2-3 alertes. **En EXTREME, l'expert reste 105 s à l'arsenal** (183 fois « pas de chemin ») :
  il n'y passe qu'en attendant une rare fenêtre. En EXTREME le bot met plusieurs minutes de calcul par partie (il attend à
  l'arsenal), et son navigateur s'est fermé pendant la 2e partie expert (souci du bot, pas du jeu) : moyen / enfant
  EXTREME pas joués (à relancer : `node outils/beufa_bot.mjs 1 champion moyen,enfant`, long). L'arsenal en EXTREME est presque bouché.

## Chiffres — quiz (10 questions tirées parmi 60)

| Le joueur connaît... | ENTRAÎNEMENT (5 croix) | FACILE (4) | NORMAL (3) | EXTREME (2) |
|---|---|---|---|---|
| 50 % des réponses | 1,7 GAME OVER avant de gagner | 4,7 | **≈ 12 (1 joueur sur 2 en fait plus de 20)** | ≈ 19 (8 sur 10 en font plus de 20) |
| 70 % | 0,2 | 0,5 | 1,6 | 5,5 |
| 90 % | 0 | 0 | 0,1 | 0,4 |

- Le **RANG ne dépend ni du temps d'infiltration ni de la difficulté** : 10 points par bonne réponse, 50 - 10 par
  alerte, -15 par CONTINUE. Avec 5 alertes, c'est CHICKEN même à 9/10.
- Points max : 150. BIG BOSS = 0 alerte + 10/10 + 0 continue.

## Ce qui va bien
- Le bot finit TOUJOURS les 4 pièces, dans toutes les difficultés et tous les profils : aucune pièce bloquée,
  aucun garde coincé, aucune erreur pendant les parties du bot.
- Le checkpoint par pièce (renvoyé à l'entrée de la pièce, pas au début) évite la frustration.
- L'expert passe sans alerte : le jeu est faisable « à la Metal Gear », en observant les rondes.
- Quiz : 60 questions sans doublon, 4 réponses partout, mélangées à chaque fois ; GAME OVER façon MGS, CONTINUE,
  record par difficulté et médaille marchent (déjà testés en V91-V92).

## A. Bugs (développeur)
1. **Rester dans un HALO de projecteur compte une alerte toutes les 0,4 s** (CONFIRMÉ par test : 4 alertes pour
   une seule détection). `detection()` rappelle `declencherAlerte(g)` à chaque remplissage de la jauge du halo,
   même si le garde te poursuit déjà. Chaque alerte coûte 10 points au classement → un seul passage raté dans le
   parc peut faire tomber à CHICKEN. → ne compter l'alerte que si le garde n'est pas déjà en poursuite.
2. **Collé à moins de 44 px d'un garde = vu, même à travers un mur / un conteneur** (`vuPar`). On peut être repéré
   caché juste derrière une caisse. → vérifier aussi que la vue n'est pas bloquée.
3. **« RENVOYÉ ! » ne remet pas l'angle des gardes** (`remettreAuDepart`) : ils repartent de leur point de départ
   mais en regardant où ils regardaient → ils pivotent sur place au début (petit saut visible, rondes décalées).
4. **Après un CONTINUE, la « série » de bonnes réponses n'est pas remise à zéro** (`this.serie` n'est pas dans
   `create()`) : la 1re bonne réponse de la nouvelle tentative peut faire la tête « choqué » au lieu de « souriant ».
5. **Voile de nuit renvoyé à la carte graphique à chaque image** (toile 1440×720, `nuitTex.refresh()` dans
   `majNuit`) : c'est ce qui coûte le plus cher sur téléphone. → le recalculer seulement quand la lumière bouge
   (projecteurs) ou une image sur deux.
6. **ENTRAÎNEMENT donne badge, record et BIG BOSS** (Kédric et Lionel : entraînement sans record ni défis).
7. Petits restes : commentaire d'en-tête « X = lancer une PIERRE » alors que la pierre est supprimée depuis V28
   (code mort `lancerPierre`) ; ~230 Ko d'images chargées et jamais utilisées (`beufa_conteneur_v`, `camion_v`,
   `etagere_v`, `helico`, `bureau`, `panneau`, `pompe`, `casiers`) ; 6 questions dont la bonne réponse est
   nettement plus longue que les autres (ça se devine).

## B. Équilibrage / plaisir (joueur)
1. **Le quiz est un mur en NORMAL** : un joueur qui connaît la moitié des réponses (déjà bien pour de la culture
   jeu vidéo) doit faire ~12 GAME OVER, souvent plus de 20. C'est le vrai boss, l'infiltration n'est qu'un apéritif.
2. **L'infiltration ne compte presque pas** : le rang ignore le temps ; 0 alerte ou 1 alerte = 10 points, comme
   une seule question. L'expert et le moyen finissent avec le même bonus.
3. **La difficulté change peu l'infiltration pour un bon joueur** (même parcours en FACILE et NORMAL) mais énormément
   pour un enfant (le parc). L'écart vient surtout des projecteurs (+ bug A1).
4. **Pièce 2 (parc) trop punitive pour un débutant**, pièce 3 (arsenal) en NORMAL sans chemin vraiment propre et
   presque bouchée en EXTREME (l'expert y attend 105 s).
5. **Le danger ne se sent pas assez** : pas de son au « ? » d'un garde (seulement un bip au « ! »), la musique ne
   change pas en alerte (dans MGS, la musique d'alerte est LE signal), et tous les bruitages sauf les musiques et
   le GAME OVER sont encore des bips provisoires.
6. 60 s par question reste long (déjà noté en V91) ; en NORMAL 40-45 s ferait plus « chrono ».

## Propositions (dans l'ordre conseillé)
1. **Bugs A1 à A4** (rapides) : halo = une seule alerte par poursuite, vue bloquée même collé, angle des gardes et
   série remis à zéro. Je relance le bot pour vérifier (les alertes de l'enfant dans le parc devraient baisser).
2. **Musique et sons d'alerte** : musique d'alerte quand un garde te poursuit (retour à la musique normale quand
   tout le monde est calmé), petit son « hein ? » au « ? », vrais bruitages (pas, porte, alerte « ! » MGS, renvoi).
   → il me faut les fichiers (voir questions).
3. **Quiz moins mur en NORMAL** : 4 croix en NORMAL (au lieu de 3) et EXTREME 3 ; ou bien un JOKER gagné par
   l'infiltration (0 alerte = 1 erreur pardonnée, comme les touchdowns de Kédric). Objectif : 50 % de bonnes
   réponses = 3 à 5 GAME OVER, pas 12.
4. **Le rang compte l'infiltration** : bonus de temps (ex. +20 sous 1 min, +10 sous 2 min), alertes à -8 au lieu
   de -10 mais halos corrigés, et éventuellement un bonus de difficulté (EXTREME +10). Ainsi un bon espion est
   récompensé même s'il rate une question.
5. **Pièces 2 et 3** : en FACILE / ENTRAÎNEMENT, projecteurs plus lents ou plus petits ; à l'arsenal en NORMAL,
   ouvrir un vrai passage (décaler une ronde de 1 s ou un conteneur), et en EXTREME garder au moins une fenêtre
   toutes les 10-15 s, vérifié au bot.
6. **Voile de nuit plus léger** (A5) pour les téléphones, puis ménage A6-A7.

## Questions pour Fabien
- Quiz en NORMAL : tu veux qu'un joueur « moyen » le gagne en 2-3 essais (proposition 3), ou c'est voulu que ce soit
  le gros mur du boss ? Plutôt « 4 croix » ou « joker gagné à l'infiltration » ?
- Le rang doit-il récompenser le TEMPS d'infiltration et la difficulté (proposition 4) ?
- Musique d'alerte : as-tu un morceau en tête (dans MGS c'est « Alert ») ? Rappel du risque Konami déjà noté en V91
  si le jeu est diffusé au-delà des amis.
- ENTRAÎNEMENT sans record (comme Kédric et Lionel) ?
- Images : lesquelles des prompts ci-dessous veux-tu générer (n°1 et n°2 sont les plus visibles) ?

## C. Animations et images
Dessiné au code (voulu, lisible) : cônes de vue, halos, voile de nuit, radar, poussière des pas, ronds dans les
flaques, « ? » / « ! », croix rouges, chrono, médaille, écran GAME OVER. Illustré par Fabien : Snake (marche
4 vues + course de profil), gardes (marche face / dos / profil), décors des 4 pièces, Beufa au bureau (avec et
sans masque, 4 expressions), codec, présentation.

Ce qui manque ou reste figé (prompts prêts dans `propositions/beufa_prompts_images.md`, à livrer dans
`assets_inbox/beufa/`) :

| N° | Ce qui ne va pas aujourd'hui | Fichier attendu | À joindre |
|---|---|---|---|
| 1 | Cinématique : Beufa est l'ANCIENNE planche vue du dessus, tournée tête en bas, plus petit que Snake (seul perso pas en 3/4) | `beufa_boss_dos.jpg` | `beufa_buste.jpg` + `beufa_garde_dos.jpg` |
| 2 | Garde en poursuite = sa planche de MARCHE accélérée | `beufa_garde_course_3vues.jpg` | `beufa_garde_face.jpg` |
| 3 | Garde de profil : poses « jambes serrées » fabriquées par le jeu (prompt V88 jamais livré) | `beufa_garde_profil_4poses.jpg` | voir `beufa_prompts_marche.md` |
| 4 | Pas de pose « surpris » au « ! » | `beufa_garde_surpris.jpg` | `beufa_garde_face.jpg` |
| 5 | Snake ne court que de profil (face / dos = marche accélérée) | `beufa_heros_course_facedos.jpg` | `beufa_heros_course_profil.jpg` + `beufa_heros.jpg` |
| 6 | « RENVOYÉ ! » : Snake reste figé dans sa marche | `beufa_heros_attrape.jpg` | `beufa_heros.jpg` |
| 7 | Le veilleur qui balaie (porte du quai, sas) bascule d'une planche entière face ↔ profil : il « saute » | `beufa_garde_tete.jpg` | `beufa_garde_face.jpg` |

(Images jointes : dans `assets/sprites/beufa/`.) Le n°7 est nouveau (ajouté au fichier de prompts).
Sans nouvelle image : la porte du QG qui s'ouvre et le rideau du bureau sont faits au code et passent bien.
