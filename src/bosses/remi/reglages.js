// Réglages du boss Rémi (la soirée au bar). Tous les chiffres d'équilibrage sont ici : on peut les modifier sans risque.
// 3 jeux à la suite : 1) LE VÉLO (aller au bar, vue de profil)  2) LE BABYFOOT contre Rémi  3) LA PORTE (qui tape le plus fort).
// Temps en secondes ; vélo : distances en pixels du jeu ; babyfoot : distances en mètres.
export const IDENTITE = { id: 'remi', nom: 'Rémi' };

// Niveaux de difficulté (choisis avant le vélo, gardés pour les 3 jeux)
//  VÉLO : temps = secondes avant la fermeture du bar ; densite = obstacles (x) ; traverse = vitesse des bourrés qui traversent (x)
//         sonnette = portée (px) de la sonnette (les bourrés debout ou qui traversent s'écartent / s'arrêtent)
//  BABY : babyVitesse = vitesse de ses tirs (m/s) ; babyLecture = durée de sa préparation (x) ; babyFeinte / babyBande /
//         babyRoulette / babyRate = chances (feinte, tir en bande, roulette, tir à côté) ; babyFenetre = durée du bonus TIR ÉCLAIR après un arrêt (s ; viser n'a pas de limite) ;
//         babyReflexe = retard de son gardien (s) ; babyGardienRemi = vitesse de son gardien ; babyDefense = vitesse à laquelle sa défense suit ta visée (m/s) ; babyGuide = la flèche jaune montre où tourner la visée ; babyAide = ton gardien est
//         attiré vers la balle quand elle arrive (0 = pas d'aide, 1 = il va tout seul au bon endroit)
//  PORTE : remiCharge = jusqu'où Rémi charge (0 à 1) ; remiPrudent = chance qu'il lâche quand le videur arrive ;
//          videur = temps d'annonce du videur (x, + petit = moins prévenu) ; feintes = part de passages piégés
//          (fausse alerte, surgit sans prévenir, revient aussitôt) ; zone = rayon de la cible parfaite ; visee = vitesse de la cible
// V17 : 4 niveaux comme Kédric (ENTRAÎNEMENT, FACILE, NORMAL, CHAMPION), avec des noms de boissons
// (les clés restent entrainement / facile / normal / champion : records et réglages développeur)
export const DIFFICULTES = {
  entrainement: { nom: 'DIABOLO', couleur: '#9fe0ff', texte: 'Pour apprendre : large, lent, Rémi est déjà pompette et le videur ne feinte jamais.',
    temps: 110, densite: 0.65, traverse: 0.7, sonnette: 800,
    babyVitesse: 0.63, babyLecture: 1.3, babyFeinte: 0, babyBande: 0, babyRoulette: 0.08, babyRate: 0.2, babyFenetre: 1.1, babyReflexe: 0.4, babyGardienRemi: 0.231, babyDefense: 0.16, babyGuide: true, babyAide: 0.5,
    remiCharge: 0.45, remiPrudent: 0.2, videur: 1.6, feintes: 0, zone: 0.28, visee: 0.65 },
  facile: { nom: 'PANACHÉ', couleur: '#7fff7f', texte: 'Le bar ferme tard, Rémi a déjà bu, et ton gardien est un peu aidé.',
    temps: 88, densite: 0.8, traverse: 0.8, sonnette: 730,
    babyVitesse: 0.79, babyLecture: 1.15, babyFeinte: 0.2, babyBande: 0.1, babyRoulette: 0.12, babyRate: 0.12, babyFenetre: 0.92, babyReflexe: 0.32, babyGardienRemi: 0.289, babyDefense: 0.24, babyGuide: true, babyAide: 0.3,
    remiCharge: 0.55, remiPrudent: 0.3, videur: 1.3, feintes: 0.25, zone: 0.22, visee: 0.8 },
  normal: { nom: 'PRESSION', couleur: '#ffd84a', texte: 'La vraie soirée : un trajet serré et un Rémi en forme.',
    temps: 70, densite: 1, traverse: 1, sonnette: 650,
    babyVitesse: 1.0, babyLecture: 1, babyFeinte: 0.35, babyBande: 0.2, babyRoulette: 0.15, babyRate: 0.07, babyFenetre: 0.74, babyReflexe: 0.24, babyGardienRemi: 0.347, babyDefense: 0.33, babyGuide: false, babyAide: 0.1,
    remiCharge: 0.68, remiPrudent: 0.35, videur: 1, feintes: 0.45, zone: 0.15, visee: 1 },
  champion: { nom: 'CUL SEC', couleur: '#ff5a6e', texte: 'Fermeture imminente, rues bondées, Rémi ne rate presque rien.',
    temps: 58, densite: 1.2, traverse: 1.25, sonnette: 570,
    babyVitesse: 1.21, babyLecture: 0.85, babyFeinte: 0.5, babyBande: 0.3, babyRoulette: 0.2, babyRate: 0.04, babyFenetre: 0.55, babyReflexe: 0.2, babyGardienRemi: 0.29, babyDefense: 0.38, babyGuide: false, babyAide: 0,
    remiCharge: 0.84, remiPrudent: 0.85, videur: 0.75, feintes: 0.65, zone: 0.1, visee: 1.3 },
};

