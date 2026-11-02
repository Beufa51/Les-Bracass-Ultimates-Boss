# Rémi — audit FUN (joueur + développeur), V8

Retours de Fabien avant cet audit : « visée du beer pong encore trop dure même sobre ; au vélo on ne comprend pas quand
sauter et quand sonner ; il faudrait pouvoir changer de route ».

## Corrigé juste avant l'audit (V8)
- **Beer pong** : un AIMANT à jeun : la balle est attirée vers le verre visé le plus proche (60 % du chemin), cet aimant
  faiblit à chaque verre bu (-12 %/verre) → sobre = on touche ce qu'on vise, ivre = c'est la galère. Imprécision baissée
  (0,025 / 0,035 / 0,05), courbe d'aide plus longue (100 / 85 / 60 %).
- **Vélo, lisibilité** : au BON MOMENT, un gros mot « SAUTE ! » (bleu) ou « DRING ! » (jaune) apparaît au-dessus de
  l'obstacle ET le bouton correspondant clignote (même couleur). Les 2 premières fois de chaque geste : RALENTI x0,3
  pendant le bon moment (sauf CHAMPION). Les petites icônes restent pour voir venir.
- **Vélo, routes** : 2 CARREFOURS. Panneau « CHOISIS TA ROUTE » (gauche / droite de l'écran, ou ◀ ▶ ; 3 s, sinon la
  1re route). 1er carrefour : LES QUAIS (tranquille, plein de pintes) ou LA RUELLE (RACCOURCI 35 % plus court, mais bondé,
  sans voitures). 2e : LE CENTRE-VILLE (la fête : 2 fois plus de tremplins / voitures, pintes) ou LES PETITES RUES (raccourci).

## Grille utilisée
Pour chaque jeu, 6 critères notés sur 5 : **Comprendre** (on sait quoi faire en 5 s), **Sensation** (retours visuels et
sonores), **Maîtrise** (on progresse en rejouant), **Décisions** (on fait des choix), **Rythme** (pas de temps mort),
**Personnalité** (c'est bien Rémi et sa soirée).

## 1. Le vélo
| Critère | Joueur | Développeur |
|---|---|---|
| Comprendre | 4/5 : « SAUTE ! / DRING ! » + bouton qui clignote + ralenti les premières fois | 4/5 : règle simple (2 gestes) |
| Sensation | 3/5 : bruitages, envol du tremplin ; manque une vraie chute « cartoon » | 3/5 |
| Maîtrise | 3/5 : saut long / court, pintes en l'air, séries | 4/5 : chocs indulgents et calculés |
| Décisions | 4/5 : carrefours (sûr ou raccourci), monter sur les voitures ou pas | 4/5 |
| Rythme | 4/5 : accélère jusqu'au bar, pas d'obstacles collés | 4/5 |
| Personnalité | 4/5 : textos de Rémi, il t'attend devant le bar | 4/5 |
| **Total** | **22/30 (7,3/10)** | **23/30** |

À améliorer pour le fun : (1) une chute plus drôle (le cycliste vole, le bourré lève sa bouteille), (2) un bonus de
« figure » en l'air (garder SAUTE au sommet du tremplin = salto, +3 s), (3) un événement par route (portière qui s'ouvre
dans la ruelle, péniche qui klaxonne sur les quais, foule qui chante au centre-ville).

## 2. Le beer pong
| Critère | Joueur | Développeur |
|---|---|---|
| Comprendre | 4/5 : tirer vers le bas comme un lance-pierre ; vue de côté utile | 4/5 |
| Sensation | 4/5 : ralenti au rebord, gerbe, foule, « TU BOIS ! », glouglou, hoquet | 4/5 |
| Maîtrise | 3/5 : à confirmer en main après l'aimant (risque : trop facile à jeun) | 3/5 : réglage `aimant` |
| Décisions | 2/5 : on vise toujours le verre le plus proche ; pas de coup spécial | 2/5 |
| Rythme | 3/5 : les tours de Rémi restent des temps morts | 3/5 |
| Personnalité | 4/5 : Rémi dans son bar, ses poses, ses piques | 4/5 |
| **Total** | **20/30 (6,7/10)** | **20/30** |

À améliorer pour le fun : (1) un CHOIX de tir : « tir rebond » (rebondir sur la table = 2 verres si ça rentre, mais plus dur),
(2) pendant le tour de Rémi, souffler / le déconcentrer (toucher l'écran au bon moment = son lancer tremble),
(3) le « re-rack » : à 3 verres, choisir la forme (ligne / triangle).

## 3. La porte
| Critère | Joueur | Développeur |
|---|---|---|
| Comprendre | 4/5 : gauche / droite en alternance, puis la cible | 4/5 |
| Sensation | 4/5 : arrêt sur image, fissures, éclats, flash, score qui jaillit, bois qui craque | 4/5 |
| Maîtrise | 3/5 : vitesse d'alternance + timing de la cible | 3/5 |
| Décisions | 3/5 : le pari plus / moins | 3/5 |
| Rythme | 3/5 : le tour de Rémi est passif (sauf le pari) | 3/5 |
| Personnalité | 3/5 : Rémi de dos, peu de répliques pendant la manche | 3/5 |
| **Total** | **20/30 (6,7/10)** | **20/30** |

À améliorer pour le fun : (1) la MANCHE DÉCISIVE avec un enjeu visible (la porte ne tient plus qu'à un fil : barre de
« solidité » de la porte qui baisse à chaque coup des deux joueurs ; celui qui la fait céder gagne tout), (2) la foule du
bar visible (têtes en bas de l'écran qui crient), (3) Rémi qui réagit (se tient la main, souffle sur son poing).

## Bilan
| | Joueur | Développeur |
|---|---|---|
| Vélo | 7,3/10 | 7,7/10 |
| Beer pong | 6,7/10 | 6,7/10 |
| Porte | 6,7/10 | 6,7/10 |
| **Rémi** | **6,9/10** | **7/10** |

## Ordre proposé pour passer à 8/10
1. **Porte : barre de solidité commune** (celui qui la fait céder gagne) — donne un vrai suspense à la fin de la soirée.
2. **Beer pong : tir rebond + déconcentrer Rémi pendant son tour** — enlève le temps mort et ajoute un choix.
3. **Vélo : salto au tremplin + une chute cartoon + un événement par route.**
4. Faire jouer Fabien et régler `aimant`, `erreur`, les temps du vélo.
