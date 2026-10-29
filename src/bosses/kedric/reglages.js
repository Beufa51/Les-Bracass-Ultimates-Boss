// Réglages du boss Kédric (match de football américain façon Eyeshield 21, vu de dos).
// Tous les chiffres d'équilibrage sont ici : on peut les modifier sans risque.
// Les temps sont en secondes, les distances en yards (1 yard ≈ 1 mètre), les vitesses en yards par seconde.
export const IDENTITE = { id: 'kedric', nom: 'Kédric' };

// Niveaux de difficulté (choisis avant le match)
//  alerte : le symbole (◀ ▶, ▲, ▼) apparaît sur le défenseur ce nombre de secondes avant le contact
//  parfait : fenêtre (s) de l'esquive PARFAITE juste avant le contact
//  aide : texte « ▲ SAUTE ! » près de toi + ralenti la première fois qu'un plaquage apparaît
//  feintes : chance que Kédric FEINTE (option kedric: true d'une course, en CHAMPION)
//  ghost : taille de la jauge du DEVIL BAT GHOST (une esquive ou une bonne réception : +1 ; PARFAITE : +2 ; voir REGLAGES.ghost)
//  flechesRouges : au battle de danse, Kédric triche avec des FLÈCHES ROUGES (fais l'inverse) ; seulement en CHAMPION
//  murTardif : le trou des murs de 2 défenseurs n'est choisi qu'au dernier moment (sinon on le voit dès le placement)
//  charge : vitesse des défenseurs qui foncent sur toi (en plus de ta course)
//  poursuite : chance qu'un défenseur esquivé de côté se relève et te poursuive ;
//  poursuiteEcart : il court ce nombre de yards / s plus vite que toi au moment où il part (le sprint le sème)
//  fenetreShow : largeur des fenêtres de timing du SHOWTIME (x)
export const DIFFICULTES = {
  facile:   { nom: 'FACILE',   couleur: '#7fff7f', alerte: 1.8, parfait: 0.22, aide: true, feintes: 0, ghost: 5, vitesse: 0.9, murTardif: false,
    charge: 1.0, poursuite: 0.06, poursuiteEcart: 0.9, fenetreShow: 1.35, flechesRouges: false,
    texte: 'Les défenseurs préviennent tôt, Kédric danse lentement. Idéal pour apprendre.' },
  normal:   { nom: 'NORMAL',   couleur: '#ffd84a', alerte: 1.45, parfait: 0.17, aide: true, feintes: 0.3, ghost: 6, vitesse: 1, murTardif: false,
    charge: 1.5, poursuite: 0.12, poursuiteEcart: 1.2, fenetreShow: 1, flechesRouges: false,
    texte: 'Le vrai match, et un vrai duel de frime contre Kédric.' },
  champion: { nom: 'CHAMPION', couleur: '#ff5a6e', alerte: 0.95, parfait: 0.12, aide: false, feintes: 0.45, ghost: 9, vitesse: 1.06, murTardif: true,
    charge: 3.0, poursuite: 0.2, poursuiteEcart: 1.5, fenetreShow: 0.8, flechesRouges: true,
    texte: 'Pas d\'aide, défense rapide, timing serré au SHOWTIME. Pour les vrais.' },
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
  terrain: 160,          // le terrain du KÉDRIC SHOW fait 160 yards (un vrai terrain : 100) : une longue course d'une traite
  // 3 COURSES : chacune commence par un COUP D'ENVOI à réceptionner, puis tu remontes tout le terrain d'une traite.
  // Plaqué = la course s'arrête (pas de points) ; personne ne t'arrête = TOUCHDOWN. Ensuite : le BATTLE DE DANSE.
  courses: 3,
  // la défense d'une course : un rang tous les 'espace' yards (≈ 1 s de course), 'souffle' yards de plus entre deux
  // formations, plus personne dans les 'finAvant' derniers yards (la ligne droite du touchdown)
  defense: { espace: 10, souffle: 6, finAvant: 8 },
  // coup d'envoi : Kédric botte, le ballon arrive du fond du terrain ; tu le réceptionnes sur tes 5 yards.
  //  vol : durée du vol ; hauteur : en yards ; choix : à ce moment du vol (fraction) le vent décide du couloir final ;
  //  parfait / bien : écart (s) entre ton ▲ et l'arrivée du ballon pour une réception PARFAITE (vitesse 3 + Ghost) / BIEN (vitesse 2) ;
  //  rebond : temps perdu à ramasser un ballon raté
  envoi: { depart: 5, vol: 2.8, hauteur: 4, choix: 0.6, parfait: 0.12, bien: 0.3, rebond: 0.9 },
  points: 7,             // touchdown (transformation comprise)
  apresAction: 1.4,      // pause après un plaquage
  // ---------- Course ----------
  vitesseBase: 8.6,      // yards / s au départ (40 yards en 4,7 s) — le défilement de base est encore un peu plus rapide
  pasVitesse: 0.7,       // + par niveau de vitesse
  niveauMax: 5,          // niveau 5 = 10,9 yards / s = 40 yards en 3,7 s, comme le n°21 !
  esquivesParNiveau: 2,  // esquives d'affilée pour gagner un niveau de vitesse
  alerteParNiveau: 0.03, // le symbole apparaît 3 % plus tard par niveau de vitesse (plus vite = un peu plus dur)
  changementCouloir: 0.13,
  saut: { duree: 0.5, recharge: 0.12 },        // ▲ : saute par-dessus un plaquage aux jambes
  rotation: { duree: 0.45, recharge: 0.12 },   // ▼ : se baisse en tournant sous les bras tendus
  // ---------- Les défenseurs ----------
  chargeAvant: 1.5,      // un défenseur en place fonce sur toi quand tu es à moins de 1,5 s de lui
  poursuite: { depart: 6, abandon: 11, max: 1 },   // UN poursuivant au plus : il part 6 yards derrière toi, abandonne à 11
  // ---------- Sprint (Z) : tape vite pour accélérer, surtout quand on te poursuit ----------
  //  chaque appui ajoute de la vitesse, qui retombe toute seule : 6 appuis / s ≈ +3,5 (le maximum)
  sprint: { parAppui: 0.5, max: 3.5, baisse: 0.8 },
  // ---------- Devil Bat Ghost ----------
  // Espace quand la jauge est pleine : pendant 'duree' s, vitesse maximale et TOUS les défenseurs sont passés à coup sûr
  // (gel : petit arrêt sur image au premier).
  // La jauge se garde d'une course à l'autre. parEsquive / parParfait : ce que rapporte une esquive (ou une bonne
  // réception) / une esquive PARFAITE (ou une réception parfaite) ; la taille de la jauge dépend de la difficulté (ghost)
  ghost: { duree: 4, gel: 0.35, parEsquive: 1, parParfait: 2 },
  // ---------- SHOWTIME : le BATTLE DE DANSE contre Kédric, le boss de fin (showtime.js) ----------
  //  Une SEULE SESSION CONTINUE : Kédric danse AVEC toi du début à la fin (plus de questions / réponses), et la musique
  //  n'est JAMAIS replacée pendant le battle (elle démarre sur le refrain à l'annonce, puis file sans coupure).
  //  rounds / dureeRound : 2 rounds d'1 minute de musique ; au round 2 : MÊMES RÈGLES, bandeau, la musique continue.
  //  tempo : début du refrain (s, sur un temps fort) et durée d'un temps (s), mesurés par outils/kedric/caler_battle.py ;
  //  tempsParPas : une flèche tous les 2 temps (~0,69 s) — toutes les flèches des 2 rounds sont calées sur cette grille.
  //  annonce : temps d'attente (en pas) avant la première flèche (la transition depuis l'écran d'annonce est douce) ;
  //  intro / introMini : l'écran d'annonce (Kédric sur scène) dure au plus 'intro' s (une flèche le passe après
  //  'introMini' s) ; la musique démarre au GO ! avec les flèches (plus pendant l'annonce).
  //  rougeChance : chance de FLÈCHE ROUGE par flèche (Kédric triche : fais l'inverse) ; CHAMPION seulement, jamais la 1re.
  //  piste : les flèches TOMBENT dans 4 couloirs (◀ ▶ à gauche, ▲ ▼ à droite) jusqu'à la touche : vitesse de chute (px / s)
  //  parfait / bien : fenêtres de timing (s, x fenetreShow de la difficulté) ; gain : points de PUBLIC (de -100 à +100)
  //  parTouchdown / avanceMax : public de départ = (touchdowns - 1) x parTouchdown (aucun touchdown : il part pour Kédric)
  //  Le public est un KAMÉHAMÉHA père-fils (showtime.js) : PARFAIT = ta boule repousse celle de Kédric, RATÉ = elle recule.
  showtime: { rounds: 2, dureeRound: 47,   // durée de la MANCHE 1 en secondes (la manche 2 : 'duree' de sa propre ligne)
    pause: 2,
    manches: [
      { musique: 'kedric_chala', tempo: { debut: 0, temps: 0.3896 } },   // la manche 1 : Cha-La Head-Cha-La, l'ouverture japonaise ORIGINALE de DBZ (1989, remasterisée) — 154 BPM
      { musique: 'kedric_dbz', duree: 60, tempo: { debut: 0, temps: 0.3896 } },   // la chanson 2 : le générique VOSTFR — UNE MINUTE
    ],
    tempsParPas: 2, annonce: 0,   // zéro temps mort : le décompte 5-4-3-2-1 démarre PILE quand la manche (et SA musique) démarrent
    // (le DÉCOMPTE 5-4-3-2-1-GO est dans showtime.js : DECOMPTE = 5 secondes PILE, calées sur le tempo de chaque morceau)
    intro: 9, introMini: 1.5, introMusique: 54.969,
    piste: { vitesse: 200 }, rougeChance: 0.12,
    piege: { nombre: 1, duree: 4 },   // par manche (CHAMPION : 1 s de plus)
    noir: { nombre: 1, duree: 3 },   // par manche
    ecartTech: 12,   // écart MINIMUM (s) entre deux techniques de Kédric (gel, noir) : pas la mitraille
    double: { duree: 12 },
    combo: { nombre: 5, duree: 10, mult: 1.5 },
    drain: { seuil: 40, force: 0.12 },   // tu mènes trop : son public se rappelle à lui (jauge/s, adouci : les pièges suffisent déjà)
    parfait: 0.12, bien: 0.28, gain: { parfait: 1.7, bien: 1.1, rate: 5 },   // réussites plus GÉNÉREUSES : on remonte après les pièges (gel, noir) ; raté = toujours une grosse pénalité
    parTouchdown: 15, avanceMax: 30 },
  // ---------- Kédric en personne sur le terrain (option : course avec kedric: true) ----------
  //  il garde l'en-but et prévient toujours pareil : danse → POSE (son attaque s'affiche) → CHARGE
  duel: { vies: 2, distance: 7, charge: 6, danse: 1.0, pose: 0.7, feinteAvant: 0.6 },
  // ---------- Classement ----------
  tempsReference: 300,   // au-delà de ce temps de jeu, le rang baisse
  rangs: [
    { rang: 'S', seuil: 88 },
    { rang: 'A', seuil: 72 },
    { rang: 'B', seuil: 50 },
    { rang: 'C', seuil: -Infinity },
  ],
};

