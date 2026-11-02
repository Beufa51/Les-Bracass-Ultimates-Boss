// Réglages du boss Rémi (la soirée au bar). Tous les chiffres d'équilibrage sont ici : on peut les modifier sans risque.
// 3 jeux à la suite : 1) LE VÉLO (aller au bar, vue de profil)  2) LE BEER PONG contre Rémi  3) LA PORTE (qui tape le plus fort).
// Temps en secondes ; vélo : distances en pixels du jeu ; beer pong : distances en mètres (table, verres).
export const IDENTITE = { id: 'remi', nom: 'Rémi' };

// Niveaux de difficulté (choisis avant le vélo, gardés pour les 3 jeux)
//  VÉLO : temps = secondes avant la fermeture du bar ; densite = obstacles (x) ; traverse = vitesse des bourrés qui traversent (x)
//         sonnette = portée (px) de la sonnette (les bourrés debout ou qui traversent s'écartent / s'arrêtent)
//  PONG : erreur = imprécision de TES lancers (m) ; apercu = part de la courbe d'aide montrée (1 = toute + point d'arrivée ;
//         0,65 = jusqu'un peu après le sommet ; l'alcool en efface encore : voir PONG.courbeBue) ;
//         distrait = chance que Rémi agite les bras pendant ta visée (ça fait trembler ton lancer) ;
//         remi = chance que Rémi mette un verre ; aide = (non utilisé au pong depuis le lance-pierre)
//  PORTE : remiCharge = jusqu'où Rémi charge (0 à 1) ; remiPrudent = chance qu'il lâche quand le videur arrive ;
//          videur = temps d'annonce du videur (x, + petit = moins prévenu) ; feintes = part de passages piégés
//          (fausse alerte, surgit sans prévenir, revient aussitôt) ; zone = rayon de la cible parfaite ; visee = vitesse de la cible
export const DIFFICULTES = {
  facile: { nom: 'FACILE', couleur: '#7fff7f', texte: 'Le bar ferme tard, Rémi a déjà bu, et on te montre où tombe la balle.',
    temps: 88, densite: 0.8, traverse: 0.8, sonnette: 730,
    erreur: 0.025, apercu: 1, distrait: 0, remi: 0.32, aide: true,
    remiCharge: 0.6, remiPrudent: 0.3, videur: 1.3, feintes: 0.25, zone: 0.22, visee: 0.8 },
  normal: { nom: 'NORMAL', couleur: '#ffd84a', texte: 'La vraie soirée : un trajet serré et un Rémi en forme.',
    temps: 70, densite: 1, traverse: 1, sonnette: 650,
    erreur: 0.035, apercu: 0.85, distrait: 0.35, remi: 0.42, aide: false,
    remiCharge: 0.75, remiPrudent: 0.35, videur: 1, feintes: 0.45, zone: 0.15, visee: 1 },
  champion: { nom: 'CHAMPION', couleur: '#ff5a6e', texte: 'Fermeture imminente, rues bondées, Rémi ne rate presque rien.',
    temps: 58, densite: 1.2, traverse: 1.25, sonnette: 570,
    erreur: 0.05, apercu: 0.6, distrait: 0.55, remi: 0.52, aide: false,
    remiCharge: 0.84, remiPrudent: 0.85, videur: 0.75, feintes: 0.65, zone: 0.1, visee: 1.3 },
};

