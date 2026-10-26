// =====================================================================
// MANIFESTE : la liste de TOUS les visuels et sons du jeu.
// Le jeu appelle chaque élément par son NOM (ex. "hub_heros_marche").
//
// Pour remplacer un visuel provisoire par un vrai dessin :
//   1. mettre le PNG dans assets/sprites/<dossier>/ ;
//   2. ici, remplacer  fichier: null  par le chemin du PNG ;
//   3. garder largeur / hauteur / images (taille d'UNE case de la planche,
//      nombre de cases posées côte à côte, de gauche à droite).
// Le champ "provisoire" sert seulement tant que fichier vaut null.
//
// Formes provisoires possibles : perso, porte, dalle, mur, cercle, badge, rect, boxeurFace, boxeurDos, ring, coach
// =====================================================================

// Couleurs des boxeurs provisoires
// Ton boxeur, façon Super Punch-Out : cheveux noirs courts, gants verts, short sombre, en pixel art
const HEROS_BOXE = { couleur: '#26263c', gants: '#6ab04c', poignets: '#2d6a1f', cheveux: '#151515', coiffure: 'court',
  peau: '#e8b48a', pixel: 3 };
// Greg d'après son illustration (assets_inbox/greg_manga.jpg) : afro, barbe, torse en sueur,
// tatouages de personnages sur les bras, short bleu marine à bandes rouges, ceinture à l'épée, gants blancs à croix.
const GREG = { couleur: '#2a4d8f', bandes: '#b3202c', ceinture: '#1d2f63', embleme: 'epee',
  gants: '#f4f4f4', poignets: '#f4f4f4', croix: true, peau: '#9a6446', cheveux: '#0e0b0b', coiffure: 'afro',
  barbe: '#130e0c', yeux: '#1a1010', sueur: true,
  tatouageGauche: [{ t: 0.22, cheveux: '#161010', habit: '#c62828' }],
  tatouageDroit: [{ t: 0.12, cheveux: '#c6dd3c', habit: '#5a7a30' }, { t: 0.55, cheveux: '#a07ad0', habit: '#2c4a8a' }] };

