// Réglages du boss Kédric (course de football américain façon Eyeshield 21).
// Tous les chiffres d'équilibrage sont ici : on peut les modifier sans risque.
// Les temps sont en secondes, les distances en yards (1 yard ≈ 1 mètre), les vitesses en yards par seconde.
export const IDENTITE = { id: 'kedric', nom: 'Kédric' };

// Niveaux de difficulté (choisis avant le match)
//  tentatives : nombre de plaquages permis par action (au-delà : balle perdue = défaite)
//  alerte : le symbole (◀ ▶, ▲, ▼) apparaît sur le défenseur ce nombre de secondes avant le contact
//  ecart : temps de course entre deux combinaisons appelées par Kédric
//  parfait : fenêtre (s) de l'esquive PARFAITE juste avant le contact
//  aide : texte « ▲ SAUTE ! » près de toi + ralenti la première fois qu'un plaquage apparaît
//  feintes : chance que Kédric (le duel final) change d'attaque au dernier moment ; feinte : délai pour y répondre
//  ghost : esquives pour remplir la jauge du DEVIL BAT GHOST
export const DIFFICULTES = {
  facile:   { nom: 'FACILE',   couleur: '#7fff7f', tentatives: 6, alerte: 1.25, ecart: 1.1, parfait: 0.24, aide: true, feintes: 0, feinte: 0.6, ghost: 8, vitesse: 0.9,
    texte: 'Les défenseurs préviennent tôt, 6 tentatives par action. Idéal pour apprendre.' },
  normal:   { nom: 'NORMAL',   couleur: '#ffd84a', tentatives: 4, alerte: 0.95, ecart: 0.75, parfait: 0.18, aide: true, feintes: 0.35, feinte: 0.55, ghost: 10, vitesse: 1,
    texte: 'Le vrai match. 4 tentatives par action, Kédric feinte un peu.' },
  champion: { nom: 'CHAMPION', couleur: '#ff5a6e', tentatives: 3, alerte: 0.68, ecart: 0.5, parfait: 0.12, aide: false, feintes: 0.6, feinte: 0.42, ghost: 14, vitesse: 1.1,
    texte: 'Pas d\'aide, défense rapide, 3 tentatives seulement. Pour les vrais.' },
};

// Le terrain vu de dos (perspective) : la ligne d'horizon, la taille d'un couloir sous tes pieds.
// Tu cours au milieu de 3 COULOIRS (-1 = gauche, 0 = milieu, 1 = droite).
export const VUE = {
  horizon: 172,        // y de l'horizon (le bout du terrain)
  pieds: 505,          // y de tes pieds
  recul: 6,            // plus c'est grand, moins la perspective est forte
  largeurCouloir: 210, // largeur d'un couloir à tes pieds (pixels)
  bord: 1.75,          // lignes de touche à 1,75 couloir du milieu
  loin: 75,            // on dessine le terrain jusqu'à 75 yards devant toi
  apparition: 2.4,     // un défenseur apparaît ce nombre de secondes avant de t'atteindre
};

export const REGLAGES = {
  // ---------- Course ----------
  vitesseBase: 6.0,      // yards / s au départ (40 yards en 6,7 s)
  pasVitesse: 0.7,       // + par niveau de vitesse
  niveauMax: 5,          // niveau 5 = 9,5 yards / s = 40 yards en 4,2 s, comme le n°21 !
  esquivesParNiveau: 2,  // esquives d'affilée pour gagner un niveau de vitesse
  alerteParNiveau: 0.05, // le symbole apparaît 5 % plus tard par niveau de vitesse (plus vite = plus dur)
  changementCouloir: 0.13,
  saut: { duree: 0.5, recharge: 0.12 },        // ▲ : saute par-dessus un plaquage aux jambes
  rotation: { duree: 0.45, recharge: 0.12 },   // ▼ : se baisse en tournant sous les bras tendus
  // ---------- Devil Bat Ghost ----------
  ghost: { duree: 3.0, vitesse: 13, cinematique: 1.0 },
  // ---------- Après un plaquage ----------
  pausePlaquage: 1.8,
  // ---------- Duel final contre Kédric ----------
  duel: {
    avant: 30,           // Kédric entre sur le terrain à 30 yards de l'en-but
    vies: 3,             // il faut l'esquiver 3 fois
    distance: 13,        // il se replace à 13 yards devant toi avant chaque charge
    charge: 15,          // vitesse de sa charge (yards / s, en plus de ta course)
    attente: [0.7, 1.3], // il danse ce temps avant de charger
    tonAllure: 0.55,     // tu cours moins vite pendant le duel (x)
  },
  // ---------- Classement ----------
  tempsReference: 50,    // au-delà de ce temps de course, le rang baisse
  rangs: [
    { rang: 'S', seuil: 88 },
    { rang: 'A', seuil: 72 },
    { rang: 'B', seuil: 50 },
    { rang: 'C', seuil: -Infinity },
  ],
};