// V17 : POINTS de la soirée (affichés à la fin) et RANGS S / A / B / C (seulement pour la soirée complète)
export const POINTS = {
  veloSeconde: 10,        // vélo : par seconde d'avance à l'arrivée (+ le score du vélo : obstacles, série, pintes, saltos)
  veloChute: 50,          // vélo : par chute
  babyEcart: 80,          // babyfoot : par but d'écart à la fin
  babyArret: 10,          // babyfoot : par arrêt
  babyGamelle: 40,        // babyfoot : par gamelle mise
  porteGagne: 300,        // porte : pour avoir gagné (plus de dégâts que Rémi)
  porteParfait: 60,       // porte : par COUP PARFAIT
  porteAttrape: 60,       // porte : par fois où tu t'es fait attraper
  porteEcart: 0.2,        // porte : points par point de dégâts d'avance sur Rémi
};
export const RANGS = [
  { rang: 'S', nom: 'ROI DU COMPTOIR', seuil: 1700 },
  { rang: 'A', nom: 'PILIER DE BAR', seuil: 1300 },
  { rang: 'B', nom: 'HABITUÉ DU ZINC', seuil: 900 },
  { rang: 'C', nom: 'BUVEUR DE DIABOLO', seuil: -Infinity },
];

export const VELO = {
  // V6 : tout est 1,3 fois plus GRAND qu'en V5 (vélo, bourrés, sauts, vitesses), la durée du trajet ne change pas
  longueur: 30000,        // longueur du trajet jusqu'au bar (px) — V10 : rallongé (environ 1 min en NORMAL)
  vitesseDepart: 390,     // le vélo roule TOUT SEUL ; il accélère doucement jusqu'au bar (px/s)
  vitesseFin: 560,
  saut: 624,              // vitesse de départ du saut (px/s)
  sautTenu: 0.28,         // saut maintenu jusqu'à ce temps (s) = saut plus haut et plus long
  graviteTenue: 780,      // gravité tant que le saut est maintenu (au début du saut)
  gravite: 2080,          // px/s²
  esquive: 0.9,           // V17 : ESQUIVE vers le bas (bourré allongé) : durée d'un appui (s), plus longue si on garde appuyé
  esquiveBas: 58,         // de combien le vélo descend vers le bas de l'écran (px)
  tampon: 0.15,           // saut demandé un peu AVANT d'atterrir : il part quand même (s)
  sonnette: 0.6,          // recharge de la sonnette (s)
  chute: 1.2,             // secondes au sol après une chute
  invincible: 1.2,        // après une chute, le vélo clignote et ne peut pas retomber (s)
  ralenti: 1.5,           // verre cassé (crevaison) ou flaque non sautés : vitesse x 0,55 pendant ce temps (s)
  ecart: [1.1, 1.9],       // temps entre deux obstacles (s, à la vitesse du moment), divisé par la densité
  types: { allonge: 3, verre: 2, debout: 3, traverse: 2, vomi: 2 },
  pintes: 0.45,           // chance d'une PINTE à attraper en sautant entre deux obstacles
  bonusPinte: 1,          // secondes gagnées par pinte
  serie: 5,               // tous les 5 obstacles passés proprement à la suite : +2 s
  // TREMPLINS + VOITURES GARÉES : tous les « voitures » obstacles, un tremplin suivi de 2 voitures (on roule sur le toit,
  // pintes au-dessus). Rentrer dans une voiture par le côté = chute.
  voitures: 5,            // une séquence tremplin + voitures tous les 5 obstacles environ
  tremplin: 760,          // élan vers le haut en quittant le tremplin (px/s)
  hauteurVoiture: 130,    // hauteur du toit (px)
  longueurVoiture: 330,
};

