// =====================================================================
// MANIFESTE DE GREG : tous ses visuels et sons (et seulement les siens).
// Fichiers dans assets/sprites/greg/ et assets/audio/greg/.
// Les chemins sont relatifs au dossier assets/. fichier: null => dessin provisoire
// (forme dessinée par le code dans dessins.js de ce dossier : boxeurFace, boxeurDos, ring, coach, portraitHeros, gantSeul, trophee).
// =====================================================================
import { FORMES_GREG } from './dessins.js';

// Couleurs des boxeurs provisoires
// Ton boxeur, façon Super Punch-Out : cheveux noirs courts, gants verts, short sombre, en pixel art
const HEROS_BOXE = { couleur: '#1d2440', gants: '#5cc93a', poignets: '#2d6a1f', cheveux: '#7a4a20', coiffure: 'touffe',
  peau: '#e8b48a', carrure: 1.3, pixel: 3 };
// Greg d'après son illustration (assets_inbox/greg_manga.jpg) : afro, barbe, torse en sueur,
// tatouages de personnages sur les bras, short bleu marine à bandes rouges, ceinture à l'épée, gants blancs à croix.
const GREG = { couleur: '#2a4d8f', bandes: '#b3202c', ceinture: '#1d2f63', embleme: 'epee',
  gants: '#f4f4f4', poignets: '#f4f4f4', croix: true, peau: '#9a6446', cheveux: '#0e0b0b', coiffure: 'afro',
  barbe: '#130e0c', yeux: '#1a1010', sueur: true,
  tatouageGauche: [{ t: 0.22, cheveux: '#161010', habit: '#c62828' }],
  tatouageDroit: [{ t: 0.12, cheveux: '#c6dd3c', habit: '#5a7a30' }, { t: 0.55, cheveux: '#a07ad0', habit: '#2c4a8a' }] };

