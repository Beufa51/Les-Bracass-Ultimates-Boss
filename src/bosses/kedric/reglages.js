// Réglages du boss Kédric (match de football américain façon Eyeshield 21, vu de dos).
// Tous les chiffres d'équilibrage sont ici : on peut les modifier sans risque.
// Les temps sont en secondes, les distances en yards (1 yard ≈ 1 mètre), les vitesses en yards par seconde.
export const IDENTITE = { id: 'kedric', nom: 'Kédric' };

// Niveaux de difficulté (choisis avant le match)
//  alerte : le symbole (◀ ▶, ▲, ▼) apparaît sur le défenseur ce nombre de secondes avant le contact
//  parfait : fenêtre (s) de l'esquive PARFAITE juste avant le contact
//  aide : texte « ▲ SAUTE ! » près de toi + ralenti la première fois qu'un plaquage apparaît
//  feintes : chance que Kédric (le duel) change d'attaque au dernier moment ; feinte : délai pour y répondre
//  ghost : esquives PARFAITES pour remplir la jauge du DEVIL BAT GHOST
//  decalage : chance que la ligne se décale au « HUT ! » (le trou change de couloir)
//  charge : vitesse des défenseurs qui foncent sur toi (en plus de ta course)
//  angle : vitesse des arrières qui reviennent en diagonale quand tu as passé toute la défense (x vitesse de départ)
//  poursuite : chance qu'un défenseur esquivé de côté se relève et te poursuive ; vitessePoursuite : sa vitesse (x vitesse de départ)
export const DIFFICULTES = {
  facile:   { nom: 'FACILE',   couleur: '#7fff7f', alerte: 1.2, parfait: 0.22, aide: true, feintes: 0, feinte: 0.6, ghost: 3, vitesse: 0.95, decalage: 0,
    charge: 2.0, poursuite: 0.2, vitessePoursuite: 1.04, angle: 1.35,
    texte: 'Les défenseurs préviennent tôt et poursuivent peu. Idéal pour apprendre.' },
  normal:   { nom: 'NORMAL',   couleur: '#ffd84a', alerte: 0.95, parfait: 0.17, aide: true, feintes: 0.35, feinte: 0.55, ghost: 4, vitesse: 1, decalage: 0.3,
    charge: 3.0, poursuite: 0.35, vitessePoursuite: 1.1, angle: 1.6,
    texte: 'Le vrai match. Kédric feinte un peu, ses gars te poursuivent.' },
  champion: { nom: 'CHAMPION', couleur: '#ff5a6e', alerte: 0.72, parfait: 0.12, aide: false, feintes: 0.6, feinte: 0.42, ghost: 5, vitesse: 1.06, decalage: 0.55,
    charge: 4.0, poursuite: 0.5, vitessePoursuite: 1.18, angle: 1.7,
    texte: 'Pas d\'aide, défense rapide et acharnée. Pour les vrais.' },
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
};

export const REGLAGES = {
  // ---------- Le match ----------
  attaques: 3,           // 3 attaques chacun ; égalité = prolongation (une attaque de plus, le premier qui marque gagne)
  depart: 20,            // chaque attaque part de tes 20 yards (l'en-but de Kédric est à 100)
  premierEssai: 10,      // avancer de 10 yards = 4 nouveaux essais
  essais: 4,             // 4 essais pour avancer de 10 yards, sinon Kédric récupère le ballon... et marque
  points: 7,             // touchdown (transformation comprise)
  avantSnap: 1.7,        // tu vois la défense en place (et tu peux changer de couloir) avant le « HUT ! »
  apresAction: 1.9,      // pause après un plaquage
  // ---------- Course ----------
  vitesseBase: 6.0,      // yards / s au départ de chaque action (40 yards en 6,7 s)
  pasVitesse: 0.7,       // + par niveau de vitesse
  niveauMax: 5,          // niveau 5 = 9,5 yards / s = 40 yards en 4,2 s, comme le n°21 !
  esquivesParNiveau: 2,  // esquives d'affilée pour gagner un niveau de vitesse (repart de zéro à chaque action)
  alerteParNiveau: 0.05, // le symbole apparaît 5 % plus tard par niveau de vitesse (plus vite = plus dur)
  changementCouloir: 0.13,
  saut: { duree: 0.5, recharge: 0.12 },        // ▲ : saute par-dessus un plaquage aux jambes
  rotation: { duree: 0.45, recharge: 0.12 },   // ▼ : se baisse en tournant sous les bras tendus
  // ---------- Les défenseurs ----------
  chargeAvant: 1.5,      // un défenseur en place fonce sur toi quand tu es à moins de 1,5 s de lui (la ligne ne bouge pas)
  poursuite: { depart: 2.5, abandon: 9, max: 3 },   // un poursuivant part 2,5 yards derrière toi, abandonne à 9 yards
  // toute la défense passée : 2 arrières reviennent en diagonale, à 3,5-5 yards derrière toi (seule la vitesse maximale les sème)
  angle: { nombre: 2, depart: [3.5, 5] },
  // ---------- Devil Bat Ghost ----------
  // Espace quand la jauge est pleine : vitesse maximale, et le PROCHAIN défenseur (dans les 1,6 s) est passé à coup sûr
  ghost: { fenetre: 1.6, gel: 0.45 },
  // ---------- Kédric en personne (3e attaque et prolongation) : le dernier défenseur ----------
  duel: {
    vies: 2,             // il faut l'esquiver 2 fois (le Devil Bat Ghost ne compte que pour une)
    distance: 13,        // il se replace à 13 yards devant toi avant chaque charge
    charge: 15,          // vitesse de sa charge (yards / s, en plus de ta course)
    attente: [0.7, 1.3], // il danse ce temps avant de charger
    tonAllure: 0.55,     // tu cours moins vite pendant le duel (x)
  },
  // ---------- Classement ----------
  tempsReference: 200,   // au-delà de ce temps de jeu, le rang baisse
  rangs: [
    { rang: 'S', seuil: 88 },
    { rang: 'A', seuil: 72 },
    { rang: 'B', seuil: 50 },
    { rang: 'C', seuil: -Infinity },
  ],
};