export const VELO = {
  // V6 : tout est 1,3 fois plus GRAND qu'en V5 (vélo, bourrés, sauts, vitesses), la durée du trajet ne change pas
  longueur: 30000,        // longueur du trajet jusqu'au bar (px) — V10 : rallongé (environ 1 min en NORMAL)
  vitesseDepart: 390,     // le vélo roule TOUT SEUL ; il accélère doucement jusqu'au bar (px/s)
  vitesseFin: 560,
  saut: 624,              // vitesse de départ du saut (px/s)
  sautTenu: 0.28,         // saut maintenu jusqu'à ce temps (s) = saut plus haut et plus long
  graviteTenue: 780,      // gravité tant que le saut est maintenu (au début du saut)
  gravite: 2080,          // px/s²
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

export const PONG = {
  verres: 6,              // verres par joueur (6 = pyramide 3-2-1 ; 10 = 4-3-2-1)
  table: { largeur: 1.2, longueur: 1.8 },   // table raccourcie (caméra proche : les verres de Rémi bien visibles)
  rayon: 0.085,           // rayon d'un verre (m)
  dedans: 0.7,            // la balle tombe à moins de rayon x ce chiffre du centre : DEDANS
  rebord: 1.2,            // entre « dedans » et rayon x ce chiffre : sur le REBORD (une chance sur deux)
  dureeVol: 0.65,         // durée du vol de la balle (s)
  tirage: 150,            // lance-pierre : longueur de tirage (px) pour la force maximale
  serieFeu: 3,            // verres de suite pour être EN FEU (trajectoire entière montrée, lancer plus précis)
  ivresse: 0.02,          // chaque verre BU fait tanguer ta visée de ce nombre de mètres en plus
  aimant: 0.6,            // À JEUN la balle est attirée vers le verre visé (part du chemin) ; -0,12 par verre bu
  courbeBue: 0.13,        // chaque verre bu efface cette part de la fin de la courbe d'aide (la retombée disparaît d'abord)
  hoquet: 2,              // à partir de ce nombre de verres bus : HOQUETS (secousse soudaine de la visée)
};

export const PORTE = {
  // V11 : « LA PORTE ET LE VIDEUR ». Chacun son tour : MAINTENIR pour charger, LÂCHER pour frapper. Le videur fait sa ronde :
  // s'il regarde pendant que tu charges (ou juste au moment du coup) : ATTRAPÉ (coup perdu, la porte est rafistolée).
  solidite: 7500,         // SOLIDITÉ de la porte : chaque coup en enlève ses dégâts ; celui qui la fait céder GAGNE
  charge: 0.35,           // vitesse de charge au départ (puissance par seconde) ; elle accélère en chargeant
  accel: 1.3,             // accélération de la charge
  degatsMin: 0.25,        // part des dégâts même avec une charge nulle
  scotch: 300,            // solidité rendue à la porte quand quelqu'un se fait attraper (le barman la rafistole)
  periodeVisee: 1.1,      // vitesse de la cible sur la porte
  casse: 850,             // un coup à ce score ou plus : gros craquement, éclats, flash
  // le videur : attente avant de revenir (s), annonce (ses pas, son ombre : s), regard (s)
  videurAttente: [1.4, 3.6], videurAnnonce: 1.1, videurRegard: [1.0, 1.5],
};

// Répliques de Rémi (provisoires : à personnaliser à la passe de FINITION)
export const REPLIQUES = {
  textos: ['Rémi : t\'es où ??', 'Rémi : je t\'ai commandé une pinte', 'Rémi : ça ferme bientôt hein',
    'Rémi : la pinte se réchauffe...', 'Rémi : magne-toi !!', 'Rémi : le barman me regarde mal'],
  arrivee: 'Enfin ! Allez, une partie de beer pong. Le perdant paie sa tournée.',
  pongToucheRemi: ['Bois, bois, bois !', 'Trop facile.', 'Tu tiens déjà plus debout ?', 'Et un de plus !'],
  pongRateRemi: ['Elle était faite exprès.', 'Le rebord, c\'est de la triche.', 'Je m\'échauffe.'],
  pongToucheToi: ['Coup de bol.', 'Ok... ok.', 'Il me reste de la place.'],
  pongGagne: 'Bon... t\'as gagné. Mais qui tape le plus fort dans la porte, hein ?',
  pongPerdu: 'Rémi : « Tournée pour toi ! Reviens quand tu sais viser. »',
  porteIntro: 'Rémi parie que tu ne défonceras pas la porte des WC avant lui. Mais le videur fait sa ronde...',
  porteAttrape: ['HÉ ! Toi là ! On se calme !', 'Encore un coup et c\'est dehors !', 'Je t\'ai vu !'],
  porteAttrapePisseur: ['Oh ! Vous faites quoi là ?! ... hips', 'Je vais le dire au videur... après avoir fait pipi.', 'Ça va les gars ? Vous bloquez les WC !'],
  porteAttrapeMamie: ['Jeune homme ! Ça ne va pas, non ?!', 'De mon temps, on frappait AVANT d\'entrer !', 'Je préviens le patron !'],
  porteRemiFrappe: ['Prends ça !', 'Regarde et apprends.', 'Celle-là elle a fait mal à la porte.'],
  porteGagne: 'Rémi : « OK... t\'es le patron de la soirée. La prochaine tournée est pour moi ! »',
  portePerdu: 'Rémi : « Faut manger de la soupe, mon grand. »',
};