export const MANIFESTE = {
  images: {
    // ---------- HUB ----------
    hub_heros_immobile: { fichier: null, largeur: 64, hauteur: 64, images: 1, vitesse: 1,
      provisoire: { forme: 'perso', couleur: '#3fa7ff' } },
    hub_heros_marche:   { fichier: null, largeur: 64, hauteur: 64, images: 4, vitesse: 8,
      provisoire: { forme: 'perso', couleur: '#3fa7ff' } },
    hub_porte:          { fichier: null, largeur: 80, hauteur: 100, images: 1, vitesse: 1,
      provisoire: { forme: 'porte', couleur: '#8b5a2b' } },
    hub_sol:            { fichier: null, largeur: 64, hauteur: 64, images: 1, vitesse: 1,
      provisoire: { forme: 'dalle', couleur: '#2f3b4a' } },
    hub_mur:            { fichier: null, largeur: 64, hauteur: 64, images: 1, vitesse: 1,
      provisoire: { forme: 'mur', couleur: '#5a4a6a' } },

    // ---------- BADGES (interface) ----------
    badge_vide:   { fichier: null, largeur: 48, hauteur: 48, images: 1, vitesse: 1,
      provisoire: { forme: 'cercle', couleur: '#3a3a3a' } },
    badge_beufa:  { fichier: null, largeur: 48, hauteur: 48, images: 1, vitesse: 1,
      provisoire: { forme: 'badge', couleur: '#e8b923', lettre: 'B' } },
    badge_kedric: { fichier: null, largeur: 48, hauteur: 48, images: 1, vitesse: 1,
      provisoire: { forme: 'badge', couleur: '#3cb44b', lettre: 'K' } },
    badge_julien: { fichier: null, largeur: 48, hauteur: 48, images: 1, vitesse: 1,
      provisoire: { forme: 'badge', couleur: '#4363d8', lettre: 'J' } },
    badge_greg:   { fichier: null, largeur: 48, hauteur: 48, images: 1, vitesse: 1,
      provisoire: { forme: 'badge', couleur: '#e6194b', lettre: 'G' } },
    badge_remi:   { fichier: null, largeur: 48, hauteur: 48, images: 1, vitesse: 1,
      provisoire: { forme: 'badge', couleur: '#f58231', lettre: 'R' } },
    badge_lionel: { fichier: null, largeur: 48, hauteur: 48, images: 1, vitesse: 1,
      provisoire: { forme: 'badge', couleur: '#911eb4', lettre: 'L' } },
    badge_modele: { fichier: null, largeur: 48, hauteur: 48, images: 1, vitesse: 1,
      provisoire: { forme: 'badge', couleur: '#888888', lettre: 'M' } },

    // ---------- GREG (combat de boxe) ----------
    // Vue "Punch-Out" : ton boxeur vu de DOS (heros_boxe_*), Greg vu de FACE (greg_*).
    // Une image par pose. Le bas du corps touche le bas de la case.
    greg_ring:  { fichier: null, largeur: 960, hauteur: 540, images: 1, vitesse: 1, provisoire: { forme: 'ring' } },
    // Greg en combat : ses illustrations détourées (garde basse, garde haute, coup au corps, coup au visage, K.O.)
    greg_combat:   { fichier: 'sprites/greg/greg_combat.png', largeur: 274, hauteur: 470, images: 1, vitesse: 1 },
    greg_garde_haute: { fichier: 'sprites/greg/greg_garde_haute.png', largeur: 343, hauteur: 517, images: 1, vitesse: 1 },
    greg_coup_corps:  { fichier: 'sprites/greg/greg_coup_corps.png', largeur: 380, hauteur: 519, images: 1, vitesse: 1 },
    greg_coup_visage: { fichier: 'sprites/greg/greg_coup_visage.png', largeur: 439, hauteur: 524, images: 1, vitesse: 1 },
    // Planche de poses en pied (assets_inbox/greg_planche_1.jpg et _2.jpg)
    greg_garde_basse_pied:  { fichier: 'sprites/greg/greg_garde_basse_pied.png', largeur: 275, hauteur: 547, images: 1, vitesse: 1 },
    greg_pied_jab:             { fichier: 'sprites/greg/greg_pied_jab.png', largeur: 267, hauteur: 539, images: 1, vitesse: 1 },
    greg_pied_crochet:           { fichier: 'sprites/greg/greg_pied_crochet.png', largeur: 277, hauteur: 536, images: 1, vitesse: 1 },
    greg_corps_pied:        { fichier: 'sprites/greg/greg_corps_pied.png', largeur: 222, hauteur: 524, images: 1, vitesse: 1 },
    greg_smash:             { fichier: 'sprites/greg/greg_smash.png', largeur: 284, hauteur: 559, images: 1, vitesse: 1 },
    greg_touche_pied:       { fichier: 'sprites/greg/greg_touche_pied.png', largeur: 332, hauteur: 538, images: 1, vitesse: 1 },
    greg_etourdi:           { fichier: 'sprites/greg/greg_etourdi.png', largeur: 243, hauteur: 534, images: 1, vitesse: 1 },
    greg_pied_victoire:        { fichier: 'sprites/greg/greg_pied_victoire.png', largeur: 253, hauteur: 550, images: 1, vitesse: 1 },
    greg_ko_debout:          { fichier: 'sprites/greg/greg_ko_debout.png', largeur: 318, hauteur: 540, images: 1, vitesse: 1 },
    greg_garde_pied:  { fichier: 'sprites/greg/greg_garde_pied.png', largeur: 486, hauteur: 743, images: 1, vitesse: 1 },
    greg_entier:      { fichier: 'sprites/greg/greg_entier.png', largeur: 327, hauteur: 670, images: 1, vitesse: 1 },
    greg_jambes:      { fichier: 'sprites/greg/greg_jambes.png', largeur: 327, hauteur: 410, images: 1, vitesse: 1 },
    greg_ko:          { fichier: 'sprites/greg/greg_ko.png', largeur: 341, hauteur: 410, images: 1, vitesse: 1 },
    greg_gant:     { fichier: null, largeur: 220, hauteur: 220, images: 1, vitesse: 1,
      provisoire: { forme: 'gantSeul', gants: '#f4f4f4', poignets: '#f4f4f4', croix: true } },
    greg_portrait: { fichier: 'sprites/greg/greg_portrait.jpg', largeur: 572, hauteur: 1024, images: 1, vitesse: 1 },
    greg_visage:   { fichier: 'sprites/greg/greg_visage.jpg', largeur: 300, hauteur: 260, images: 1, vitesse: 1 },
    heros_portrait: { fichier: null, largeur: 64, hauteur: 64, images: 1, vitesse: 1, provisoire: { forme: 'portraitHeros' } },
    greg_coach: { fichier: null, largeur: 160, hauteur: 160, images: 1, vitesse: 1, provisoire: { forme: 'coach' } },
    heros_boxe_garde:         { fichier: null, largeur: 280, hauteur: 340, images: 1, vitesse: 1, provisoire: { forme: 'boxeurDos', pose: 'garde', ...HEROS_BOXE } },
    heros_boxe_jab:           { fichier: null, largeur: 280, hauteur: 340, images: 1, vitesse: 1, provisoire: { forme: 'boxeurDos', pose: 'jab', ...HEROS_BOXE } },
    heros_boxe_crochet:       { fichier: null, largeur: 280, hauteur: 340, images: 1, vitesse: 1, provisoire: { forme: 'boxeurDos', pose: 'crochet', ...HEROS_BOXE } },
    heros_boxe_corps:         { fichier: null, largeur: 280, hauteur: 340, images: 1, vitesse: 1, provisoire: { forme: 'boxeurDos', pose: 'corps', ...HEROS_BOXE } },
    heros_boxe_esquive:       { fichier: null, largeur: 280, hauteur: 340, images: 1, vitesse: 1, provisoire: { forme: 'boxeurDos', pose: 'esquive', ...HEROS_BOXE } },
    heros_boxe_bloque:        { fichier: null, largeur: 280, hauteur: 340, images: 1, vitesse: 1, provisoire: { forme: 'boxeurDos', pose: 'bloque', ...HEROS_BOXE } },
    heros_boxe_touche:        { fichier: null, largeur: 280, hauteur: 340, images: 1, vitesse: 1, provisoire: { forme: 'boxeurDos', pose: 'touche', ...HEROS_BOXE } },
    heros_boxe_sol:           { fichier: null, largeur: 280, hauteur: 340, images: 1, vitesse: 1, provisoire: { forme: 'boxeurDos', pose: 'sol', ...HEROS_BOXE } },
    heros_boxe_victoire:      { fichier: null, largeur: 280, hauteur: 340, images: 1, vitesse: 1, provisoire: { forme: 'boxeurDos', pose: 'victoire', ...HEROS_BOXE } },
    heros_boxe_dempsey_g:     { fichier: null, largeur: 280, hauteur: 340, images: 1, vitesse: 1, provisoire: { forme: 'boxeurDos', pose: 'dempsey_g', ...HEROS_BOXE } },
    heros_boxe_dempsey_d:     { fichier: null, largeur: 280, hauteur: 340, images: 1, vitesse: 1, provisoire: { forme: 'boxeurDos', pose: 'dempsey_d', ...HEROS_BOXE } },
    greg_garde:               { fichier: null, largeur: 360, hauteur: 460, images: 1, vitesse: 1, provisoire: { forme: 'boxeurFace', pose: 'garde', ...GREG } },
    greg_garde_basse:         { fichier: null, largeur: 360, hauteur: 460, images: 1, vitesse: 1, provisoire: { forme: 'boxeurFace', pose: 'garde_basse', ...GREG } },
    greg_prepare:             { fichier: null, largeur: 360, hauteur: 460, images: 1, vitesse: 1, provisoire: { forme: 'boxeurFace', pose: 'prepare', ...GREG } },
    greg_prepare_bas:         { fichier: null, largeur: 360, hauteur: 460, images: 1, vitesse: 1, provisoire: { forme: 'boxeurFace', pose: 'prepare_bas', ...GREG } },
    greg_prepare_smash:       { fichier: null, largeur: 360, hauteur: 460, images: 1, vitesse: 1, provisoire: { forme: 'boxeurFace', pose: 'prepare_smash', ...GREG } },
    greg_jab:                 { fichier: null, largeur: 360, hauteur: 460, images: 1, vitesse: 1, provisoire: { forme: 'boxeurFace', pose: 'jab', ...GREG } },
    greg_crochet:             { fichier: null, largeur: 360, hauteur: 460, images: 1, vitesse: 1, provisoire: { forme: 'boxeurFace', pose: 'crochet', ...GREG } },
    greg_corps:               { fichier: null, largeur: 360, hauteur: 460, images: 1, vitesse: 1, provisoire: { forme: 'boxeurFace', pose: 'corps', ...GREG } },
    greg_uppercut:            { fichier: null, largeur: 360, hauteur: 460, images: 1, vitesse: 1, provisoire: { forme: 'boxeurFace', pose: 'uppercut', ...GREG } },
    greg_bloque:              { fichier: null, largeur: 360, hauteur: 460, images: 1, vitesse: 1, provisoire: { forme: 'boxeurFace', pose: 'bloque', ...GREG } },
    greg_touche:              { fichier: null, largeur: 360, hauteur: 460, images: 1, vitesse: 1, provisoire: { forme: 'boxeurFace', pose: 'touche', ...GREG } },
    greg_essouffle:           { fichier: null, largeur: 360, hauteur: 460, images: 1, vitesse: 1, provisoire: { forme: 'boxeurFace', pose: 'essouffle', ...GREG } },
    greg_sol:                 { fichier: null, largeur: 360, hauteur: 460, images: 1, vitesse: 1, provisoire: { forme: 'boxeurFace', pose: 'sol', ...GREG } },
    greg_victoire:            { fichier: null, largeur: 360, hauteur: 460, images: 1, vitesse: 1, provisoire: { forme: 'boxeurFace', pose: 'victoire', ...GREG } },

    // ---------- BOSS MODÈLE (test technique, pas un vrai boss) ----------
    modele_cible: { fichier: null, largeur: 64, hauteur: 64, images: 2, vitesse: 4,
      provisoire: { forme: 'rect', couleur: '#ff5ab4' } },
  },

  // Clips (GIF, MP4 ou WEBM) joués par-dessus le jeu (durée en secondes).
  // Si le fichier n'existe pas (ou fichier: null), le jeu joue son animation dessinée par le code.
  clips: {
    greg_dempsey: { fichier: 'sprites/greg/dempsey.gif', duree: 2.46 },   // lancement du Dempsey Roll (2 boucles du GIF)
  },

  // Sons : fichier null => petit "bip" provisoire (fréquence en Hz, durée en secondes)
  sons: {
    ui_valider: { fichier: null, provisoire: { frequence: 660, duree: 0.08 } },
    ui_badge:   { fichier: null, provisoire: { frequence: 990, duree: 0.25 } },
    ui_defaite: { fichier: null, provisoire: { frequence: 160, duree: 0.35 } },
    hub_porte:  { fichier: null, provisoire: { frequence: 440, duree: 0.12 } },
    // Greg (boxe)
    // musique: true => musique de fond (jouée par src/core/musique.js) ; volume de 0 à 1
    greg_musique:    { fichier: 'audio/greg_musique.mp3', musique: true, volume: 0.45 },
    greg_coup:       { fichier: 'audio/greg_coup.wav', provisoire: { frequence: 220, duree: 0.06 } },
    greg_coup_fort:  { fichier: 'audio/greg_coup_fort.wav', provisoire: { frequence: 110, duree: 0.16 } },
    greg_bloque:     { fichier: 'audio/greg_bloque.wav', provisoire: { frequence: 880, duree: 0.04 } },
    greg_esquive:    { fichier: 'audio/greg_esquive.wav', provisoire: { frequence: 1250, duree: 0.03 } },
    greg_cloche:     { fichier: 'audio/greg_cloche.wav', provisoire: { frequence: 1320, duree: 0.5 } },
    greg_compte:     { fichier: 'audio/greg_compte.wav', provisoire: { frequence: 520, duree: 0.1 } },
    greg_tapis:      { fichier: 'audio/greg_tapis.wav' },
    greg_foule:      { fichier: 'audio/greg_foule.wav' },
    greg_alerte:     { fichier: 'audio/greg_alerte.wav', provisoire: { frequence: 740, duree: 0.07 } },
  },
};
