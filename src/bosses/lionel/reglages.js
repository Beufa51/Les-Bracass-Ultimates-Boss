// Réglages du boss Lionel (match de frisbee façon Windjammers, Neo Geo 1994).
// Tous les chiffres d'équilibrage sont ici : on peut les modifier sans risque.
// Les temps sont en secondes, les vitesses en pixels par seconde.
export const IDENTITE = { id: 'lionel', nom: 'Lionel' };

// Le terrain (vu de 3/4 au-dessus) : TOI à gauche, Lionel à droite, le filet au milieu.
// Les buts sont les murs des deux bouts : zone du milieu = 5 points, côtés = 3 points.
// Calé sur le décor assets/sprites/lionel/lionel_terrain.jpg (assets_inbox/lionel_decor.jpg recadré :
// x de 120 à 1246 et y de 100 à 733, puis réduit à 960 x 540) : bords du sable et ligne jaune du milieu.
export const TERRAIN = {
  x0: 90, x1: 872,       // murs de but (gauche = le tien, droite = celui de Lionel)
  y0: 104, y1: 468,      // murs du haut et du bas (le frisbee rebondit dessus)
  filet: 481,            // personne ne passe le filet
  zone5: [0.36, 0.64],   // zone à 5 points (en fraction de la hauteur du terrain)
};

// Niveaux de difficulté (choisis avant le match)
//  vitesse : x vitesse de course de Lionel ; reaction : temps avant qu'il réagisse au lancer ;
//  erreur : de combien il se trompe (pixels) sur l'endroit où arrive le frisbee ;
//  disque : x vitesse de ses lancers ; superHasard : chance d'un super lancer "gratuit" à chacun de ses lancers
//  aides : 'tot' = cercle vert dès le lancer, 'filet' = seulement quand le frisbee a passé le filet, false = aucune
//  choix : ses lancers préférés (remplace REGLAGES.ia.choix)
//  attrape : ta zone d'attrape autour de tes pieds { x : de chaque côté, haut : vers le fond, bas : vers l'écran }
//  ralenti : le frisbee ralentit (x ce nombre) quand il arrive près de toi (1 = pas de ralenti)
//  superSurLob : Lionel obtient son super en rattrapant TES lobs
//  lentLob : il réagit ce nombre de fois plus lentement à tes lobs (ils sont durs à lire)
//  publicLionel : vitesse de remplissage de la jauge du public de Lionel (x)
//  surprises : une surprise (mouette, château de sable, ballon) toutes les X à Y secondes
//  biaisApres : ses N premiers lancers de l'échange sont droits (pas de rebond)
export const DIFFICULTES = {
  facile:   { nom: 'FACILE',   couleur: '#7fff7f', vitesse: 0.78, reaction: 0.34, erreur: 70, disque: 0.72, superHasard: 0.03, lentLob: 2.2, surprises: [16, 24], fenetreParfait: 0.2, publicLionel: 0.5,
    aides: 'tot', choix: { droit: 64, biais: 24, lob: 12 }, attrape: { x: 62, haut: 90, bas: 40 }, ralenti: 0.7, superSurLob: false, biaisApres: 3,
    texte: 'Lionel court moins vite et rate plus souvent. Idéal pour apprendre.' },
  normal:   { nom: 'NORMAL',   couleur: '#ffd84a', vitesse: 1.0, reaction: 0.21, erreur: 44, disque: 0.89, superHasard: 0.07, lentLob: 2.2, surprises: [12, 20], fenetreParfait: 0.15, publicLionel: 0.85,
    aides: 'tot', choix: { droit: 50, biais: 36, lob: 14 }, attrape: { x: 44, haut: 70, bas: 30 }, ralenti: 0.85, superSurLob: false, biaisApres: 1,
    texte: 'Le vrai match.' },
  champion: { nom: 'CHAMPION', couleur: '#ff5a6e', vitesse: 1.14, reaction: 0.15, erreur: 22, disque: 1.14, superHasard: 0.08, lentLob: 1.3, surprises: [10, 16], fenetreParfait: 0.1, publicLionel: 1,
    aides: 'filet', choix: { droit: 30, biais: 36, courbe: 22, lob: 12 }, attrape: { x: 38, haut: 55, bas: 26 }, ralenti: 1, superSurLob: true,
    texte: 'Aide seulement après le filet, lancers rapides, supers fréquents. Pour les vrais.' },
};

