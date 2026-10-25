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
const HEROS_BOXE = { couleur: '#3fa7ff', gants: '#f4f4f4', gantsOmbre: '#c9c9c9', cheveux: '#3b2416' };
const GREG = { couleur: '#e6194b', gants: '#b3122f', gantsOmbre: '#7d0c20', cheveux: '#111111', coiffure: 'pics', peau: '#e8b58a', peauOmbre: '#c98f63', ceinture: '#ffd84a' };

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
    greg_garde:               { fichier: null, largeur: 360, hauteur: 420, images: 1, vitesse: 1, provisoire: { forme: 'boxeurFace', pose: 'garde', ...GREG } },
    greg_garde_basse:         { fichier: null, largeur: 360, hauteur: 420, images: 1, vitesse: 1, provisoire: { forme: 'boxeurFace', pose: 'garde_basse', ...GREG } },
    greg_prepare:             { fichier: null, largeur: 360, hauteur: 420, images: 1, vitesse: 1, provisoire: { forme: 'boxeurFace', pose: 'prepare', ...GREG } },
    greg_prepare_bas:         { fichier: null, largeur: 360, hauteur: 420, images: 1, vitesse: 1, provisoire: { forme: 'boxeurFace', pose: 'prepare_bas', ...GREG } },
    greg_prepare_smash:       { fichier: null, largeur: 360, hauteur: 420, images: 1, vitesse: 1, provisoire: { forme: 'boxeurFace', pose: 'prepare_smash', ...GREG } },
    greg_jab:                 { fichier: null, largeur: 360, hauteur: 420, images: 1, vitesse: 1, provisoire: { forme: 'boxeurFace', pose: 'jab', ...GREG } },
    greg_crochet:             { fichier: null, largeur: 360, hauteur: 420, images: 1, vitesse: 1, provisoire: { forme: 'boxeurFace', pose: 'crochet', ...GREG } },
    greg_corps:               { fichier: null, largeur: 360, hauteur: 420, images: 1, vitesse: 1, provisoire: { forme: 'boxeurFace', pose: 'corps', ...GREG } },
    greg_uppercut:            { fichier: null, largeur: 360, hauteur: 420, images: 1, vitesse: 1, provisoire: { forme: 'boxeurFace', pose: 'uppercut', ...GREG } },
    greg_bloque:              { fichier: null, largeur: 360, hauteur: 420, images: 1, vitesse: 1, provisoire: { forme: 'boxeurFace', pose: 'bloque', ...GREG } },
    greg_touche:              { fichier: null, largeur: 360, hauteur: 420, images: 1, vitesse: 1, provisoire: { forme: 'boxeurFace', pose: 'touche', ...GREG } },
    greg_essouffle:           { fichier: null, largeur: 360, hauteur: 420, images: 1, vitesse: 1, provisoire: { forme: 'boxeurFace', pose: 'essouffle', ...GREG } },
    greg_sol:                 { fichier: null, largeur: 360, hauteur: 420, images: 1, vitesse: 1, provisoire: { forme: 'boxeurFace', pose: 'sol', ...GREG } },
    greg_victoire:            { fichier: null, largeur: 360, hauteur: 420, images: 1, vitesse: 1, provisoire: { forme: 'boxeurFace', pose: 'victoire', ...GREG } },

    // ---------- BOSS MODÈLE (test technique, pas un vrai boss) ----------
    modele_cible: { fichier: null, largeur: 64, hauteur: 64, images: 2, vitesse: 4,
      provisoire: { forme: 'rect', couleur: '#ff5ab4' } },
  },

  // Sons : fichier null => petit "bip" provisoire (fréquence en Hz, durée en secondes)
  sons: {
    ui_valider: { fichier: null, provisoire: { frequence: 660, duree: 0.08 } },
    ui_badge:   { fichier: null, provisoire: { frequence: 990, duree: 0.25 } },
    ui_defaite: { fichier: null, provisoire: { frequence: 160, duree: 0.35 } },
    hub_porte:  { fichier: null, provisoire: { frequence: 440, duree: 0.12 } },
    // Greg (boxe)
    greg_coup:       { fichier: null, provisoire: { frequence: 220, duree: 0.06 } },
    greg_coup_fort:  { fichier: null, provisoire: { frequence: 110, duree: 0.16 } },
    greg_bloque:     { fichier: null, provisoire: { frequence: 880, duree: 0.04 } },
    greg_esquive:    { fichier: null, provisoire: { frequence: 1250, duree: 0.03 } },
    greg_cloche:     { fichier: null, provisoire: { frequence: 1320, duree: 0.5 } },
    greg_compte:     { fichier: null, provisoire: { frequence: 520, duree: 0.1 } },
    greg_alerte:     { fichier: null, provisoire: { frequence: 740, duree: 0.07 } },
  },
};
