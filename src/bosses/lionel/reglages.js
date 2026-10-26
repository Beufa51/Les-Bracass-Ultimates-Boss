// Réglages du boss Lionel (match de frisbee façon Windjammers, Neo Geo 1994).
// Tous les chiffres d'équilibrage sont ici : on peut les modifier sans risque.
// Les temps sont en secondes, les vitesses en pixels par seconde.
export const IDENTITE = { id: 'lionel', nom: 'Lionel' };

// Le terrain (vu de 3/4 au-dessus) : TOI à gauche, Lionel à droite, le filet au milieu.
// Les buts sont les murs des deux bouts : zone du milieu = 5 points, côtés = 3 points.
export const TERRAIN = {
  x0: 70, x1: 890,       // murs de but (gauche = le tien, droite = celui de Lionel)
  y0: 168, y1: 500,      // murs du haut et du bas (le frisbee rebondit dessus)
  filet: 480,            // personne ne passe le filet
  zone5: [0.36, 0.64],   // zone à 5 points (en fraction de la hauteur du terrain)
};

// Niveaux de difficulté (choisis avant le match)
//  vitesse : x vitesse de course de Lionel ; reaction : temps avant qu'il réagisse au lancer ;
//  erreur : de combien il se trompe (pixels) sur l'endroit où arrive le frisbee ;
//  disque : x vitesse de ses lancers ; superHasard : chance d'un super lancer "gratuit" (set 2 et plus)
export const DIFFICULTES = {
  facile:   { nom: 'FACILE',   couleur: '#7fff7f', vitesse: 0.78, reaction: 0.34, erreur: 70, disque: 0.85, superHasard: 0,
    aides: true, texte: 'Lionel court moins vite et rate plus souvent. Idéal pour apprendre.' },
  normal:   { nom: 'NORMAL',   couleur: '#ffd84a', vitesse: 1,    reaction: 0.22, erreur: 40, disque: 1,    superHasard: 0.08,
    aides: true, texte: 'Le vrai match.' },
  champion: { nom: 'CHAMPION', couleur: '#ff5a6e', vitesse: 1.15, reaction: 0.14, erreur: 18, disque: 1.15, superHasard: 0.16,
    aides: false, texte: 'Sans aide, lancers rapides et super lancers fréquents. Pour les vrais.' },
};

export const REGLAGES = {
  // ---------- Match ----------
  pointsSet: 12,          // premier à 12 points gagne le set
  dureeSet: 30,           // ... ou le meilleur au bout de 30 s, comme le vrai Windjammers (égalité = point en or)
  setsGagnants: 2,        // 2 sets gagnants (en 3 sets)
  pointsLob: 2,           // lob qui tombe par terre
  pauseApresPoint: 1.7,   // secondes de pause après un point

  // ---------- Joueurs ----------
  rayon: 26,              // zone où l'on attrape le frisbee
  vitesseJoueur: 330,
  vitesseLionel: 315,
  glissade: { vitesse: 860, duree: 0.22, recharge: 0.45, relever: 0.28 },   // plongeon (Espace en courant)
  tenueMax: 2.2,          // au-delà, le frisbee part tout seul
  ralentiTenue: 0.12,     // on ne peut pas relancer avant ce délai (évite les doubles appuis)

  // ---------- Frisbee ----------
  vitesseDisque: 560,     // premier lancer de l'échange
  accelEchange: 0.06,     // +6 % à chaque lancer de l'échange (les longs échanges deviennent intenables)
  vitesseMax: 1150,
  rayonDisque: 11,
  angle: 0.62,            // lancer en biais (Haut / Bas maintenu) : angle en radians
  courbe: { decalage: 150, depart: 0.38 },   // lancer courbe : arrive décalé de 150 px, part de l'autre côté
  lob: { duree: 1.25, hauteur: 170, attrape: 42 },   // lob : temps de vol, hauteur max, distance pour l'attraper
  rapide: { fenetre: 0.2, bonus: 1.22 },     // relancer très vite après avoir attrapé = lancer PUISSANT
  hauteurMain: 34,        // hauteur du frisbee en vol (au niveau de la main)

  // ---------- Super lancers (quand on rattrape un lob juste en dessous) ----------
  superJoueur: { nom: 'ÉCLAIR VERT', vitesse: 1.45, zigzag: 0.16, amplitude: 520 },
  superLionel: { nom: 'LE CHAMBREUR', vitesse: 1.35, arret: 0.6 },   // s'arrête au filet (une ligne montre où il va)... puis repart en flèche

  // ---------- Lionel (le cerveau) ----------
  ia: {
    tenue: [0.18, 0.6],           // temps qu'il garde le frisbee avant de lancer
    nargue: 0.18,                 // chance de garder le frisbee pour te narguer
    tenueNargue: 1.1,
    choix: { droit: 28, biais: 32, courbe: 28, lob: 10 },   // ses lancers préférés (poids)
    plongeon: 120,                // il plonge si le frisbee arrive à plus de 120 px de lui
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
  super: ['LE CHAMBREUR !', 'Celle-là, tu la sens pas venir !'],
  lob: ['Oups, il tombe !', 'Cours, cours !'],
  setGagne: ['Un set à zéro, tranquille.', 'On continue, ou t\'abandonnes ?'],
  setPerdu: ['Bon... on arrête de rigoler.', 'Ok. Là, je me fâche.'],
  defaite: 'Reviens quand tu sauras attraper un frisbee !',
  victoire: 'Ok, ok... t\'as gagné. Mais je te laissais faire, hein !',
};
