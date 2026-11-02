# Rémi — audit V5 (développeur + joueur), après les retours sur la V4

Retours de Fabien sur la V4 : « vélo injouable, touches mal placées, les images arrivent par 4, pas sûr que ce soit fun ;
la porte c'est mieux mais pas fou ; le beer pong est mieux mais on ne voit ni nos verres ni la courbe qui retombe ».

## Ce qui a été corrigé en V5

### Vélo (refait)
- **BUG trouvé** : les bourrés DEBOUT n'étaient plus repositionnés à l'écran (une ligne de code coupée par un commentaire) :
  ils restaient figés et s'empilaient, d'où « les images arrivent par 4 ». Corrigé.
- **Plus de boutons** : sur téléphone, l'écran est coupé en DEUX MOITIÉS. Gauche = DRING, droite = SAUTE (garder appuyé =
  plus haut). Rien ne cache plus la route. Clavier : ▲ / ESPACE saute, Z / ◀ sonne.
- **Deux gestes seulement** : plus de sprint ni de frein. Le vélo roule tout seul et accélère doucement jusqu'au bar.
  Le bourré qui TRAVERSE se gère maintenant à la sonnette (il s'arrête et recule), comme le bourré debout.
- **Lisibilité** : une icône au-dessus de chaque obstacle dit quoi faire (▲ bleu = saute, cloche jaune = sonne, la cloche
  s'allume quand il est dans la zone jaune de la sonnette). Pas d'icône en CHAMPION.
- **Rythme** : l'écart entre deux obstacles se compte en TEMPS (1,25 à 2,1 s) : jamais deux obstacles collés.
- **Fun** : PINTES en l'air à attraper en sautant (+1 s), SÉRIE d'obstacles passés proprement (tous les 5 : +2 s),
  score affiché, bilan à l'arrivée.

### Beer pong
- **Toute la table est visible** : tes 6 verres en bas, ceux de Rémi en haut (caméra en retrait et en hauteur).
- **La courbe entière** jusqu'à la retombée, avec un contour sombre (lisible devant Rémi). Vu de derrière, une courbe
  ressemble à un trait droit : un **encart « vue de côté »** (en haut à droite) montre la balle qui monte puis RETOMBE dans
  les verres de Rémi, avec le point d'arrivée. FACILE / NORMAL : point d'arrivée sur la table ; CHAMPION : pointillés espacés.
- Vol plus tendu (la balle monte moins haut).

### Porte
- **Visée SUR LA PORTE** : une cible rouge se promène sur le battant ; on frappe quand elle passe sur le « + » (le poing).
- **PARI** pendant l'élan de Rémi : PLUS ou MOINS que le seuil ? (moitié d'écran gauche / droite, ou ◀ ▶) : +60 à ta frappe.
- **Impact** : arrêt sur image (plus long pour un gros coup), le score jaillit du point d'impact ; pendant ton élan,
  ton perso tremble et les bords de l'écran rougissent avec la jauge.

## Notes (V5)

| Jeu | Joueur V4 → V5 | Développeur | Commentaire |
|---|---|---|---|
| Vélo | 4 → **6,5/10** | 7/10 | Simple, lisible, plus de touches qui gênent. Reste à le faire jouer sur téléphone. |
| Beer pong | 5 → **7/10** | 7/10 | On voit tout et on comprend la portée grâce à la vue de côté. |
| Porte | 6 → **7/10** | 7/10 | Plus de décisions (pari, visée sur la porte) et plus d'impact. |
| **Rémi global** | **6,8/10** | **7/10** | Tout est jouable et compréhensible ; à confirmer en main. |

Bots (NORMAL) : vélo sans erreur = 0 chute ; vélo en ratant 15 % des gestes = 3 chutes, arrivé avec de la marge (temps
ensuite resserrés : 62 / 50 / 43 s) ; beer pong gagné ; porte 2-0. Aucune erreur dans la console.

## Ce qui empêche encore d'aller à 8-9/10
1. **Pas encore testé à la main sur téléphone** (seulement des bots) : réglages de difficulté à confirmer.
2. **Sons** : encore des bips (sonnette, plouf, coup dans la porte) : le plus gros gain de « sensation » restant.
3. **Vélo** : une seule rue en boucle ; pas de variété de décor ni d'événement (voiture, flic, chien) ; pas de musique.
4. **Beer pong** : toujours 6 verres (10 verres + re-rack pas fait) ; Rémi ne réagit pas encore au « Chut ! ».
5. **Porte** : 3 manches identiques ; une dernière manche « tout ou rien » (porte qui cède) donnerait une vraie fin.

## Prochaines étapes proposées
- **S1** Faire jouer Fabien (FACILE puis NORMAL) et régler les chiffres (`reglages.js` ou l'écran développeur).
- **S2** Vrais bruitages générés au code (sonnette « dring », plouf, bois qui craque, foule) — sans image à fournir.
- **S3** Manche finale de la porte « tout ou rien » + porte qui s'ouvre sur la salle qui applaudit.
- **S4** Vélo : un événement surprise (voiture qui ouvre sa portière = sonne ; flic = ralentis) et une musique de balade.
