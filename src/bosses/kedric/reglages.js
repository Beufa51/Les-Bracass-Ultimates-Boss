// Réglages du boss Kédric (match de football américain façon Eyeshield 21, vu de dos).
// Tous les chiffres d'équilibrage sont ici : on peut les modifier sans risque.
// Les temps sont en secondes, les distances en yards (1 yard ≈ 1 mètre), les vitesses en yards par seconde.
export const IDENTITE = { id: 'kedric', nom: 'Kédric' };

// Niveaux de difficulté (choisis avant le match)
//  alerte : le symbole (◀ ▶, ▲, ▼) apparaît sur le défenseur ce nombre de secondes avant le contact
//  parfait : fenêtre (s) de l'esquive PARFAITE juste avant le contact
//  aide : texte « ▲ SAUTE ! » près de toi + ralenti la première fois qu'un plaquage apparaît
//  feintes : chance que Kédric FEINTE (en finale, acte 3 seulement ; dans les duels de zone rouge, en CHAMPION)
//  ghost : esquives PARFAITES (ou réceptions parfaites) pour remplir la jauge du DEVIL BAT GHOST
//  decalage : chance que la ligne se décale au « HUT ! » (le trou change de couloir)
//  murTardif : le trou des murs de 2 défenseurs n'est choisi qu'au dernier moment (sinon on le voit dès le placement)
//  charge : vitesse des défenseurs qui foncent sur toi (en plus de ta course)
//  poursuite : chance qu'un défenseur esquivé de côté se relève et te poursuive ;
//  poursuiteEcart : il court ce nombre de yards / s plus vite que toi au moment où il part (le sprint le sème)
//  fenetreShow : largeur des fenêtres de timing du SHOWTIME (x)
export const DIFFICULTES = {
  facile:   { nom: 'FACILE',   couleur: '#7fff7f', alerte: 1.8, parfait: 0.22, aide: true, feintes: 0, ghost: 3, vitesse: 0.9, decalage: 0, murTardif: false,
    charge: 1.0, poursuite: 0.06, poursuiteEcart: 0.9, fenetreShow: 1.35,
    texte: 'Les défenseurs préviennent tôt, Kédric danse lentement. Idéal pour apprendre.' },
  normal:   { nom: 'NORMAL',   couleur: '#ffd84a', alerte: 1.45, parfait: 0.17, aide: true, feintes: 0.3, ghost: 5, vitesse: 1, decalage: 0, murTardif: false,
    charge: 1.5, poursuite: 0.12, poursuiteEcart: 1.2, fenetreShow: 1,
    texte: 'Le vrai match, et un vrai duel de frime contre Kédric.' },
  champion: { nom: 'CHAMPION', couleur: '#ff5a6e', alerte: 0.95, parfait: 0.12, aide: false, feintes: 0.45, ghost: 6, vitesse: 1.06, decalage: 0.5, murTardif: true,
    charge: 3.0, poursuite: 0.2, poursuiteEcart: 1.5, fenetreShow: 0.8,
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
  terrain: 140,          // le terrain du KÉDRIC SHOW fait 140 yards (un vrai terrain : 100) : plus d'actions avant l'en-but
  // 3 ATTAQUES (chacune commence par un COUP D'ENVOI à réceptionner), puis la FINALE en 1 contre 1 contre Kédric.
  attaques: 3,
  // coup d'envoi : Kédric botte, le ballon arrive du fond du terrain ; tu le réceptionnes sur tes 5 yards.
  //  vol : durée du vol ; hauteur : en yards ; choix : à ce moment du vol (fraction) le vent décide du couloir final ;
  //  parfait / bien : écart (s) entre ton ▲ et l'arrivée du ballon pour une réception PARFAITE (vitesse 3 + Ghost) / BIEN (vitesse 2) ;
  //  rebond : temps perdu à ramasser un ballon raté ; retourMax : au-delà, tu es poussé en touche (fini les retours de 95 yards)
  envoi: { depart: 5, vol: 2.8, hauteur: 4, choix: 0.6, parfait: 0.12, bien: 0.3, rebond: 0.9, retourMax: 40 },
  // PASSE : ▲ avant le « HUT ! » (2 par attaque) : tu pars 8 yards plus loin et le ballon arrive par-dessus toi.
  //  ratée = passe incomplète (essai perdu, aucun gain)
  passe: { parAttaque: 2, distance: 8, vol: 1.6, hauteur: 3, depart: 16 },
  premierEssai: 10,      // avancer de 10 yards = 4 nouveaux essais
  essais: 4,             // 4 essais pour avancer de 10 yards, sinon Kédric récupère le ballon... et marque
  points: 7,             // touchdown (transformation comprise)
  avantSnap: 2.0,        // tu vois la défense en place (et tu peux changer de couloir) avant le « HUT ! »
  apresAction: 1.4,      // pause après un plaquage
  // DERNIER RIDEAU : passé le dernier défenseur, ses arrières te poussent en touche ce nombre de yards plus loin
  // (pas un plaquage : l'action s'arrête). Seul un DEVIL BAT GHOST perce le rideau.
  rideau: 6,
  // ZONE ROUGE : à moins de 22 yards de l'en-but, défense serrée (ZONE_ROUGE) ; en 2e et 3e attaques, Kédric garde l'en-but.
  zoneRouge: 22,
  // ---------- Course ----------
  vitesseBase: 6.0,      // yards / s au départ (40 yards en 6,7 s)
  pasVitesse: 0.7,       // + par niveau de vitesse
  niveauMax: 5,          // niveau 5 = 9,5 yards / s = 40 yards en 4,2 s, comme le n°21 !
  esquivesParNiveau: 2,  // esquives d'affilée pour gagner un niveau de vitesse
  elan: 2,               // à chaque nouvelle action, tu gardes ta vitesse moins 2 niveaux
  alerteParNiveau: 0.03, // le symbole apparaît 3 % plus tard par niveau de vitesse (plus vite = un peu plus dur)
  changementCouloir: 0.13,
  saut: { duree: 0.5, recharge: 0.12 },        // ▲ : saute par-dessus un plaquage aux jambes
  rotation: { duree: 0.45, recharge: 0.12 },   // ▼ : se baisse en tournant sous les bras tendus
  // ---------- Les défenseurs ----------
  chargeAvant: 1.5,      // un défenseur en place fonce sur toi quand tu es à moins de 1,5 s de lui (la ligne ne bouge pas)
  poursuite: { depart: 6, abandon: 11, max: 1 },   // UN poursuivant au plus : il part 6 yards derrière toi, abandonne à 11
  // ---------- Sprint (Z) : tape vite pour accélérer, surtout quand on te poursuit ----------
  //  chaque appui ajoute de la vitesse, qui retombe toute seule : 6 appuis / s ≈ +3,5 (le maximum)
  sprint: { parAppui: 0.5, max: 3.5, baisse: 0.8 },
  // ---------- Devil Bat Ghost ----------
  // Espace quand la jauge est pleine : vitesse maximale, le PROCHAIN défenseur (dans les 1,6 s) est passé à coup sûr,
  // et le dernier rideau ne t'arrête pas : c'est la grande percée.
  ghost: { fenetre: 1.6, gel: 0.45 },
  // ---------- SHOWTIME : le DUEL DE FRIME contre Kédric (showtime.js) ----------
  //  Kédric montre ses pas en rythme, puis « À TOI ! » : tu les refais sur les mêmes temps. FLÈCHE ROUGE = l'inverse.
  //  manches : nombre de pas de chaque manche de la finale ; rouges : flèches rouges par manche ; bpm : tempo par manche
  //  parfait / bien : fenêtres de timing (s, x fenetreShow de la difficulté) ; gain : points de PUBLIC (la jauge va de -100 à +100)
  //  kedricParPas : le public qu'il te prend à chaque pas qu'il montre ; tu gagnes la finale si la jauge finit au-dessus de 0
  //  (-100 = perdu tout de suite). Chaque touchdown d'avance au score : +15 au départ (30 au plus).
  //  revanche : après chacun de tes touchdowns, Kédric veut sa revanche sur 4 pas (sans risque, réussie = +1 Ghost)
  showtime: { manches: [4, 6, 8], rouges: [0, 1, 2], bpm: [88, 96, 104], annonce: 1.6, pause: 1.2,
    parfait: 0.1, bien: 0.22, gain: { parfait: 11, bien: 7, rate: 12 }, kedricParPas: 2,
    parTouchdown: 15, avanceMax: 30, revanche: 4 },
  // ---------- Kédric en personne sur le terrain (option : attaque avec kedric: true) ----------
  //  il garde l'en-but en zone rouge et prévient toujours pareil : danse → POSE (son attaque s'affiche) → CHARGE
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

// Les 3 ATTAQUES : à chaque action, Kédric choisit une FORMATION dans la liste (dans l'ordre, puis il recommence).
// En zone rouge, il prend ZONE_ROUGE. Kédric ne plaque jamais lui-même (une star ne se salit pas les mains) :
// on l'affronte au SHOWTIME. (kedric: true sur une attaque = il garde l'en-but en zone rouge, en duel d'esquive.)
export const ATTAQUES = [
  { nom: '1re ATTAQUE', titre: 'L\'échauffement', formations: ['base', 'faux', 'corde', 'base', 'blitz', 'zone'] },
  { nom: '2e ATTAQUE', titre: 'Le grand show', formations: ['blitz', 'zone', 'corde', 'piege', 'faux', 'blitz'] },
  { nom: '3e ATTAQUE', titre: 'La défense de fer', formations: ['piege', 'blitz', 'zone', 'faux', 'piege', 'corde'] },
];

// L'équipe du coup d'envoi qui descend sur toi (elle court déjà quand tu réceptionnes)
export const COUVERTURE = { nom: 'COUP D\'ENVOI !', liste: [[14, 'bloc', 'toi'], [23, 'bas', 'tous'], [32, 'bloc', 'mur'], [41, 'haut', 'toi']] };

// Les formations : 11 défenseurs au plus, comme un vrai match. [profondeur (yards devant la ligne d'engagement), type, couloir]
//  types : 'bloc' = plaqueur debout (change de couloir ◀ ▶), 'bas' = plonge aux jambes (▲ saute, il te suit : pas de ◀ ▶ possible),
//          'haut' = bras tendus (▼ baisse-toi, il te suit aussi), 'suiveur' = te suit puis se fige au dernier moment (◀ ▶ après)
//  couloir : 'toi' = le tien, 'tous' = un défenseur dans chaque couloir, 'mur' = 2 couloirs bouchés (le libre n'est pas le tien)
//  La LIGNE (profondeur 6) bloque 2 couloirs dès le départ : place-toi face au trou avant le « HUT ! »
//  (attention, elle peut se DÉCALER au dernier moment). Plaqué par la ligne = pas de gain (tu es arrêté sur la ligne).
// Les rangs sont espacés d'au moins 8 yards (plus d'une seconde entre deux défenseurs) : on a le temps de lire.
export const FORMATIONS = {
  base:  { nom: 'DÉFENSE DE BASE !', liste: [[6, 'bloc', 'mur'], [14, 'bloc', 'toi'], [22, 'bas', 'toi'], [30, 'suiveur', 'toi']] },
  faux:  { nom: 'LA FAUX !', liste: [[6, 'bloc', 'mur'], [14, 'bas', 'tous'], [22, 'bloc', 'toi'], [30, 'haut', 'toi']] },
  corde: { nom: 'LA CORDE À LINGE !', liste: [[6, 'bloc', 'mur'], [14, 'haut', 'tous'], [22, 'suiveur', 'toi'], [30, 'bas', 'toi']] },
  blitz: { nom: 'BLITZ !!', liste: [[6, 'bloc', 'mur'], [14, 'bloc', 'toi'], [22, 'bas', 'toi'], [30, 'haut', 'tous'], [38, 'bloc', 'toi']] },
  zone:  { nom: 'DÉFENSE DE ZONE !', liste: [[6, 'bloc', 'mur'], [14, 'suiveur', 'toi'], [22, 'bloc', 'mur'], [30, 'haut', 'toi']] },
  piege: { nom: 'LE PIÈGE !', liste: [[6, 'bloc', 'mur'], [14, 'bas', 'tous'], [22, 'haut', 'tous'], [30, 'suiveur', 'toi']] },
};

// ZONE ROUGE (près de l'en-but) : des rangs réguliers jusqu'à la ligne d'en-but, espacés d'au moins 6 yards (placés par le jeu ;
// ceux qui n'ont pas la place ne jouent pas)
export const ZONE_ROUGE = [
  { nom: 'ZONE ROUGE : LE MUR VERT !', liste: [[0, 'bloc', 'mur'], [0, 'bas', 'tous'], [0, 'bloc', 'toi'], [0, 'haut', 'tous']] },
  { nom: 'ZONE ROUGE : PERSONNE NE PASSE !', liste: [[0, 'bloc', 'mur'], [0, 'haut', 'tous'], [0, 'bas', 'toi'], [0, 'bloc', 'mur']] },
];
export const ESPACE_ZONE_ROUGE = 6;

// Le suiveur se fige ce nombre de secondes avant le contact (il devient rouge) : esquive APRÈS
export const VERROU_SUIVEUR = 0.75;

// Ce que fait Kédric (le coach showman)
export const REPLIQUES = {
  presentation: 'Mesdames et messieurs... LE SHOW VA COMMENCER !',
  plaque: ['Et c\'est le SHOW KÉDRIC !', 'Applaudissez mes gars !', 'Trop lent, la star, c\'est MOI !', 'Ha ! Rejoue la scène !'],
  parfait: ['QUOI ?! Il est passé à travers ?!', 'Mais c\'est un fantôme ?!'],
  poursuite: ['Rattrape-le, numéro 55 !', 'Il fatigue ! Courez !'],
  rattrape: 'Personne ne court plus vite que MES gars !',
  touche: ['Dehors ! Le rideau est fermé !', 'Mes arrières, mesdames et messieurs !'],
  ghost: 'Le... le DEVIL BAT GHOST ?!',
  envoi: 'Mesdames et messieurs... LE COUP D\'ENVOI DU SHOW !',
  reception: ['Il l\'a attrapé ?! Couvrez-le !', 'Pas mal la réception... pour un débutant.'],
  rate: 'Ha ! Il a les mains en beurre !',
  passe: 'Une passe ?! Marquez-le !',
  incomplete: 'Incomplète ! Rends-moi ce ballon !',
  zoneRouge: 'Zone rouge ! Ici, c\'est MON territoire !',
  finale: 'Une star ne plaque pas. On règle ça au SHOWTIME ! Suis mes pas... si tu peux !',
  revanche: 'Tu crois savoir faire le show ? Montre-moi !',
  touchdown: ['Ok ok... c\'était l\'échauffement.', 'Tu me voles la vedette, là !', 'Le public est pour MOI, hein !'],
  balle: 'Ballon pour MOI ! Regardez bien... TOUCHDOWN KÉDRIC !',
  premierEssai: ['Pfff... 10 yards, la belle affaire.', 'Les gars, réveillez-vous !'],
  duel: 'C\'est l\'heure du SHOWTIME ! Je m\'en occupe MOI-MÊME !',
  duelEsquive: ['Hé ! Je glisse sur mon parquet !', 'Encore une fois, pour le public !', 'Personne ne passe Kédric deux fois !'],
  attaques: { bloc: 'L\'ÉPAULE DE STAR !', bas: 'LE PLONGEON DORÉ !', haut: 'LA CORDE DU SHOWMAN !' },
  victoire: 'Tu... tu m\'as volé la vedette. Ok... tu es le nouveau showman.',
  defaite: 'Merci, merci ! Pas d\'autographes !',
};
