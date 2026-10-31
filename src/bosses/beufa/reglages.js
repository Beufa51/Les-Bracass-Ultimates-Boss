// =====================================================================
// Réglages du boss BEUFA : infiltration de nuit dans sa base militaire (vue du dessus, façon Metal Gear NES).
// TOUS les chiffres d'équilibrage sont ici : on peut les modifier sans risque.
// =====================================================================
export const IDENTITE = { id: 'beufa', nom: 'Beufa' };

export const REGLAGES = {
  joueur: {
    vitesse: 120,      // V32 : 130 avant — marche (px/s) : silencieuse — LENTE, comme une infiltration
    sprint: 200,       // Z : plus rapide, mais les gardes proches T'ENTENDENT
    pas: 60,           // V49 : px parcourus pour UN cycle de marche complet (2 pas) — calé sur l'écart des pieds de Snake (72 avant)
    pasCourse: 100,    // V51 : px pour un cycle de COURSE complet (sprint de profil) — plus petit = jambes plus rapides
    rebond: 1.5,       // V49 : px dont il monte à chaque pas (0 = aucun)
    rayon: 10,      // V25 : on frôle les caisses SANS être bloqué — les couloirs redeviennent passables
    bruit: 180,        // V32 : 130 avant — rayon (px) dans lequel un garde entend le sprint
    pierres: 0,        // V28 : la pierre est SUPPRIMÉE (proposition du game designer)
    porteePierre: 300, // elle VOLE LOIN : détourner un garde sans entrer dans son cône
  },
  garde: {
    portee: 240,       // V32 : ils voient encore PLUS LOIN (210 en V31, 180 avant)
    angle: 40,         // V32 (34 en V31) : demi-angle du cône (°) — cône plus large, moins facile à contourner (28 avant)
    reperage: 0.8,     // V33 : retour au réglage d'avant (0.45 en V32, trop dur) — dans un cône on est repéré EN UN CLIN D'ŒIL — la nuit ne pardonne plus
    vitesseRonde: 75,  // V32 (65 en V31) : ronde plus rapide, les fenêtres se referment plus vite (50 avant)
    vitessePoursuite: 185, // V32 : 165 en V31, 150 avant — presque aussi rapide que ton sprint
    rayon: 14,
    pas: 64,           // V33 : px pour un cycle de marche complet du garde
    vitesseDemiTour: 3.2, // V34 : rad/s quand il fait demi-tour sur place au bout de sa ronde (π ≈ 1 s)
    pause: 0.7,        // V32 (1.0 en V31) : il s'arrête MOINS LONGTEMPS à chaque bout (1.5 avant)
  },
  projecteur: {
    rayon: 62,        // V23 : les halos sont PLUS LARGE
    periode: 8,       // s d'un va-et-vient complet : la lumière file jusqu'au milieu puis REVIENT
    reperage: 0.4,    // V33 : retour au réglage d'avant — sous un halo, on est grillé presque aussitôt
  },
  alerte: {
    collective: 320,    // V32 (200 avant) : l'alerte se propage PLUS LOIN dans la base
    poursuiteMax: 5,   // V32 (3 avant) : ils te cherchent PLUS LONGTEMPS
    verification: 4,   // V32 (3 avant) : s à fouiller avant de retourner à sa ronde
    rattrape: 24,      // px : il te touche → RENVOYÉ à l'entrée de la pièce (jamais de mort)
  },
  vue: {
    nuit: 0.3,   // V29 : opacité du voile de nuit (0 = plein jour, 0.55 = l'ancienne nuit, trop sombre sur téléphone)
    zoom: 1.15,   // la caméra RAPPROCHÉE : elle suit le héros — 1 = pièce entière, 2 = très proche
  },
};

