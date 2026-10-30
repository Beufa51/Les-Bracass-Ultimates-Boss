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
  projecteur: {
    rayon: 55,        // rayon du HALO lumineux au sol (px)
    periode: 8,       // s d'un va-et-vient complet : la lumière file jusqu'au milieu puis REVIENT
    reperage: 1.3,    // s dans le halo avant que le garde le plus proche ne soit alerté
  },
  alerte: {
    collective: 200,    // un « ! » met aussi en alerte les gardes à cette distance
    poursuiteMax: 4,   // s sans te voir avant que le garde aille vérifier sur place
    verification: 3,   // s à fouiller avant de retourner à sa ronde
    rattrape: 22,      // px : il te touche → RENVOYÉ à l'entrée de la pièce (jamais de mort)
  },
  vue: {
    zoom: 1.4,   // la caméra RAPPROCHÉE : elle suit le héros — 1 = pièce entière, 2 = très proche
  },
};

// LA BASE = LE PLAN DE FABIEN — UNE PIÈCE À L'ÉCRAN À LA FOIS (conseil de designer
// stealth « Mark of the Ninja » : un espace de rencontre = UN écran ; CHECKPOINT PAR
// PIÈCE : se faire prendre renvoie à l'entrée DE LA PIÈCE).
//
// V6 — « UNE VRAIE BASE MILITAIRE » (demande de Fabien : plus rien de posé à
// l'arrache, chaque chose est À SA PLACE) :
//  LA COUR D'ENTRÉE (extérieur) : le PORTAIL au sud, une ROUTE en asphalte qui
//  monte tout droit jusqu'à la porte de la salle du QG — et le projecteur du mur
//  nord L'ÉCLAIRE. À gauche la cour de STOCKAGE (2 conteneurs alignés, le garde
//  fait sa ronde ENTRE eux). À droite le MOTOR POOL (conteneur vertical, barils).
//  Sur la route, le POSTE DE CONTRÔLE : deux nids de sacs de sable face à face,
//  et la sentinelle qui monte sa garde sur l'asphalte. À la porte, le planté du
//  sas. Rien d'aléatoire : chaque garde SURVEILLE quelque chose.
//  LA SALLE DU QG (poste de commandement) : les rayonnages du haut, la TABLE À
//  CARTES d'état-major au centre — les deux projecteurs des murs latéraux
//  SE REJOIGNENT juste au-dessus —, la garde du QG qui boucle devant la porte
//  du bureau de Beufa, à droite.
//
// RÈGLES DE PLACEMENT : chaque cône laisse une FENÊTRE claire ; l'entrée de
// chaque pièce reste une poche SÛRE d'où OBSERVER ; au moins deux routes vers
// la sortie.
export const PIECES = [
  { // ----- PIÈCE 1 : LA COUR D'ENTRÉE — portail, route, stockage, motor pool -----
    nom: 'PIÈCE 1/2 · LA COUR D\'ENTRÉE',
    teinteSol: 0x9fc0a8,   // la cour est DEHORS : le sol tire vers l'herbe de nuit
    murs: [   // [x, y, l, h] — x, y = CENTRES ; épaisseur 20 partout
      [227, 10, 434, 20], [733, 10, 434, 20],   // mur du nord : LA PORTE (x 445-515) de la salle du QG
      [480, 530, 960, 20],                      // mur du sud : LE PORTAIL (x 445-515), par où tu arrives
      [10, 222, 20, 404], [10, 505, 20, 30],    // mur de l'ouest : PORTE VERROUILLÉE (y 424-490) — pièce à venir du plan
      [950, 270, 20, 540],                      // mur de l'est
    ],
    portesVerrouillees: [ [10, 457, 20, 66] ],
    portes: [ [480, 10, 0] ],          // LA SORTIE au nord (LED verte, bande jaune)
    routes: [ [480, 270, 70, 540] ],   // LA ROUTE : du portail droit à la porte, l'axe de la base
    conteneurs: [   // [x, y, l, h] (+ image optionnelle) — les GRANDES couvertures, elles coupent la vue
      [250, 200, 140, 52],                                // la cour de STOCKAGE : deux conteneurs alignés
      [250, 300, 140, 52, 'beufa_conteneur_olive'],       //   l'un contre l'autre — le garde ronde ENTRE eux
      [820, 260, 52, 140],                                // le MOTOR POOL : le conteneur vertical contre l'est
    ],
    sacs: [ [390, 300], [570, 300] ],   // LE POSTE DE CONTRÔLE : deux nids de sacs, face à face sur la route
    caisses: [
      [180, 130],    // le stock : des caisses contre les conteneurs
      [884, 100],    // le motor pool : des barils dans l'angle nord-est
      [884, 450],    //   et le long du mur est
      [560, 470],    // le baril du portail : TA première couverture, juste au spawn
    ],
    projecteurs: [   // la tour est SUR le mur ; son HALO voyage de « depart » à « arrivee »
      { tour: [480, 14], depart: [480, 60], arrivee: [480, 260] },   // IL ÉCLAIRE LA ROUTE, l'axe d'entrée de la base
    ],
    gardes: [
      { chemin: [[480, 330], [480, 150]] },                         // LA SENTINELLE DE LA ROUTE : elle monte sa garde sur l'asphalte
      { chemin: [[110, 250], [400, 250]] },                         // LE STOCKAGE : sa ronde passe ENTRE les deux conteneurs
      { chemin: [[700, 160], [700, 420]] },                         // LE MOTOR POOL : sa ronde fait l'aller-retour devant les barils
      { chemin: [[480, 90], [480, 90]], scan: 40, scanBase: Math.PI / 2 },   // LE SAS : le planté de la porte du QG, il balaie
    ],
    entree: { x: 480, y: 490 },   // le portail : une poche sûre, rien ne la voit
    sortie: 'haut',               // traverser la porte du nord → pièce suivante
  },
  { // ----- PIÈCE 2 : LA SALLE DU QG — rayonnages, table à cartes, garde rapprochée -----
    nom: 'PIÈCE 2/2 · LA SALLE DU QG',
    teinteSol: 0xaab4d8,   // la salle est DEDANS : sol bleuté
    murs: [
      [480, 10, 960, 20],                        // mur du nord
      [227, 530, 434, 20], [733, 530, 434, 20],  // mur du sud : LA PORTE D'ENTRÉE (x 445-515), celle par laquelle tu arrives
      [10, 35, 20, 30], [10, 317, 20, 406],      // mur de l'ouest : PORTE VERROUILLÉE (y 50-114) — pièce à venir du plan
      [950, 102, 20, 165], [950, 388, 20, 264],  // mur de l'est : LA PORTE DU QG (y 185-255) — le bureau de BEUFA
    ],
    portesVerrouillees: [ [10, 82, 20, 64] ],
    portes: [ [480, 530, 0], [950, 220, Math.PI / 2] ],   // la porte d'entrée + LA PORTE DU QG (LED verte)
    routes: [],
    conteneurs: [   // les RAYONNAGES du poste : alignés contre les murs, comme du matériel entreposé
      [250, 120, 140, 52, 'beufa_conteneur_olive'],   // le rayonnage nord-ouest
      [690, 120, 140, 52],                            // le rayonnage nord-est
      [150, 380, 52, 140, 'beufa_conteneur_olive'],   // le rayonnage de l'ouest
      [820, 380, 52, 140],                           // le rayonnage de l'est — il force le couloir du QG
    ],
    tables: [ [480, 350] ],   // LA TABLE À CARTES : le cœur du poste de commandement
    sacs: [],
    caisses: [ [480, 220], [880, 150], [60, 250] ],   // des caisses entre les rayonnages et la table
    projecteurs: [   // LES DEUX TOURS AU BORD : leurs halos filent du mur jusqu'au MILIEU —
      { tour: [26, 270], depart: [70, 270], arrivee: [480, 270] },    // et SE REJOIGNENT juste au-dessus
      { tour: [934, 270], depart: [890, 270], arrivee: [480, 270] }, // de la table à cartes
    ],
    gardes: [
      { chemin: [[96, 81], [96, 81]], scan: 45, scanBase: Math.PI / 2 },    // LA BONBONNE de l'ouest : elle balaie le rayonnage
      { chemin: [[864, 81], [864, 81]], scan: 45, scanBase: Math.PI / 2 },  // LA BONBONNE de l'est : elle couvre l'approche du QG
      { chemin: [[340, 55], [620, 55]] },                                   // LA DOUBLE FLÈCHE du plan : la ronde ENTRE les deux bonbonnes
      { chemin: [[640, 270], [890, 270]] },                                 // LA GARDE DU QG : elle boucle devant la porte du bureau, DANS les projecteurs
      { chemin: [[120, 260], [360, 260]] },                                  // la ronde du couloir de l'ouest
      { chemin: [[250, 440], [710, 440]] },                                 // la ronde du sud, entre l'entrée et la table à cartes
    ],
    entree: { x: 480, y: 492 },   // la poche sûre du sud
    sortie: 'qg',                 // atteindre LA PORTE DU QG à l'est → VICTOIRE
  },
];
