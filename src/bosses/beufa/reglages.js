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
    reperage: 0.55,    // V27 : dans un cône on est repéré EN UN CLIN D'ŒIL — la nuit ne pardonne plus
    vitesseRonde: 42,  // V23 : une ronde LENTE mais les fenêtres se referment PLUS VITE
    vitessePoursuite: 160,
    rayon: 14,
    pause: 1.2,        // V23 : il s'arrête MOINS LONGTEMPS à chaque bout
  },
  projecteur: {
    rayon: 62,        // V23 : les halos sont PLUS LARGE
    periode: 8,       // s d'un va-et-vient complet : la lumière file jusqu'au milieu puis REVIENT
    reperage: 0.6,    // V27 : sous un halo, on est grillé presque aussitôt
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
// V27 — QUATRE PIÈCES AVANT LE QUIZ (demande de Fabien). Chaque salle a SON
// identité et SA mécanique : 1. LA COUR DU PORTAIL (l'extérieur, trois zones,
// huit gardes) ; 2. LE PARC À VÉHICULES (traversée du parking d'ouest en est,
// camions en rangées, phares en opposition, la voie de service balayée) ;
// 3. L'ARSENAL (la grille des râteliers en damier : on SERPENTE entre les
// rayons sous les yeux de l'armurier — la salle la plus serrée de la base) ;
// 4. LE QG DE BEUFA (le poste de commandement, la table des cartes, le bureau).
export const PIECES = [
  { // ----- PIÈCE 1 : LA COUR DU PORTAIL — 960×1080, trois zones, huit gardes -----
    nom: 'PIÈCE 1/4 · LA COUR DU PORTAIL',
    l: 960, h: 1080,   // la cour déborde de l'écran — elle DÉFILE sous la caméra
    teinteSol: 0x9fc0a8,   // la cour est DEHORS : le sol tire vers l'herbe de nuit
    murs: [
      [227, 10, 434, 20], [733, 10, 434, 20],     // le mur du QG : LA PORTE DE LA BASE (x 445-515)
      [227, 1070, 434, 20], [733, 1070, 434, 20], // le mur du portail — c'est par là qu'on arrive
      [10, 270, 20, 500], [10, 835, 20, 510],     // l'ouest : la PORTE DU DÉPÔT (verrouillée)
      [950, 555, 20, 1070],                       // l'est : le mur du motor pool
    ],
    portesVerrouillees: [ [10, 550, 20, 60] ],
    portes: [ [480, 10, 0] ],          // LA PORTE DU QG (elle pulse dans la nuit)
    routes: [ [480, 555, 70, 1080] ],   // L'AXE : du portail droit à la porte du QG
    conteneurs: [
      // LE NORD (V27 : le quartier du SAS n'est plus vide)
      [300, 150, 140, 52],   // LA BARAQUE DU POSTE, à l'ouest de l'axe — la couverture contre le SAS
      [680, 100, 52, 140],   // LE FOURGON DU POSTE, à l'est — le guépard rôde derrière
      // LE DÉPÔT
      [250, 470, 140, 52],   // deux conteneurs face à face —
      [250, 570, 140, 52],   //   la ronde passe dans l'allée, tu tournes autour
      [180, 410, 140, 52],   // la couverture nord du dépôt
      [300, 622, 140, 52],   // l'angle sud du dépôt, empilé sur l'allée
      // LE MOTOR POOL
      [700, 330, 140, 52],   // l'abri du véhicule
      [820, 700, 52, 140],   // le fourgon garé contre l'est
      [860, 250, 140, 52],   // le conteneur de l'angle nord-est
      [860, 1015, 140, 52],  // le coin sud-est, sous le nez du rideau
      // LE SUD ET L'AXE
      [600, 680, 140, 52],   // LA COUVERTURE DU MILIEU : casse l'axe du sud
      [410, 660, 52, 140],   // LE SLALOM DE L'AXE, à l'ouest de la route
      [550, 420, 52, 140],   //   et à l'est — un pas de couverture entre sentinelle et halo
      [575, 985, 140, 52],   // le conteneur du portail : TA première couverture
      [280, 820, 140, 52],   // le coin de la ronde sud-ouest
      // V28 — LE MATÉRIEL : la cour vit, ce n'est pas un dépôt de boîtes
      [130, 730, 148, 96, 'beufa_tente'],      // LA TENTE DES QUARTIERS, au sud-ouest
      [760, 125, 96, 96, 'beufa_reservoir'],   // LA STATION DE CARBURANT du motor pool
      [870, 125, 96, 96, 'beufa_reservoir'],
      [600, 900, 80, 80, 'beufa_mirador'],      // LE MIRADOR DU PORTAIL, au carrefour sud
    ],
    sacs: [ [390, 515], [570, 515] ],   // LE POSTE DE CONTRÔLE au carrefour de l'axe
    caisses: [],
    tables: [],
    projecteurs: [   // TROIS TOURS, une par zone : le QG, le dépôt, la voie est
      { tour: [480, 14], depart: [480, 70], arrivee: [480, 250] },     // le halo descend L'AXE jusqu'au SAS
      { tour: [10, 515], depart: [70, 515], arrivee: [390, 515] },     // le halo balaie L'ALLÉE DU DÉPÔT
      { tour: [940, 515], depart: [880, 515], arrivee: [700, 515] },   // le halo couvre LA VOIE DU MOTOR POOL
    ],
    gardes: [
      { chemin: [[480, 780], [480, 300]] },                                 // LA SENTINELLE DE L'AXE : la longue horloge du milieu
      { chemin: [[150, 900], [400, 900]] },                                 // LA RONDE DU SUD-OUEST : le quart du portail
      { chemin: [[110, 515], [330, 515]] },                                 // LA RONDE DU DÉPÔT : dans l'allée, SOUS le halo
      { chemin: [[880, 380], [880, 760]] },                                 // LE MOTOR POOL : l'aller-retour de la voie est
      { chemin: [[480, 80], [480, 80]], scan: 55, scanBase: Math.PI / 2 },   // LE SAS DU QG : la PIERRE est la clé
      { chemin: [[600, 200], [900, 200]] },                                 // LE GUÉPARD DU NORD : l'approche nord-est du SAS
      { chemin: [[700, 940], [920, 940]] },                                 // LE RIDEAU DU SUD : il ferme le coin sud-est
      { chemin: [[120, 120], [120, 120]], scan: 50, scanBase: 0 },           // L'ŒIL DU NORD-OUEST (V27) : il balaie la baraque du poste
    ],
    entree: { x: 480, y: 1030 },
    sortie: 'haut',               // traverser LA PORTE DU QG → le parc des véhicules
  },
  { // ----- PIÈCE 2 : LE PARC À VÉHICULES — 1440×720, la traversée du parking -----
    nom: 'PIÈCE 2/4 · LE PARC À VÉHICULES',
    l: 1440, h: 720,   // le parc est DEUX FOIS plus large que l'écran : on le traverse d'OUEST en EST
    teinteSol: 0x9fc0a8,   // dehors : le bitume du parking
    murs: [
      [720, 10, 1440, 20],                         // le mur du nord
      [720, 710, 1440, 20],                        // le mur du sud
      [10, 170, 20, 300], [10, 570, 20, 320],      // l'ouest : LA PORTE D'ENTRÉE (y 320-410)
      [1430, 170, 20, 300], [1430, 570, 20, 320],  // l'est : LA PORTE DU PARC (y 320-410)
    ],
    portesVerrouillees: [],
    portes: [ [10, 360, Math.PI / 2], [1430, 365, Math.PI / 2] ],   // l'entrée + LA PORTE DU PARC
    routes: [ [720, 360, 1460, 70] ],   // LA VOIE DE SERVICE : l'asphalte traverse le parc
    conteneurs: [   // V28 — LES VRAIS VÉHICULES DU PARC : camions, jeeps, hélicoptère
      [300, 150, 72, 176, 'beufa_camion'],     // LA RANGÉE DE CAMIONS, garés en marche arrière au nord
      [480, 150, 72, 176, 'beufa_camion'],
      [660, 150, 72, 176, 'beufa_camion'],
      [1200, 150, 184, 100, 'beufa_helico'],   // L'HÉLICOPTÈRE, sur son hélipad à l'est
      [1050, 60, 88, 60, 'beufa_jeep'],        // les jeeps de service, de part et d'autre
      [1050, 250, 88, 60, 'beufa_jeep'],
      [300, 560, 176, 72, 'beufa_camion'],     // LA RANGÉE DU SUD, face à l'est
      [520, 560, 176, 72, 'beufa_camion'],
      [740, 560, 176, 72, 'beufa_camion'],
      [960, 560, 176, 72, 'beufa_camion'],
      [1000, 360, 80, 80, 'beufa_mirador'],    // LE MIRADOR DU PARC, planté sur la voie de service
      [1190, 620, 96, 96, 'beufa_reservoir'],  // LA STATION DE CARBURANT, au sud-est
      [1320, 620, 96, 96, 'beufa_reservoir'],
    ],
    sacs: [],
    caisses: [],
    tables: [],
    projecteurs: [   // LES PHARES DU PARC, en opposition de phase : la voie n'est jamais éclairée que d'UNE lumière
      { tour: [26, 200], depart: [70, 200], arrivee: [700, 200] },
      { tour: [1414, 520], depart: [1370, 520], arrivee: [700, 520], phase: 4 },
    ],
    gardes: [   // SIX menaces, le personnel du parc :
      { chemin: [[300, 360], [900, 360]] },                                   // LA RONDE DE LA VOIE : jusqu'au mirador du milieu
      { chemin: [[880, 300], [880, 460]] },                                   // LE BALAYEUR DES RANGÉES : l'allée centrale
      { chemin: [[230, 200], [230, 200]], scan: 40, scanBase: Math.PI / 2 },  // LE PLANTÉ DU POSTE : il regarde l'entrée depuis le nord
      { chemin: [[300, 660], [1100, 660]] },                                  // LA RONDE DE L'ALLÉE SUD : entre les camions et le mur
      { chemin: [[1280, 360], [1280, 360]], scan: 50, scanBase: Math.PI },    // LE GARDIEN DE LA PORTE : il balaie la voie — passe dans son DOS
      { chemin: [[1370, 90], [1370, 90]], scan: 50, scanBase: Math.PI / 2 },  // L'ŒIL DU NORD-EST : il veille sur l'hélipad
    ],
    entree: { x: 75, y: 360 },   // la poche sûre de la porte ouest
    sortie: 'est',                // atteindre LA PORTE DU PARC → l'arsenal
  },
  { // ----- PIÈCE 3 : L'ARSENAL — 960×960, la grille des râteliers -----
    nom: 'PIÈCE 3/4 · L\'ARSENAL',
    l: 960, h: 960,   // la salle la plus SERRÉE de la base : on serpente entre les râteliers
    teinteSol: 0xaab4d8,   // dedans : le béton bleuté
    murs: [
      [227, 10, 434, 20], [733, 10, 434, 20],   // le mur du nord : LA PORTE DU QG (x 445-515)
      [227, 950, 434, 20], [733, 950, 434, 20], // le mur du sud : LA PORTE D'ENTRÉE (x 445-515)
      [10, 10, 20, 280], [10, 685, 20, 550],   // l'ouest + LE DÉPÔT DE MUNITIONS (verrouillé)
      [950, 490, 20, 940],                     // l'est : le mur des lance-roquettes
      [480, 650, 20, 150],                     // V28 : LA CLOISON DES MUNITIONS — elle force le serpentin
    ],
    portesVerrouillees: [ [10, 345, 20, 120] ],
    portes: [ [480, 950, 0], [480, 10, 0] ],   // l'entrée + LA PORTE DU QG DE BEUFA
    routes: [],
    conteneurs: [   // LES RÂTELIERS D'ARMES : une grille en damier — on SERPENTE
      [230, 180, 140, 52, 'beufa_ratelier'], [730, 180, 140, 52, 'beufa_ratelier'],   // la rangée des fusils
      [480, 300, 140, 52, 'beufa_ratelier'],                        // le râtelier du centre
      [230, 420, 140, 52, 'beufa_ratelier'], [730, 420, 140, 52, 'beufa_ratelier'],
      [480, 540, 140, 52, 'beufa_ratelier'],
      [230, 660, 140, 52, 'beufa_ratelier'], [730, 660, 140, 52, 'beufa_ratelier'],
      [480, 780, 140, 52, 'beufa_ratelier'],
      // V29 — LE DÉCOR DE L'ARSENAL : des barils entre les rayons, la salle vit
      [130, 160, 48, 48, 'beufa_baril'],   // le baril du nord-ouest : couverture dans le dos du planté
      [800, 560, 48, 48, 'beufa_baril'],   // le baril de l'allée est, entre les rayons
      [180, 880, 48, 48, 'beufa_baril'],   // le baril du dépôt sud : abri contre la ronde du sud
      // V30 — LE POSTE DU CENTRE : quatre barils autour du planté — le VIDE au
      // milieu de la salle est comblé, et ils couvrent l'approche du planté
      [350, 480, 48, 48, 'beufa_baril'],
      [610, 480, 48, 48, 'beufa_baril'],
      [350, 600, 48, 48, 'beufa_baril'],
      [610, 600, 48, 48, 'beufa_baril'],
    ],
    sacs: [],
    caisses: [ [100, 300], [300, 100], [860, 600], [860, 80], [90, 895], [860, 880] ],   // V28 : les munitions + V29 : LES COINS DE LA SALLE habités
    tables: [ [180, 70] ],   // LE POSTE DE L'ARMURIER, au pied de la porte du QG
    projecteurs: [   // LES DEUX GÉANTS de l'arsenal, en opposition — la lumière saute de râtelier en râtelier
      { tour: [10, 480], depart: [70, 480], arrivee: [600, 480] },
      { tour: [950, 360], depart: [890, 360], arrivee: [340, 360], phase: 4 },
    ],
    gardes: [   // SIX menaces, la salle des armes ne dort jamais :
      { chemin: [[600, 60], [600, 60]], scan: 40, scanBase: Math.PI },        // L'ARMURIER : il balaie la porte du QG — passe dans son dos
      { chemin: [[880, 240], [880, 540]] },                                  // LA RONDE DE L'EST : le couloir des lance-roquettes
      { chemin: [[80, 540], [80, 780]] },                                    // LA RONDE DE L'OUEST : le couloir des caisses
      { chemin: [[480, 480], [480, 480]], scan: 45, scanBase: -Math.PI / 2 }, // LE PLANTÉ DU CENTRE : il surveille la voie du nord
      { chemin: [[160, 830], [400, 830]] },                                   // LA RONDE DU SUD : dans le dos de l'entrée
      { chemin: [[80, 240], [80, 240]], scan: 45, scanBase: Math.PI / 2 },    // LE PLANTÉ DU NORD-OUEST : le couloir ouest
    ],
    entree: { x: 480, y: 900 },   // la poche sûre du sud
    sortie: 'haut',               // traverser LA PORTE DU QG → LE QG DE BEUFA
  },
  { // ----- PIÈCE 4 : LE QG DE BEUFA — 1440×720, le poste de commandement -----
    nom: 'PIÈCE 4/4 · LE QG DE BEUFA',
    l: 1440, h: 720,   // la salle des opérations est DEUX FOIS plus large que l'écran
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
      [690, 120, 140, 52],   // le rayonnage nord
      [1130, 120, 140, 52],  // le rayonnage nord-est
      [1300, 120, 140, 52],  // la rallonge de la rangée nord, à l'extrême est
      [150, 380, 52, 140],   // le rayonnage de l'ouest
      [80, 170, 140, 52],    // le conteneur du couloir ouest, sous l'officier
      [1130, 380, 52, 140],  // le rayonnage du centre-est
      [1250, 620, 140, 52],  // le rayonnage du sud-est
      [500, 350, 52, 140],   // le rayonnage du milieu — le stratège le frôle à l'est
      [1350, 540, 52, 140],  // la couverture de l'approche du bureau, sous le cerbère
      [700, 550, 140, 52],   // la couverture sud de la table à cartes
    ],
    sacs: [],
    caisses: [],
    tables: [ [720, 360] ],   // LA TABLE DES CARTES : les deux halos la frôlent au-dessus
    projecteurs: [   // EN OPPOSITION DE PHASE : le plateau n'est jamais éclairé que d'UNE lumière
      { tour: [26, 360], depart: [70, 360], arrivee: [600, 360] },
      { tour: [1414, 600], depart: [1370, 600], arrivee: [1050, 600], phase: 4 },   // au SUD — la PORTE DU BUREAU est dégagée
    ],
    gardes: [   // SIX menaces, chacune garde SON couloir :
      { chemin: [[150, 220], [150, 220]], scan: 45, scanBase: 0 },        // L'OFFICIER DE QUART : il balaie la salle vers l'est
      { chemin: [[380, 60], [1300, 60]] },                               // LA RONDE DU NORD : le long des rayonnages
      { chemin: [[600, 620], [1150, 620]] },                             // LA RONDE DU SUD : sous la table des cartes
      { chemin: [[1360, 300], [1360, 430]] },                            // LE CERBÈRE DU BUREAU : il monte et descend devant la porte
      { chemin: [[560, 240], [880, 240], [880, 480], [560, 480]] },       // LE STRATÈGE : il fait LE TOUR DE LA TABLE en boucle
      { chemin: [[80, 350], [80, 600]] },                                // LE VEILLEUR : le couloir de l'ouest
    ],
    entree: { x: 325, y: 660 },   // la poche sûre du sud-ouest
    sortie: 'qg',                 // atteindre LE BUREAU DE BEUFA → VICTOIRE (puis le QUIZ)
  },
];


