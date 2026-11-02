// Réglages du boss Rémi (la soirée au bar). Tous les chiffres d'équilibrage sont ici : on peut les modifier sans risque.
// 3 jeux à la suite : 1) LE VÉLO (aller au bar, vue de profil)  2) LE BEER PONG contre Rémi  3) LA PORTE (qui tape le plus fort).
// Temps en secondes ; vélo : distances en pixels du jeu ; beer pong : distances en mètres (table, verres).
export const IDENTITE = { id: 'remi', nom: 'Rémi' };

// Niveaux de difficulté (choisis avant le vélo, gardés pour les 3 jeux)
//  VÉLO : temps = secondes avant la fermeture du bar ; densite = obstacles (x) ; traverse = vitesse des bourrés qui traversent (x)
//         sonnette = distance max (px) où la sonnette fait s'écarter un bourré debout
//  PONG : erreur = imprécision de TES lancers (m) ; zoneForce = largeur de la zone VERTE de la jauge de force (0 à 1) ;
//         remi = chance que Rémi mette un verre ; aide = point d'arrivée affiché sur la table pendant la jauge
//         (la vitesse du curseur de force = « visee », comme à la porte)
//  PORTE : remiMin / remiMax = scores de Rémi ; zone = largeur de la zone parfaite de la visée (0 à 1) ; visee = vitesse du curseur (x)
export const DIFFICULTES = {
  facile: { nom: 'FACILE', couleur: '#7fff7f', texte: 'Le bar ferme tard, Rémi a déjà bu, et on te montre où tombe la balle.',
    temps: 78, densite: 0.75, traverse: 0.8, sonnette: 560,
    erreur: 0.012, zoneForce: 0.3, remi: 0.28, aide: true,
    remiMin: 560, remiMax: 760, zone: 0.22, visee: 0.8 },
  normal: { nom: 'NORMAL', couleur: '#ffd84a', texte: 'La vraie soirée : un trajet serré et un Rémi en forme.',
    temps: 65, densite: 1, traverse: 1, sonnette: 500,
    erreur: 0.018, zoneForce: 0.2, remi: 0.38, aide: false,
    remiMin: 650, remiMax: 850, zone: 0.15, visee: 1 },
  champion: { nom: 'CHAMPION', couleur: '#ff5a6e', texte: 'Fermeture imminente, rues bondées, Rémi ne rate presque rien.',
    temps: 57, densite: 1.3, traverse: 1.25, sonnette: 440,
    erreur: 0.025, zoneForce: 0.13, remi: 0.5, aide: false,
    remiMin: 760, remiMax: 930, zone: 0.1, visee: 1.3 },
};

export const VELO = {
  longueur: 15000,        // longueur du trajet jusqu'au bar (px)
  croisiere: 300,         // le vélo roule TOUT SEUL à cette vitesse (px/s)
  vitesseMax: 480,        // vitesse en SPRINT (▶ maintenu, tant qu'il reste de l'endurance)
  acceleration: 420,      // px/s² pour rejoindre la vitesse voulue
  freinage: 900,          // px/s² (◀ appuyé)
  endurance: 0.4,         // part de la jauge de sprint vidée par seconde de sprint (pleine = 1)
  recup: 0.2,             // part de la jauge regagnée par seconde sans sprint
  saut: 480,              // vitesse de départ du saut (px/s)
  sautTenu: 0.28,         // ▲ maintenu jusqu'à ce temps (s) = saut plus haut et plus long
  graviteTenue: 600,      // gravité tant que ▲ est maintenu (au début du saut)
  gravite: 1600,          // px/s²
  sonnette: 1.0,          // recharge de la sonnette (s) ; plus court que l'écart entre 2 bourrés debout
  tampon: 0.15,           // ▲ appuyé un peu AVANT d'atterrir : le saut part quand même (s)
  chute: 1.4,             // secondes au sol après une chute
  invincible: 1.2,        // après une chute, le vélo clignote et ne peut pas retomber (s)
  crevaison: 0.35,        // verre cassé non sauté : vitesse x ce chiffre
  glissade: 0.55,         // flaque non sautée à plus de 250 px/s : vitesse x ce chiffre + le vélo zigzague
  ecart: [520, 900],      // écart entre deux obstacles (px), divisé par la densité
  // types d'obstacles et leur fréquence (par difficulté : même liste, la densité change)
  types: { allonge: 3, verre: 2, debout: 3, traverse: 2, vomi: 2, groupe: 1 },
};

export const PONG = {
  verres: 6,              // verres par joueur (6 = pyramide 3-2-1 ; 10 = 4-3-2-1)
  table: { largeur: 1.2, longueur: 2.4 },
  rayon: 0.085,           // rayon d'un verre (m)
  dedans: 0.8,            // la balle tombe à moins de rayon x ce chiffre du centre : DEDANS
  rebord: 1.2,            // entre « dedans » et rayon x ce chiffre : sur le REBORD (une chance sur deux)
  dureeVol: 0.85,         // durée du vol de la balle (s)
  ivresse: 0.012,         // chaque verre bu fait tanguer ta visée de ce nombre de mètres en plus
  balancier: 1.5,         // durée (s) d'un aller-retour du curseur de force (à vitesse x1)
};

export const PORTE = {
  manches: 3,             // en 3 manches gagnantes (la meilleure frappe de la manche gagne)
  elan: 2.6,              // secondes pour TAPOTER (élan)
  parTape: 0.075,         // jauge gagnée par tape
  baisse: 0.3,            // jauge perdue par seconde
  periodeVisee: 1.1,      // durée (s) d'un aller-retour du curseur de visée (à vitesse x1)
  poidsElan: 0.55,        // part de l'élan dans le score (le reste = la visée)
  casse: 900,             // une frappe à ce score ou plus fend la porte d'un coup
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
  porteIntro: 'La porte des toilettes. Le plus gros coup de poing gagne. Le videur ne regarde pas.',
  porteRemiFrappe: ['Prends ça !', 'Regarde et apprends.', 'Celle-là elle a fait mal à la porte.'],
  porteGagne: 'Rémi : « OK... t\'es le patron de la soirée. La prochaine tournée est pour moi ! »',
  portePerdu: 'Rémi : « Faut manger de la soupe, mon grand. »',
};
