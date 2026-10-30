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
    rattrape: 22,      // px : il te touche → RENVOYÉ à l'entrée de la pièce (jamais de mort)
  },
};

// LA BASE = LE PLAN DE FABIEN (photo du 30/10) — mais UNE PIÈCE À L'ÉCRAN À LA FOIS,
// avec un fondu pour passer de l'une à l'autre (conseil de designer stealth —
// « Mark of the Ninja » : un espace de rencontre = UN écran, pas plus ;
// au-delà, le joueur se perd. Et un CHECKPOINT PAR PIÈCE : se faire prendre
// renvoie à l'entrée DE LA PIÈCE, jamais au tout début).
//
// RÈGLES DE PLACEMENT DES GARDES (conseils du même designer) :
//  - chaque cône laisse une FENÊTRE claire : on balaie, on ne fixe JAMAIS un passage obligatoire ;
//  - l'entrée de chaque pièce reste une poche SÛRE, d'où le joueur OBSERVE les rondes avant de bouger ;
//  - deux routes au moins vers la sortie (gauche ou droite), et des couvertures pour épier.
export const PIECES = [
  { // ----- PIÈCE 1 : LA COUR D'ENTRÉE (on apprend : une ronde + un balayage, deux routes) -----
    nom: 'PIÈCE 1/2 · LA COUR D\'ENTRÉE',
    murs: [   // [x, y, l, h] — x, y = CENTRES ; épaisseur 20 partout
      [227, 10, 434, 20], [733, 10, 434, 20],   // mur du haut : LA PORTE (x 445-515) vers la salle du QG
      [480, 530, 960, 20],                      // mur du bas (l'entrée de la base)
      [10, 225, 20, 410], [10, 508, 20, 24],    // mur de gauche : PORTE VERROUILLÉE (y 420-496) — pièce à venir du plan
      [950, 270, 20, 540],                      // mur de droite
    ],
    portesVerrouillees: [ [10, 458, 20, 76] ],   // dessinée (LED rouge), elle bloque
    portes: [ [480, 10, 0] ],                    // LA SORTIE en haut (LED verte, bande jaune)
    caisses: [ [192, 432], [384, 432], [576, 432], [768, 432] ],   // les 4 du plan, alignées en bas : ta couverture
    tours: [],
    gardes: [
      { chemin: [[250, 320], [710, 320]] },                        // LA RONDE : elle coupe la pièce en deux — passe dans son dos
      { chemin: [[330, 130], [330, 130]], scan: 50, scanBase: 0 },  // LA BONBONNE : plantée, elle balaie le coin haut-gauche
    ],
    entree: { x: 480, y: 490 },   // la poche sûre du bas, entre les caisses
    sortie: 'haut',               // traverser la porte du haut → pièce suivante
  },
  { // ----- PIÈCE 2 : LA SALLE DU QG (la garde rapprochée : tout le plan du haut, en une pièce) -----
    nom: 'PIÈCE 2/2 · LA SALLE DU QG',
    murs: [
      [480, 10, 960, 20],                        // mur du haut
      [227, 530, 434, 20], [733, 530, 434, 20],  // mur du bas : LA PORTE D'ENTRÉE (x 445-515), celle par laquelle tu arrives
      [10, 35, 20, 30], [10, 317, 20, 406],      // mur de gauche : PORTE VERROUILLÉE (y 50-114) — pièce à venir du plan
      [950, 102, 20, 165], [950, 388, 20, 264],  // mur de droite : LA PORTE DU QG (y 185-255) — LA SORTIE
    ],
    portesVerrouillees: [ [10, 82, 20, 64] ],
    portes: [ [480, 530, 0], [950, 220, Math.PI / 2] ],   // la porte d'entrée + LA PORTE DU QG (LED verte)
    caisses: [   // les 3 du plan en haut + 2 couvertures près de l'entrée
      [240, 108], [480, 108], [720, 108],
      [330, 430], [630, 430],
    ],
    tours: [ [400, 250] ],   // LE PROJECTEUR du plan : au centre de la salle, il balaye tout
    gardes: [
      { chemin: [[96, 81], [96, 81]], scan: 45, scanBase: Math.PI / 2 },    // LA BONBONNE de GAUCHE : elle balaie vers le bas
      { chemin: [[864, 81], [864, 81]], scan: 45, scanBase: Math.PI / 2 },  // LA BONBONNE de DROITE : elle couvre l'approche du QG
      { chemin: [[340, 55], [620, 55]] },                                   // LA DOUBLE FLÈCHE du plan : la ronde entre les deux bonbonnes
      { chemin: [[700, 330], [890, 330]] },                                 // LA GARDE DU QG : il boucle devant la porte
    ],
    entree: { x: 480, y: 492 },   // la poche sûre du bas, entre les deux couvertures
    sortie: 'qg',                 // atteindre la PORTE DU QG à droite → VICTOIRE
  },
];
