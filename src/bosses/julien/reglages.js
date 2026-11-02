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
    sourisActive: true,  // PC : un clic dans le jeu capture la souris pour tourner la vue (Échap la libère)
    souris: 0.0035,      // rotation par pixel de souris
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
  sarbacane: { cadence: 0.3, vitesse: 12, duree: 1.2, degats: 1, recul: 0 },   // lycée et classe : SEULE arme (celles de la manif sont interdites), infinie ; ×3 DE DOS
  eau: { bouteille: 120, maxi: 300, cadence: 0.07, vitesse: 11, duree: 0.45, degats: 0.2, recul: 0.06, eteint: 0.3 },   // eteint : s de lacrymo en moins par goutte
  fumigenes: { boite: 3, maxi: 9, cadence: 1.0, distance: 5, vol: 0.8, duree: 6, rayon: 1.6, degats: 1 },   // degats : par seconde dans la fumée
  sandwich: 35,          // vie rendue par un sandwich (Fabien : trop dur → 25 → 35)
  soins: {
    casseCroute: 0.25,   // (Fabien : un peu moins de nourriture, 0,45 → 0,25) chance qu'un policier mis en fuite lâche son casse-croûte (= un sandwich)
    manifestant: 15,     // vie rendue par un manifestant quand tu passes à côté (une fois chacun)
  },
  fuite: { vitesse: 2.6, mini: 0.6 },   // policier en fuite : vitesse ; il disparaît après « mini » s, dès que tu ne le vois plus
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
    degats: 10,          // charge du CRS (18 → 14 → 10 : Fabien, trop dur)
    essouffle: 2.2,      // bouclier baissé ce temps-là après la charge : c'est le moment de lui lancer des œufs
  },
  lacrymo: {
    vol: 1.0,            // temps de vol de la grenade
    duree: 4.5,          // durée du nuage
    rayon: 1.15,
    degats: 7,           // vie perdue par seconde dans le nuage (Fabien : trop dur → 14 → 10 → 7)
    degatsPolice: 0.5,   // les policiers pris dans leur propre lacrymo toussent aussi (par seconde)
  },
  // MINI-NIVEAU « LE LYCÉE » (JulienLycee.js) : entre la manif et la classe
  surveillant: {         // le pion : comme un CRS SANS bouclier (il siffle, puis il fonce ; pas de côté !)
    vie: 2, vitesse: 1.9, vue: 8, porteeCharge: 5, preavis: 0.6, vitesseCharge: 6.2, dureeCharge: 1.2,
    degats: 15, essouffle: 1.4, cri: '« TWEEET ! Hé toi ! Tu vas où comme ça ?! »',
    // (Fabien : « ils n'enlèvent pas de vie ») au contact il t'attrape : dégâts toutes les « cadence » s
    attrape: { portee: 1.05, degats: 8, cadence: 0.9, replique: '« Toi, au bureau du CPE ! »' },
  },
  cantiniere: {          // dame de cantine : comme un lanceur, mais de la PURÉE (flaque où l'on avance au ralenti)
    vie: 3, vitesse: 1.0, vue: 9, distance: 4, cadence: 2.8, preavis: 0.7,
    degats: 8, rayon: 0.9, flaque: 6, ralenti: 0.45, replique: '« Reprends donc de la purée ! »',
  },
  lycee: { canette: 15, fayotCri: 3.5, fayotAlerte: 10, fayotVue: 8 },   // canette : vie rendue ; fayot : s entre 2 cris, rayon d'alerte, vue
  // NIVEAU 2 : JULIEN, le prof (JulienClasse.js). 3 phases : > 50 % de vie, 50-20 %, < 20 % (il pète un câble)
  julien: {
    vie: 55,             // (Fabien : trop simple → 40 → 55) 1 boulette = 1, 1 tomate = 2, 1 coup de pancarte = 1 ; DE DOS : ×2 (sarbacane ×3)
    vitesse: 1.1,        // il fait les cent pas devant le tableau (phase 3 : vitesseRage, derrière son bureau renversé)
    vitesseRage: 1.6,
    cadence: [1.9, 1.5, 1.1],    // secondes entre 2 attaques, par phase (× la difficulté)
    preavis: [0.7, 0.6, 0.45],  // il lève le livre ce temps-là AVANT de lancer
    arret: [1.1, 0.8, 0.4],      // il s'arrête ce temps-là (environ) à chaque bout de sa marche : le moment de viser
    pause: 1.6,          // changement de phase : il s'arrête, crie, et ne prend pas de coups
    dos: [1.9, 1.7, 2.0],         // FENÊTRE DE PUNITION : après une grosse attaque, il écrit au tableau DE DOS (s)
    dosApresPetite: [0, 0.2, 0.6], // chance qu'il se retourne aussi après une petite attaque (il perd ses moyens)
    multDos: 2, multDosSarbacane: 3,
    livre: { vitesse: 6, degats: 14 },
    eventail: 0.28,      // écart (radians) entre les 3 livres de l'éventail
    dico: { vitesse: 4.5, degats: 22, rebonds: 3, preavis: 0.8 },   // le dictionnaire rebondit sur les murs (pas sur les tables)
    copies: { nombre: 5, vitesse: 3, degats: 7, ecart: 0.22 },   // copies d'interro : lentes, en vague
    mur: { vitesse: 2.6, degats: 10, ecart: 0.3, trou: 1.8, preavis: 1.0 },   // mur de copies : toute la largeur, UN trou ; passe au-dessus des tables
    craies: { nombre: 5, intervalle: 0.11, vitesse: 9, degats: 4, dispersion: 0.07, preavis: 0.55 },   // rapides, petits dégâts
    aimant: { duree: 2, force: 2.4, preavis: 0.8, degats: 15 },   // « AU TABLEAU ! » : il t'attire (force < ta vitesse : cours vers le fond)
    confisque: { portee: 2.8, duree: 8, preavis: 0.7 },   // « CONFISQUÉ ! » : trop près, il prend ton arme
    regle: { portee: 1.9, degats: 18, recul: 1.3, preavis: 0.45 },   // règle géante au contact
    rafale: { nombre: 3, intervalle: 0.28 },
    // DÉLUGE DE COPIES (bullet hell) : vagues par phase, s entre 2 vagues, copies par éventail, cercle d'une vague sur 3
    deluge: { vagues: [3, 5, 7], intervalle: [0.75, 0.6, 0.5], nombre: 9, ecart: 0.2, cercle: 18, vitesse: 3.3, degats: 7, preavis: 0.9 },
    // RAFALE DE MURS (shoot them up) : murs d'affilée par phase (« murs » : +1), s entre 2 murs, décalage du trou (cases)
    murs: { nombre: [5, 5, 6], intervalle: [0.95, 0.85, 0.75] },
    // VUE DU DESSUS pendant la rafale de murs (en pixels de la vue 480 × 222) : attente avant le 1er mur (s), ta vitesse,
    // vitesse des murs, largeur du trou, décalage du trou d'un mur à l'autre, vitesse de Julien en haut, de tes boulettes
    dessus: { attente: 1.0, vitesse: 150, vitesseMur: 75, trou: 64, derive: [50, 95], vitesseProf: 70, vitesseTir: 280 },
  },
  classe: {
    glisse: 0.45,            // phase 3 (sprinklers) : tu glisses encore ce temps-là (s) après avoir lâché (petit = moins de glissade)
  },
};
