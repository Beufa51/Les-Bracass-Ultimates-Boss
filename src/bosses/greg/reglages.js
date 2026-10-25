// Réglages du boss Greg (combat de boxe façon Hajime no Ippo).
// Tous les chiffres d'équilibrage sont ici : on peut les modifier sans risque.
// Les temps sont en secondes, les dégâts en points de vie (sur 100).
export const IDENTITE = { id: 'greg', nom: 'Greg' };

export const REGLAGES = {
  // ---------- Match ----------
  nbRounds: 3,
  dureeRound: 60,              // secondes par round
  soinEntreRounds: 30,         // vie rendue au joueur dans le coin
  soinGregEntreRounds: 15,     // vie rendue à Greg dans le coin

  // ---------- Écran (vue Punch-Out : on voit ton boxeur de dos) ----------
  centreX: 480,                // milieu du ring
  piedsGreg: 440,              // bas du dessin de Greg
  piedsJoueur: 575,            // bas du dessin du joueur (coupé par le bas de l'écran)
  decalageEsquive: 120,        // de combien ton boxeur part sur le côté en esquivant
  tailleGreg: 0.9,             // 1 = taille du dessin
  // Greg en illustrations : chaque image est placée pour que sa TÊTE tombe en (teteX, teteY).
  //   origine = position de la tête dans l'image (0 à 1), taille = grossissement à l'écran
  illustre: {
    //   cote = côté de l'écran d'où part le gant sur l'image (elle est retournée pour l'autre côté)
    teteX: 480, teteY: 122, yAuSol: 345,
    poses: {
      basse:  { cle: 'greg_combat',      origine: [0.467, 0.134], taille: 0.74 },
      haute:  { cle: 'greg_garde_haute', origine: [0.584, 0.18],  taille: 0.69 },
      corps:  { cle: 'greg_coup_corps',  origine: [0.3, 0.154],   taille: 0.61, cote: 'd' },
      visage: { cle: 'greg_coup_visage', origine: [0.633, 0.19],  taille: 0.54, cote: 'g' },
      ko:     { cle: 'greg_ko',          origine: [0.5, 0.5],     taille: 0.72 },
    },
    debutElan: 0.2,    // à partir de ce moment de la préparation, on voit le coup partir
  },
  tailleJoueur: 0.85,

  // ---------- Joueur ----------
  souffleRecup: 22,            // souffle regagné par seconde quand on ne frappe pas
  coups: {
    //          moment de l'impact, durée totale, dégâts, souffle dépensé, cible
    visage: { impact: 0.10, duree: 0.30, degats: 3, souffle: 8,  cible: 'tete' },
    corps:  { impact: 0.14, duree: 0.36, degats: 3, souffle: 11, cible: 'corps', souffleGreg: 15 },
  },
  esquiveDuree: 0.38,          // durée de l'esquive (Gauche ou Droite)
  esquiveProtege: 0.32,        // pendant ce temps, les coups au visage passent à côté
  esquivePause: 0.2,           // délai avant de pouvoir ré-esquiver
  esquiveSouffle: 8,
  garde: 0.15,                 // part des dégâts reçus en garde (0.15 = 15 %)
  gardeSouffle: 10,            // souffle perdu par coup bloqué
  toucheDuree: 0.38,           // temps sonné après un coup reçu
  contreFenetre: 0.8,          // après une esquive réussie, temps pour placer un contre
  contreMultiplicateur: 2,     // dégâts du contre

  // ---------- Esprit combatif (jauge du Dempsey Roll) ----------
  esprit: { coupPorte: 3, esquive: 10, contre: 15, releve: 25 },
  // Dempsey Roll = jeu de rythme : une boule parcourt un "∞" (le balancement du buste).
  // Appuie sur ◀ quand elle arrive à gauche, ▶ quand elle arrive à droite.
  // Chaque coup réussi accélère le rythme et frappe plus fort.
  dempsey: {
    coupsMax: 10,              // le 10e coup est le coup final
    periodeDepart: 1.7,        // secondes pour un tour complet du "∞" au début
    acceleration: 0.95,        // chaque coup réussi : le tour dure 5 % de moins
    periodeMin: 0.8,
    parfait: 0.45,             // tolérance (en "angle") pour un PARFAIT
    bien: 1.15,                // ... et pour un BIEN (au-delà : raté)
    erreursPermises: 2,        // ratés pardonnés ; le suivant arrête le roll
    attenteMax: 6,             // secondes pour donner le 1er coup (▶) avant que le roll s'annule
    degatsParfait: 5,
    degatsBien: 3,
    bonusCombo: 0.1,           // +10 % de dégâts par coup déjà enchaîné
    degatsFinal: 14,
    contreEntre: [3, 6],       // round 3 : Greg tente un contre entre ces coups-là
    degatsContre: 25,
  },

  // ---------- Au tapis ----------
  secondeCompte: 0.9,          // durée d'un chiffre du compte de l'arbitre
  appuisPourSeRelever: [12, 18, 26],   // 1er, 2e, 3e passage au tapis
  vieApresRelevee: [55, 40, 30],
  knockdownsMax: 3,            // au 3e tapis... c'est fini (pour toi comme pour Greg)
  vieGregApresRelevee: [80, 60],
  compteGregRelevee: [6, 8],   // Greg se relève à ce chiffre

  // ---------- Greg ----------
  souffleGregRecup: 7,
  souffleGregApresEssoufflement: 60,
  dureeEssoufflement: 2.0,     // Greg à bout de souffle = grande ouverture
  dureeTouche: 0.25,
  comboMax: 3,                 // après 3 coups encaissés d'affilée, Greg se couvre...
  dureeCouverture: 0.8,        // ...pendant ce temps (il bloque tout sauf les contres), puis riposte
  // Temps de réflexion entre deux attaques (min, max), par round
  pauseAttaque: [[1.0, 1.8], [0.8, 1.5], [0.6, 1.2]],
  // Greg change de garde (haute / basse) toutes les X secondes (min, max)
  changementGarde: [2.0, 4.0],
  // Chaque fois que Greg se relève, il prépare ses coups plus vite
  fureur: 0.85,
};

