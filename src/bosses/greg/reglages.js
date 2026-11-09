// Réglages du boss Greg (combat de boxe façon Hajime no Ippo).
// Tous les chiffres d'équilibrage sont ici : on peut les modifier sans risque.
// Les temps sont en secondes, les dégâts en points de vie (sur 100).
export const IDENTITE = { id: 'greg', nom: 'Greg' };

// Niveaux de difficulté (choisis avant le combat)
//  degatsGreg : x dégâts des coups de Greg ; vitesse : x durée de préparation de ses coups (plus petit = plus rapide)
//  esquive : durée pendant laquelle ton esquive protège ; aides : flèche + cible d'aide
//  degatsJoueur : x dégâts de TES coups (plus petit = Greg tient plus longtemps : on voit le round 3)
//  etourdi : remplace une partie du réglage commun `etourdi` (RUSH) ; protection = secondes après un RUSH sans pouvoir
//    être ré-étourdi (9 nov. 2026, Fabien : « je l'enchaîne trop quand il est étourdi »)
//  dempsey : x dégâts du Dempsey Roll (absent = 1) ; finishTapis : remplace dempsey.finishTapis (absent = réglage commun)
//  rangMax : meilleur rang possible dans ce mode ; sansRecord : ni record ni défis (mode découverte)
export const DIFFICULTES = {
  // V18 (audit global) : ENTRAÎNEMENT comme Kédric et Rémi, pour découvrir le combat sans pression
  entrainement: { nom: 'ENTRAÎNEMENT', couleur: '#9fe0ff', degatsGreg: 0.5, vitesse: 1.5, esquive: 0.65, aides: true, degatsJoueur: 0.65, rangMax: 'B', sansRecord: true,
    texte: 'Greg tape doucement et prévient longtemps. Pour apprendre les esquives et les contres.' },
  facile:   { nom: 'FACILE',   couleur: '#7fff7f', degatsGreg: 0.65, vitesse: 1.25, esquive: 0.55, aides: true, degatsJoueur: 0.65, rangMax: 'A',
    texte: 'Greg frappe moins fort et plus lentement. Idéal pour apprendre.' },
  normal:   { nom: 'NORMAL',   couleur: '#ffd84a', degatsGreg: 0.75, vitesse: 1,    esquive: 0.5,  aides: true, degatsJoueur: 0.55, dempsey: 0.7, finishTapis: 30, etourdi: { duree: 1.0, multiplicateur: 2, protection: 6 },   // dempsey / finishTapis : 9 nov. 2026 (Fabien : Dempsey « un peu trop puissant ») ; nov. 2026 (Fabien : « un peu trop facile ») : 0,6 / 0,6 avant
    texte: 'Le vrai combat.' },
  champion: { nom: 'CHAMPION', couleur: '#ff5a6e', degatsGreg: 0.9,  vitesse: 0.85, esquive: 0.42, aides: false, degatsJoueur: 0.5,
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
      // Greg v2 : toutes posées sur leurs pieds (solY), même taille ; origine x = la tête
      entier:     { cle: 'greg2_entier',      origine: [0.510, 1], taille: 0.78, pied: true },
      gardePied:  { cle: 'greg2_garde_haute', origine: [0.505, 1], taille: 0.78, pied: true },
      gardeBasse: { cle: 'greg2_garde_basse', origine: [0.483, 1], taille: 0.78, pied: true },
      nargue:     { cle: 'greg2_nargue',      origine: [0.418, 1], taille: 0.78, pied: true },   // langue tirée, bras ballants
      tapeGants:  { cle: 'greg2_tape_gants',  origine: [0.496, 1], taille: 0.78, pied: true },   // avant le SMASH
      jab:        { cle: 'greg2_jab',         origine: [0.625, 1], taille: 0.70, pied: true, cote: 'g' },   // DE FACE : gant vers toi
      crochet:    { cle: 'greg2_crochet',     origine: [0.320, 1], taille: 0.70, pied: true, cote: 'd' },   // DE FACE : gant en avant, à droite
      corpsPied:  { cle: 'greg2_corps',       origine: [0.732, 1], taille: 0.78, pied: true, cote: 'g' },   // DE FACE : accroupi, gant au ventre
      smash:      { cle: 'greg2_smash',       origine: [0.636, 1], taille: 0.78, pied: true },
      touche:     { cle: 'greg2_touche',      origine: [0.616, 1], taille: 0.78, pied: true },
      etourdi:    { cle: 'greg2_etourdi',     origine: [0.492, 1], taille: 0.78, pied: true },
      koDebout:   { cle: 'greg2_ko_debout',   origine: [0.492, 1], taille: 0.78, pied: true },   // yeux blancs, il bascule
      releve:     { cle: 'greg2_releve',      origine: [0.494, 1], taille: 0.78, pied: true },   // il se relève, amoché et furieux
      victoire:   { cle: 'greg2_victoire',    origine: [0.501, 1], taille: 0.78, pied: true },
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
      heros_touche: [0.499, 0.709], heros_sol: [0.485, 0.75],
      // nov. 2026 (outils/greg/preparer_heros.py : même taille de short que heros_garde)
      heros_esquive: [0.487, 0.450], heros_bloque: [0.494, 0.483], heros_dempsey: [0.492, 0.563], heros_victoire: [0.501, 0.759] },
    poses: {
      garde:     { cle: 'heros_garde' },
      bloque:    { cle: 'heros_bloque' },
      esquive:   { cle: 'heros_esquive', miroir: true },   // esquive vers la gauche (l'image penche à droite)
      esquive_d: { cle: 'heros_esquive' },                 // ... et vers la droite
      touche:    { cle: 'heros_touche' },
      sol:       { cle: 'heros_sol', dy: -10 },
      jab:       { cle: 'heros_coup', miroir: true },
      crochet:   { cle: 'heros_coup' },
      corps:     { cle: 'heros_coup', dy: 30, angle: 8 },
      corps_g:   { cle: 'heros_coup', miroir: true, dy: 30, angle: -8 },
      dempsey_g: { cle: 'heros_dempsey', miroir: true, echelle: 0.6, dy: -60 },
      dempsey_d: { cle: 'heros_dempsey', echelle: 0.6, dy: -60 },
      victoire:  { cle: 'heros_victoire' },
    },
  },
  transparenceJoueur: 0.75,

  // ---------- Joueur ----------
  gestesTactiles: true,        // téléphone : gestes (glisser / toucher, voir gestes.js) au lieu des boutons en combat
  souffleRecup: 22,            // souffle regagné par seconde quand on ne frappe pas
  coups: {
    //          moment de l'impact, durée totale, dégâts, souffle dépensé, cible
    // nov. 2026 (Fabien) : UN SEUL coup de poing (Espace ou Z) = « visage » ; il vide aussi un peu son souffle.
    // (« corps » n'est plus utilisé par le joueur, gardé pour revenir en arrière)
    visage: { impact: 0.10, duree: 0.30, degats: 3, souffle: 8,  cible: 'tete', vertige: 1.5, souffleGreg: 8 },   // (bot : 4 / 2 = combats 2x trop courts)
    corps:  { impact: 0.14, duree: 0.36, degats: 2, souffle: 11, cible: 'corps', souffleGreg: 15, vertige: 1 },
  },
  esquiveDuree: 0.5,           // durée de l'esquive (Gauche ou Droite)
    tropTot: 0.4,                // esquive finie moins de X s avant le coup => message "Trop tôt !"
  esquivePause: 0.2,           // délai avant de pouvoir ré-esquiver
  esquiveSouffle: 8,
  garde: 0.3,                  // part des dégâts reçus en garde (0.3 = 30 %)
  gardeSouffle: 14,            // souffle perdu par coup bloqué (audit nov. 2026 : 22 -> 14) (et pas de récupération tant qu'on garde)
  toucheDuree: 0.38,           // temps sonné après un coup reçu
  contreFenetre: 0.8,          // après une esquive réussie, temps pour placer un contre
  contreMultiplicateur: 3,     // dégâts du contre : c'est LA stratégie
  esquiveParfaite: 0.12,       // esquive lancée moins de X s avant l'impact = PARFAITE (flash bleu, + esprit)
  espritParfait: 5,
  serie: { bonus: 0.1, oubli: 1.2 },   // « X HITS » : +10 % par coup enchaîné ; la série s'arrête après 1,2 s sans toucher
  memoireAppui: 0.15,          // un appui fait pendant un coup / sonné est gardé en mémoire ce temps
  memoireEsquive: 0.25,        // ... un peu plus pour les esquives (elles ne doivent jamais « se perdre »)

  // ---------- Esprit combatif (jauge du Dempsey Roll) ----------
  // la jauge ne se remplit QU'avec les esquives réussies (environ 8 esquives pour un Dempsey)
  esprit: { coupPorte: 0, esquive: 13, contre: 0, releve: 0 },
  // Dempsey Roll = jeu de rythme : une boule parcourt un "∞" (le balancement du buste).
  // Appuie sur ◀ quand elle arrive à gauche, ▶ quand elle arrive à droite (un bip marque le bon moment).
  // Chaque coup réussi accélère le rythme et frappe plus fort.
  dempsey: {
    coupsMax: 10,              // le 10e coup est le coup final
    periodeDepart: 1.15,       // secondes pour un tour complet du "∞" au début (nov. 2026 : 1,6 -> 1,15, ça démarre fort)
    acceleration: 0.93,        // chaque coup réussi : le tour dure 7 % de moins
    periodeMin: 0.55,
    parfait: 0.4,              // tolérance (en "angle") pour un PARFAIT
    bien: 1.0,                 // ... et pour un BIEN (au-delà : raté)
    toleranceTactile: 1.3,     // au doigt (téléphone) : fenêtre BIEN x1,3 (le côté droit passait mal, nov. 2026)
    erreursPermises: 2,        // ratés pardonnés ; le suivant arrête le roll
    attenteMax: 6,             // secondes pour donner le 1er coup (▶) avant que le roll s'annule
    degatsParfait: 3,
    degatsBien: 2,
    bonusCombo: 0.05,          // +5 % de dégâts par coup déjà enchaîné
    degatsFinal: 12,
    finishTapis: 50,           // FINISH (10e coup) : s'il reste à Greg moins que ça, il part AU TAPIS direct
    clipUneFois: true,         // la vidéo de lancement seulement au 1er roll du combat (ensuite : lancement éclair)
    contreEntre: [3, 6],       // round 3 : Greg tente un contre entre ces coups-là
    degatsContre: 30,
  },

  // ---------- Au tapis ----------
  secondeCompte: 0.9,          // durée d'un chiffre du compte de l'arbitre
  appuisPourSeRelever: [10, 14],   // alternances ◀ ▶ à faire : 1er, 2e passage au tapis (le 3e = K.O.)
  vieApresRelevee: [55, 40],
  knockdownsMax: 3,            // au 3e tapis... c'est fini (pour toi comme pour Greg)
  vieGregApresRelevee: [100, 100],
  compteGregRelevee: [6, 8],   // Greg se relève à ce chiffre

  // ---------- Greg ----------
  souffleGregRecup: 7,
  souffleGregApresEssoufflement: 60,
  dureeEssoufflement: 1.4,     // Greg à bout de souffle = grande ouverture (nov. 2026 : 2 -> 1,4 s)
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
  etourdi: { protection: 0, parCoup: 15, parContre: 35, baisse: 16, duree: 1.3, multiplicateur: 3, coupRapide: 0.6 },   // RUSH : plus court, chaque coup x3, sans souffle, coups 40 % plus rapides   // baisse : 18 -> 16 (audit : il n'était jamais étourdi ; le visage étourdit 2x plus)
  compteVocal: false,          // compte de l'arbitre à voix haute (japonais) ; false = seulement à l'écran
  annonceur: false,            // voix de synthèse retirées : pas assez punchy — tout passe par l'écran et les sons

  // ---------- Moment secret : Greg baisse la garde un très court instant ----------
  // Une fois par round, à un moment au hasard (entre 'entre' secondes restantes). Pour réussir :
  // un COUP AU CORPS lancé APRÈS qu'il a baissé la garde (marteler avant ne marche pas), en moins de 'duree'.
  // 1re fois du combat = COUP SECRET (tapis direct) ; ensuite = dégâts x3. Mauvais coup = il esquive.
  nargue: { entre: [45, 15], duree: 0.7, coup: 'visage', multiplicateur: 3 },

  // ---------- Classement de fin (temps de K.O. + coups reçus + tapis) ----------
  // score de fin = 100 - dégâts reçus x parRecu (au plus recusMax) - tapis x parTapis - secondes après tempsLibre x parSeconde
  // nov. 2026 (Fabien : rang B sans être tombé) : avant 0,4 / 40 / 15 / 60 s / 0,15
  rangCalcul: { parRecu: 0.3, recusMax: 40, parTapis: 15, tempsLibre: 75, parSeconde: 0.15 },
  rangs: [ // du meilleur au moins bon : il faut un score >= au seuil
    { rang: 'S', nom: 'CEINTURE D\'OR', seuil: 90 }, { rang: 'A', nom: 'POIDS LOURD', seuil: 70 },
    { rang: 'B', nom: 'BOXEUR DU DIMANCHE', seuil: 45 }, { rang: 'C', nom: 'SAC DE FRAPPE', seuil: 0 },
  ],

  // ---------- Coups / garde : finitions ----------
  arretImpact: { coup: 0.06, contre: 0.12, recu: 0.15 },   // "hit-stop" : l'image se fige un instant
  gardeBriseeSonne: 0.8,       // garde avec souffle à 0 => garde brisée, sonné ce temps
  smashGardeSonne: 1.0,        // le SMASH bloqué brise toujours la garde
  // Greg pare même tes coups "libres" (zone ouverte, hors contre / essoufflement) : chance par round
  blocageLibre: [0.6, 0.7, 0.8],   // nov. 2026 : il pare plus les coups gratuits ; tes coups qui passent font plus mal   // (aussi juste après avoir encaissé un coup : il faut CONTRER)
  martelage: { coups: 3, fenetre: 1.5 },   // plus de 3 coups (hors contres) en 1,5 s : il pare tout (le spam ne paie plus)
  hesitation: { chance: 0.3, duree: [0.2, 0.4] },   // rounds 2-3 : parfois un petit temps d'arrêt avant le coup suivant
  maxSansAttaque: 2.5,         // garde-fou : jamais plus de 2,5 s sans attaquer (même si tu le martèles)
  pauseApresTouche: 0.4,       // après avoir encaissé, il ne reste pas bloqué : pause max avant d'attaquer
  // son d'annonce de chaque coup de Greg (au moment du « ! ») : son existant + hauteur (rate)
  annonces: {
    jab: { son: 'greg_alerte', rate: 1.25 },       // petit « bip » aigu
    rafale: { son: 'greg_alerte', rate: 1.6 },     // très aigu
    crochet: { son: 'greg_alerte', rate: 0.75 },   // plus grave
    corps: { son: 'greg_bloque', rate: 0.55 },     // « tok » sourd
    smash: { son: 'greg_coup_fort', rate: 0.6 },   // gros « boum » (en plus du TAP ! TAP !)
    feinte: { son: 'greg_alerte', rate: 1.25 },    // comme un jab : c'est une feinte !
  },
  riposte: { prepa: 0.6 },   // (audit : 0,5 -> 0,6, trop rapide pour un enfant)     // après "Il se couvre", il riposte tout de suite par un jab rapide
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

