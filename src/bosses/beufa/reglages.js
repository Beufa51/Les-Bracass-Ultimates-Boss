// =====================================================================
// Réglages du boss BEUFA : infiltration de nuit dans sa base militaire (vue du dessus, façon Metal Gear NES).
// TOUS les chiffres d'équilibrage sont ici : on peut les modifier sans risque.
// =====================================================================
export const IDENTITE = { id: 'beufa', nom: 'Beufa' };

export const REGLAGES = {
  joueur: {
    vitesse: 120,      // marche (px/s) : silencieuse — LENTE, comme une infiltration
    sprint: 185,       // Z : plus rapide, mais les gardes proches T'ENTENDENT
    rayon: 10,      // V25 : on frôle les caisses SANS être bloqué — les couloirs redeviennent passables
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
// V24 — LE PASS DU DESIGNER SENIOR : la base n'est plus un écran, c'est un LIEU.
// PIÈCE 1 = 960×1080, une cour DEUX FOIS plus profonde que l'écran : le portail
// au SUD, un AXE central qui monte, un DÉPÔT à l'ouest, un MOTOR POOL à l'est,
// et tout au nord LA PORTE DU QG sous SA tour. Trois zones, SEPT gardes, TROIS
// halos : on avance par paliers, chaque zone a son horloge. PIÈCE 2 = 1440×720,
// le QG EN LONGUEUR : on entre au sud-ouest, le bureau de Beufa est à l'extrême
// EST — table des cartes au centre qu'un STRATÈGE tourne en boucle, deux halos
// en opposition qui balaient le plateau. On ne « traverse » plus une pièce :
// on l'INFILTRE.
export const PIECES = [
  { // ----- PIÈCE 1 : LA COUR DU PORTAIL — 960×1080, trois zones, sept gardes -----
    nom: 'PIÈCE 1/2 · LA COUR DU PORTAIL',
    l: 960, h: 1080,   // V24 : la cour déborde de l'écran — elle DÉFILE sous la caméra
    teinteSol: 0x9fc0a8,   // la cour est DEHORS : le sol tire vers l'herbe de nuit
    murs: [   // [x, y, l, h] — x, y = CENTRES ; épaisseur 20 partout
      [227, 10, 434, 20], [733, 10, 434, 20],     // le mur du QG : LA PORTE DE LA BASE (x 445-515)
      [227, 1070, 434, 20], [733, 1070, 434, 20], // le mur du portail — c'est par là qu'on arrive
      [10, 270, 20, 500], [10, 835, 20, 510],     // l'ouest : la PORTE DU DÉPÔT (verrouillée)
      [950, 555, 20, 1070],                       // l'est : le mur du motor pool
    ],
    portesVerrouillees: [ [10, 550, 20, 60] ],
    portes: [ [480, 10, 0] ],          // LA PORTE DU QG (elle pulse dans la nuit)
    routes: [ [480, 555, 70, 1080] ],   // L'AXE : du portail droit à la porte du QG
    conteneurs: [   // les GRANDES couvertures, elles coupent la vue
      [250, 470, 140, 52],                                // LE DÉPÔT : deux conteneurs face à face —
      [250, 570, 140, 52],       //   la ronde passe dans l'allée, tu tournes autour
      [700, 330, 140, 52],                                // LE MOTOR POOL : l'abri du véhicule
      [820, 700, 52, 140],                                //   et le fourgon garé contre l'est
      [600, 680, 140, 52],                                // LA COUVERTURE DU MILIEU : casse l'axe du sud
    ],
    sacs: [ [390, 515], [570, 515] ],   // LE POSTE DE CONTRÔLE au carrefour de l'axe
    caisses: [
      [560, 990],    // V25 : le bidon du portail — couloir sud DÉGAGÉ
      [420, 700],    // LE SLALOM DE L'AXE : deux plots — un pas de couverture entre
      [540, 420],    //   la sentinelle et le halo qui descend du QG
      [180, 400],    // le dépôt : pour tourner autour de la ronde de l'allée
      [352, 622],    //   l'angle sud du dépôt
      [884, 300],    // le motor pool : les bidons de l'angle nord-est
      [864, 1000],   // V25 : et le long du mur est — couloir est DÉGAGÉ (passable)
      [300, 820],    // le coin du chien de garde, au sud-ouest
    ],
    projecteurs: [   // TROIS TOURS, une par zone : le QG, le dépôt, la voie est
      { tour: [480, 14], depart: [480, 70], arrivee: [480, 250] },     // le halo descend L'AXE jusqu'au SAS
      { tour: [10, 515], depart: [70, 515], arrivee: [390, 515] },     // le halo balaie L'ALLÉE DU DÉPÔT
      { tour: [940, 515], depart: [880, 515], arrivee: [700, 515] },   // le halo couvre LA VOIE DU MOTOR POOL
    ],
    gardes: [
      { chemin: [[480, 780], [480, 300]] },                                 // LA SENTINELLE DE L'AXE : la longue horloge du milieu
      { chemin: [[150, 900], [400, 900]] },                                 // LE CHIEN DE GARDE : le quart sud-ouest
      { chemin: [[110, 515], [330, 515]] },                                 // LA RONDE DU DÉPÔT : dans l'allée, SOUS le halo
      { chemin: [[880, 380], [880, 760]] },                                 // LE MOTOR POOL : l'aller-retour de la voie est
      { chemin: [[480, 80], [480, 80]], scan: 55, scanBase: Math.PI / 2 },   // LE SAS DU QG : la PIERRE est la clé
      { chemin: [[600, 200], [900, 200]] },                                 // LE GUÉPARD DU NORD : l'approche nord-est du SAS
      { chemin: [[700, 940], [920, 940]] },                                 // LE RIDEAU DU SUD : il ferme le coin sud-est
    ],
    entree: { x: 480, y: 1030 },  // le portail : une poche sûre — vérifiée contre les 7 cônes
    sortie: 'haut',               // traverser LA PORTE DU QG → pièce suivante
  },
  { // ----- PIÈCE 2 : LE QG — 1440×720, infiltration en longueur, six gardes -----
    nom: 'PIÈCE 2/2 · LE QG',
    l: 1440, h: 720,   // V24 : la salle des opérations est DEUX FOIS plus large que l'écran
    teinteSol: 0xaab4d8,   // la salle est DEDANS : sol bleuté
    murs: [
      [720, 10, 1440, 20],                        // le mur du nord
      [155, 710, 290, 20], [895, 710, 1090, 20],  // le mur du sud : LA PORTE D'ENTRÉE (x 300-350)
      [10, 375, 20, 710],                         // l'ouest : le mur du veilleur
      [1430, 170, 20, 300], [1430, 570, 20, 320], // l'est : LA PORTE DU BUREAU DE BEUFA (y 320-410)
    ],
    portesVerrouillees: [],
    portes: [ [325, 710, 0], [1430, 365, Math.PI / 2] ],   // l'entrée + LE BUREAU (il pulse dans la nuit)
    routes: [],
    conteneurs: [   // les RAYONNAGES du matériel : quatre couloirs traversent la salle
      [250, 120, 140, 52],   // le rayonnage nord-ouest
      [690, 120, 140, 52],                            // le rayonnage nord
      [1130, 120, 140, 52],                           // le rayonnage nord-est
      [150, 380, 52, 140],   // le rayonnage de l'ouest
      [1130, 380, 52, 140],                           // le rayonnage du centre-est
      [1250, 620, 140, 52],                           // le rayonnage du sud-est
    ],
    tables: [ [720, 360] ],   // LA TABLE DES CARTES : les deux halos la frôlent au-dessus
    sacs: [],
    caisses: [ [500, 350], [60, 200], [1240, 120], [1350, 540], [700, 550] ],   // une couverture par couloir
    projecteurs: [   // EN OPPOSITION DE PHASE : le plateau n'est jamais éclairé que d'UNE lumière
      { tour: [26, 360], depart: [70, 360], arrivee: [600, 360] },
      { tour: [1414, 600], depart: [1370, 600], arrivee: [1050, 600], phase: 4 },   // V25 : déplacé au SUD — la PORTE DU BUREAU est dégagée
    ],
    gardes: [   // SIX menaces, chacune garde SON couloir :
      { chemin: [[150, 220], [150, 220]], scan: 45, scanBase: 0 },        // L'OFFICIER DE QUART : il balaie la salle vers l'est
      { chemin: [[380, 60], [1300, 60]] },                               // LA RONDE DU NORD : le long des rayonnages
      { chemin: [[600, 620], [1150, 620]] },                             // LA RONDE DU SUD : sous la table des cartes
      { chemin: [[1360, 300], [1360, 430]] },                            // LE CERBÈRE DU BUREAU : il monte et descend devant la porte
      { chemin: [[560, 240], [880, 240], [880, 480], [560, 480]] },       // LE STRATÈGE : il fait LE TOUR DE LA TABLE en boucle
      { chemin: [[80, 350], [80, 600]] },                                // LE VEILLEUR : le couloir de l'ouest
    ],
    entree: { x: 325, y: 660 },   // la poche sûre du sud-ouest — vérifiée contre les 6 cônes
    sortie: 'qg',                 // atteindre LE BUREAU DE BEUFA → VICTOIRE
  },
];