// BABYFOOT (prototype) : mètres et secondes. Vue depuis ton but (z = 0), celui de Rémi à z = longueur.
export const BABY = {
  buts: 5,                // premier à ce nombre de buts
  largeur: 0.68, longueur: 1.0, balle: 0.02, but: 0.24,
  course: 0.13,           // débattement de ton gardien (m de chaque côté)
  // V19p : chiffres sortis du code
  balleTenue: 0.03,       // la balle tenue est un peu à côté de ton gardien (visible derrière lui) (m)
  priseDefense: 0.85,     // ses défenseurs arrêtent la balle à moins de B.prise x ce chiffre
  margeDefense: 0.01,     // marge du VERT autour de ses défenseurs (m : ils bougent encore un peu)
  margeGardien: 0.12,     // marge du VERT sur le temps de son gardien (s)
  pinteReflexe: 0.04,     // chaque pinte de Rémi : son gardien réagit ce temps plus tard (s)...
  pinteTir: 0.04,         // ... et ses tirs perdent cette part de vitesse
  priseToi: 0.06,         // V19h : TON gardien arrête la balle à moins de ça de son centre (plus large que ceux de Rémi)
  largeurGardien: 0.07,   // ... et il est dessiné de cette largeur (m)
  balancier: 1.6,         // V19j : pendant que tu vises, son gardien se balance devant son but (vitesse du balancement)
  leveEcrase: 0.3,        // V19j : barre levée : la figurine (pieds vers Rémi) vue écrasée à cette part de sa hauteur
  hauteurFigurine: 0.15,  // V19i : hauteur d'une figurine (image) du socle à la tête (m)
  tailleGardien: 1.15,    // ... ton gardien, un peu plus grand (il est plus large aussi)
  transparenceGardien: 0.62, // ... à moitié transparent : on voit la balle et ses joueurs derrière lui
  prise: 0.045,           // la balle est arrêtée à moins de ça du centre d'un joueur
  vitesseBoutons: 1.1,    // V19d BOUTONS ◀ ▶ : vitesse du gardien quand on maintient (m/s ; tout le but en ~0,25 s)
  depart: 0.45,           // ... il part à cette part de la vitesse...
  montee: 0.25,           // ... et atteint la pleine vitesse en ce temps (s) : petites touches = petits pas précis
  vitesseGardien: 2.2,    // vitesse max de ton gardien (m/s) (V19c : 1,2 → 2,2 : il colle mieux au doigt)
  prep: [0.9, 1.4],       // durée de la préparation de Rémi (s), x babyLecture de la difficulté
  feinteBascule: 0.65,    // feinte : il change de côté à cette part de la préparation
  rouletteVitesse: 1.35,  // une roulette part plus vite
  eclairVitesse: 1.35,    // V19g TIR ÉCLAIR (tiré pendant babyFenetre) : balle x ce chiffre...
  eclairReflexe: 0.08,    // ... et son gardien réagit ce temps plus tard (s)
  riposteVitesse: 2.2,    // ta riposte (m/s)
  priseGardienRemi: 0.75, // son gardien arrête la balle à moins de B.prise x ce chiffre (ses joueurs : x 0,85)
  viseeMax: 0.85,         // V19k BILLARD : angle max de la visée (rad) (V19o : 0,55 → 0,85 : les tirs en BANDE peuvent enfin entrer)
  vitesseVisee: 0.45,     // vitesse à laquelle ◀ ▶ tournent la visée (rad/s, avec le même départ doux que le gardien)
  biais: 0.12,            // angle max de la riposte en glissant en biais (rad)
  vitesseBarresRemi: 0.4, // ses barres d'attaque et de défense se replacent devant ta balle à cette vitesse (m/s)
  retardRemi: 6,          // vitesse à laquelle Rémi « voit » où vise ta balle (plus petit = il réagit plus en retard)
  gamelleBord: 0.6,       // un but à plus de cette part du demi-but depuis le centre peut faire GAMELLE...
  gamelle: 0.35,          // ... avec cette chance
  appelDuree: 1.6,        // temps pour crier « ROULETTE ! » après son but (s)
  // V19n : chaque but que TU marques (une pinte pour Rémi) ralentit sa défense et son gardien de cette part (mini 50 %)
  defBue: 0.12, garBue: 0.1,
  ralenti: 0.25, ralentiDuree: 0.45, arretFige: 0.12, // RALENTI quand tu marques (vitesse du jeu, durée en s) ; arretFige : petit ralenti à TON arrêt
  // V19m EFFET BOURRÉ (chaque but encaissé = une pinte ; les effets plafonnent à ivresseMax pintes)
  ivresseMax: 5,
  titubeVisee: 0.035,     // ta visée ondule de ± ce nombre de rad par pinte
  vueBue: 0.11, vueMini: 0.4, // la ligne de visée raccourcit de 11 % par pinte (jamais moins de 40 % du trajet)
  ivresseRond: 3,         // à partir de ce nombre de pintes, plus de rond d'arrivée
  hoquetGardien: 0.05, hoquetVisee: 0.15, // un HOQUET (dès 2 pintes) fait sauter ton gardien (m) et ta visée (rad)
  vignetteBue: 0.09, vignetteMax: 0.55,   // bords de l'écran qui s'assombrissent par pinte
  trembleBu: 0.006,       // tremblement de ton gardien par but encaissé (m)
};

