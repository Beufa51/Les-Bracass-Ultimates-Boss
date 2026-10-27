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
//  viesFinale : nombre de plaquages que tu peux encaisser dans la FINALE contre Kédric
//  poursuite : chance qu'un défenseur esquivé de côté se relève et te poursuive ; vitessePoursuite : sa vitesse (x vitesse de départ)
export const DIFFICULTES = {
  facile:   { nom: 'FACILE',   couleur: '#7fff7f', alerte: 1.2, parfait: 0.22, aide: true, feintes: 0, feinte: 0.6, ghost: 3, vitesse: 0.95, decalage: 0,
    charge: 2.0, poursuite: 0.2, vitessePoursuite: 1.04, angle: 1.45, viesFinale: 4,
    texte: 'Les défenseurs préviennent tôt et poursuivent peu. Idéal pour apprendre.' },
  normal:   { nom: 'NORMAL',   couleur: '#ffd84a', alerte: 0.95, parfait: 0.17, aide: true, feintes: 0.35, feinte: 0.55, ghost: 4, vitesse: 1, decalage: 0.3,
    charge: 3.0, poursuite: 0.35, vitessePoursuite: 1.1, angle: 1.75, viesFinale: 3,
    texte: 'Le vrai match. Kédric feinte un peu, ses gars te poursuivent.' },
  champion: { nom: 'CHAMPION', couleur: '#ff5a6e', alerte: 0.72, parfait: 0.12, aide: false, feintes: 0.6, feinte: 0.42, ghost: 5, vitesse: 1.06, decalage: 0.55,
    charge: 4.0, poursuite: 0.5, vitessePoursuite: 1.18, angle: 1.85, viesFinale: 2,
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
  // 3 ATTAQUES (chacune commence par un COUP D'ENVOI à réceptionner), puis la FINALE en 1 contre 1 contre Kédric.
  attaques: 3,
  // coup d'envoi : Kédric botte, le ballon arrive du fond du terrain ; tu le réceptionnes sur tes 5 yards.
  //  vol : durée du vol ; hauteur : en yards ; super : fenêtre (s) pour ▲ juste avant l'arrivée = SUPER RÉCEPTION ;
  //  rebond : temps perdu à ramasser un ballon raté
  envoi: { depart: 5, vol: 2.4, hauteur: 4, super: 0.3, rebond: 0.9 },
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
  // toute la défense passée : 2 arrières (3 sur un coup d'envoi) reviennent en diagonale, à 2,5-3,5 yards derrière toi
  // (seuls la vitesse maximale et le SPRINT les sèment)
  angle: { nombre: 2, nombreEnvoi: 3, depart: [2.5, 3.5] },
  // ---------- Sprint (Z) : tape vite pour accélérer, surtout quand on te poursuit ----------
  //  chaque appui ajoute de la vitesse (yards / s), qui retombe toute seule (de plus en plus vite : il faut taper vite et longtemps)
  //  5 appuis / s = +1,5 environ ; 7 appuis / s = +2 ; jamais plus que max
  sprint: { parAppui: 0.35, max: 2.5, baisse: 1.2 },
  // ---------- Devil Bat Ghost ----------
  // Espace quand la jauge est pleine : vitesse maximale, et le PROCHAIN défenseur (dans les 1,6 s) est passé à coup sûr
  ghost: { fenetre: 1.6, gel: 0.45 },
  // ---------- La FINALE : 1 contre 1 contre Kédric, depuis ses 40 yards ----------
  //  vies : esquives qu'il faut pour le passer (+1 par touchdown de retard au score) ;
  //  chaque touchdown d'avance te donne 1 vie de plus (2 au plus) ; feintes : chance de feinte en plus pendant la finale
  //  chaine : chance (qui monte quand il faiblit) qu'il enchaîne une attaque tout de suite après une esquive (« CHORÉGRAPHIE »)
  finale: { depart: 60, vies: 5, viesMax: 7, bonusMax: 2, chaine: 0.35, distanceChaine: 8, feintes: 0.15 },
  // ---------- Kédric en personne (2e attaque) : le dernier défenseur ----------
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
// 2e et 3e attaques : Kédric joue lui-même, en dernier défenseur.
export const ATTAQUES = [
  { nom: '1re ATTAQUE', titre: 'L\'échauffement', formations: ['base', 'faux', 'corde', 'base', 'blitz', 'zone'] },
  { nom: '2e ATTAQUE', titre: 'Kédric entre en jeu', kedric: true, formations: ['blitz', 'zone', 'corde', 'piege', 'faux', 'blitz'] },
  { nom: '3e ATTAQUE', titre: 'Le grand show', kedric: true, formations: ['piege', 'blitz', 'zone', 'faux', 'piege', 'corde'] },
];

// L'équipe du coup d'envoi qui descend sur toi (elle court déjà quand tu réceptionnes)
export const COUVERTURE = { nom: 'COUP D\'ENVOI !', liste: [[16, 'bloc', 'toi'], [23, 'bas', 'tous'], [31, 'bloc', 'mur'], [40, 'haut', 'toi'], [49, 'suiveur', 'toi'], [58, 'bloc', 'toi']] };

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
  envoi: 'Mesdames et messieurs... LE COUP D\'ENVOI DU SHOW !',
  reception: ['Il l\'a attrapé ?! Couvrez-le !', 'Pas mal la réception... pour un débutant.'],
  rate: 'Ha ! Il a les mains en beurre !',
  finale: 'Toi et moi. Sous les projecteurs. C\'est MON SHOWTIME !',
  finalePlaque: ['Et la foule est en DÉLIRE !', 'Rejoue, rejoue ! J\'adore ce passage !', 'Encore raté, la star c\'est MOI !'],
  choregraphie: 'CHORÉGRAPHIE !',
  touchdown: ['Ok ok... c\'était l\'échauffement.', 'Tu me voles la vedette, là !', 'Le public est pour MOI, hein !'],
  balle: 'Ballon pour MOI ! Regardez bien... TOUCHDOWN KÉDRIC !',
  premierEssai: ['Pfff... 10 yards, la belle affaire.', 'Les gars, réveillez-vous !'],
  duel: 'C\'est l\'heure du SHOWTIME ! Je m\'en occupe MOI-MÊME !',
  duelEsquive: ['Hé ! Je glisse sur mon parquet !', 'Encore une fois, pour le public !', 'Personne ne passe Kédric deux fois !'],
  feinte: 'Feinte de STAR !',
  victoire: 'Tu... tu m\'as volé la vedette. Ok... tu es le nouveau showman.',
  defaite: 'Merci, merci ! Pas d\'autographes !',
};