export const REGLAGES = {
  // ---------- Match ----------
  pointsSet: 12,          // premier à 12 points gagne le set
  dureeSet: 30,           // ... ou le meilleur au bout de 30 s, comme le vrai Windjammers (égalité = point en or)
  setsGagnants: 2,        // 2 sets gagnants (en 3 sets)
  pointsLob: 2,           // lob qui tombe par terre
  pauseApresPoint: 1.7,   // secondes de pause après un point

  // ---------- Joueurs ----------
  rayon: 26,              // zone où LIONEL attrape le frisbee (la tienne : 'attrape' dans DIFFICULTES)
  vitesseJoueur: 330,
  vitesseLionel: 315,
  glissade: { vitesse: 700, duree: 0.24, recharge: 0.45, relever: 0.1 },   // plongeon (Espace en courant)
  tenueMax: 3.5,          // au-delà, le frisbee part tout seul
  ralentiTenue: 0.08,     // on ne peut pas relancer avant ce délai (évite les doubles appuis)

  // ---------- Frisbee ----------
  vitesseDisque: 560,     // premier lancer de l'échange
  accelEchange: 0.04,     // +4 % à chaque lancer de l'échange (les longs échanges finissent par passer)
  vitesseMax: 900,
  rayonDisque: 11,
  angle: 0.52,            // lancer en biais (Haut / Bas maintenu) : angle en radians
  courbe: { decalage: 120, depart: 0.32 },   // lancer courbe : arrive décalé de 120 px, part de l'autre côté
  lob: { duree: 1.25, hauteur: 170, attrape: 42, attrapeLionel: 36 },   // lob : temps de vol, hauteur max, distance pour l'attraper (toi / Lionel)
  // tes lobs se visent : ▲ ▼ = côté, ◀ = COURT (près du filet), ▶ = PROFOND (près du mur de Lionel, 3 points)
  lobVise: { courtX: 95, profondX: 70, dureeCourt: 1.0, dureeProfond: 1.1, pointsProfond: 3 },
  rapide: { fenetre: 0.3, bonus: 1.22 },     // relancer très vite après avoir attrapé = lancer PUISSANT
  echelleIllustre: 0.5,   // taille à l'écran des illustrations de Lionel (découpées à moitié de la planche)
  hauteurMain: 34,        // hauteur du frisbee en vol (au niveau de la main)

  // ---------- Super lancers (en rattrapant un lob juste en dessous, ou quand la jauge du public est pleine) ----------
  superJoueur: { nom: 'TORNADE DE FEU', vitesse: 1.45, pilotage: 520, reactivite: 7 },   // téléguidé avec ▲ ▼ pendant tout son vol
  superLionel: { nom: 'LE CHAMBREUR', vitesse: 1.35, arret: 0.5 },   // s'arrête au filet (une ligne montre où il va)... puis repart en flèche

  // ---------- Jauge du public (la tienne) : pleine = SUPER PRÊT sans attraper de lob ----------
  // (chaque joueur a sa jauge ; encaisser ne la vide pas : pas de double peine)
  public: { max: 15, attrape: 1, plongeon: 2, parfait: 3, puissant: 1, marque: 1 },

  // ---------- Contre parfait : appuyer sur Espace juste avant d'attraper (fenetreParfait selon la difficulté) ----------
  parfait: { fenetre: 0.1, bonus: 1.4, ralenti: 0.35, dureeRalenti: 0.45 },

  // ---------- Les trois supers de Lionel (tirés au hasard) ----------
  supersLionel: {
    chambreur:  { nom: 'LE CHAMBREUR' },                           // s'arrête au filet puis repart en flèche (superLionel)
    dedoubleur: { nom: 'LE DÉDOUBLEUR', vitesse: 1.15, ecart: 0.55 },   // un vrai frisbee et un FAUX qui disparaît au dernier moment
    boomerang:  { nom: 'LE BOOMERANG', vitesse: 1.2, decalage: 230 },   // part d'un côté et revient en crochet de l'autre
  },

  // ---------- Surprises sur le terrain ----------
  surprisePresDeToi: 200,   // un tir de Lionel n'est pas dévié à moins de 200 px de toi
  mouette: { rayon: 34, hauteur: 60, vitesse: 120 },   // traverse le terrain ; si le frisbee la touche, il est dévié (« COUAC ! »)
  chateau: { rayon: 24, duree: 11 },                    // château de sable : le frisbee rebondit dessus, il s'écroule
  ballon:  { rayon: 20, vitesse: 70, duree: 13 },       // ballon de plage qui roule : le frisbee rebondit, le ballon file

  // ---------- Lionel (le cerveau) ----------
  ia: {
    tenue: [0.18, 0.6],           // temps qu'il garde le frisbee avant de lancer
    nargue: 0.18,                 // chance de garder le frisbee pour te narguer
    tenueNargue: 1.1,
    choix: { droit: 40, biais: 40, lob: 20 },   // ses lancers préférés (poids), si la difficulté n'en donne pas
    plongeon: 120,                // il plonge si le frisbee arrive à plus de 120 px de lui
    ecartVise: 110,               // ses lancers droits arrivent à 110 px de toi (il faut bouger)
  },

  // ---------- Classement ----------
  rangs: [
    { rang: 'S', seuil: 85 },
    { rang: 'A', seuil: 68 },
    { rang: 'B', seuil: 48 },
    { rang: 'C', seuil: -Infinity },
  ],
};

// Lionel est un peu chambreur : il se moque gentiment de toi.
export const REPLIQUES = {
  marque: ['Trop facile !', 'T\'as vu passer ?', 'Allez, ramasse !', 'Hé hé, on se réveille ?', 'C\'est tout ?',
    'Je joue d\'une main, là.', 'Tu veux que je ralentisse ?', 'Et de un de plus !'],
  encaisse: ['Coup de chance...', 'Ok, pas mal... pour un débutant.', 'Je te laisse gagner, c\'est tout.',
    'Pfff, j\'étais pas prêt !', 'Hé ! C\'était pas du jeu !', 'Le soleil m\'a ébloui.'],
  nargue: ['Tu la veux ? Viens la chercher !', 'Attention... attention...', 'Regarde bien... non, en fait !', 'Tic... tac...'],
  super: ['Celle-là, tu la sens pas venir !', 'Regarde bien... trop tard !', 'Tu peux toujours courir !', 'Attention les yeux !'],
  lob: ['Oups, il tombe !', 'Cours, cours !'],
  lobRate: ['Aïe ! Sur la tête !', 'Hé ! Il était où, celui-là ?', 'Bon... joli lob.', 'Je regardais les mouettes !'],
  setGagne: ['Un set à zéro, tranquille.', 'On continue, ou t\'abandonnes ?'],
  setPerdu: ['Bon... on arrête de rigoler.', 'Ok. Là, je me fâche.'],
  defaite: 'Reviens quand tu sauras attraper un frisbee !',
  victoire: 'Ok, ok... t\'as gagné. Mais je te laissais faire, hein !',
};