// Les 3 COURSES : la défense de chaque course enchaîne ces FORMATIONS, dans l'ordre (et recommence), jusqu'à l'en-but.
// Kédric ne plaque jamais lui-même (une star ne se salit pas les mains) : on l'affronte au BATTLE DE DANSE.
// (kedric: true sur une course = il garde l'en-but, en duel d'esquive.)
export const COURSES = [
  { nom: 'COURSE', titre: 'L\'échauffement', formations: ['base', 'faux', 'corde', 'zone'] },
  { nom: 'COURSE', titre: 'Le grand show', formations: ['blitz', 'zone', 'corde', 'piege', 'faux'] },
  { nom: 'COURSE', titre: 'La défense de fer', formations: ['piege', 'blitz', 'zone', 'faux', 'corde'] },
];

// L'équipe du coup d'envoi qui descend sur toi (elle court déjà quand tu réceptionnes)
export const COUVERTURE = { nom: 'COUP D\'ENVOI !', liste: [[14, 'bloc', 'toi'], [23, 'bas', 'tous'], [32, 'bloc', 'mur'], [41, 'haut', 'toi']] };

// Les formations : des rangs à la suite (un tous les REGLAGES.defense.espace yards). [type, couloir]
//  types : 'bloc' = plaqueur debout (change de couloir ◀ ▶), 'bas' = plonge aux jambes (▲ saute, il te suit : pas de ◀ ▶ possible),
//          'haut' = bras tendus (▼ baisse-toi, il te suit aussi), 'suiveur' = te suit puis se fige au dernier moment (◀ ▶ après)
//  couloir : 'toi' = le tien, 'tous' = un défenseur dans chaque couloir, 'mur' = 2 couloirs bouchés (le libre n'est pas le tien)
export const FORMATIONS = {
  base:  { nom: 'DÉFENSE DE BASE !', liste: [['bloc', 'mur'], ['bloc', 'toi'], ['bas', 'toi'], ['suiveur', 'toi']] },
  faux:  { nom: 'LA FAUX !', liste: [['bloc', 'mur'], ['bas', 'tous'], ['bloc', 'toi'], ['haut', 'toi']] },
  corde: { nom: 'LA CORDE À LINGE !', liste: [['bloc', 'mur'], ['haut', 'tous'], ['suiveur', 'toi'], ['bas', 'toi']] },
  blitz: { nom: 'BLITZ !!', liste: [['bloc', 'mur'], ['bloc', 'toi'], ['bas', 'toi'], ['haut', 'tous'], ['bloc', 'toi']] },
  zone:  { nom: 'DÉFENSE DE ZONE !', liste: [['bloc', 'mur'], ['suiveur', 'toi'], ['bloc', 'mur'], ['haut', 'toi']] },
  piege: { nom: 'LE PIÈGE !', liste: [['bloc', 'mur'], ['bas', 'tous'], ['haut', 'tous'], ['suiveur', 'toi']] },
};

