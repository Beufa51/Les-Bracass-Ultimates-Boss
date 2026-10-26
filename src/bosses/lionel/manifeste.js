// =====================================================================
// MANIFESTE DE LIONEL : tous ses visuels et sons (et seulement les siens).
// Fichiers dans assets/sprites/lionel/ et assets/audio/lionel/.
// Les chemins sont relatifs au dossier assets/. fichier: null => dessin provisoire
// (forme dessinée par le code dans dessins.js de ce dossier : joueurFrisbee, frisbee, terrainFrisbee, trophee).
// =====================================================================
import { FORMES_LIONEL } from './dessins.js';
import { TERRAIN as TERRAIN_FRISBEE } from './reglages.js';

// Lionel d'après ses planches (maillot vert et crème n°93, short vert, baskets vertes, cheveux courts, barbe)
const LIONEL = { maillot: '#1f9a6a', panneau: '#f2ead2', numero: '93', short: '#1f9a6a', chaussures: '#2fae7a',
  peau: '#e0a77c', cheveux: '#5a3a22', barbe: '#7a6656', yeux: '#4a7ab0' };
// Toi au frisbee (dessin de secours) : blond, maillot et short rouges, comme sur ta planche
const HEROS_FRISBEE = { maillot: '#c8202c', panneau: '#d8343c', numero: '1', short: '#c8202c', chaussures: '#d02a2a',
  peau: '#e8b48a', cheveux: '#e8c050', coiffure: 'pics', yeux: '#4a7ab0' };

