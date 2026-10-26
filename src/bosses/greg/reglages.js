// Réglages du boss Greg (combat de boxe façon Hajime no Ippo).
// Tous les chiffres d'équilibrage sont ici : on peut les modifier sans risque.
// Les temps sont en secondes, les dégâts en points de vie (sur 100).
export const IDENTITE = { id: 'greg', nom: 'Greg' };

// Niveaux de difficulté (choisis avant le combat)
//  degatsGreg : x dégâts des coups de Greg ; vitesse : x durée de préparation de ses coups (plus petit = plus rapide)
//  esquive : durée pendant laquelle ton esquive protège ; aides : flèche + cible d'aide
export const DIFFICULTES = {
  facile:   { nom: 'FACILE',   couleur: '#7fff7f', degatsGreg: 0.65, vitesse: 1.25, esquive: 0.55, aides: true,
    texte: 'Greg frappe moins fort et plus lentement. Idéal pour apprendre.' },
  normal:   { nom: 'NORMAL',   couleur: '#ffd84a', degatsGreg: 1,    vitesse: 1,    esquive: 0.45, aides: true,
    texte: 'Le vrai combat.' },
  champion: { nom: 'CHAMPION', couleur: '#ff5a6e', degatsGreg: 1.25, vitesse: 0.85, esquive: 0.38, aides: false,
    texte: 'Sans flèche ni cible, coups rapides et puissants. Pour les vrais.' },
};

