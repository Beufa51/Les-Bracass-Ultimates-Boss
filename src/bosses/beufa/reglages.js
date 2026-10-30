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
};

// LA BASE = LE PLAN DE FABIEN (photo du 30/10) — UNE PIÈCE À L'ÉCRAN À LA FOIS,
// avec un fondu pour passer de l'une à l'autre (conseil de designer stealth —
// « Mark of the Ninja » : un espace de rencontre = UN écran, pas plus ;
// et un CHECKPOINT PAR PIÈCE : se faire prendre renvoie à l'entrée DE LA PIÈCE).
//
// V5, demandes de Fabien : PLUS DE RONDES, des CONTENEURS (vraies grandes
// couvertures), et LES PROJECTEURS = des tours AU BORD DE L'ÉCRAN dont le halo
// voyage jusqu'au MILIEU de la pièce — dans la salle du QG, les deux halos
// (gauche et droite) SE REJOIGNENT au centre.
//
// RÈGLES DE PLACEMENT DES GARDES : chaque cône laisse une FENÊTRE claire (on
// balaie, jamais de cône fixe sur un passage obligatoire) ; l'entrée de chaque
// pièce reste une poche SÛRE d'où OBSERVER ; les conteneurs dessinent des
// couloirs — plusieurs routes vers la sortie.
export const PIECES = [
  { // ----- PIÈCE 1 : LA COUR D'ENTRÉE (4 gardes + 1 projecteur : on apprend tout) -----
    nom: 'PIÈCE 1/2 · LA COUR D\'ENTRÉE',
    teinteSol: 0x9fc0a8,   // la cour est DEHORS : le sol tire vers l'herbe de nuit
    murs: [   // [x, y, l, h] — x, y = CENTRES ; épaisseur 20 partout
      [227, 10, 434, 20], [733, 10, 434, 20],   // mur du haut : LA PORTE (x 445-515) vers la salle du QG
      [480, 530, 960, 20],                      // mur du bas (l'entrée de la base)
      [10, 225, 20, 410], [10, 508, 20, 24],    // mur de gauche : PORTE VERROUILLÉE (y 420-496) — pièce à venir du plan
      [950, 270, 20, 540],                      // mur de droite
    ],
    portesVerrouillees: [ [10, 458, 20, 76] ],   // dessinée (LED rouge), elle bloque
    portes: [ [480, 10, 0] ],                    // LA SORTIE en haut (LED verte, bande jaune)
    conteneurs: [   // [x, y, l, h] (+ image optionnelle) — les GRANDES couvertures, elles coupent la vue
      [250, 250, 140, 52],
      [560, 250, 140, 52, 'beufa_conteneur_olive'],
      [820, 320, 52, 140],   // vertical : il couvre le couloir de droite
    ],
    caisses: [ [520, 170], [160, 450], [800, 450] ],   // 64 x 64 — les petites couvertures
    projecteurs: [   // la tour est SUR le mur ; son HALO voyage de « depart » à « arrivee »
      { tour: [250, 14], depart: [250, 50], arrivee: [250, 190] },   // il éclaire la voie du haut
    ],
    gardes: [
      { chemin: [[120, 100], [840, 100]] },                         // LA GRANDE RONDE du haut, toute la largeur
      { chemin: [[180, 330], [700, 330]] },                         // la ronde du milieu, entre les conteneurs
      { chemin: [[100, 180], [100, 380]] },                          // la ronde du couloir de gauche
      { chemin: [[480, 90], [480, 90]], scan: 40, scanBase: Math.PI / 2 },   // la bonbonne de la porte : elle balaie
    ],
    entree: { x: 480, y: 490 },   // la poche sûre du bas, rien ne la voit
    sortie: 'haut',               // traverser la porte du haut → pièce suivante
  },
  { // ----- PIÈCE 2 : LA SALLE DU QG (6 gardes + LES DEUX PROJECTEURS qui se rejoignent au centre) -----
    nom: 'PIÈCE 2/2 · LA SALLE DU QG',
    teinteSol: 0xaab4d8,   // la salle est DEDANS : sol bleuté
    murs: [
      [480, 10, 960, 20],                        // mur du haut
      [227, 530, 434, 20], [733, 530, 434, 20],  // mur du bas : LA PORTE D'ENTRÉE (x 445-515), celle par laquelle tu arrives
      [10, 35, 20, 30], [10, 317, 20, 406],      // mur de gauche : PORTE VERROUILLÉE (y 50-114) — pièce à venir du plan
      [950, 102, 20, 165], [950, 388, 20, 264],  // mur de droite : LA PORTE DU QG (y 185-255) — LA SORTIE
    ],
    portesVerrouillees: [ [10, 82, 20, 64] ],
    portes: [ [480, 530, 0], [950, 220, Math.PI / 2] ],   // la porte d'entrée + LA PORTE DU QG (LED verte)
    conteneurs: [
      [250, 180, 140, 52, 'beufa_conteneur_olive'],
      [690, 180, 140, 52],
      [480, 320, 140, 52],   // le conteneur CENTRAL : le point de rencontre des deux halos est juste au-dessus
      [150, 380, 52, 140, 'beufa_conteneur_olive'],   // vertical : couloir de gauche
      [820, 380, 52, 140],   // vertical : il force le passage vers la porte du QG
    ],
    caisses: [ [480, 130], [880, 150], [60, 250] ],
    projecteurs: [   // LES DEUX TOURS AU BORD : leurs halos filet du bord jusqu'au MILIEU — et SE REJOIGNENT
      { tour: [26, 270], depart: [70, 270], arrivee: [480, 270] },
      { tour: [934, 270], depart: [890, 270], arrivee: [480, 270] },
    ],
    gardes: [
      { chemin: [[96, 81], [96, 81]], scan: 45, scanBase: Math.PI / 2 },    // LA BONBONNE de GAUCHE : elle balaie vers le bas
      { chemin: [[864, 81], [864, 81]], scan: 45, scanBase: Math.PI / 2 },  // LA BONBONNE de DROITE : elle couvre l'approche du QG
      { chemin: [[340, 55], [620, 55]] },                                   // LA DOUBLE FLÈCHE du plan : la ronde entre les deux bonbonnes
      { chemin: [[640, 270], [890, 270]] },                                 // LA GARDE DU QG : il boucle devant la porte, DANS les projecteurs
      { chemin: [[120, 260], [360, 260]] },                                 // la ronde du couloir de gauche
      { chemin: [[250, 440], [710, 440]] },                                 // la ronde du bas, entre l'entrée et le centre
    ],
    entree: { x: 480, y: 492 },   // la poche sûre du bas
    sortie: 'qg',                 // atteindre la PORTE DU QG à droite → VICTOIRE
  },
];
