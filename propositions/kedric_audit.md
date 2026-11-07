# Kédric — audit (développeur + joueur bot), même méthode que Lionel (audit 3)

Méthode : relecture du code (`KedricCourse.js`, `showtime.js`, `reglages.js`, `difficulte.js`) + bot qui joue des
matchs COMPLETS (3 courses + battle) en accéléré : 35 matchs, 3 difficultés × 3 profils de joueur
(BON : réaction 0,25 s, 3 % d'erreurs ; MOYEN : 0,35 s, 8 % ; ENFANT : 0,5 s, 15 %, se fait avoir par 30 % des leurres).
0 erreur JavaScript.

## Chiffres du bot

| Difficulté | Profil | Touchdowns (moy.) | Battle | Public à la fin | Rang |
|---|---|---|---|---|---|
| FACILE | bon / moyen / enfant | 2,3 / 2,3 / 0,3 | 9 / 9 gagnés | 92 à 100 | S partout |
| NORMAL | bon / moyen / enfant | 3 / 1 / 0,3 | 9 / 9 gagnés | 99 à 100 | S partout |
| CHAMPION | bon / moyen / enfant | 2,3 / 0,7 / 0,3 | 3/3, 3/3, 1/3 | 94-100 (enfant : -24 à 2) | S partout |

(27 matchs ci-dessus, 3 par case ; 8 de plus pour suivre la jauge du public.)

- Temps de jeu : courses ≈ 15 à 50 s AU TOTAL (une course ≈ 15 s), battle 143 s. Le football = 25 % du boss.
- NORMAL, joueur moyen : public à 100 % dès ~50 s de battle, puis au-dessus de 90 % les 2/3 du battle. Plus aucun suspense.
- Plaquages : répartis à égalité sur les 3 courses (15 / 15 / 13) : la « défense de fer » (course 3) n'est pas plus dure.

## Ce qui va bien
- Les courses sont lisibles : tous les plaquages du bot viennent de ses erreurs voulues (aucun plaquage « injuste »).
- 0 erreur, aucune course bloquée, la musique et le décompte du battle tiennent (horloge de jeu).

## A. Bugs (développeur)
1. **« X = ENTRAÎNEMENT » au battle ne marche JAMAIS** : l'écran d'annonce le propose, mais `lireTouches()`
   (`KedricCourse.js:379`) ne lit pas la touche X → `e.x` toujours faux (`showtime.js:467`). Sur téléphone il n'y a
   pas de bouton X non plus. → lire X (et un bouton tactile), ou retirer la phrase.
2. **Écran de victoire illisible** (même défaut que Lionel avant son audit 3) : la 1re ligne déborde à gauche, la
   colonne de stats passe SUR le trophée et sur Kédric, les lignes « public gagné » / défis sortent à droite, et le
   CONSEIL DU COACH (dernière ligne) est hors de l'écran (12 lignes centrées à y = 440).
3. **« DEVIL BAT GHOST PRÊT » muet après REJOUER** : `ghostAnnonce` n'est pas remis à zéro dans `create()`
   (si la partie d'avant a fini jauge pleine, l'annonce ne revient plus).
4. **Le temps du record ne compte pas le battle** (`tempsTotal` avance seulement pendant les courses) : « Record :
   rang S en 0'29" » pour un boss de 3 minutes ; `tempsReference: 300` ne sert jamais.
5. **Difficulté ENTRAÎNEMENT** : donne quand même badge, record et défis (Lionel : PERSO sans record ni défis),
   et le battle peut y être perdu (contrairement à « l'entraînement » X du battle).
6. `NOTES.md` décrit encore l'ancien battle (manches de 8/12/16 pas en questions/réponses) : à mettre à jour.

## B. Équilibrage / plaisir (joueur)
1. **Le battle est gagné d'avance** : PARFAIT ±0,12 s (240 ms de fenêtre, énorme pour un jeu de rythme), BIEN ±0,28 s,
   +2,1 par parfait (x1,5 en combo) contre -6,5 par raté : on gagne tant qu'on rate moins d'1 flèche sur 4.
   Le « drain » (-0,12/s au-dessus de 40) ne pèse rien face à +2,7/s.
2. **Les courses ne servent à rien pour gagner** : 0 touchdown = public de départ -15, qui ne change rien vu le point 1.
   On peut rater les 3 courses et battre Kédric à 100 %.
3. **Rang S pour tout le monde** : le « score de course » donne +25 dès 500 points (atteint même à 0 touchdown) ;
   le temps ne pénalise jamais (point A4). Le rang ne récompense rien.
4. **Défis trop faciles** : « 40 esquives PARFAITES (courses + battle) » est fait par le battle seul (80 à 190 parfaits) ;
   « 80 % du public » = presque toujours.
5. **Courses très courtes et « tout ou rien »** : 1 erreur = course finie (≈ 15 s). Un joueur moyen fait 1 touchdown
   sur 3 en NORMAL et joue ~30 s de football pour 2 min 20 de danse.
6. Pas de montée de difficulté d'une course à l'autre (point des plaquages ci-dessus).

## Propositions (dans l'ordre conseillé)
1. Bugs A1 à A5 (rapides).
2. **Battle plus tendu** : PARFAIT ±0,07 s / BIEN ±0,16 s en NORMAL (x1,35 FACILE, x0,8 CHAMPION gardés),
   raté -8, drain plus fort au-dessus de 40 → but : NORMAL moyen gagne mais à 40-70 %, enfant gagne en FACILE seulement
   une partie sur deux ou trois. (Je recale avec le bot.)
3. **Les touchdowns comptent vraiment** : chaque touchdown = 1 « JOKER » au battle (un raté effacé : « LE PUBLIC
   TE PARDONNE ! »), en plus du public de départ. Les courses deviennent une préparation du boss de fin.
4. **Rang qui veut dire quelque chose** : touchdowns + % du public final + ratés du battle ; score de course plafonné
   plus haut ; temps du battle compté. Défis : « 3 touchdowns », « battle sans PIÈGE DORÉ », « 30 PARFAITS d'affilée ».
5. **Courses** : course 3 vraiment plus dure (charge +20 %, symbole un peu plus tard) ; éventuellement 2e chance
   par course (le 1er plaquage = « PERDU LE BALLON ? NON ! » une fois par match) pour que le football dure plus.

## Questions pour Fabien
- Battle : tu veux qu'un joueur moyen le gagne « de justesse » (proposition 2) ou qu'il reste facile ?
- Jokers des touchdowns (proposition 3) : oui / non ?
- ENTRAÎNEMENT : sans badge ni record (comme Lionel PERSO) ?

## C. Animations et images (vérification ajoutée à la demande de Fabien)
Tout est illustré (toi, défenseurs, Kédric coach / danse / frime / défaite, scène, stade, trophée). À améliorer :
1. **Les défenseurs qui courent** : UNE seule image qui sautille (`kedric_def_course`) → cycle de course en 4 images
   (prompt n°3 de `kedric_prompts_images.md`).
2. **Ta réception au coup d'envoi** : on voit l'image du SAUT → vraie pose « j'attrape le ballon » (prompt n°4).
3. Sans nouvelle image (code) : le ballon et le kaméhaméha du public sont dessinés au code, c'est voulu et lisible.
   `kedric_star` (Kédric en joueur, une seule image penchée) ne sert plus (duel retiré) : rien à faire.

## FAIT (choix de Fabien : battle de justesse mais pas injuste, jokers oui, entraînement comme Lionel)
- A1 touche X lue (entraînement du battle) ; sur téléphone la phrase « X = ENTRAÎNEMENT » n'est plus affichée.
- A2 écran de victoire en colonne (comme Lionel), A3 annonce du Ghost remise à zéro, A4 le battle compte dans le temps.
- A5 ENTRAÎNEMENT : ni record ni défis (badge gardé, comme le PERSO de Lionel).
- Battle : PARFAIT ±0,07 s, BIEN ±0,16 s, raté -8, et le « drain » remplacé par un RAPPEL ÉLASTIQUE (6 %/s vers
  le milieu, des deux côtés). Sans lui, la jauge finissait toujours à +100 ou -100 ; avec lui elle montre comment tu
  danses en ce moment, et celui qui est mené peut remonter.
- JOKERS : 1 par touchdown, un raté pardonné (« JOKER ! LE PUBLIC TE PARDONNE »), annoncés avant le battle.
- Rang : touchdowns x12 + public x0,4 - ratés du battle x0,5 + parfaites des courses (max 10) ; plus le temps.
  Défis : 3 touchdowns sur 3 ; 80 % du public ; battle sans toucher une flèche DORÉE.
- Courses 2 et 3 plus dures : défenseurs plus rapides (x1,15 / x1,35), symbole plus tard (x0,95 / x0,88), rangs plus
  serrés (9 / 8 yards au lieu de 10).

Bot après corrections (3 matchs par case) :

| | bon | moyen | enfant |
|---|---|---|---|
| FACILE | gagne 3/3 (public 85-98) | 3/3 (58-83) | 2/3 (-16 à 20) |
| NORMAL | 3/3 (83-97) | 3/3 (22-49) | 0/3 (-53 à -18) |
| CHAMPION | 3/3 (63-70) | 3/3 (11-23) | 0/3 (-100 à -89) |

Rangs en NORMAL : bon S, moyen A à C selon les touchdowns. La 2e chance par course n'a pas été faite (pas demandée).