export const REGLAGES = {
  // ---------- Match ----------
  nbRounds: 3,
  dureeRound: 60,              // secondes par round
  soinEntreRounds: 30,         // vie rendue au joueur dans le coin
  soinGregEntreRounds: 15,     // vie rendue à Greg dans le coin

  // ---------- Écran (vue Punch-Out : on voit ton boxeur de dos) ----------
  centreX: 480,                // milieu du ring
  piedsGreg: 440,              // bas du dessin de Greg
  piedsJoueur: 590,            // bas du dessin du joueur (coupé par le bas de l'écran)
  decalageEsquive: 120,        // de combien ton boxeur part sur le côté en esquivant
  tailleGreg: 0.9,             // 1 = taille du dessin
  // Greg en illustrations : chaque image est placée pour que sa TÊTE tombe en (teteX, teteY).
  //   origine = position de la tête dans l'image (0 à 1), taille = grossissement à l'écran
  illustre: {
    //   cote = côté de l'écran d'où part le gant sur l'image (elle est retournée pour l'autre côté)
    // Greg est vu EN ENTIER (comme dans Punch-Out) :
    //  - en garde / touché / essoufflé : l'image complète greg_entier ;
    //  - garde haute et coups : le haut du corps (coupé à la ceinture) + les jambes greg_jambes,
    //    posées sous la ceinture. ceinture = [x du milieu, y du haut, largeur] dans l'image du haut.
    solY: 505,                // hauteur des pieds sur le tapis (poses "pied")
    teteX: 480, teteY: 118,   // au K.O. : case de manga avec l'image greg_ko
    jambes: { cle: 'greg_jambes', ceintureX: 163.5, largeur: 132.6 },
    poses: {
      entier: { cle: 'greg_entier',      origine: [0.461, 0.082], taille: 0.64 },
      // garde (en pied, gants levés) ; decalY = descendre l'image pour que les pieds touchent le tapis
      gardePied: { cle: 'greg_garde_pied', origine: [0.423, 0.085], taille: 0.6, decalY: -21 },
      // planche de poses EN PIED : posées sur leurs pieds (solY), toutes à la même taille
      gardeBasse: { cle: 'greg_garde_basse_pied', origine: [0.415, 1], taille: 0.815, pied: true },
      jab:        { cle: 'greg_pied_jab',              origine: [0.592, 1], taille: 0.815, pied: true, cote: 'g' },
      crochet:    { cle: 'greg_pied_crochet',          origine: [0.245, 1], taille: 0.815, pied: true, cote: 'd' },
      corpsPied:  { cle: 'greg_corps_pied',       origine: [0.432, 1], taille: 0.815, pied: true, cote: 'g' },
      smash:      { cle: 'greg_smash',            origine: [0.331, 1], taille: 0.815, pied: true },
      touche:     { cle: 'greg_touche_pied',      origine: [0.666, 1], taille: 0.815, pied: true },
      etourdi:    { cle: 'greg_etourdi',          origine: [0.23, 1], taille: 0.815, pied: true },
      koDebout:   { cle: 'greg_ko_debout',        origine: [0.494, 1], taille: 0.815, pied: true },   // il s'effondre
      victoire:   { cle: 'greg_pied_victoire',         origine: [0.506, 1], taille: 0.815, pied: true },
      basse:  { cle: 'greg_combat',      origine: [0.467, 0.134], taille: 0.382 },
      haute:  { cle: 'greg_garde_haute', origine: [0.584, 0.18],  taille: 0.368, ceinture: [205, 414, 192] },
      corps:  { cle: 'greg_coup_corps',  origine: [0.3, 0.154],   taille: 0.355, ceinture: [190, 392, 215], cote: 'd' },
      visage: { cle: 'greg_coup_visage', origine: [0.633, 0.19],  taille: 0.40,  ceinture: [225, 474, 240], cote: 'g' },
    },
    dureeChute: 0.9,   // K.O. : durée de la chute sur le ring avant la case manga
    debutElan: 0.2,    // à partir de ce moment de la préparation, on voit le coup partir
    debutElanCorps: 0.4,   // pour le coup au corps : il plonge d'abord bas plus longtemps
  },
  tailleJoueur: 0.92,          // petit et transparent, comme dans Super Punch-Out
  // Ton boxeur en illustrations (assets/sprites/greg/heros_*.png) : origine = milieu du haut de la ceinture.
  // Pour chaque pose du jeu : quelle image, retournée (miroir) ou non, décalage, inclinaison.
  herosIllustre: {
    ceintureY: 565, taille: 0.66,
    images: { heros_garde: [0.496, 0.801], heros_coup: [0.617, 0.807], heros_uppercut: [0.517, 0.851],
      heros_touche: [0.499, 0.709], heros_sol: [0.485, 0.75] },
    poses: {
      garde:     { cle: 'heros_garde' },
      bloque:    { cle: 'heros_garde', echelle: 0.96, dy: 6 },
      esquive:   { cle: 'heros_garde', dy: 40, echelle: 0.95 },
      touche:    { cle: 'heros_touche' },
      sol:       { cle: 'heros_sol', dy: -10 },
      jab:       { cle: 'heros_coup', miroir: true },
      crochet:   { cle: 'heros_coup' },
      corps:     { cle: 'heros_coup', dy: 30, angle: 8 },
      dempsey_g: { cle: 'heros_coup', miroir: true, dy: 30 },
      dempsey_d: { cle: 'heros_coup', dy: 30 },
      victoire:  { cle: 'heros_uppercut' },
    },
  },
  transparenceJoueur: 0.75,

  // ---------- Joueur ----------
  souffleRecup: 22,            // souffle regagné par seconde quand on ne frappe pas
  coups: {
    //          moment de l'impact, durée totale, dégâts, souffle dépensé, cible
    visage: { impact: 0.10, duree: 0.30, degats: 3, souffle: 8,  cible: 'tete' },
    corps:  { impact: 0.14, duree: 0.36, degats: 3, souffle: 11, cible: 'corps', souffleGreg: 15 },
  },
  esquiveDuree: 0.5,           // durée de l'esquive (Gauche ou Droite)
  esquiveProtege: 0.45,        // pendant ce temps, les coups au visage passent à côté
  tropTot: 0.4,                // esquive finie moins de X s avant le coup => message "Trop tôt !"
  esquivePause: 0.2,           // délai avant de pouvoir ré-esquiver
  esquiveSouffle: 8,
  garde: 0.3,                  // part des dégâts reçus en garde (0.3 = 30 %)
  gardeSouffle: 22,            // souffle perdu par coup bloqué (et pas de récupération tant qu'on garde)
  toucheDuree: 0.38,           // temps sonné après un coup reçu
  contreFenetre: 0.8,          // après une esquive réussie, temps pour placer un contre
  contreMultiplicateur: 3,     // dégâts du contre : c'est LA stratégie
  memoireAppui: 0.15,          // un appui fait pendant un coup / sonné est gardé en mémoire ce temps

  // ---------- Esprit combatif (jauge du Dempsey Roll) ----------
  // la jauge ne se remplit QU'avec les esquives réussies (environ 8 esquives pour un Dempsey)
  esprit: { coupPorte: 0, esquive: 13, contre: 0, releve: 0 },
  // Dempsey Roll = jeu de rythme : une boule parcourt un "∞" (le balancement du buste).
  // Appuie sur ◀ quand elle arrive à gauche, ▶ quand elle arrive à droite (un bip marque le bon moment).
  // Chaque coup réussi accélère le rythme et frappe plus fort.
  dempsey: {
    coupsMax: 10,              // le 10e coup est le coup final
    periodeDepart: 1.6,        // secondes pour un tour complet du "∞" au début
    acceleration: 0.95,        // chaque coup réussi : le tour dure 5 % de moins
    periodeMin: 0.75,
    parfait: 0.35,             // tolérance (en "angle") pour un PARFAIT
    bien: 0.9,                 // ... et pour un BIEN (au-delà : raté)
    erreursPermises: 2,        // ratés pardonnés ; le suivant arrête le roll
    attenteMax: 6,             // secondes pour donner le 1er coup (▶) avant que le roll s'annule
    degatsParfait: 3,
    degatsBien: 2,
    bonusCombo: 0.05,          // +5 % de dégâts par coup déjà enchaîné
    degatsFinal: 12,
    contreEntre: [3, 6],       // round 3 : Greg tente un contre entre ces coups-là
    degatsContre: 30,
  },

  // ---------- Au tapis ----------
  secondeCompte: 0.9,          // durée d'un chiffre du compte de l'arbitre
  appuisPourSeRelever: [10, 14, 20],   // alternances ◀ ▶ à faire : 1er, 2e, 3e passage au tapis
  vieApresRelevee: [55, 40, 30],
  knockdownsMax: 3,            // au 3e tapis... c'est fini (pour toi comme pour Greg)
  vieGregApresRelevee: [100, 100],
  compteGregRelevee: [6, 8],   // Greg se relève à ce chiffre

  // ---------- Greg ----------
  souffleGregRecup: 7,
  souffleGregApresEssoufflement: 60,
  dureeEssoufflement: 2.0,     // Greg à bout de souffle = grande ouverture
  dureeTouche: 0.25,
  comboMax: 3,                 // après 3 coups encaissés d'affilée, Greg se couvre...
  dureeCouverture: 0.8,        // ...pendant ce temps (il bloque tout sauf les contres), puis riposte
  // Temps de réflexion entre deux attaques (min, max), par round
  pauseAttaque: [[1.6, 2.4], [1.1, 1.8], [0.8, 1.4]],
  // Ses coups se préparent plus vite à chaque round (multiplie les "prepa" des attaques)
  vitesseRound: [1, 0.9, 0.82],
  // Chaque fois que Greg se relève, il prépare ses coups plus vite
  fureur: 0.92,
  // Aides visuelles par round (round 1 = tutoriel)
  aideFleche: [true, true, true],     // flèche "ESQUIVE / GARDE"
  aideCible: [true, true, true],      // cercle qui se resserre là où le coup va frapper

  // ---------- Étourdissement (comme dans Super Punch-Out) ----------
  // Chaque coup qui TOUCHE remplit une jauge cachée (qui se vide toute seule). Pleine => Greg titube,
  // sans défense pendant 'duree' secondes : tous tes coups passent !
  etourdi: { parCoup: 15, parContre: 35, baisse: 18, duree: 1.8 },
  compteVocal: false,          // compte de l'arbitre à voix haute (japonais) ; false = seulement à l'écran
  annonceur: true,             // voix de synthèse : "Box !", compte, "K.O. !" (si le navigateur en a une)

  // ---------- Moment secret : Greg baisse la garde un très court instant ----------
  // Une fois par round, à un moment au hasard (entre 'entre' secondes restantes). Pour réussir :
  // un COUP AU CORPS lancé APRÈS qu'il a baissé la garde (marteler avant ne marche pas), en moins de 'duree'.
  // 1re fois du combat = COUP SECRET (tapis direct) ; ensuite = dégâts x3. Mauvais coup = il esquive.
  nargue: { entre: [45, 15], duree: 0.7, coup: 'corps', multiplicateur: 3 },

  // ---------- Classement de fin (temps de K.O. + coups reçus + tapis) ----------
  rangs: [ // du meilleur au moins bon : il faut un score >= au seuil
    { rang: 'S', seuil: 90 }, { rang: 'A', seuil: 70 }, { rang: 'B', seuil: 45 }, { rang: 'C', seuil: 0 },
  ],

  // ---------- Coups / garde : finitions ----------
  arretImpact: { coup: 0.06, contre: 0.12, recu: 0.15 },   // "hit-stop" : l'image se fige un instant
  gardeBriseeSonne: 0.8,       // garde avec souffle à 0 => garde brisée, sonné ce temps
  smashGardeSonne: 1.0,        // le SMASH bloqué brise toujours la garde
  // Greg pare même tes coups "libres" (zone ouverte, hors contre / essoufflement) : chance par round
  blocageLibre: [0.4, 0.5, 0.6],
  pauseApresTouche: 0.4,       // après avoir encaissé, il ne reste pas bloqué : pause max avant d'attaquer
  riposte: { prepa: 0.5 },     // après "Il se couvre", il riposte tout de suite par un jab rapide
};