export const MANIFESTE = {
  formes: FORMES_LIONEL,
  images: {
    // ---------- LIONEL (frisbee façon Windjammers) ----------
    // Lionel : poses découpées dans ses planches manga (outils/lionel/decouper_planches.py), tournées vers la GAUCHE.
    // Dessins provisoires (fichier: null) : tournés vers la DROITE (le jeu les retourne au besoin).
    // Les pieds touchent le bas de la case. "course" dessinée = 4 images côte à côte.
    // "nargue" utilise la victoire.
    // Ton joueur (blond, maillot rouge) : planche assets_inbox/heros_frisbee_planche.jpg, poses tournées vers la DROITE.
    // Ses poses ont les mains vides : le jeu dessine le frisbee devant lui quand il le tient.
    // Tenir / rattraper : pose de côté (course), le frisbee dans le poing avant (la pose de face ne plaisait pas).
    // décor perso (assets_inbox/lionel_decor.jpg recadré) ; sans fichier : terrain dessiné par le code
    lionel_terrain:  { fichier: 'sprites/lionel/lionel_terrain.jpg', largeur: 960, hauteur: 540, images: 1, vitesse: 1, provisoire: { forme: 'terrainFrisbee', terrain: TERRAIN_FRISBEE } },
    frisbee:         { fichier: null, largeur: 34, hauteur: 34, images: 4, vitesse: 16, provisoire: { forme: 'frisbee' } },
    // attente : 1re pose du pas chassé (bras ouverts, prêt à attraper)
    lionel_garde: { fichier: 'sprites/lionel/lionel_attente.png', largeur: 222, hauteur: 275, images: 1, vitesse: 1, provisoire: { forme: 'joueurFrisbee', pose: 'garde', ...LIONEL } },
    // en reculant : pas chassé face à toi (5 poses en aller-retour, assets_inbox/lionel_chasse.jpg, cases retournées)
    lionel_recul: { fichier: 'sprites/lionel/lionel_chasse.png', largeur: 222, hauteur: 275, images: 8, vitesse: 12, provisoire: { forme: 'joueurFrisbee', pose: 'course', ...LIONEL } },
    // course en 6 images (assets_inbox/lionel_course_6.jpg, découpée par outils/lionel/decouper_animation.py --par-ligne 3, cases retournées)
    lionel_course: { fichier: 'sprites/lionel/lionel_course6.png', largeur: 172, hauteur: 296, images: 6, vitesse: 12, provisoire: { forme: 'joueurFrisbee', pose: 'course', ...LIONEL } },
    lionel_tient: { fichier: 'sprites/lionel/lionel_tient.png', largeur: 178, hauteur: 266, images: 1, vitesse: 1, provisoire: { forme: 'joueurFrisbee', pose: 'tient', ...LIONEL } },
    lionel_lance: { fichier: 'sprites/lionel/lionel_lance.png', largeur: 228, hauteur: 269, images: 1, vitesse: 1, provisoire: { forme: 'joueurFrisbee', pose: 'lance', ...LIONEL } },
    lionel_super: { fichier: 'sprites/lionel/lionel_super.png', largeur: 225, hauteur: 210, images: 1, vitesse: 1, provisoire: { forme: 'joueurFrisbee', pose: 'super', ...LIONEL } },
    lionel_rattrape: { fichier: 'sprites/lionel/lionel_rattrape.png', largeur: 147, hauteur: 299, images: 1, vitesse: 1, provisoire: { forme: 'joueurFrisbee', pose: 'rattrape', ...LIONEL } },
    lionel_plongeon: { fichier: 'sprites/lionel/lionel_plongeon.png', largeur: 300, hauteur: 170, images: 1, vitesse: 1, provisoire: { forme: 'joueurFrisbee', pose: 'plongeon', ...LIONEL } },
    lionel_nargue: { fichier: 'sprites/lionel/lionel_victoire.png', largeur: 152, hauteur: 341, images: 1, vitesse: 1, provisoire: { forme: 'joueurFrisbee', pose: 'nargue', ...LIONEL } },
    lionel_victoire: { fichier: 'sprites/lionel/lionel_victoire.png', largeur: 152, hauteur: 341, images: 1, vitesse: 1, provisoire: { forme: 'joueurFrisbee', pose: 'victoire', ...LIONEL } },
    lionel_touche: { fichier: 'sprites/lionel/lionel_touche.png', largeur: 226, hauteur: 236, images: 1, vitesse: 1, provisoire: { forme: 'joueurFrisbee', pose: 'touche', ...LIONEL } },
    lionel_defaite: { fichier: 'sprites/lionel/lionel_defaite.png', largeur: 154, hauteur: 158, images: 1, vitesse: 1, provisoire: { forme: 'joueurFrisbee', pose: 'defaite', ...LIONEL } },
    lionel_portrait: { fichier: 'sprites/lionel/lionel_portrait.png', largeur: 215, hauteur: 650, images: 1, vitesse: 1, provisoire: { forme: 'joueurFrisbee', pose: 'nargue', ...LIONEL } },
    // au repos : la 1re image du pas chassé (en garde, de côté)
    heros_frisbee_garde: { fichier: 'sprites/lionel/heros_frisbee_attente.png', largeur: 175, hauteur: 259, images: 1, vitesse: 1, provisoire: { forme: 'joueurFrisbee', pose: 'garde', ...HEROS_FRISBEE } },
    // course en 6 images (assets_inbox/heros_frisbee_course_6.jpg, outils/lionel/decouper_animation.py)
    heros_frisbee_course: { fichier: 'sprites/lionel/heros_frisbee_course6.png', largeur: 165, hauteur: 267, images: 6, vitesse: 12, provisoire: { forme: 'joueurFrisbee', pose: 'course', ...HEROS_FRISBEE } },
    // en reculant : pas chassé en 6 images (4 poses en aller-retour, assets_inbox/heros_frisbee_chasse_1.jpg), face à Lionel
    heros_frisbee_recul: { fichier: 'sprites/lionel/heros_frisbee_chasse.png', largeur: 175, hauteur: 259, images: 6, vitesse: 11, provisoire: { forme: 'joueurFrisbee', pose: 'course', ...HEROS_FRISBEE } },
    heros_frisbee_tient: { fichier: 'sprites/lionel/heros_frisbee_course.png', largeur: 187, hauteur: 256, images: 1, vitesse: 1, provisoire: { forme: 'joueurFrisbee', pose: 'tient', ...HEROS_FRISBEE } },
    heros_frisbee_lance: { fichier: 'sprites/lionel/heros_frisbee_lance.png', largeur: 188, hauteur: 253, images: 1, vitesse: 1, provisoire: { forme: 'joueurFrisbee', pose: 'lance', ...HEROS_FRISBEE } },
    heros_frisbee_super: { fichier: 'sprites/lionel/heros_frisbee_super.png', largeur: 197, hauteur: 284, images: 1, vitesse: 1, provisoire: { forme: 'joueurFrisbee', pose: 'super', ...HEROS_FRISBEE } },
    heros_frisbee_rattrape: { fichier: 'sprites/lionel/heros_frisbee_course.png', largeur: 187, hauteur: 256, images: 1, vitesse: 1, provisoire: { forme: 'joueurFrisbee', pose: 'rattrape', ...HEROS_FRISBEE } },
    heros_frisbee_plongeon: { fichier: 'sprites/lionel/heros_frisbee_plongeon.png', largeur: 300, hauteur: 140, images: 1, vitesse: 1, provisoire: { forme: 'joueurFrisbee', pose: 'plongeon', ...HEROS_FRISBEE } },
    heros_frisbee_victoire: { fichier: 'sprites/lionel/heros_frisbee_victoire.png', largeur: 132, hauteur: 330, images: 1, vitesse: 1, provisoire: { forme: 'joueurFrisbee', pose: 'victoire', ...HEROS_FRISBEE } },
    heros_frisbee_touche: { fichier: 'sprites/lionel/heros_frisbee_touche.png', largeur: 181, hauteur: 256, images: 1, vitesse: 1, provisoire: { forme: 'joueurFrisbee', pose: 'touche', ...HEROS_FRISBEE } },
    heros_frisbee_defaite: { fichier: 'sprites/lionel/heros_frisbee_defaite.png', largeur: 180, hauteur: 189, images: 1, vitesse: 1, provisoire: { forme: 'joueurFrisbee', pose: 'defaite', ...HEROS_FRISBEE } },
    // surprises du terrain (dessinées par le code)
    lionel_mouette:  { fichier: null, largeur: 128, hauteur: 96, images: 4, vitesse: 10, provisoire: { forme: 'mouette' } },
    lionel_chateau:  { fichier: null, largeur: 140, hauteur: 128, images: 1, vitesse: 1, provisoire: { forme: 'chateau' } },
    lionel_ballon:   { fichier: null, largeur: 80, hauteur: 80, images: 12, vitesse: 16, provisoire: { forme: 'ballon' } },
    lionel_trophee:  { fichier: null, largeur: 220, hauteur: 260, images: 1, vitesse: 1, provisoire: { forme: 'trophee' } },
  },

  sons: {
    // musique de fond (jouée par src/core/musique.js, en boucle) : Windjammers, « Lawn Court » ; volume de 0 à 1
    lionel_musique:   { fichier: 'audio/lionel/lionel_musique.mp3', musique: true, volume: 0.4 },
    // Lionel (frisbee) : générés par outils/lionel/generer_sons.py
    frisbee_lancer:  { fichier: 'audio/lionel/frisbee_lancer.wav', provisoire: { frequence: 600, duree: 0.06 } },
    frisbee_attrape: { fichier: 'audio/lionel/frisbee_attrape.wav', provisoire: { frequence: 300, duree: 0.05 } },
    frisbee_rebond:  { fichier: 'audio/lionel/frisbee_rebond.wav', provisoire: { frequence: 900, duree: 0.03 } },
    frisbee_but:     { fichier: 'audio/lionel/frisbee_but.wav', provisoire: { frequence: 200, duree: 0.3 } },
    frisbee_sifflet: { fichier: 'audio/lionel/frisbee_sifflet.wav', provisoire: { frequence: 1800, duree: 0.3 } },
    frisbee_super:   { fichier: 'audio/lionel/frisbee_super.wav', provisoire: { frequence: 1100, duree: 0.25 } },
    frisbee_pret:    { fichier: 'audio/lionel/frisbee_pret.wav', provisoire: { frequence: 880, duree: 0.2 } },
    frisbee_plongeon: { fichier: 'audio/lionel/frisbee_plongeon.wav', provisoire: { frequence: 150, duree: 0.08 } },
    frisbee_sol:     { fichier: 'audio/lionel/frisbee_sol.wav', provisoire: { frequence: 120, duree: 0.12 } },
    lionel_foule:     { fichier: 'audio/lionel/lionel_foule.wav' },
    lionel_ambiance:  { fichier: 'audio/lionel/lionel_ambiance.wav' },   // public en continu (boucle)
  },
};