// LA BASE — VERSION « LISIBLE » : 4 pièces courtes, UNE nouveauté par pièce.
// 1. LA COUR       : le cône, l'ombre des conteneurs, passer DANS LE DOS (3 gardes, 0 projecteur)
// 2. LE PARC       : la LUMIÈRE (portique puis halo sur la route), les niches entre camions (3 gardes, 2 projecteurs)
// 3. L'ARSENAL     : le VEILLEUR qui tourne la tête + la ronde en boucle (4 gardes, 0 projecteur)
// 4. LE QG         : tout ensemble, une seule fois chaque chose (4 gardes, 1 projecteur)
// Aucune pièce n'exige la pierre. Sorties compatibles avec le code actuel :
// 'haut' = porte x 445-515 en haut (pièces 960 de large), 'est'/'qg' = x > 1396, y 330-400 (pièces 1440 de large).
export const PIECES = [
  { // ----- PIÈCE 1 : LA COUR DU PORTAIL — 960×720 — « le cône, l'ombre, le dos » -----
    nom: 'PIÈCE 1/4 · LA COUR DU PORTAIL',
    l: 960, h: 720,
    barbeles: ['s', 'o', 'e'],   // V62 : barbelés SEULEMENT sur l'enceinte extérieure (portail au sud, côtés) — pas sur le mur vers le parc
    teinteSol: 0xcfe0d2,
    murs: [
      [227, 10, 434, 20], [733, 10, 434, 20],   // le nord : LA PORTE DU QG (x 445-515)
      [480, 710, 960, 20],                      // le sud : le portail (on arrive par là)
      [10, 360, 20, 720], [950, 360, 20, 720],  // ouest, est
    ],
    portesVerrouillees: [],
    portes: [ [480, 710, 0], [480, 10, 0] ],    // l'entrée + LA SORTIE (elle pulse)
    routes: [ [480, 360, 70, 720] ],            // L'AXE : du portail à la porte
    conteneurs: [
      [330, 610, 140, 52], [630, 610, 140, 52],      // LE PORTAIL : la poche sûre d'où l'on observe
      [360, 330, 70, 140],                           // L'ALCÔVE OUEST : l'ombre où attendre que la sentinelle reparte
      [600, 330, 70, 140],                           // L'ALCÔVE EST : elle cache aussi l'axe de la ronde des réservoirs
      [160, 450, 148, 96, 'beufa_tente'],            // la tente des quartiers — V63 : rangée du milieu (y 450), en miroir du conteneur est
      [150, 110, 140, 52, 'beufa_conteneur_olive'],  // le conteneur du nord-ouest — V63 : rangée nord (y 110), en miroir du réservoir
      [810, 110, 96, 96, 'beufa_reservoir'],         // LE RÉSERVOIR du nord-est (la variante passe entre lui et le mur) — V63 : x 810 = miroir exact du conteneur olive
      [800, 450, 140, 52],                           // LA COUVERTURE DU CHEMIN EST (variante) — V63 : miroir de la tente (axe x 480)
      [860, 620, 68, 80, 'beufa_mirador'],           // le mirador du portail (décor)
      [370, 52, 88, 64, 'beufa_guerite'],            // V52 : la guérite de la porte du QG — V56 : COLLÉE au mur — V57 : image 96×96 (plus haute que Snake), emprise élargie à 88
      [52, 668, 64, 64, 'beufa_palettes'],           // V52 : palettes dans le coin sud-ouest (hors des chemins)
      // V60 : BASE MILITAIRE — le drapeau en face de la guérite, deux lampadaires au portail, le panneau d'interdiction
      [560, 130, 20, 16, 'beufa_drapeau', 19],       // emprise = le socle ; l'image est décalée (le mât est à gauche du dessin)
      [400, 690, 14, 12, 'beufa_lampadaire'], [560, 690, 14, 12, 'beufa_lampadaire'],
    ],
    decorsSol: [ [480, 680, 'beufa_barriere'], [250, 380, 'beufa_flaque', 0.8], [700, 200, 'beufa_flaque', 0.8] ],   // V52 : la barrière du portail (on passe dessus)
    sacs: [ [395, 520], [565, 520] ],                // le poste de contrôle de l'axe
    caisses: [],
    tables: [],
    projecteurs: [],
    gardes: [
      { chemin: [[480, 400], [480, 150]] },          // LA SENTINELLE DE L'AXE : monte, regarde, redescend — l'horloge de la pièce
      { chemin: [[660, 300], [900, 300]] },          // LA RONDE DES RÉSERVOIRS : garde la variante est
      { chemin: [[60, 300], [300, 300]] },           // V31 : LA RONDE DE L'OUEST : garde la variante ouest
      { chemin: [[700, 540], [900, 540]] },          // V33 : LA RONDE DU MIRADOR : surveille le départ est
    ],
    entree: { x: 480, y: 645 },
    sortie: 'haut',
  },
  { // ----- PIÈCE 2 : LE PARC À VÉHICULES — 1440×540 — « la lumière » -----
    nom: 'PIÈCE 2/4 · LE PARC À VÉHICULES',
    l: 1440, h: 540,
    barbeles: ['n'],   // V62 : seul le mur nord du parc est l'enceinte ; les autres donnent sur la cour et l'arsenal
    teinteSol: 0xcfe0d2,
    murs: [
      [720, 10, 1440, 20], [720, 530, 1440, 20],
      [10, 165, 20, 330], [10, 470, 20, 140],         // ouest : la porte d'entrée (y 330-400)
      [1430, 165, 20, 330], [1430, 470, 20, 140],     // est : LA PORTE DU PARC (y 330-400)
    ],
    portesVerrouillees: [],
    portes: [ [10, 365, Math.PI / 2], [1430, 365, Math.PI / 2] ],
    routes: [ [720, 365, 1460, 70] ],
    conteneurs: [
      [150, 150, 120, 66, 'beufa_jeep'], [150, 487, 120, 66, 'beufa_jeep'],   // l'entrée : deux jeeps, la poche sûre — V61 : à l'échelle de Snake (88×60 → 120×66), celle du sud garée contre le mur
      // LA RANGÉE NORD : camions garés nez au mur — entre eux, des NICHES à l'ombre
      [560, 220, 72, 176, 'beufa_camion'], [720, 220, 72, 176, 'beufa_camion'],
      [880, 220, 72, 176, 'beufa_camion'], [1040, 220, 72, 176, 'beufa_camion'],
      // LA RANGÉE SUD : trois camions le long de la route — les niches entre eux sont à L'OMBRE du halo
      [560, 455, 176, 72, 'beufa_camion'], [800, 455, 176, 72, 'beufa_camion'], [1040, 455, 176, 72, 'beufa_camion'],
      [1220, 480, 96, 96, 'beufa_reservoir'],        // la station : cache la dernière niche du gardien de la porte
      [1355, 53, 120, 66, 'beufa_jeep'],             // décor de l'angle nord-est — V61 : garée contre le mur (au-dessus du demi-tour du gardien, y 110)
      [360, 410, 16, 16, 'beufa_plot'], [392, 410, 16, 16, 'beufa_plot'], [1130, 320, 16, 16, 'beufa_plot'], [1170, 320, 16, 16, 'beufa_plot'],   // V55 : plots au bord de la route (hors des chemins des gardes)
      [250, 318, 14, 12, 'beufa_lampadaire'], [1340, 318, 14, 12, 'beufa_lampadaire'],   // V60 : lampadaires au bord NORD de la route (au sud, le poteau montait par-dessus l'asphalte)
      [1396, 496, 48, 48, 'beufa_pneus'], [234, 496, 48, 48, 'beufa_pneus'],   // V53 : pneus dans les coins (hors des chemins)
    ],
    decorsSol: [ [900, 385, 'beufa_huile', 0.6], [640, 330, 'beufa_huile', 0.6], [1180, 160, 'beufa_huile', 0.6] ],   // V53 : taches d'huile
    sacs: [],
    caisses: [],
    tables: [],
    projecteurs: [
      { tour: [300, 14], depart: [300, 60], arrivee: [300, 480] },                 // LE PORTIQUE : la lumière barre le passage, puis repart
      { tour: [830, 14], depart: [560, 365], arrivee: [1100, 365], phase: 2 },     // LE HALO DE LA ROUTE : il file sur l'asphalte — attends-le dans une niche
    ],
    gardes: [
      { chemin: [[470, 60], [1180, 60]] },           // LA RONDE DU NORD : la variante derrière les camions
      { chemin: [[1290, 470], [1290, 110]] },        // LE GARDIEN DE LA PORTE : passe quand il monte
      { chemin: [[620, 365], [980, 365]] },          // V31 : LA PATROUILLE DE LA ROUTE : cache-toi dans une niche du nord
      { chemin: [[430, 90], [430, 470]] },           // V33 : LA RONDE DU PORTIQUE : traverse la route juste après la lumière
    ],
    entree: { x: 75, y: 365 },
    sortie: 'est',
  },
  { // ----- PIÈCE 3 : L'ARSENAL — 960×720 — « le veilleur et la ronde » -----
    nom: 'PIÈCE 3/4 · L\'ARSENAL',
    l: 960, h: 720,
    teinteSol: 0xd2d8ee,
    murs: [
      [227, 10, 434, 20], [733, 10, 434, 20],
      [480, 710, 960, 20],
      [10, 360, 20, 720], [950, 360, 20, 720],
      // V58 : LES PILIERS PORTEURS du hangar, engagés dans les murs (ils dépassent de 16 px, hors rondes et passages)
      [300, 23, 28, 26], [660, 23, 28, 26],         // nord (de part et d'autre de la porte)
      [200, 697, 28, 26], [760, 697, 28, 26],       // sud
      [23, 160, 26, 28], [23, 440, 26, 28],         // ouest
      [937, 200, 26, 28], [937, 560, 26, 28],       // est
    ],
    portesVerrouillees: [],
    portes: [ [480, 710, 0], [480, 10, 0] ],
    routes: [],
    conteneurs: [
      // L'ÎLOT DES RÂTELIERS au centre : la ronde en fait le tour
      // V62 : c'est LE DÉPÔT DE MISSILES : 4 missiles en batterie au centre (même emprise que les anciens râteliers)
      [410, 330, 140, 52, 'beufa_missile'], [550, 330, 140, 52, 'beufa_missile'],
      [410, 430, 140, 52, 'beufa_missile'], [550, 430, 140, 52, 'beufa_missile'],
      // le sas d'entrée
      // V61 : L'ATELIER de l'entrée : caisses de munitions à déballer + l'établi (même emprise qu'avant)
      [295, 610, 70, 52, 'beufa_munitions'], [365, 610, 70, 52, 'beufa_munitions'], [630, 610, 140, 52, 'beufa_etabli'],
      // V61 : LA RÉSERVE DES MISSILES au nord-ouest, sous l'œil du veilleur (à la place de la table à cartes, même emprise)
      [190, 68, 140, 45, 'beufa_missile'], [190, 113, 140, 45, 'beufa_missile'],
      // L'ABRI DU VEILLEUR : la rangée nord, l'ombre juste avant la porte
      [610, 150, 140, 52, 'beufa_ratelier'],
      [870, 90, 70, 38, 'beufa_munitions'],          // V54 : caisses de munitions (à la place de la caisse du nord-est)
      [100, 200, 34, 48, 'beufa_baril'], [923, 420, 34, 48, 'beufa_baril'],   // V57 : baril est contre le mur (la ronde de l'est le traversait) — V52 : obstacle = largeur du vrai baril
    ],
    sacs: [],
    caisses: [ [90, 668], [870, 668] ],   // V61 : collées au mur sud
    tables: [],                                      // V61 : la table à cartes n'a rien à faire à l'arsenal (→ réserve des missiles)
    projecteurs: [],
    gardes: [
      { chemin: [[700, 530], [260, 530], [260, 230], [700, 230]] },        // LA RONDE DE L'ÎLOT : elle tourne autour (sens des aiguilles d'une montre) — tourne DERRIÈRE elle
      { chemin: [[380, 92], [380, 92]], scan: 50, scanBase: 0.2 },           // LE VEILLEUR DE LA PORTE : il tourne la tête — passe quand il regarde au sud
      { chemin: [[860, 520], [860, 260]] },                                // LA RONDE DE L'EST : elle garde le couloir des caisses — on la double quand elle REDESCEND
      { chemin: [[90, 560], [90, 300]] },                                  // V31 : LA RONDE DE L'OUEST : ferme le couloir ouest
      { chemin: [[560, 92], [800, 92]] },                                  // V33 : LA RONDE DE LA PORTE : le côté est de la sortie
    ],
    entree: { x: 480, y: 645 },
    sortie: 'haut',
  },
  { // ----- PIÈCE 4 : LE QG DE BEUFA — 1440×540 — « tout ensemble » -----
    nom: 'PIÈCE 4/4 · LE QG DE BEUFA',
    l: 1440, h: 540,
    teinteSol: 0xd2d8ee,
    murs: [
      [720, 10, 1440, 20], [720, 530, 1440, 20],
      [10, 165, 20, 330], [10, 470, 20, 140],
      [1430, 165, 20, 330], [1430, 470, 20, 140],   // est : LE BUREAU DE BEUFA (y 330-400)
      // V64 : plus de cloison devant la sortie (elle bloquait le passage ; le bureau de Beufa ira dans la pièce du quiz)
      // V58 : LES PILIERS PORTEURS, engagés dans les murs (jamais devant le passage secret du nord, x 560-960)
      [230, 23, 28, 26],                            // nord (à côté de la tour du portique)
      [300, 517, 28, 26], [760, 517, 28, 26],       // sud (le 2e entre les deux étagères)
      [23, 120, 26, 28], [23, 470, 26, 28],         // ouest (de part et d'autre de l'entrée)
    ],
    portesVerrouillees: [],
    portes: [ [10, 365, Math.PI / 2], [1430, 365, Math.PI / 2] ],
    routes: [],
    conteneurs: [
      [150, 150, 132, 44, 'beufa_console'], [150, 494, 140, 52, 'beufa_etagere'],   // V54 : consoles radar au nord       // l'antichambre : la poche sûre
      [420, 130, 52, 140, 'beufa_etagere'], [420, 450, 52, 140, 'beufa_etagere'],       // les rayonnages de part et d'autre du portique de lumière
      [640, 494, 140, 52, 'beufa_etagere'], [880, 494, 140, 52, 'beufa_etagere'],       // la rangée sud : l'abri contre le stratège — V61 : collée au mur (avant : faux passage de 24 px derrière)
      [640, 84, 140, 52, 'beufa_etagere'], [880, 84, 140, 52, 'beufa_etagere'],       // la rangée nord — DERRIÈRE elle, contre le mur, un PASSAGE SECRET (la variante)
      [1200, 494, 140, 52, 'beufa_etagere'],                           // les archives du sas
      [1200, 42, 132, 44, 'beufa_console'],          // V62 : LE POSTE DE SÉCURITÉ (écrans) contre le mur — le bureau de Beufa ira dans la pièce du QUIZ
    ],
    decorsSol: [ [1340, 365, 'beufa_tapis'] ],   // V62 : le tapis à l'emblème de Beufa mène à SA porte (la sortie, vers le quiz)
    sacs: [],
    caisses: [],
    tables: [ [760, 270] ],                           // LA TABLE DES CARTES : le stratège en fait le tour
    projecteurs: [
      { tour: [300, 14], depart: [300, 60], arrivee: [300, 480], phase: 3 },   // LE PORTIQUE de l'antichambre (on le connaît)
    ],
    gardes: [
      { chemin: [[560, 175], [960, 175], [960, 380], [560, 380]] },   // LE STRATÈGE : le tour de la table, en boucle (sens des aiguilles d'une montre)
      { chemin: [[1150, 200], [1150, 200]], scan: 55, scanBase: Math.PI / 2 },   // LE GARDE DU SAS : il balaie la porte du sas
      { chemin: [[1330, 120], [1330, 300]] },                              // LE PLANTON : il garde la porte de Beufa — passe quand il REMONTE
      { chemin: [[250, 250], [250, 470]] },                                // V31 : LA SENTINELLE DE L'ANTICHAMBRE : sous le portique
      { chemin: [[1100, 400], [1380, 400]] },                              // V33 : LA RONDE DU SAS : devant la porte de Beufa
    ],
    entree: { x: 75, y: 365 },
    sortie: 'qg',
  },
];