// Les 3 ACTIONS du match : courir jusqu'à l'en-but de Kédric.
// Kédric (le coach, sur le bord du terrain) appelle ses COMBINAISONS dans l'ordre (puis recommence la liste).
export const ACTIONS = [
  { nom: 'ACTION 1', titre: 'L\'échauffement', yards: 90,
    combinaisons: ['seul', 'faux', 'seul', 'corde', 'mur', 'zigzag', 'faux', 'corde', 'mur', 'seul'] },
  { nom: 'ACTION 2', titre: 'Le grand show', yards: 100,
    combinaisons: ['mur', 'double', 'suiveur', 'zigzag', 'blitz', 'piege', 'corde', 'suiveur', 'double', 'mur'] },
  { nom: 'ACTION 3', titre: 'SHOWTIME', yards: 110, duel: true,
    combinaisons: ['blitz', 'suiveur', 'piege', 'double', 'zigzag', 'mur', 'blitz', 'piege'] },
];

// Les combinaisons : liste de défenseurs [délai (s), type, couloir]
//  types : 'bloc' = plaqueur debout (change de couloir ◀ ▶), 'bas' = plonge aux jambes (▲ saute),
//          'haut' = bras tendus (▼ baisse-toi), 'suiveur' = te suit puis se fige au dernier moment (◀ ▶ après)
//  couloir : 'toi' = le tien, 'tous' = un défenseur dans chaque couloir, 'mur' = 2 couloirs bouchés (le libre n'est pas le tien),
//            'autre' = un couloir voisin du tien
export const COMBINAISONS = {
  seul:    { nom: 'PLAQUEUR !', liste: [[0, 'bloc', 'toi']] },
  faux:    { nom: 'LA FAUX !', liste: [[0, 'bas', 'tous']] },
  corde:   { nom: 'LA CORDE À LINGE !', liste: [[0, 'haut', 'tous']] },
  mur:     { nom: 'LE MUR !', liste: [[0, 'bloc', 'mur']] },
  zigzag:  { nom: 'ZIGZAG !', liste: [[0, 'bloc', 'toi'], [0.6, 'bloc', 'toi']] },
  double:  { nom: 'FAUX ET CORDE !', liste: [[0, 'bas', 'tous'], [0.75, 'haut', 'tous']] },
  suiveur: { nom: 'LE POT DE COLLE !', liste: [[0, 'suiveur', 'toi']] },
  blitz:   { nom: 'BLITZ !!', liste: [[0, 'bloc', 'toi'], [0.55, 'bas', 'tous'], [1.15, 'bloc', 'mur'], [1.75, 'haut', 'tous']] },
  piege:   { nom: 'LE PIÈGE !', liste: [[0, 'bloc', 'mur'], [0.6, 'bas', 'tous'], [1.2, 'suiveur', 'toi']] },
};

// Le suiveur se fige ce nombre de secondes avant le contact (il devient rouge) : esquive APRÈS
export const VERROU_SUIVEUR = 0.5;

// Ce que fait Kédric (le coach showman)
export const REPLIQUES = {
  presentation: 'Mesdames et messieurs... LE SHOW VA COMMENCER !',
  plaque: ['Et c\'est le SHOW KÉDRIC !', 'Applaudissez mes gars !', 'Trop lent, la star, c\'est MOI !', 'Ha ! Rejoue la scène !'],
  esquive: ['Hein ?! Rattrapez-le !', 'Mais qu\'est-ce que vous faites ?!', 'Hé ! C\'est MON show !', 'Pas mal... pas mal...'],
  parfait: ['QUOI ?! Il est passé à travers ?!', 'Mais c\'est un fantôme ?!'],
  ghost: 'Le... le DEVIL BAT GHOST ?!',
  touchdown: ['Ok ok... c\'était l\'échauffement.', 'Tu me voles la vedette, là !'],
  duel: 'C\'est l\'heure du SHOWTIME ! Je m\'en occupe MOI-MÊME !',
  duelEsquive: ['Hé ! Je glisse sur mon parquet !', 'Encore une fois, pour le public !', 'Personne ne passe Kédric deux fois !'],
  feinte: 'Feinte de STAR !',
  victoire: 'Tu... tu m\'as volé la vedette. Ok... tu es le nouveau showman.',
  defaite: 'Merci, merci ! Pas d\'autographes !',
};
