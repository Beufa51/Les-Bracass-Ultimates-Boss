// =====================================================================
// MANIFESTE DE KÉDRIC : tous ses visuels et sons (et seulement les siens).
// Fichiers dans assets/sprites/kedric/ et assets/audio/kedric/.
// Les chemins sont relatifs au dossier assets/. fichier: null => dessin provisoire
// (forme dessinée par le code dans dessins.js de ce dossier : coureurDos, defenseur, kedric, trophee, ballon).
// Ton coureur est vu de DOS, les défenseurs et Kédric de FACE. Les pieds touchent le bas de la case.
// =====================================================================
import { FORMES_KEDRIC } from './dessins.js';

// les défenseurs de Kédric : maillot vert, numéros dorés, casque blanc à bande verte
const DEF = { maillot: '#1d8a4a', chiffre: '#ffd84a', casque: '#f4f4f4', bande: '#1d8a4a' };
// Kédric en personne pour le duel final : maillot doré n°1, casque vert à étoile, lunettes noires
const KED = { maillot: '#e8b923', chiffre: '#1d8a4a', casque: '#1d8a4a', bande: '#ffd84a', numero: '1', etoile: true, lunettes: true };
const def = (pose, images = 1, vitesse = 1, couleurs = DEF) =>
  ({ fichier: null, largeur: 220, hauteur: 200, images, vitesse, provisoire: { forme: 'defenseur', pose, ...couleurs } });
// illustration détourée (une case) ; 'secours' = le dessin provisoire si le fichier manque
const ill = (nom, largeur, hauteur, secours) => ({ ...secours, fichier: `sprites/kedric/kedric_${nom}.png`, largeur, hauteur, images: 1, vitesse: 1 });
const toi = (pose, images = 1, vitesse = 1) =>
  ({ fichier: null, largeur: 180, hauteur: 220, images, vitesse, provisoire: { forme: 'coureurDos', pose } });

export const MANIFESTE = {
  formes: FORMES_KEDRIC,
  images: {
    // Illustrations : assets_inbox/kedric_*.jpg détourées par outils/kedric/preparer_images.py (1,5 fois la taille
    // d'affichage, le jeu les réduit). Une seule image par pose : le jeu les fait bouger (foulées, rebonds).
    // Sans fichier (fichier: null), c'est le dessin provisoire du code qui revient.
    // ---------- TOI (vu de dos, n°21, casque rouge) ----------
    kedric_toi_course:   ill('toi_course', 245, 322, toi('course', 4, 12)),
    kedric_toi_saut:     ill('toi_saut', 277, 300, toi('saut')),
    kedric_toi_rotation: ill('toi_rotation', 282, 240, toi('rotation')),
    kedric_toi_plaque:   ill('toi_plaque', 265, 368, toi('plaque')),       // le plaqueur est déjà sur l'image
    kedric_toi_victoire: ill('toi_victoire', 188, 375, toi('victoire')),
    // ---------- LES DÉFENSEURS (de face) ----------
    kedric_def_course: ill('def_course', 221, 308, def('course', 4, 10)),
    kedric_def_garde:  ill('def_garde', 172, 292, def('garde', 2, 4)),
    kedric_def_bas:    ill('def_bas', 236, 240, def('bas')),
    kedric_def_plonge: ill('def_plonge', 394, 188, def('plonge')),        // plonge vers la GAUCHE (retourné au besoin)
    kedric_def_bras:   ill('def_bras', 491, 270, def('bras')),
    kedric_def_rate:   ill('def_rate', 295, 225, def('rate')),
    // ---------- KÉDRIC en joueur (duel final) : une seule illustration (kedric_star), le jeu la penche / la couche ----------
    kedric_star_course: ill('star', 209, 322, def('course', 4, 10, KED)),
    kedric_star_garde:  ill('star', 209, 322, def('garde', 2, 4, KED)),
    kedric_star_bas:    ill('star', 209, 322, def('bas', 1, 1, KED)),
    kedric_star_plonge: ill('star', 209, 322, def('plonge', 1, 1, KED)),
    kedric_star_bras:   ill('star', 209, 322, def('bras', 1, 1, KED)),
    kedric_star_rate:   ill('star', 209, 322, def('rate', 1, 1, KED)),
    // ---------- KÉDRIC le coach ----------
    kedric_portrait: { fichier: 'sprites/kedric/kedric_portrait.png', largeur: 240, hauteur: 645, images: 1, vitesse: 1, provisoire: { forme: 'kedric', pose: 'portrait' } },
    // buste : 1) bras croisés  2) il parle au micro
    kedric_coach:    { fichier: 'sprites/kedric/kedric_coach.png', largeur: 180, hauteur: 180, images: 2, vitesse: 6, provisoire: { forme: 'kedric', pose: 'buste' } },
    // danse : 1) main sur la hanche  2) disco, le doigt vers le ciel
    kedric_danse:    { fichier: 'sprites/kedric/kedric_danse.png', largeur: 200, hauteur: 450, images: 2, vitesse: 4, provisoire: { forme: 'kedric', pose: 'danse' } },
    kedric_defaite:  { fichier: 'sprites/kedric/kedric_defaite.png', largeur: 234, hauteur: 450, images: 1, vitesse: 1, provisoire: { forme: 'kedric', pose: 'defaite' } },
    kedric_trophee:  { fichier: null, largeur: 220, hauteur: 260, images: 1, vitesse: 1, provisoire: { forme: 'trophee' } },
    kedric_ballon:   { fichier: null, largeur: 40, hauteur: 40, images: 8, vitesse: 16, provisoire: { forme: 'ballon' } },
  },

  sons: {
    // générés par outils/kedric/generer_sons.py
    kedric_esquive:   { fichier: 'audio/kedric/kedric_esquive.wav', provisoire: { frequence: 700, duree: 0.06 } },
    kedric_saut:      { fichier: 'audio/kedric/kedric_saut.wav', provisoire: { frequence: 500, duree: 0.08 } },
    kedric_parfait:   { fichier: 'audio/kedric/kedric_parfait.wav', provisoire: { frequence: 1400, duree: 0.12 } },
    kedric_plaque:    { fichier: 'audio/kedric/kedric_plaque.wav', provisoire: { frequence: 110, duree: 0.25 } },
    kedric_alerte:    { fichier: 'audio/kedric/kedric_alerte.wav', provisoire: { frequence: 1000, duree: 0.04 } },
    kedric_niveau:    { fichier: 'audio/kedric/kedric_niveau.wav', provisoire: { frequence: 880, duree: 0.15 } },
    kedric_ghost:     { fichier: 'audio/kedric/kedric_ghost.wav', provisoire: { frequence: 300, duree: 0.5 } },
    kedric_sifflet:   { fichier: 'audio/kedric/kedric_sifflet.wav', provisoire: { frequence: 1800, duree: 0.3 } },
    kedric_touchdown: { fichier: 'audio/kedric/kedric_touchdown.wav', provisoire: { frequence: 520, duree: 0.5 } },
    kedric_foule:     { fichier: 'audio/kedric/kedric_foule.wav' },
    kedric_ambiance:  { fichier: 'audio/kedric/kedric_ambiance.wav' },   // public en continu (boucle)
  },
};