// Attaques de Greg.
//  cible 'tete'  : esquive du côté OPPOSÉ au coup (coup de gauche => ▶) ou garde (Bas)
//  cible 'corps' : garde (Bas) seulement
//  cible 'smash' : esquive (Gauche/Droite) ! La garde ne protège qu'à moitié.
export const ATTAQUES = {
  jab:     { nom: 'Jab',          cible: 'tete',  prepa: 0.6,  degats: 6,  recup: 0.4, souffle: 4 },
  crochet: { nom: 'Crochet',      cible: 'tete',  prepa: 0.85, degats: 12, recup: 0.7, souffle: 8 },
  corps:   { nom: 'Coup au foie', cible: 'corps', prepa: 0.75, degats: 10, recup: 0.6, souffle: 8, souffleJoueur: 25 },
  rafale:  { nom: 'Flicker',      cible: 'tete',  prepa: 0.6,  degats: 4,  recup: 0.8, souffle: 12, coups: 3, entre: 0.4 },
  smash:   { nom: 'SMASH',        cible: 'smash', prepa: 1.1,  degats: 28, recup: 1.2, souffle: 20, gardeCassee: 0.5 },
};

// Attaques possibles selon le round (plusieurs fois le même nom = plus fréquent)
export const ATTAQUES_PAR_ROUND = [
  ['jab', 'jab', 'crochet', 'corps'],
  ['jab', 'crochet', 'corps', 'rafale', 'rafale'],
  ['jab', 'crochet', 'corps', 'rafale', 'smash', 'smash'],
];

// Ce que dit le vieux coach dans le coin, entre les rounds
export const CONSEILS = [
  [
    'Regarde ses gants, petit !',
    'Garde HAUTE : tape au CORPS.',
    'Garde BASSE : tape au VISAGE.',
    'Son coup au foie (« ! » bleu) : seule la GARDE marche.',
  ],
  [
    'Son coup part de GAUCHE ? Esquive à DROITE (et inversement) !',
    '...et tu CONTRES tout de suite derrière : dégâts x2 !',
    'Jauge d\'esprit pleine ? DEMPSEY ROLL : frappe ◀ ▶ au rythme de la boule !',
  ],
  [
    'Attention à son SMASH (le gros "!!" rouge) :',
    'ESQUIVE sur le côté ! La garde ne suffit pas.',
    'Dempsey Roll : s\'il contre (boule ROUGE), GARDE (▼) pour freiner net !',
  ],
];

// Petites phrases (style manga)
export const REPLIQUES = {
  gregDebut: ['Prépare-toi à manger le tapis !', 'Mon Smash va t\'envoyer au vestiaire !'],
  gregReleve: ['C\'est tout ce que t\'as ?!', 'Ça chatouille...', 'Maintenant, je suis ÉNERVÉ !'],
  joueurSol: ['Mes jambes... ne répondent plus...', 'Je... ne peux pas... perdre ici !', 'Tout le monde compte sur moi !'],
  coach: 'Relève-toi, petit !!',
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