export const PORTE = {
  // V11 : « LA PORTE ET LE VIDEUR ». Chacun son tour : MAINTENIR pour charger, LÂCHER pour frapper. Le videur fait sa ronde :
  // s'il regarde pendant que tu charges (ou juste au moment du coup) : ATTRAPÉ (coup perdu, la porte est rafistolée).
  solidite: 5500,         // (V17 : 7500 → 5500, parties trop longues) SOLIDITÉ de la porte : chaque coup en enlève ses dégâts ; quand elle cède, le PLUS DE DÉGÂTS gagne
  charge: 0.35,           // vitesse de charge au départ (puissance par seconde) ; elle accélère en chargeant
  accel: 1.3,             // accélération de la charge
  degatsMin: 0.15,        // (V17 : 0,25 → 0,15 : un coup mou rapporte moins) part des dégâts même avec une charge nulle
  scotch: 300,            // solidité rendue à la porte quand quelqu'un se fait attraper (le barman la rafistole)
  periodeVisee: 1.1,      // vitesse de la cible sur la porte
  casse: 850,             // un coup à ce score ou plus : gros craquement, éclats, flash
  // le videur : attente avant de revenir (s), annonce (ses pas, son ombre : s), regard (s)
  videurAttente: [1.4, 3.6], videurAnnonce: 1.1, videurRegard: [1.0, 1.5],
  annonceMini: 0.85,      // V18 : une arrivée est TOUJOURS annoncée au moins ce temps (s), même ses feintes (temps de réagir)
};

// Répliques de Rémi (provisoires : à personnaliser à la passe de FINITION)
export const REPLIQUES = {
  textos: ['Rémi : t\'es où ??', 'Rémi : je t\'ai commandé une pinte', 'Rémi : ça ferme bientôt hein',
    'Rémi : la pinte se réchauffe...', 'Rémi : magne-toi !!', 'Rémi : le barman me regarde mal'],
  arrivee: 'Enfin ! Allez, une partie de babyfoot. Le perdant paie sa tournée.',
  babyIntro: 'Une pièce, une partie. Le perdant paie sa tournée.',
  babyArret: ['Coup de bol.', 'Il dort pas, lui.', 'Pff, gardien de handball.'],
  babyBut: ['Dans ta lucarne !', 'Bois, bois, bois !', 'Trop facile.', 'T\'as vu passer ?'],
  babyEncaisse: ['Ok... ok.', 'Le gardien glissait.', 'Je te laisse jouer, là.'],
  babyRouletteVue: ['Quoi ? J\'ai rien tourné !', 'Pfff... rabat-joie.', 'Elle a glissé, la barre.'],
  babyGagne: 'Bon... t\'as gagné. Mais qui tape le plus fort dans la porte, hein ?',
  babyPerdu: 'Rémi : « Tournée pour toi ! Reviens quand tu sais garder. »',
  porteIntro: 'Rémi parie que tu ne défonceras pas la porte des WC avant lui. Mais le videur fait sa ronde...',
  porteAttrape: ['HÉ ! Toi là ! On se calme !', 'Encore un coup et c\'est dehors !', 'Je t\'ai vu !'],
  porteAttrapePisseur: ['Oh ! Vous faites quoi là ?! ... hips', 'Je vais le dire au videur... après avoir fait pipi.', 'Ça va les gars ? Vous bloquez les WC !'],
  porteAttrapeMamie: ['Jeune homme ! Ça ne va pas, non ?!', 'De mon temps, on frappait AVANT d\'entrer !', 'Je préviens le patron !'],
  porteRemiFrappe: ['Prends ça !', 'Regarde et apprends.', 'Celle-là elle a fait mal à la porte.'],
  porteGagne: 'Rémi : « OK... t\'es le patron de la soirée. La prochaine tournée est pour moi ! »',
  portePerdu: 'Rémi : « Faut manger de la soupe, mon grand. »',
};