export const MANIFESTE = {
  formes: FORMES_GREG,
  images: {
    // ---------- GREG (combat de boxe) ----------
    // Vue "Punch-Out" : ton boxeur vu de DOS (heros_boxe_*), Greg vu de FACE (greg_*).
    // Une image par pose. Le bas du corps touche le bas de la case.
    greg_ring:  { fichier: null, largeur: 960, hauteur: 540, images: 1, vitesse: 1, provisoire: { forme: 'ring', pixel: 2 } },
    // Greg v2 (nouvelle tête + tatouages, assets_inbox/greg_v2, détourées par outils/greg/preparer_v2.py)
    // (audit nov. 2026 : les anciennes images v1 du combat ne sont plus chargées ni gardées)
    greg2_garde_haute: { fichier: 'sprites/greg/greg2_garde_haute.png', largeur: 402, hauteur: 560, images: 1, vitesse: 1 },
    greg2_nargue: { fichier: 'sprites/greg/greg2_nargue.png', largeur: 237, hauteur: 560, images: 1, vitesse: 1 },
    greg2_entier: { fichier: 'sprites/greg/greg2_entier.png', largeur: 398, hauteur: 560, images: 1, vitesse: 1 },
    greg2_jab: { fichier: 'sprites/greg/greg2_jab.png', largeur: 399, hauteur: 545, images: 1, vitesse: 1 },
    greg2_corps: { fichier: 'sprites/greg/greg2_corps.png', largeur: 354, hauteur: 472, images: 1, vitesse: 1 },
    greg2_smash: { fichier: 'sprites/greg/greg2_smash.png', largeur: 331, hauteur: 561, images: 1, vitesse: 1 },
    greg2_touche: { fichier: 'sprites/greg/greg2_touche.png', largeur: 360, hauteur: 545, images: 1, vitesse: 1 },
    greg2_etourdi: { fichier: 'sprites/greg/greg2_etourdi.png', largeur: 237, hauteur: 560, images: 1, vitesse: 1 },
    greg2_crochet: { fichier: 'sprites/greg/greg2_crochet.png', largeur: 353, hauteur: 545, images: 1, vitesse: 1 },
    greg2_garde_basse: { fichier: 'sprites/greg/greg2_garde_basse.png', largeur: 231, hauteur: 560, images: 1, vitesse: 1 },
    greg2_ko_debout: { fichier: 'sprites/greg/greg2_ko_debout.png', largeur: 237, hauteur: 560, images: 1, vitesse: 1 },
    greg2_victoire: { fichier: 'sprites/greg/greg2_victoire.png', largeur: 318, hauteur: 559, images: 1, vitesse: 1 },
    greg2_releve: { fichier: 'sprites/greg/greg2_releve.png', largeur: 237, hauteur: 560, images: 1, vitesse: 1 },
    greg2_tape_gants: { fichier: 'sprites/greg/greg2_tape_gants.png', largeur: 258, hauteur: 560, images: 1, vitesse: 1 },
    greg_ko:          { fichier: 'sprites/greg/greg_ko.png', largeur: 341, hauteur: 410, images: 1, vitesse: 1 },
    greg_gant:     { fichier: null, largeur: 220, hauteur: 220, images: 1, vitesse: 1,
      provisoire: { forme: 'gantSeul', gants: '#f4f4f4', poignets: '#f4f4f4', croix: true } },
    greg_portrait: { fichier: 'sprites/greg/greg_portrait.jpg', largeur: 572, hauteur: 1024, images: 1, vitesse: 1 },
    greg_visage:   { fichier: 'sprites/greg/greg_visage.jpg', largeur: 300, hauteur: 260, images: 1, vitesse: 1 },
    // Ton boxeur en illustrations (assets_inbox/heros_*.jpg, détourées)
    heros_garde:    { fichier: 'sprites/greg/heros_garde.png', largeur: 499, hauteur: 538, images: 1, vitesse: 1 },
    heros_coup:     { fichier: 'sprites/greg/heros_coup.png', largeur: 396, hauteur: 649, images: 1, vitesse: 1 },
    heros_uppercut: { fichier: 'sprites/greg/heros_uppercut.png', largeur: 522, hauteur: 789, images: 1, vitesse: 1 },
    heros_touche:   { fichier: 'sprites/greg/heros_touche.png', largeur: 985, hauteur: 591, images: 1, vitesse: 1 },
    heros_sol:      { fichier: 'sprites/greg/heros_sol.png', largeur: 634, hauteur: 534, images: 1, vitesse: 1 },
    heros_portrait: { fichier: null, largeur: 64, hauteur: 64, images: 1, vitesse: 1, provisoire: { forme: 'portraitHeros' } },
    // Le coach (portraits tirés de assets_inbox/coach_planche.jpg) : l'expression change selon ton round
    coach_regard: { fichier: 'sprites/greg/coach_regard.jpg', largeur: 220, hauteur: 206, images: 1, vitesse: 1 },
    coach_malin:  { fichier: 'sprites/greg/coach_malin.jpg', largeur: 220, hauteur: 206, images: 1, vitesse: 1 },
    coach_severe: { fichier: 'sprites/greg/coach_severe.jpg', largeur: 220, hauteur: 189, images: 1, vitesse: 1 },
    coach_kbg:    { fichier: 'sprites/greg/coach_kbg.jpg', largeur: 220, hauteur: 190, images: 1, vitesse: 1 },
    greg_trophee: { fichier: null, largeur: 220, hauteur: 260, images: 1, vitesse: 1, provisoire: { forme: 'trophee' } },
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
  },


  // Clips (GIF, MP4 ou WEBM) joués par-dessus le jeu (durée en secondes).
  // Si le fichier n'existe pas (ou fichier: null), le jeu joue son animation dessinée par le code.
  clips: {
    greg_dempsey: { fichier: 'sprites/greg/dempsey.mp4', duree: 2.46 },   // lancement du Dempsey Roll (2 boucles du GIF)
  },

  sons: {
    // Greg (boxe)
    // musique: true => musique de fond (jouée par src/core/musique.js) ; volume de 0 à 1
    greg_musique:    { fichier: 'audio/greg/greg_musique.mp3', musique: true, volume: 0.45 },
    greg_coup:       { fichier: 'audio/greg/greg_coup.wav', provisoire: { frequence: 220, duree: 0.06 } },
    greg_coup_fort:  { fichier: 'audio/greg/greg_coup_fort.wav', provisoire: { frequence: 110, duree: 0.16 } },
    greg_bloque:     { fichier: 'audio/greg/greg_bloque.wav', provisoire: { frequence: 880, duree: 0.04 } },
    greg_esquive:    { fichier: 'audio/greg/greg_esquive.wav', provisoire: { frequence: 1250, duree: 0.03 } },
    greg_cloche:     { fichier: 'audio/greg/greg_cloche.wav', provisoire: { frequence: 1320, duree: 0.5 } },
    greg_compte:     { fichier: 'audio/greg/greg_compte.wav', provisoire: { frequence: 520, duree: 0.1 } },
    greg_tapis:      { fichier: 'audio/greg/greg_tapis.wav' },
    greg_foule:      { fichier: 'audio/greg/greg_foule.wav' },
    greg_ambiance:   { fichier: 'audio/greg/greg_ambiance.wav' },   // public en continu (boucle)
    greg_alerte:     { fichier: 'audio/greg/greg_alerte.wav', provisoire: { frequence: 740, duree: 0.07 } },
  },
};
