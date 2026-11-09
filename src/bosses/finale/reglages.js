// =====================================================================
// BOSS FINAL : le MÉCHA DES BRACASS' (shoot'em up, vue du dessus, défilement de gauche à droite).
// Proposition : propositions/finale_mecha.md. Images : outils/finale/preparer_images.py.
// Tout ce qui se règle est ici (réglages = données, pas de logique).
// =====================================================================
export const IDENTITE = { id: 'finale', nom: 'le mécha des Bracass\'' };

// FACILE proposé par défaut la 1re fois (c'est la récompense, pas un mur)
//  vies / bombes au départ ; vitesse = x vitesse des tirs ennemis ; cadence = x tirs ennemis par seconde ; pv = x vie des parties
export const DIFFICULTES = {
  facile:   { nom: 'FACILE',   couleur: '#7fff7f', vies: 8, bombes: 3, vitesse: 0.72, cadence: 0.62, pv: 0.8,
    texte: 'Tirs lents et rares, 8 cœurs, 3 bombes. Pour profiter du spectacle.' },
  normal:   { nom: 'NORMAL',   couleur: '#ffd84a', vies: 5, bombes: 2, vitesse: 1,    cadence: 1,    pv: 1,
    texte: 'Le vrai combat final : 5 cœurs, 2 bombes.' },
  champion: { nom: 'CHAMPION', couleur: '#ff5a6e', vies: 4, bombes: 1, vitesse: 1.1,  cadence: 1.15, pv: 1.1,
    texte: '4 cœurs, 1 bombe, des tirs partout. Pour les vrais.' },
};

export const REGLAGES = {
  // ---------- ton vaisseau ----------
  vaisseau: {
    echelle: 0.45,        // taille de l'image (200 x 116 → 90 x 52)
    vitesse: 330,         // clavier : pixels par seconde
    suivi: 1.25,          // téléphone : le vaisseau bouge 1,25 fois le mouvement du doigt (on ne le cache pas sous le pouce)
    zone: { xMin: 40, xMax: 560, yMin: 30, yMax: 515 },   // où il peut aller (le mécha est à droite)
    rayon: 5,             // POINT D'IMPACT : seuls les tirs qui touchent ce petit point comptent (point lumineux)
    pointX: 6,            // place du point d'impact par rapport au centre de l'image (le cockpit)
    cadence: 0.11,        // un tir toutes les 0,11 s (automatique)
    vitesseTir: 900, degats: 1,
    invincible: 2.0,      // après un coup : clignote et ne craint rien (bot : 1,6 → 2)
  },
  bombe: { degats: 40, invincible: 1.2, parPartie: 1 },   // efface tous les tirs ; +1 bombe à chaque partie détruite
  ralentiMousse: 0.5,     // dans une flaque de mousse (Rémi) : vitesse x 0,5

  // ---------- le mécha ----------
  mecha: { x: 770, bas: 532, echelle: 0.82, flotte: 8 },   // pied du robot à « bas », il flotte de ± 8 px
  // ordre des parties à détruire, leurs PV (x DIFFICULTES.pv) et ce que dit le pote éjecté
  parties: [
    { id: 'kedric', nom: 'KÉDRIC', pv: 330, replique: 'TOUCHDOWN… dans le décor !' },
    { id: 'remi',   nom: 'RÉMI',   pv: 330, replique: 'Ma tournée… elle est renversée !' },
    { id: 'lionel', nom: 'LIONEL', pv: 350, replique: 'Faute ! Le frisbee était dedans !' },
    { id: 'greg',   nom: 'GREG',   pv: 380, replique: 'Ok… t\'as gagné ce round.' },
    { id: 'julien', nom: 'JULIEN', pv: 380, replique: 'COLLÉ ! …ah non, c\'est moi.' },
    { id: 'beufa',  nom: 'BEUFA',  pv: 520, replique: 'Ma base… MA BASE !' },
  ],
  explosionPartie: 1.6,   // durée de l'explosion d'une partie (le jeu continue, les tirs s'effacent)
  pauseEntreParties: 1.2, // répit après une partie détruite

  // ---------- attaques (vitesses en px/s, temps en s ; calées au bot outils/finale_bot.mjs) ; chaque partie alterne tirs simples et attaque spéciale ----------
  attaques: {
    kedric: { ballons: { periode: 1.25, nombre: 4, ecart: 0.24, vitesse: 210 },
              blitz: { toutesLes: 6.5, preavis: 1.1, hauteur: 60, nombre: 5, vitesse: 560 } },
    remi:   { pintes: { periode: 1.2, duree: 1.3, gravite: 520 }, mousse: { rayon: 46, duree: 3.5 },
              tournee: { toutesLes: 7, nombre: 8, vitesse: 200, angle: 1.3 } },
    lionel: { frisbees: { periode: 1.4, vitesse: 230, max: 4 },
              superLancer: { toutesLes: 5.5, preavis: 0.9, vitesse: 950 } },
    greg:   { jabs: { periode: 1.25, vitesse: 270 },
              poing: { toutesLes: 5, preavis: 1.1, hauteur: 70, vitesse: 750, rafale: 1 },
              dempsey: { toutesLes: 13, rafale: 3, preavis: 0.7 } },
    julien: { copies: { periode: 0.45, vitesse: 120 },
              interro: { toutesLes: 6.5, anneaux: 3, parAnneau: 12, vitesse: 135, ecart: 0.5 } },
    beufa:  { cone: { angle: 0.3, balayage: 0.7, portee: 900, repere: 0.6, delai: 0.45, rafale: 3, vitesse: 430 },   // delai : entre le « ! » et la rafale
              tirs: { periode: 1.5, vitesse: 200 },
              desespoir: 0.3 },   // sous 30 % de sa vie : il ajoute un peu des attaques des 5 autres
  },

  // ---------- rang (format « NOM (lettre) ») : vie restante 50, temps 30 (plein sous le PAR), bombes gardées 20 ----------
  par: 200,               // secondes : sous ce temps, les 30 points du temps sont pleins
  rangs: [
    { rang: 'S', nom: 'BOSS DES BOSS', seuil: 85 },
    { rang: 'A', nom: 'SUPER SAIYAN', seuil: 65 },
    { rang: 'B', nom: 'HUMAIN DE BASE', seuil: 40 },
    { rang: 'C', nom: 'YAMCHA', seuil: -Infinity },
  ],
  defiTemps: 180,         // défi : gagner en moins de 3 min
};
