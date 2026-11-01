// Plan du niveau 1 : LA MANIF. On part du boulevard (en bas à gauche) et on doit atteindre le portail du lycée (en haut).
// Deux chemins : la ruelle à gauche (plus calme) ou la rue à droite (gardée par un CRS).
//
// Murs (chiffres) : 1 immeuble en briques, 2 immeuble crème, 3 vitrines, 4 mur tagué, 5 palissade de chantier,
//                   6 mur du lycée, 7 portail du lycée.
// Sol : '.' vide, 'J' départ du joueur (regarde vers le haut), 'S' arrivée (devant le portail).
// Ennemis : 'P' policier lanceur de lacrymos, 'B' CRS au bouclier.
// Objets : 'o' boîte d'œufs, 's' sandwich, 'b' barrière (bloque), 'p' poubelle (bloque), 'm' manifestant (décor).
export const PLAN_MANIF = [
  '66666666666666776666666666666666',
  '6666666666....SS....666666666666',
  '6666666666.P......P.666666666666',
  '6666666666..b....b..666666666666',
  '1111111111....B.....222222222222',
  '1111111111111....222222222222222',
  '1111111111111.m..222222222222222',
  '3333333333333....333333333333333',
  '1111111111111..p.222222222222222',
  '1111111111111....222222222222222',
  '111111..................o.222222',
  '111111..P...........P.....222222',
  '44..44...m....b....m......222222',
  '44..44....B.......p.......222222',
  '44..........b.....B...P...222222',
  '44..44........s...........222222',
  '44..4433333333333333...333222222',
  '44..4433333333333333.B.333222222',
  '4..............m.............o.4',
  '4...o.....p.........b..........4',
  '4.J.......m....................4',
  '4....b.......m.......P....s....4',
  '55555555555555555555555555555555',
];

// Ce que représente chaque lettre posée sur le sol
export const OBJETS = {
  P: 'lanceur', B: 'bouclier', o: 'oeufs', s: 'sandwich', b: 'barriere', p: 'poubelle', m: 'manifestant',
};