// Attaques de Greg.
//  cible 'tete'  : esquive du côté OPPOSÉ au coup (coup de gauche => ▶) ou garde (Bas)
//  cible 'corps' : garde (Bas) seulement
//  cible 'smash' : esquive (Gauche/Droite) ! La garde ne protège qu'à moitié.
export const ATTAQUES = {
  jab:     { nom: 'Jab',          cible: 'tete',  prepa: 0.8,  degats: 8,  recup: 0.4, souffle: 4 },
  crochet: { nom: 'Crochet',      cible: 'tete',  prepa: 1.0,  degats: 16, recup: 0.7, souffle: 8 },
  corps:   { nom: 'Coup au foie', cible: 'corps', prepa: 0.9,  degats: 13, recup: 0.6, souffle: 8, souffleJoueur: 25 },
  rafale:  { nom: 'Flicker',      cible: 'tete',  prepa: 0.7,  degats: 6,  recup: 0.8, souffle: 12, coups: 3, entre: 0.75 },
  // FEINTE (Greg énervé) : elle ressemble à un coup au visage mais ne frappe pas ; le vrai coup suit !
  feinte:  { nom: 'Feinte',       cible: 'tete',  prepa: 0.6,  degats: 0,  recup: 0.05, souffle: 2, feinte: true },
  smash:   { nom: 'SMASH',        cible: 'smash', prepa: 1.1,  degats: 34, recup: 1.2, souffle: 20, gardeCassee: 0.5 },
};

