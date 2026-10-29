// =====================================================================
// Réglages du boss BEUFA : infiltration de nuit dans sa base militaire (vue du dessus, façon Metal Gear).
// Tous les chiffres d'équilibrage sont ici : on peut les modifier sans risque.
// =====================================================================
export const IDENTITE = { id: 'beufa', nom: 'Beufa' };

export const REGLAGES = {
  joueur: {
    vitesse: 165,      // marche (px/s) : silencieuse
    sprint: 270,       // Z : plus rapide, mais les gardes proches T'ENTENDENT
    rayon: 13,
    bruit: 150,        // rayon (px) dans lequel un garde entend le sprint
    pierres: 3,        // X : lance une pierre pour attirer les gardes AILLEURS
    porteePierre: 160,
  },
  garde: {
    portee: 190,       // portée du cône de vision (px)
    angle: 30,         // demi-angle du cône (°)
    reperage: 0.55,    // secondes dans le cône avant le « ! » (la jauge de repérage)
    vitesseRonde: 62,
    vitessePoursuite: 215,
    rayon: 14,
  },
  tour: {
    portee: 235,       // les projecteurs voient PLUS loin...
    angle: 16,         // ...mais leur cône est ÉTROIT
    balayage: 38,      // vitesse de rotation (°/s) : prévisible, ça s'apprend
    reperage: 0.8,
  },
  alerte: {
    collective: 240,    // un « ! » met aussi en alerte les gardes à cette distance
    poursuiteMax: 3.5,  // s sans te voir avant que le garde aille vérifier sur place
    verification: 2.2,  // s à fouiller les caisses avant de retourner à sa ronde
    rattrape: 24,      // px : il te touche → RENVOYÉ au départ (jamais de mort)
  },
};

// LA BASE : x, y = CENTRES des obstacles ; murs/caisses/piliers/tours bloquent le passage ET la vue.
// Le héros part du bas (la poche au centre, entre les deux bas de ronde) ; LA PORTE DU QG est en haut au centre.
export const CARTE = {
  murs: [
    [9, 270, 18, 540], [951, 270, 18, 540], [480, 531, 960, 18],
    [205, 9, 410, 18], [755, 9, 410, 18],   // le haut laisse OUVERTE la porte du QG (x 410 à 550)
  ],
  caisses: [   // 56 x 56
    [232, 452], [312, 452], [648, 452], [728, 452],
    [120, 352], [452, 352], [508, 352], [840, 352],
    [300, 252], [660, 252],
    [120, 162], [232, 162], [728, 162], [840, 162],
  ],
  piliers: [   // 34 x 34
    [386, 206], [574, 206], [336, 300], [624, 300],
  ],
  tours: [[150, 250], [810, 250]],   // 72 x 72 : le projecteur qui balaye
  gardes: [
    { chemin: [[70, 150], [70, 480]] },               // le couloir de gauche, du haut en bas
    { chemin: [[890, 150], [890, 480]] },             // le couloir de droite
    { chemin: [[120, 500], [350, 500]] },             // la poche en bas à gauche
    { chemin: [[610, 500], [840, 500]] },             // la poche en bas à droite
    { chemin: [[200, 402], [760, 402]] },             // la grande traversée du milieu
    { chemin: [[300, 108], [660, 108]] },             // la garde rapprochée de la porte
    { chemin: [[480, 296], [480, 296]], scan: 65 },   // LE PLANTÉ du centre : il balaie, il bouge jamais
  ],
};
