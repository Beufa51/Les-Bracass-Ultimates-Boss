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
    course: 1.6,         // vitesse ×1,6 en courant (Maj)
    rayon: 0.25,         // taille du joueur pour les collisions
  },
  oeufs: {
    depart: 40,          // œufs au départ (Fabien : les munitions ne doivent pas être un problème)
    maxi: 99,
    cadence: 0.35,       // secondes entre 2 lancers
    vitesse: 9,          // vitesse de l'œuf
    boite: 15,           // œufs dans une boîte ramassée
    aide: 0.10,          // aide à la visée (clavier) : un œuf lancé à moins de 0,10 radian (≈ 6°) d'un policier part sur lui
    aideTactile: 0.17,   // aide à la visée au doigt (≈ 10°)
  },
  // AUTRES ARMES (touches 1 à 5 ; bouton ARME sur téléphone). La 1re cagette / pistolet / fumigène trouvé donne l'arme.
  pancarte: { cadence: 0.45, portee: 1.4, degats: 1, recul: 0.7, etourdit: 1.4 },   // un CRS frappé baisse son bouclier (etourdit s)
  tomates: { cagette: 10, maxi: 40, cadence: 0.8, vitesse: 8, duree: 0.9, ecart: 0.13, degats: 1, recul: 0.3 },   // 3 tomates en éventail
  eau: { bouteille: 120, maxi: 300, cadence: 0.07, vitesse: 11, duree: 0.45, degats: 0.2, recul: 0.06, eteint: 0.3 },   // eteint : s de lacrymo en moins par goutte
  fumigenes: { boite: 3, maxi: 9, cadence: 1.0, distance: 5, vol: 0.8, duree: 6, rayon: 1.6, degats: 1 },   // degats : par seconde dans la fumée
  sandwich: 25,          // vie rendue par un sandwich
  lanceur: {             // policier qui lance des lacrymos
    vie: 2,              // œufs pour le faire fuir
    vitesse: 1.3,
    vue: 9,              // distance à laquelle il te repère
    distance: 4.5,       // il essaie de rester à cette distance
    cadence: 2.6,        // secondes entre 2 lacrymos
    preavis: 0.6,        // il lève le bras ce temps-là AVANT de lancer (pour que tu le voies venir)
  },
  bouclier: {            // CRS au bouclier : les œufs s'écrasent sur le bouclier, SAUF quand il est essoufflé après une charge
    vie: 2,              // œufs (seulement quand il est essoufflé)
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
