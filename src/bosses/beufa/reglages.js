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
    bruit: 160,        // rayon (px) dans lequel un garde entend le sprint
    pierres: 5,        // X : lance une pierre pour attirer les gardes AILLEURS (la clé des plantés)
    porteePierre: 300, // elle VOLE LOIN : détourner un garde sans entrer dans son cône
  },
  garde: {
    portee: 205,       // V23 : la nuit jouait POUR toi — les gardes voient PLUS LOIN
    angle: 26,         // demi-angle du cône (°)
    reperage: 0.9,     // V23 : dans un cône, on se fait repérer VITE — fini le « ? » interminable
    vitesseRonde: 42,  // V23 : une ronde LENTE mais les fenêtres se referment PLUS VITE
    vitessePoursuite: 160,
    rayon: 14,
    pause: 1.2,        // V23 : il s'arrête MOINS LONGTEMPS à chaque bout
  },
  projecteur: {
    rayon: 62,        // V23 : les halos sont PLUS LARGE
    periode: 8,       // s d'un va-et-vient complet : la lumière file jusqu'au milieu puis REVIENT
    reperage: 1.0,    // V23 : et ils repèrent PLUS VITE
  },
  alerte: {
    collective: 270,    // V23 : l'alerte se propage PLUS LOIN dans la base
    poursuiteMax: 5,   // V23 : ils te cherchent PLUS LONGTEMPS
    verification: 3.5,   // s à fouiller avant de retourner à sa ronde
    rattrape: 24,      // px : il te touche → RENVOYÉ à l'entrée de la pièce (jamais de mort)
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
// V23 — UNE VRAIE BASE, PENSÉE COMME UNE BASE : le portail au sud, un AXE central
// qui monte droit au QG, un DÉPÔT à l'ouest avec SA tour d'éclairage, un MOTOR POOL
// à l'est — et au nord LA PORTE DU QG sous le projecteur. Chaque zone a sa sentinelle,
// chaque sentinelle est une HORLOGE, et la PIERRE ouvre les plantés. Pièce 2 = LE QG :
// salle des opérations, table des cartes, et LE BUREAU DE BEUFA à l'est — sa porte
// PULSE en vert dans la nuit, gardée par un CERBÈRE qui monte et descend.
export const PIECES = [
  { // ----- PIÈCE 1 : LA COUR DU PORTAIL — portail, axe, dépôt, motor pool, porte du QG -----
    nom: 'PIÈCE 1/2 · LA COUR DU PORTAIL',
    teinteSol: 0x9fc0a8,   // la cour est DEHORS : le sol tire vers l'herbe de nuit
    murs: [   // [x, y, l, h] — x, y = CENTRES ; épaisseur 20 partout
      [227, 10, 434, 20], [733, 10, 434, 20],   // le mur du QG : LA PORTE DE LA BASE (x 445-515)
      [480, 530, 960, 20],                      // le mur du portail — c'est par là qu'on arrive
      [10, 222, 20, 404], [10, 505, 20, 30],    // l'ouest : la PORTE DU DÉPÔT (verrouillée — le plan)
      [950, 270, 20, 540],                      // l'est
    ],
    portesVerrouillees: [ [10, 457, 20, 66] ],
    portes: [ [480, 10, 0] ],          // LA PORTE DU QG (elle pulse dans la nuit)
    routes: [ [480, 270, 70, 540] ],   // L'AXE : du portail droit à la porte du QG
    conteneurs: [   // les GRANDES couvertures, elles coupent la vue
      [250, 200, 140, 52],                                // LE DÉPÔT : deux conteneurs face à face —
      [250, 300, 140, 52, 'beufa_conteneur_olive'],       //   la ronde passe dans l'allée, tu tournes autour
      [700, 112, 140, 52],                                // LE MOTOR POOL : le véhicule sous l'abri
      [820, 260, 52, 140],                                //   et le fourgon garé contre l'est
    ],
    sacs: [ [390, 300], [570, 300] ],   // LE POSTE DE CONTRÔLE sur l'axe
    caisses: [
      [560, 470],    // le bidon du portail : TA première couverture, au spawn
      [420, 360],    // LE SLALOM DE L'AXE : deux plots — un pas de couverture entre
      [540, 220],    //   la sentinelle et le halo qui descend du QG
      [180, 130],    // le dépôt : pour tourner autour de la ronde de l'allée
      [352, 352],    //   l'angle sud du dépôt
      [884, 100],    // le motor pool : les bidons de l'angle nord-est
      [884, 450],    //   et le long du mur est
    ],
    projecteurs: [   // DEUX TOURS, comme une vraie base : une sur le QG, une sur le dépôt
      { tour: [480, 14], depart: [480, 70], arrivee: [480, 250] },    // le halo descend L'AXE
      { tour: [10, 250], depart: [70, 250], arrivee: [390, 250] },   // le halo balaie L'ALLÉE DU DÉPÔT
    ],
    gardes: [
      { chemin: [[480, 390], [480, 150]] },                                 // LA SENTINELLE DE L'AXE : la 1re horloge
      { chemin: [[110, 250], [400, 250]] },                                 // LA RONDE DU DÉPÔT : dans l'allée, SOUS le halo
      { chemin: [[700, 160], [700, 420]] },                                 // LE MOTOR POOL : l'aller-retour des bidons
      { chemin: [[480, 80], [480, 80]], scan: 55, scanBase: Math.PI / 2 },  // LE SAS DU QG : la PIERRE est la clé
      { chemin: [[150, 420], [400, 420]] },                                 // LE CHIEN DE GARDE : le quart sud-ouest ne se promène plus
    ],
    entree: { x: 480, y: 490 },   // le portail : une poche sûre — vérifiée contre les 5 cônes
    sortie: 'haut',               // traverser LA PORTE DU QG → pièce suivante
  },
  { // ----- PIÈCE 2 : LE QG — salle des opérations, table des cartes, bureau de Beufa -----
    nom: 'PIÈCE 2/2 · LE QG',
    teinteSol: 0xaab4d8,   // la salle est DEDANS : sol bleuté
    murs: [
      [480, 10, 960, 20],                        // le mur du nord
      [227, 530, 434, 20], [733, 530, 434, 20],  // le mur du sud : LA PORTE D'ENTRÉE (x 445-515)
      [10, 35, 20, 30], [10, 317, 20, 406],      // l'ouest : la PORTE VERROUILLÉE (le plan)
      [950, 102, 20, 165], [950, 388, 20, 264],  // l'est : LA PORTE DU BUREAU DE BEUFA (y 185-255)
    ],
    portesVerrouillees: [ [10, 82, 20, 64] ],
    portes: [ [480, 530, 0], [950, 220, Math.PI / 2] ],   // l'entrée + LE BUREAU (il pulse dans la nuit)
    routes: [],
    conteneurs: [   // les RAYONNAGES du matériel : la salle a trois couloirs
      [250, 120, 140, 52, 'beufa_conteneur_olive'],   // le rayonnage nord-ouest
      [690, 120, 140, 52],                            // le rayonnage nord-est
      [150, 380, 52, 140, 'beufa_conteneur_olive'],   // le rayonnage de l'ouest
      [820, 380, 52, 140],                           // le rayonnage de l'est
    ],
    tables: [ [480, 350] ],   // LA TABLE DES CARTES : les deux halos la frôlent au-dessus
    sacs: [],
    caisses: [ [480, 220], [60, 250], [880, 150] ],   // une couverture par couloir
    projecteurs: [   // EN OPPOSITION DE PHASE : le centre n'est jamais éclairé que d'UNE lumière
      { tour: [26, 270], depart: [70, 270], arrivee: [480, 270] },
      { tour: [934, 270], depart: [890, 270], arrivee: [480, 270], phase: 4 },
    ],
    gardes: [   // QUATRE menaces, chacune garde UN couloir :
      { chemin: [[96, 81], [96, 81]], scan: 45, scanBase: Math.PI / 2 },    // L'OFFICIER DE QUART : il balaie le couloir ouest
      { chemin: [[340, 60], [620, 60]] },                                   // LA RONDE DU NORD : entre les rayonnages
      { chemin: [[200, 420], [760, 420]] },                                 // LA RONDE DU SUD : sous la table des cartes
      { chemin: [[864, 200], [864, 290]] },                                 // LE CERBÈRE DU BUREAU : il monte et descend devant la porte
    ],
    entree: { x: 480, y: 492 },   // la poche sûre du sud
    sortie: 'qg',                 // atteindre LE BUREAU DE BEUFA → VICTOIRE
  },
];
