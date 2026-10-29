// =====================================================================
// Réglages du boss BEUFA : infiltration de nuit dans sa base militaire (vue du dessus, façon Metal Gear).
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
    verification: 3,   // s à fouiller les caisses avant de retourner à sa ronde
    rattrape: 22,      // px : il te touche → RENVOYÉ au départ (jamais de mort)
  },
};

// LA BASE : des SALLES et des COULOIRS séparés par des MURS (x, y = CENTRES ; l, h = taille).
// Les GAPS entre deux segments d'une même rangée sont des PORTES : on choisit son chemin
// et on les passe au bon moment — c'est ÇA, l'infiltration. Le héros part du bas (la cour
// d'entrée) ; LA PORTE DU QG est en haut au centre, dans son yard gardé.
export const CARTE = {
  murs: [
    [10, 270, 20, 540], [950, 270, 20, 540], [480, 531, 960, 18],   // l'enceinte
    [205, 9, 410, 18], [755, 9, 410, 18],   // le mur du haut : la PORTE DU QG reste ouverte (x 410 à 550)
    // la rangée du milieu (y=400) : TROIS portes (x 160-235, 473-548, 728-803)
    [90, 400, 140, 20], [354, 400, 238, 20], [638, 400, 180, 20], [871, 400, 137, 20],
    // le HANGAR central : on entre par le SUD (x 440-520), on ressort par le NORD (x 540-620)
    [390, 330, 100, 20], [570, 330, 100, 20],   // mur sud du hangar (porte au centre)
    [450, 210, 220, 20],                        // mur nord du hangar (porte à droite)
    [340, 270, 20, 120], [620, 270, 20, 120],   // flancs ouest / est
    // la rangée du QG (y=150) : DEUX portes (x 250-330 et 630-710)
    [135, 150, 230, 20], [480, 150, 300, 20], [825, 150, 230, 20],
  ],
  caisses: [   // 56 x 56 — des cachettes, pas des murs
    [360, 480], [600, 480],
    [120, 350], [250, 250], [285, 355],
    [720, 350], [710, 250], [840, 355],
    [270, 100], [690, 100],
  ],
  piliers: [   // 34 x 34 — devant les portes du hangar
    [400, 370], [560, 370],
  ],
  tours: [[180, 210], [820, 210]],   // 72 x 72 : les projecteurs qui balayent les cours latérales
  gardes: [
    { chemin: [[90, 465], [300, 465]] },             // la cour d'entrée, côté gauche
    { chemin: [[660, 465], [870, 465]] },            // la cour d'entrée, côté droit
    { chemin: [[90, 300], [310, 300]] },             // la cour latérale gauche
    { chemin: [[650, 300], [870, 300]] },            // la cour latérale droite
    { chemin: [[480, 275], [480, 275]], scan: 70 },  // LE PLANTÉ du hangar : il balaie le couloir
    { chemin: [[330, 60], [630, 60]] },               // la ronde DEVANT la porte du QG
    { chemin: [[290, 185], [290, 185]], scan: 60 },  // le planté de la porte gauche du QG
    { chemin: [[670, 185], [670, 185]], scan: 60 },  // le planté de la porte droite du QG
  ],
};
