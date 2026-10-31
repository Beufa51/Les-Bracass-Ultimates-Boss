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
      { chemin: [[60, 300], [300, 300]] },           // V31 : LA RONDE DE L'OUEST : garde la variante ouest
      { chemin: [[700, 540], [900, 540]] },          // V33 : LA RONDE DU MIRADOR : surveille le départ est
    ],
    entree: { x: 480, y: 645 },
    sortie: 'haut',
  },
  { // ----- PIÈCE 2 : LE PARC À VÉHICULES — 1440×540 — « la lumière » -----
    nom: 'PIÈCE 2/4 · LE PARC À VÉHICULES',
    l: 1440, h: 540,
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
      { chemin: [[250, 250], [250, 470]] },                                // V31 : LA SENTINELLE DE L'ANTICHAMBRE : sous le portique
      { chemin: [[1100, 400], [1380, 400]] },                              // V33 : LA RONDE DU BUREAU : devant la porte de Beufa
    ],
    entree: { x: 75, y: 365 },
    sortie: 'qg',
  },
];