// Le suiveur se fige ce nombre de secondes avant le contact (il devient rouge) : esquive APRÈS
export const VERROU_SUIVEUR = 0.75;

// Ce que fait Kédric (le coach showman)
export const REPLIQUES = {
  presentation: 'Mesdames et messieurs... LE SHOW VA COMMENCER !',
  plaque: ['Et c\'est le SHOW KÉDRIC !', 'Applaudissez mes gars !', 'Trop lent, la star, c\'est MOI !', 'Ha ! Rejoue la scène !'],
  parfait: ['QUOI ?! Il est passé à travers ?!', 'Mais c\'est un fantôme ?!'],
  poursuite: ['Rattrape-le, numéro 55 !', 'Il fatigue ! Courez !'],
  rattrape: 'Personne ne court plus vite que MES gars !',
  ghost: 'Le... le DEVIL BAT GHOST ?!',
  envoi: 'Mesdames et messieurs... LE COUP D\'ENVOI DU SHOW !',
  reception: ['Il l\'a attrapé ?! Couvrez-le !', 'Pas mal la réception... pour un débutant.'],
  rate: 'Ha ! Il a les mains en beurre !',
  finaleZero: 'Même pas un touchdown ? Ha ! Et maintenant... le BATTLE DE DANSE ! Regarde et apprends la CLASSE !',
  finale: 'Tu m\'as eu au football américain... mais tu ne m\'auras pas sur la CLASSE ! Place au BATTLE DE DANSE !',
  touchdown: ['Ok ok... c\'était l\'échauffement.', 'Tu me voles la vedette, là !', 'Le public est pour MOI, hein !'],
  duel: 'C\'est l\'heure du SHOWTIME ! Je m\'en occupe MOI-MÊME !',
  duelEsquive: ['Hé ! Je glisse sur mon parquet !', 'Encore une fois, pour le public !', 'Personne ne passe Kédric deux fois !'],
  attaques: { bloc: 'L\'ÉPAULE DE STAR !', bas: 'LE PLONGEON DORÉ !', haut: 'LA CORDE DU SHOWMAN !' },
  victoire: 'Tu... tu m\'as volé la vedette. Ok... tu es le nouveau showman.',
  defaite: 'Merci, merci ! Pas d\'autographes !',
};

