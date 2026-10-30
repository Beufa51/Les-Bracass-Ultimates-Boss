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
    pierres: 5,        // X : lance une pierre pour attirer les gardes AILLEURS (la clé des plantés)
    porteePierre: 300, // elle VOLE LOIN : détourner un garde sans entrer dans son cône
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
// V22 — LE PASS GAME DESIGN : une pièce de stealth se joue OBSERVER → PLANIFIER →
// EXÉCUTER. Donc : (1) chaque menace est une HORLOGE qu'on lit depuis une poche sûre ;
// (2) les couvertures forment des CHAPELETS le long des routes risquées (jamais de
// traversée de plein vide) ; (3) TROIS routes par pièce — la frontale (pierre/timing),
// la latérale sûre (lente), la maligne (derrière les cônes) ; (4) la PIERRE est la
// CLÉ des plantés : le SAS et le Cerbère se contournent… ou s'ouvrent d'un CLAC.
export const PIECES = [
  { // ----- PIÈCE 1 : LA COUR D'ENTRÉE — apprendre les 3 horloges : ronde, halo, planté -----
    nom: 'PIÈCE 1/2 · LA COUR D\'ENTRÉE',
    teinteSol: 0x9fc0a8,   // la cour est DEHORS : le sol tire vers l'herbe de nuit
    murs: [   // [x, y, l, h] — x, y = CENTRES ; épaisseur 20 partout
      [227, 10, 434, 20], [733, 10, 434, 20],   // mur du nord : LA PORTE (x 445-515) de la salle du QG
      [480, 530, 960, 20],                      // mur du sud : LE PORTAIL (x 445-515), par où tu arrives
      [10, 222, 20, 404], [10, 505, 20, 30],    // mur de l'ouest : PORTE VERROUILLÉE — pièce à venir
      [950, 270, 20, 540],                      // mur de l'est
    ],
    portesVerrouillees: [ [10, 457, 20, 66] ],
    portes: [ [480, 10, 0] ],          // LA SORTIE au nord (LED verte, bande jaune)
    routes: [ [480, 270, 70, 540] ],   // LA ROUTE : du portail à la porte, l'axe de la base
    conteneurs: [   // les GRANDES couvertures, elles coupent la vue
      [250, 200, 140, 52],                                // STOCKAGE : le couloir des deux conteneurs —
      [250, 300, 140, 52, 'beufa_conteneur_olive'],       //   la ronde passe DEDANS : tourne autour par-derrière
      [700, 112, 140, 52],                                // L'ABRI DU MOTOR POOL : casse la vue vers le SAS
      [820, 260, 52, 140],                                // le conteneur vertical contre l'est
    ],
    sacs: [ [390, 300], [570, 300] ],   // LE POSTE DE CONTRÔLE : deux nids face à face sur la route
    caisses: [
      [560, 470],    // le baril du portail : TA première couverture, juste au spawn
      [420, 360],    // LE SLALOM DE LA ROUTE : deux plots en quinconce — un pas de couverture
      [540, 220],    //   entre la sentinelle et le halo qui descend
      [180, 130],    // le stock : pour tourner autour de la ronde du couloir
      [352, 352],    //   l'angle sud du couloir — regardé par personne
      [884, 100],    // le motor pool : les barils de l'angle nord-est
      [884, 450],    //   et le long du mur est
    ],
    projecteurs: [   // la tour du mur nord : son HALO DESCEND LA ROUTE — la 2e horloge
      { tour: [480, 14], depart: [480, 70], arrivee: [480, 250] },
    ],
    gardes: [
      { chemin: [[480, 390], [480, 150]] },                       // LA SENTINELLE : la 1re horloge — traverse quand elle s'éloigne
      { chemin: [[110, 250], [400, 250]] },                       // LE STOCKAGE : sa ronde tourne dans le couloir
      { chemin: [[700, 160], [700, 420]] },                       // LE MOTOR POOL : l'aller-retour devant les barils
      { chemin: [[480, 80], [480, 80]], scan: 55, scanBase: Math.PI / 2 },   // LE SAS : il BALAYE la porte — la PIERRE est la clé
    ],
    entree: { x: 480, y: 490 },   // le portail : une poche sûre, rien ne la voit
    sortie: 'haut',               // traverser la porte du nord → pièce suivante
  },
  { // ----- PIÈCE 2 : LA SALLE DU QG — trois actes : les couloirs, le centre, la porte -----
    nom: 'PIÈCE 2/2 · LA SALLE DU QG',
    teinteSol: 0xaab4d8,   // la salle est DEDANS : sol bleuté
    murs: [
      [480, 10, 960, 20],                        // mur du nord
      [227, 530, 434, 20], [733, 530, 434, 20],  // mur du sud : LA PORTE D'ENTRÉE (x 445-515)
      [10, 35, 20, 30], [10, 317, 20, 406],      // mur de l'ouest : PORTE VERROUILLÉE
      [950, 102, 20, 165], [950, 388, 20, 264],  // mur de l'est : LA PORTE DU QG (y 185-255)
    ],
    portesVerrouillees: [ [10, 82, 20, 64] ],
    portes: [ [480, 530, 0], [950, 220, Math.PI / 2] ],   // la porte d'entrée + LA PORTE DU QG
    routes: [],
    conteneurs: [   // les RAYONNAGES : la salle a des couloirs — ouest, nord, est
      [250, 120, 140, 52, 'beufa_conteneur_olive'],   // le rayonnage nord-ouest
      [690, 120, 140, 52],                            // le rayonnage nord-est
      [150, 380, 52, 140, 'beufa_conteneur_olive'],   // le rayonnage de l'ouest
      [820, 380, 52, 140],                           // le rayonnage de l'est
    ],
    tables: [ [480, 350] ],   // LA TABLE À CARTES : les halos la frôlent au-dessus
    sacs: [],
    caisses: [ [480, 220], [60, 250], [880, 150] ],   // une couverture par couloir
    projecteurs: [   // LES DEUX HALOS EN OPPOSITION DE PHASE : quand l'un file au
      { tour: [26, 270], depart: [70, 270], arrivee: [480, 270] },                 // MILIEU, l'autre est REPARTI
      { tour: [934, 270], depart: [890, 270], arrivee: [480, 270], phase: 4 },    // au mur : UNE lumière à la fois
    ],
    gardes: [   // QUATRE menaces LISIBLES, chacune garde UNE route :
      { chemin: [[96, 81], [96, 81]], scan: 45, scanBase: Math.PI / 2 },    // LE COULOIR OUEST : la bonbonne balaie
      { chemin: [[340, 60], [620, 60]] },                                   // LE HALL DU NORD : la ronde entre les rayonnages
      { chemin: [[200, 420], [760, 420]] },                                 // LE SUD : la ronde sous la table — l'entrée reste une poche sûre
      { chemin: [[864, 250], [864, 250]], scan: 50, scanBase: Math.PI },   // LE CERBÈRE : il balaie l'approche de LA PORTE DU QG
    ],
    entree: { x: 480, y: 492 },   // la poche sûre du sud
    sortie: 'qg',                 // atteindre LA PORTE DU QG à l'est → VICTOIRE
  },
];
