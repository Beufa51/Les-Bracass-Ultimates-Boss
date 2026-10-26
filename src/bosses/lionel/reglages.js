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
//  aides : 'tot' = cercle vert dès le lancer, 'filet' = seulement quand le frisbee a passé le filet, false = aucune
//  choix : ses lancers préférés (remplace REGLAGES.ia.choix)
//  attrape : ta zone d'attrape autour de tes pieds { x : de chaque côté, haut : vers le fond, bas : vers l'écran }
//  ralenti : le frisbee ralentit (x ce nombre) quand il arrive près de toi (1 = pas de ralenti)
//  superSurLob : Lionel obtient son super en rattrapant TES lobs
//  biaisApres : ses N premiers lancers de l'échange sont droits (pas de rebond)
export const DIFFICULTES = {
  facile:   { nom: 'FACILE',   couleur: '#7fff7f', vitesse: 0.78, reaction: 0.34, erreur: 70, disque: 0.72, superHasard: 0,
    aides: 'tot', choix: { droit: 64, biais: 24, lob: 12 }, attrape: { x: 62, haut: 90, bas: 40 }, ralenti: 0.7, superSurLob: false, biaisApres: 3,
    texte: 'Lionel court moins vite et rate plus souvent. Idéal pour apprendre.' },
  normal:   { nom: 'NORMAL',   couleur: '#ffd84a', vitesse: 0.92, reaction: 0.26, erreur: 52, disque: 0.8,  superHasard: 0,
    aides: 'tot', choix: { droit: 60, biais: 28, lob: 12 }, attrape: { x: 50, haut: 75, bas: 32 }, ralenti: 0.75, superSurLob: false, biaisApres: 2,
    texte: 'Le vrai match.' },
  champion: { nom: 'CHAMPION', couleur: '#ff5a6e', vitesse: 1.12, reaction: 0.15, erreur: 24, disque: 1.12, superHasard: 0.08,
    aides: false, choix: { droit: 30, biais: 36, courbe: 22, lob: 12 }, attrape: { x: 38, haut: 55, bas: 26 }, ralenti: 1, superSurLob: true,
    texte: 'Sans aide, lancers rapides et super lancers fréquents. Pour les vrais.' },
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
  accelEchange: 0.03,     // +3 % à chaque lancer de l'échange
  vitesseMax: 900,
  rayonDisque: 11,
  angle: 0.52,            // lancer en biais (Haut / Bas maintenu) : angle en radians
  courbe: { decalage: 120, depart: 0.32 },   // lancer courbe : arrive décalé de 120 px, part de l'autre côté
  lob: { duree: 1.25, hauteur: 170, attrape: 42, attrapeLionel: 36 },   // lob : temps de vol, hauteur max, distance pour l'attraper (toi / Lionel)
  rapide: { fenetre: 0.3, bonus: 1.22 },     // relancer très vite après avoir attrapé = lancer PUISSANT
  echelleIllustre: 0.5,   // taille à l'écran des illustrations de Lionel (découpées à moitié de la planche)
  hauteurMain: 34,        // hauteur du frisbee en vol (au niveau de la main)

  // ---------- Super lancers (quand on rattrape un lob juste en dessous) ----------
  superJoueur: { nom: 'ÉCLAIR VERT', vitesse: 1.45, zigzag: 0.16, amplitude: 520 },
  superLionel: { nom: 'LE CHAMBREUR', vitesse: 1.15, arret: 0.8 },   // s'arrête au filet (une ligne montre où il va)... puis repart en flèche

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
  super: ['LE CHAMBREUR !', 'Celle-là, tu la sens pas venir !'],
  lob: ['Oups, il tombe !', 'Cours, cours !'],
  setGagne: ['Un set à zéro, tranquille.', 'On continue, ou t\'abandonnes ?'],
  setPerdu: ['Bon... on arrête de rigoler.', 'Ok. Là, je me fâche.'],
  defaite: 'Reviens quand tu sauras attraper un frisbee !',
  victoire: 'Ok, ok... t\'as gagné. Mais je te laissais faire, hein !',
};
