# Rémi — le babyfoot vu par un HABITUÉ (V19v)

Revue faite par Claude en se mettant à la place d'un joueur de babyfoot de bar régulier (pas un vrai joueur, pas d'agent :
version économe). Base : le jeu actuel, les parties des bots et les retours de Fabien (« encore un peu facile »).

## Ce qu'un habitué apprécie déjà
- Lire le corps de l'adversaire avant le tir : c'est vraiment ce qu'on fait au baby.
- Gamelle, roulette interdite, la pinte du perdant : l'ambiance de bar est juste.
- Les tirs en bande et les feintes de visée : ça ressemble aux « passes en bande » qu'on travaille.

## Ce qui sonne faux ou manque de plaisir (du plus important au moins important)
1. **Les échanges s'arrêtent trop vite.** Au vrai baby, une balle contrée REPART : elle rebondit sur le joueur et
   revient vers toi, on la rattrape, on retente. Ici, un contre = pause puis Rémi réengage. C'est le plus gros manque
   de rythme. → Proposition A : « BALLE FOLLE » : un contre renvoie la balle vers ton but (plus lente, direction
   au hasard) : tu dois la rattraper comme un tir, et si tu l'arrêtes, tu repars à l'attaque.
2. **Son gardien et sa défense ne jouaient pas ensemble.** Un bon défenseur ferme un angle avec la défense et laisse
   l'autre au gardien. → FAIT en V19v : son gardien lit aussi ta visée (`babyGardienLit` : 0 / 0,2 / 0,4 / 0,3).
   Plus tard : vraie défense à deux barres (le gardien prend le côté que la défense ne couvre pas).
3. **On ne fait que des tirs du gardien.** Au baby, on passe la balle : gardien → défense → … → attaque, et c'est
   l'attaque qui marque. → Proposition B : « PASSE » : depuis ton gardien, un bouton fait passer la balle à ton
   ATTAQUE (3 joueurs, juste devant sa défense) : tir plus court et plus dangereux, mais la passe peut être
   interceptée par son attaque.
4. **Pas de puissance.** Tous tes tirs partent à la même vitesse (sauf ÉCLAIR). → Proposition C : maintenir TIR =
   charger (jauge) : plus fort = plus dur à arrêter pour son gardien, mais la visée tremble pendant la charge.
5. **Trop de temps morts.** Préparation de Rémi de 0,9 à 1,4 s + célébrations : entre deux actions, on attend.
   → Proposition D : préparation raccourcie de 20 % et célébration du but plus courte (la caméra reste, le reste file).
6. **Un arrêt est toujours parfait.** La balle « colle » au gardien. Au baby, elle rebondit si on ne l'amortit pas.
   → Proposition E : arrêt en BOUGEANT = la balle ricoche devant toi (petite balle folle), arrêt immobile = balle tenue.
7. **Le tir de Rémi vient toujours de son attaque.** Il pourrait tirer de loin (sa défense, tir lent mais surprise).
   Moins prioritaire.

## Difficulté (« encore un peu facile »)
- FAIT V19v : son gardien lit ta visée (voir 2). Bot : PRESSION toujours gagnable vite pour un bot parfait,
  CUL SEC ≈ 8 s de visée en moyenne avant un passage (une valeur plus forte rend CUL SEC impossible : bot bloqué).
- Les propositions A, B et E ajoutent surtout du PLAISIR ; A et E rendent aussi le jeu plus dur sans frustration
  (plus d'actions, pas de murs invisibles).

## Ordre conseillé
A (balle folle) → D (moins de temps morts) → C (puissance) → B (passe à l'attaque) → E (amorti).
