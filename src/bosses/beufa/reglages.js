// =====================================================================
// Réglages du boss BEUFA : infiltration de nuit dans sa base militaire (vue du dessus, façon Metal Gear NES).
// TOUS les chiffres d'équilibrage sont ici : on peut les modifier sans risque.
// =====================================================================
export const IDENTITE = { id: 'beufa', nom: 'Beufa' };

export const REGLAGES = {
  joueur: {
    vitesse: 120,      // marche (px/s) : silencieuse — LENTE, comme une infiltration
    sprint: 185,       // Z : plus rapide, mais les gardes proches T'ENTENDENT
    rayon: 13,
    bruit: 130,        // rayon (px) dans lequel un garde entend le sprint
    pierres: 3,        // X : lance une pierre pour attirer les gardes AILLEURS
    porteePierre: 160,
  },
  garde: {
    portee: 175,       // portée du cône de vision (px)
    angle: 26,         // demi-angle du cône (°)
    reperage: 1.2,     // secondes dans le cône avant le « ! » — ça pardonne, on réagit
    vitesseRonde: 34,  // une vraie ronde : LENTE
    vitessePoursuite: 150,
    rayon: 14,
    pause: 1.6,        // s d'arrêt à chaque bout de la ronde (il regarde autour, comme dans MGS)
  },
  tour: {
    portee: 215,       // les projecteurs voient loin...
    angle: 14,         // ...mais leur cône est ÉTROIT
    balayage: 22,      // °/s : lent et prévisible, ça s'apprend
    reperage: 1.4,
  },
  alerte: {
    collective: 200,    // un « ! » met aussi en alerte les gardes à cette distance
    poursuiteMax: 4,   // s sans te voir avant que le garde aille vérifier sur place
    verification: 3,   // s à fouiller avant de retourner à sa ronde
    rattrape: 22,      // px : il te touche → RENVOYÉ au départ (jamais de mort)
  },
};

// LA BASE = LE PLAN DE FABIEN (photo du 30/10), pièce par pièce — en voici les 2 PREMIÈRES :
// la pièce du BAS (l'entrée, où tu commences) et la pièce du HAUT (la salle du QG).
// La PORTE entre les deux est au centre ; LA PORTE DU QG est en haut à droite.
// Les 2 ouvertures à gauche sont les portes des pièces À VENIR (verrouillées pour l'instant).
export const CARTE = {
  murs: [   // [x, y, l, h] — x, y = CENTRES ; épaisseur 20 partout
    [480, 10, 960, 20],                                // mur du haut de la pièce du haut
    [227, 270, 434, 20], [733, 270, 434, 20],          // le mur du milieu : la PORTE (x 445-515) au centre
    [480, 530, 960, 20],                               // mur du bas (l'entrée de la base)
    [10, 30, 20, 40], [10, 267, 20, 306], [10, 513, 20, 34],   // mur de gauche : 2 portes à venir (y 50-114 et 420-496)
    [950, 97, 20, 175], [950, 392, 20, 275],           // mur de droite : LA PORTE DU QG (y 185-255)
  ],
  portesVerrouillees: [ [10, 82, 20, 64], [10, 458, 20, 76] ],   // dessinées, elles bloquent (pièces suivantes du plan)
  caisses: [   // 56 x 56 — le plan : 3 dans la pièce du haut, 4 alignées dans celle du bas
    [240, 108], [480, 108], [720, 108],
    [192, 432], [384, 432], [576, 432], [768, 432],
  ],
  piliers: [],
  tours: [[400, 150]],   // LE PROJECTEUR de la pièce du haut, au centre — il balaye
  gardes: [
    { chemin: [[96, 81], [96, 81]], scan: 45, scanBase: -Math.PI / 2 },    // la bonbonne de GAUCHE, goulot vers le HAUT
    { chemin: [[864, 81], [864, 81]], scan: 45, scanBase: -Math.PI / 2 },  // la bonbonne de DROITE, goulot vers le HAUT
    { chemin: [[340, 55], [620, 55]] },   // la DOUBLE FLÈCHE : la ronde entre les deux bonbonnes
    { chemin: [[96, 405], [96, 405]], scan: 55, scanBase: Math.PI },       // la bonbonne de la pièce du bas, vers la GAUCHE
  ],
};