// ENCHAÎNEMENTS de Greg, par round : il les joue dans l'ordre, en boucle (comme dans Punch-Out,
// on peut les apprendre par cœur). Chaque coup : 'attaque' + côté ('g' / 'd') ; le SMASH part du centre.
// Après chaque enchaînement, Greg change de garde (haute <-> basse) et souffle un peu.
export const ENCHAINEMENTS = [
  [ // round 1
    ['jab g', 'jab d'],
    ['jab g', 'corps'],
    ['crochet d'],
    ['jab d', 'jab d', 'corps'],
  ],
  [ // round 2
    ['jab g', 'jab d', 'crochet g'],
    ['rafale'],
    ['corps', 'crochet d'],
    ['jab g', 'corps', 'jab d'],
  ],
  [ // round 3
    ['jab g', 'crochet d'],
    ['rafale', 'corps'],
    ['jab d', 'jab g', 'crochet d'],
    ['smash'],                       // avant le SMASH, il tape ses gants (on le voit venir)
    ['corps', 'jab g', 'crochet g'],
  ],
];

// Greg ÉNERVÉ (après son 2e passage au tapis) : enchaînements avec des feintes
export const ENCHAINEMENTS_ENERVE = [
  ['feinte g', 'jab d', 'crochet g'],
  ['jab g', 'feinte d', 'corps'],
  ['crochet d', 'feinte g', 'jab g'],
  ['corps', 'feinte d', 'jab d', 'smash'],
];

// Ce que dit le vieux coach dans le coin, entre les rounds
export const CONSEILS = [
  [
    'Regarde le cadre blanc : c\'est ce qu\'il protège.',
    'Il protège le visage ? Tape au CORPS. Le ventre ? Tape au VISAGE.',
    'Son coup au foie (« ! » violet) : seule la GARDE (▼) marche.',
  ],
  [
    'Coup de GAUCHE ? Esquive à DROITE (et inversement) !',
    'Et juste après une esquive, CONTRE : dégâts x3 !',
    'Chaque esquive réussie remplit ta jauge. Pleine ? DEMPSEY ROLL !',
    'Il répète toujours les mêmes enchaînements : apprends-les !',
    'Parfois il baisse sa garde une fraction de seconde... vise là où ça fait mal !',
  ],
  [
    'Quand il tape ses gants, le SMASH arrive :',
    'ESQUIVE sur le côté ! La garde ne suffit pas.',
    'Dempsey Roll : s\'il contre (boule ROUGE), GARDE (▼) pour freiner !',
  ],
];

// Petites phrases (style manga)
export const REPLIQUES = {
  gregDebut: ['Prépare-toi à manger le tapis !', 'Mon Smash va t\'envoyer au vestiaire !'],
  gregReleve: ['C\'est tout ce que t\'as ?!', 'Ça chatouille...', 'Maintenant, je suis ÉNERVÉ !'],
  joueurSol: ['Mes jambes... ne répondent plus...', 'Je... ne peux pas... perdre ici !', 'Tout le monde compte sur moi !'],
  coach: 'Relève-toi, petit !!',
  joueurContre: ['Trop facile !', 'Je l\'ai eu !', 'Dans le mille !', 'Et BAM !'],
  joueurTouche: ['Trop près...', 'Aïe aïe aïe...', 'Ça pique !'],
};

// Onomatopées affichées à l'impact (comme dans le manga)
export const ONOMATOPEES = {
  leger: ['PAF', 'BAP', 'TAK'],
  fort: ['BAM !', 'DOSH !', 'GOM !'],
  corps: ['DOM !', 'ZUN !'],
  enorme: ['ZUDOOOM !!', 'DOGOOON !!'],
  bloque: ['TAK', 'PAN'],
  esquive: ['FUN !', 'SHU !'],
};