// ENCHAÎNEMENTS de Greg, par round. Round 1 : dans l'ordre, en boucle (on les apprend). Rounds 2-3 (et énervé) :
// au hasard, sans jouer deux fois de suite le même ; le SMASH du round 2 ne sort qu'une fois. Chaque coup : 'attaque' + côté ('g' / 'd') ; le SMASH part du centre.
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
    ['smash'],                       // une seule fois au round 2 (son arme signature, vue par tout le monde)
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

// Avant le round 1 : UN seul conseil, en gros (avis jouabilité nov. 2026)
export const CONSEIL_ROUND1 = 'Esquive du côté OPPOSÉ au coup... puis frappe tout de suite : CONTRE ! (dégâts x3)';

// Ce que dit le vieux coach dans le coin, entre les rounds
export const CONSEILS = [
  [
    'Son coup au foie (« ! » violet au milieu) : seule la GARDE (▼) marche.',
    'Quand il baisse les bras pour te narguer (« hé... ») : FRAPPE tout de suite !',
  ],
  [
    'Coup de GAUCHE ? Esquive à DROITE (et inversement) !',
    'Et juste après une esquive, CONTRE : dégâts x3 !',
    'Chaque esquive réussie remplit ta jauge. Pleine ? DEMPSEY ROLL !',
    'Il mélange ses enchaînements maintenant : reste concentré !',
    'Quand il tape ses gants, c\'est le SMASH : ESQUIVE sur le côté !',
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
