// Réglages du boss Julien. Niveau 1 : LA MANIF (FPS façon Wolfenstein : rejoindre le lycée sous les lacrymos).
// Tous les chiffres d'équilibrage sont ici : on peut les modifier sans risque.
// Distances en CASES du plan (1 case = la largeur d'un mur), temps en secondes, vitesses en cases par seconde.
export const IDENTITE = { id: 'julien', nom: 'Julien' };

// Niveaux de difficulté façon Doom (choisis avant la manif, retenus pour la fois suivante)
//  degats : × dégâts reçus ; munitions : × œufs au départ et dans ce qu'on ramasse ;
//  cadence : × temps entre 2 lacrymos (plus petit = plus souvent) ; essouffle : × temps où le CRS baisse son bouclier
export const DIFFICULTES = {
  sage:       { nom: 'LYCÉEN SAGE',       couleur: '#7fff7f', degats: 0.5,  munitions: 1.5, cadence: 1.3, essouffle: 1.3, texte: 'Pour découvrir la manif tranquille.' },
  delegue:    { nom: 'DÉLÉGUÉ DE CLASSE', couleur: '#9fd0ff', degats: 0.75, munitions: 1.2, cadence: 1.1, essouffle: 1.15, texte: 'Un peu d\'aide, mais ça pique quand même.' },
  bloqueur:   { nom: 'BLOQUEUR',          couleur: '#ffd84a', degats: 1,    munitions: 1,   cadence: 1,   essouffle: 1,   texte: 'La vraie manif, comme prévue.' },
  anarchiste: { nom: 'ANARCHISTE',        couleur: '#ff5a6e', degats: 1.5,  munitions: 0.7, cadence: 0.7, essouffle: 0.7, texte: 'Lacrymos en rafale, CRS teigneux. Pour les vrais.' },
};
// Rang de fin (score sur 100 : policiers 50, secrets 20, objets 10, temps 20) ; court = affiché au hub
export const RANGS = [
  { mini: 85, nom: 'CHE GUEVARA DU LYCÉE', court: 'CHE' },
  { mini: 65, nom: 'LEADER ÉTUDIANT', court: 'LEADER' },
  { mini: 40, nom: 'DÉLÉGUÉ DE CLASSE', court: 'DÉLÉGUÉ' },
  { mini: 0, nom: 'FAYOT', court: 'FAYOT' },
];

export const REGLAGES = {
  joueur: {
    vie: 100,            // vie au départ (et maximum)
    vitesse: 3.2,        // avancer / reculer
    vitesseCote: 2.8,    // pas de côté
    rotation: 3.0,       // radians par seconde (≈ 170° / s)
    course: 1.6,         // vitesse ×1,6 en courant
    toujoursCourir: true,   // comme les joueurs de Doom (« always run ») : Maj fait alors MARCHER
    tactile: { courir: false, rotation: 2.0, joystick: true },   // téléphone : pas de course, rotation douce ; joystick à gauche (false = la croix)
    rayon: 0.25,         // taille du joueur pour les collisions
  },
  oeufs: {
    depart: 40,          // œufs au départ (Fabien : les munitions ne doivent pas être un problème)
    maxi: 99,
    cadence: 0.35,       // secondes entre 2 lancers
    vitesse: 9,          // vitesse de l'œuf
    degats: 1, recul: 0.15,   // un œuf = 1 de vie en moins, et le policier recule un peu
    boite: 15,           // œufs dans une boîte ramassée
    aide: 0.10,          // aide à la visée (clavier) : un œuf lancé à moins de 0,10 radian (≈ 6°) d'un policier part sur lui
    aideTactile: 0.17,   // aide à la visée au doigt (≈ 10°)
  },
  // AUTRES ARMES (touches 1 à 5 ; bouton ARME sur téléphone). La 1re cagette / pistolet / fumigène trouvé donne l'arme.
  pancarte: { cadence: 0.45, portee: 1.4, degats: 1, recul: 0.7, etourdit: 1.4 },   // un CRS frappé baisse son bouclier (etourdit s)
  tomates: { cagette: 10, maxi: 40, cadence: 0.6, vitesse: 8, duree: 0.9, degats: 2, recul: 0.5 },   // une tomate = 2 œufs, fait bien reculer
  eau: { bouteille: 120, maxi: 300, cadence: 0.07, vitesse: 11, duree: 0.45, degats: 0.2, recul: 0.06, eteint: 0.3 },   // eteint : s de lacrymo en moins par goutte
  fumigenes: { boite: 3, maxi: 9, cadence: 1.0, distance: 5, vol: 0.8, duree: 6, rayon: 1.6, degats: 1 },   // degats : par seconde dans la fumée
  sandwich: 25,          // vie rendue par un sandwich
  // BONUS façon Doom : écharpe mouillée (= combinaison anti-radiations), café serré (= Berserk), K-Way (= armure)
  bonus: {
    echarpe: 20,         // s sans souffrir des lacrymos
    cafe: 15,            // s plus rapide (×vitesse) et tir plus rapide (×cadence)
    cafeVitesse: 1.4, cafeCadence: 0.5,
    kway: 50,            // armure gagnée (maxi kwayMaxi) ; elle absorbe une part des dégâts (absorbe)
    kwayMaxi: 100, absorbe: 0.5,
  },
  farine: { rayon: 1.9, degats: 3, aveugle: 3, chaine: 0.15 },   // sac de farine : dégâts (perce le bouclier), s aveuglés, délai de la chaîne
  bruitTir: 8,           // un tir alerte les policiers à moins de 8 cases (comme dans Doom)
  lanceur: {             // policier qui lance des lacrymos
    vie: 2,              // œufs pour le faire fuir
    vitesse: 1.3,
    vue: 9,              // distance à laquelle il te repère
    distance: 4.5,       // il essaie de rester à cette distance
    cadence: 3.0,        // secondes entre 2 lacrymos (2,6 → 3,0)
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
    degats: 14,          // charge du CRS (18 → 14)
    essouffle: 2.2,      // bouclier baissé ce temps-là après la charge : c'est le moment de lui lancer des œufs
  },
  lacrymo: {
    vol: 1.0,            // temps de vol de la grenade
    duree: 4.5,          // durée du nuage
    rayon: 1.15,
    degats: 10,          // vie perdue par seconde dans le nuage (Fabien : un peu dur en Bloqueur → 14 → 10)
    degatsPolice: 0.5,   // les policiers pris dans leur propre lacrymo toussent aussi (par seconde)
  },
};
