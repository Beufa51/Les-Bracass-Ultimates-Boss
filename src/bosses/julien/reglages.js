// Réglages du boss Julien. Niveau 1 : LA MANIF (FPS façon Wolfenstein : rejoindre le lycée sous les lacrymos).
// Tous les chiffres d'équilibrage sont ici : on peut les modifier sans risque.
// Distances en CASES du plan (1 case = la largeur d'un mur), temps en secondes, vitesses en cases par seconde.
export const IDENTITE = { id: 'julien', nom: 'Julien' };

export const REGLAGES = {
  joueur: {
    vie: 100,            // vie au départ (et maximum)
    vitesse: 3.2,        // avancer / reculer
    vitesseCote: 2.8,    // pas de côté
    rotation: 2.4,       // radians par seconde (≈ 140° / s)
    course: 1.6,         // vitesse ×1,6 en courant (Maj, ou « Courir » sur téléphone)
    rayon: 0.25,         // taille du joueur pour les collisions
  },
  oeufs: {
    depart: 12,          // œufs au départ
    maxi: 30,
    cadence: 0.35,       // secondes entre 2 lancers
    vitesse: 9,          // vitesse de l'œuf
    boite: 6,            // œufs dans une boîte ramassée
  },
  sandwich: 25,          // vie rendue par un sandwich
  lanceur: {             // policier qui lance des lacrymos
    vie: 3,              // œufs pour le faire fuir
    vitesse: 1.3,
    vue: 9,              // distance à laquelle il te repère
    distance: 4.5,       // il essaie de rester à cette distance
    cadence: 2.6,        // secondes entre 2 lacrymos
    preavis: 0.6,        // il lève le bras ce temps-là AVANT de lancer (pour que tu le voies venir)
  },
  bouclier: {            // CRS au bouclier : les œufs s'écrasent sur le bouclier, SAUF quand il est essoufflé après une charge
    vie: 4,
    vitesse: 1.1,
    vue: 8,
    porteeCharge: 6,     // il charge quand tu es à moins de ça
    preavis: 0.7,        // il crie « DISPERSEZ-VOUS ! » ce temps-là avant de charger
    vitesseCharge: 5.5,
    dureeCharge: 1.3,
    degats: 18,
    essouffle: 2.2,      // bouclier baissé ce temps-là après la charge : c'est le moment de lui lancer des œufs
  },
  lacrymo: {
    vol: 1.0,            // temps de vol de la grenade
    duree: 4.5,          // durée du nuage
    rayon: 1.15,
    degats: 14,          // vie perdue par seconde dans le nuage
  },
};