// Les 3 ATTAQUES : à chaque action, Kédric choisit une FORMATION dans la liste (dans l'ordre, puis il recommence).
// 3e attaque (et prolongation) : Kédric joue lui-même, en dernier défenseur.
export const ATTAQUES = [
  { nom: '1re ATTAQUE', titre: 'L\'échauffement', formations: ['base', 'faux', 'corde', 'base', 'blitz', 'zone'] },
  { nom: '2e ATTAQUE', titre: 'Le grand show', formations: ['blitz', 'zone', 'corde', 'piege', 'faux', 'blitz'] },
  { nom: '3e ATTAQUE', titre: 'SHOWTIME', kedric: true, formations: ['piege', 'blitz', 'zone', 'faux', 'corde'] },
];
export const PROLONGATION = { nom: 'PROLONGATION', titre: 'Le premier qui marque', kedric: true, formations: ['blitz', 'piege', 'zone'] };

// Les formations : 11 défenseurs au plus, comme un vrai match. [profondeur (yards devant la ligne d'engagement), type, couloir]
//  types : 'bloc' = plaqueur debout (change de couloir ◀ ▶), 'bas' = plonge aux jambes (▲ saute),
//          'haut' = bras tendus (▼ baisse-toi), 'suiveur' = te suit puis se fige au dernier moment (◀ ▶ après)
//  couloir : 'toi' = le tien, 'tous' = un défenseur dans chaque couloir, 'mur' = 2 couloirs bouchés (le libre n'est pas le tien)
//  La LIGNE (profondeur 4) bloque 2 couloirs dès le départ : place-toi face au trou avant le « HUT ! »
//  (attention, elle peut se DÉCALER au dernier moment). Plaqué par la ligne = pas de gain (tu es arrêté sur la ligne).
//  En 3e attaque, le défenseur le plus profond est remplacé par KÉDRIC (le duel).
export const FORMATIONS = {
  base:  { nom: 'DÉFENSE DE BASE !', liste: [[4, 'bloc', 'mur'], [9, 'bloc', 'toi'], [17, 'bas', 'toi'], [30, 'suiveur', 'toi']] },
  faux:  { nom: 'LA FAUX !', liste: [[4, 'bloc', 'mur'], [9, 'bas', 'tous'], [18, 'bloc', 'toi'], [31, 'haut', 'toi']] },
  corde: { nom: 'LA CORDE À LINGE !', liste: [[4, 'bloc', 'mur'], [10, 'haut', 'tous'], [19, 'suiveur', 'toi'], [32, 'bas', 'toi']] },
  blitz: { nom: 'BLITZ !!', liste: [[4, 'bloc', 'mur'], [7, 'bloc', 'toi'], [11, 'bas', 'toi'], [20, 'haut', 'tous'], [33, 'bloc', 'toi']] },
  zone:  { nom: 'DÉFENSE DE ZONE !', liste: [[4, 'bloc', 'mur'], [10, 'suiveur', 'toi'], [16, 'bloc', 'mur'], [26, 'haut', 'toi'], [35, 'bas', 'toi']] },
  piege: { nom: 'LE PIÈGE !', liste: [[4, 'bloc', 'mur'], [8, 'bas', 'tous'], [13, 'haut', 'tous'], [22, 'suiveur', 'toi'], [32, 'bloc', 'mur']] },
};

// Le suiveur se fige ce nombre de secondes avant le contact (il devient rouge) : esquive APRÈS
export const VERROU_SUIVEUR = 0.5;

// Ce que fait Kédric (le coach showman)
export const REPLIQUES = {
  presentation: 'Mesdames et messieurs... LE SHOW VA COMMENCER !',
  plaque: ['Et c\'est le SHOW KÉDRIC !', 'Applaudissez mes gars !', 'Trop lent, la star, c\'est MOI !', 'Ha ! Rejoue la scène !'],
  esquive: ['Hein ?! Rattrapez-le !', 'Mais qu\'est-ce que vous faites ?!', 'Hé ! C\'est MON show !', 'Pas mal... pas mal...'],
  parfait: ['QUOI ?! Il est passé à travers ?!', 'Mais c\'est un fantôme ?!'],
  poursuite: ['Rattrape-le, numéro 55 !', 'Il fatigue ! Courez !'],
  rattrape: 'Personne ne court plus vite que MES gars !',
  ghost: 'Le... le DEVIL BAT GHOST ?!',
  touchdown: ['Ok ok... c\'était l\'échauffement.', 'Tu me voles la vedette, là !', 'Le public est pour MOI, hein !'],
  balle: 'Ballon pour MOI ! Regardez bien... TOUCHDOWN KÉDRIC !',
  premierEssai: ['Pfff... 10 yards, la belle affaire.', 'Les gars, réveillez-vous !'],
  duel: 'C\'est l\'heure du SHOWTIME ! Je m\'en occupe MOI-MÊME !',
  duelEsquive: ['Hé ! Je glisse sur mon parquet !', 'Encore une fois, pour le public !', 'Personne ne passe Kédric deux fois !'],
  feinte: 'Feinte de STAR !',
  victoire: 'Tu... tu m\'as volé la vedette. Ok... tu es le nouveau showman.',
  defaite: 'Merci, merci ! Pas d\'autographes !',
};
