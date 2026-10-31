// LA BASE — VERSION « LISIBLE » : 4 pièces courtes, UNE nouveauté par pièce.
// 1. LA COUR       : le cône, l'ombre des conteneurs, passer DANS LE DOS (2 gardes, 0 projecteur)
// 2. LE PARC       : la LUMIÈRE (portique puis halo sur la route), les niches entre camions (2 gardes, 2 projecteurs)
// 3. L'ARSENAL     : le VEILLEUR qui tourne la tête + la ronde en boucle (3 gardes, 0 projecteur)
// 4. LE QG         : tout ensemble, une seule fois chaque chose (3 gardes, 1 projecteur)
// Aucune pièce n'exige la pierre. Sorties compatibles avec le code actuel :
// 'haut' = porte x 445-515 en haut (pièces 960 de large), 'est'/'qg' = x > 1396, y 330-400 (pièces 1440 de large).
export const PIECES = [
  { // ----- PIÈCE 1 : LA COUR DU PORTAIL — 960×720 — « le cône, l'ombre, le dos » -----
    nom: 'PIÈCE 1/4 · LA COUR DU PORTAIL',
    l: 960, h: 720,
    teinteSol: 0x9fc0a8,
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
      [360, 330, 52, 140],                           // L'ALCÔVE OUEST : l'ombre où attendre que la sentinelle reparte
      [600, 330, 52, 140],                           // L'ALCÔVE EST : elle cache aussi l'axe de la ronde des réservoirs
      [160, 470, 148, 96, 'beufa_tente'],            // la tente des quartiers (décor, couverture)
      [150, 170, 140, 52],                           // le conteneur du nord-ouest
      [780, 110, 96, 96, 'beufa_reservoir'],         // LE RÉSERVOIR du nord-est (la variante passe entre lui et le mur)
      [820, 430, 140, 52],                           // LA COUVERTURE DU CHEMIN EST (variante)
      [860, 620, 80, 80, 'beufa_mirador'],           // le mirador du portail (décor)
    ],
    sacs: [ [395, 520], [565, 520] ],                // le poste de contrôle de l'axe
    caisses: [],
    tables: [],
    projecteurs: [],
    gardes: [
      { chemin: [[480, 400], [480, 150]] },          // LA SENTINELLE DE L'AXE : monte, regarde, redescend — l'horloge de la pièce
      { chemin: [[660, 300], [900, 300]] },          // LA RONDE DES RÉSERVOIRS : garde la variante est
    ],
    entree: { x: 480, y: 645 },
    sortie: 'haut',
  },
  { // ----- PIÈCE 2 : LE PARC À VÉHICULES — 1440×540 — « la lumière » -----
    nom: 'PIÈCE 2/4 · LE PARC À VÉHICULES',
    l: 1440, h: 540,
    teinteSol: 0x9fc0a8,
    murs: [
      [720, 10, 1440, 20], [720, 530, 1440, 20],
      [10, 165, 20, 330], [10, 470, 20, 140],         // ouest : la porte d'entrée (y 330-400)
      [1430, 165, 20, 330], [1430, 470, 20, 140],     // est : LA PORTE DU PARC (y 330-400)
    ],
    portesVerrouillees: [],
    portes: [ [10, 365, Math.PI / 2], [1430, 365, Math.PI / 2] ],
    routes: [ [720, 365, 1460, 70] ],
    conteneurs: [
      [150, 150, 88, 60, 'beufa_jeep'], [150, 470, 88, 60, 'beufa_jeep'],   // l'entrée : deux jeeps, la poche sûre
      // LA RANGÉE NORD : camions garés nez au mur — entre eux, des NICHES à l'ombre
      [560, 220, 72, 176, 'beufa_camion'], [720, 220, 72, 176, 'beufa_camion'],
      [880, 220, 72, 176, 'beufa_camion'], [1040, 220, 72, 176, 'beufa_camion'],
      // LA RANGÉE SUD : trois camions le long de la route — les niches entre eux sont à L'OMBRE du halo
      [560, 455, 176, 72, 'beufa_camion'], [800, 455, 176, 72, 'beufa_camion'], [1040, 455, 176, 72, 'beufa_camion'],
      [1220, 480, 96, 96, 'beufa_reservoir'],        // la station : cache la dernière niche du gardien de la porte
      [1300, 90, 88, 60, 'beufa_jeep'],              // décor de l'angle nord-est
    ],
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
    ],
    entree: { x: 75, y: 365 },
    sortie: 'est',
  },
  { // ----- PIÈCE 3 : L'ARSENAL — 960×720 — « le veilleur et la ronde » -----
    nom: 'PIÈCE 3/4 · L\'ARSENAL',
    l: 960, h: 720,
    teinteSol: 0xaab4d8,
    murs: [
      [227, 10, 434, 20], [733, 10, 434, 20],
      [480, 710, 960, 20],
      [10, 360, 20, 720], [950, 360, 20, 720],
    ],
    portesVerrouillees: [],
    portes: [ [480, 710, 0], [480, 10, 0] ],
    routes: [],
    conteneurs: [
      // L'ÎLOT DES RÂTELIERS au centre : la ronde en fait le tour
      [410, 330, 140, 52, 'beufa_ratelier'], [550, 330, 140, 52, 'beufa_ratelier'],
      [410, 430, 140, 52, 'beufa_ratelier'], [550, 430, 140, 52, 'beufa_ratelier'],
      // le sas d'entrée
      [330, 610, 140, 52, 'beufa_ratelier'], [630, 610, 140, 52, 'beufa_ratelier'],
      // L'ABRI DU VEILLEUR : la rangée nord, l'ombre juste avant la porte
      [610, 150, 140, 52, 'beufa_ratelier'],
      [100, 200, 48, 48, 'beufa_baril'], [860, 420, 48, 48, 'beufa_baril'],
    ],
    sacs: [],
    caisses: [ [90, 640], [870, 640], [870, 90] ],
    tables: [ [190, 90] ],                           // le poste de l'armurier
    projecteurs: [],
    gardes: [
      { chemin: [[700, 530], [260, 530], [260, 230], [700, 230]] },        // LA RONDE DE L'ÎLOT : elle tourne autour (sens des aiguilles d'une montre) — tourne DERRIÈRE elle
      { chemin: [[380, 92], [380, 92]], scan: 50, scanBase: 0.2 },           // LE VEILLEUR DE LA PORTE : il tourne la tête — passe quand il regarde au sud
      { chemin: [[860, 520], [860, 260]] },                                // LA RONDE DE L'EST : elle garde le couloir des caisses — on la double quand elle REDESCEND
    ],
    entree: { x: 480, y: 645 },
    sortie: 'haut',
  },
  { // ----- PIÈCE 4 : LE QG DE BEUFA — 1440×540 — « tout ensemble » -----
    nom: 'PIÈCE 4/4 · LE QG DE BEUFA',
    l: 1440, h: 540,
    teinteSol: 0xaab4d8,
    murs: [
      [720, 10, 1440, 20], [720, 530, 1440, 20],
      [10, 165, 20, 330], [10, 470, 20, 140],
      [1430, 165, 20, 330], [1430, 470, 20, 140],   // est : LE BUREAU DE BEUFA (y 330-400)
      [1060, 110, 20, 200], [1060, 440, 20, 160],   // la cloison du bureau : on y entre par l'ouverture du milieu (y 210-360)
    ],
    portesVerrouillees: [],
    portes: [ [10, 365, Math.PI / 2], [1430, 365, Math.PI / 2] ],
    routes: [],
    conteneurs: [
      [150, 150, 140, 52], [150, 470, 140, 52],       // l'antichambre : la poche sûre
      [420, 130, 52, 140], [420, 430, 52, 140],       // les rayonnages de part et d'autre du portique de lumière
      [640, 470, 140, 52], [880, 470, 140, 52],       // la rangée sud : l'abri contre le stratège
      [640, 84, 140, 52], [880, 84, 140, 52],         // la rangée nord — DERRIÈRE elle, contre le mur, un PASSAGE SECRET (la variante)
      [1200, 470, 140, 52],                           // le classeur du bureau
    ],
    sacs: [],
    caisses: [ [1150, 110] ],
    tables: [ [760, 270] ],                           // LA TABLE DES CARTES : le stratège en fait le tour
    projecteurs: [
      { tour: [300, 14], depart: [300, 60], arrivee: [300, 480], phase: 3 },   // LE PORTIQUE de l'antichambre (on le connaît)
    ],
    gardes: [
      { chemin: [[560, 175], [960, 175], [960, 380], [560, 380]] },   // LE STRATÈGE : le tour de la table, en boucle (sens des aiguilles d'une montre)
      { chemin: [[1150, 200], [1150, 200]], scan: 55, scanBase: Math.PI / 2 },   // LE GARDE DU BUREAU : il balaie l'entrée du bureau
      { chemin: [[1330, 120], [1330, 300]] },                              // LE PLANTON : il garde la porte du bureau — passe quand il REMONTE
    ],
    entree: { x: 75, y: 365 },
    sortie: 'qg',
  },
];
