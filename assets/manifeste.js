// =====================================================================
// MANIFESTE DU MOTEUR COMMUN : visuels et sons du hub, des badges et de l'interface.
// Chaque boss a SON propre manifeste dans son dossier (src/bosses/<boss>/manifeste.js) :
// un boss ne touche jamais aux visuels ni aux sons d'un autre.
// Le jeu appelle chaque élément par son NOM (ex. "hub_heros_marche").
//
// Pour remplacer un visuel provisoire par un vrai dessin :
//   1. mettre le PNG dans assets/sprites/<dossier>/ ;
//   2. ici, remplacer  fichier: null  par le chemin du PNG ;
//   3. garder largeur / hauteur / images (taille d'UNE case de la planche,
//      nombre de cases posées côte à côte, de gauche à droite).
// Le champ "provisoire" sert seulement tant que fichier vaut null.
//
// Formes provisoires du moteur : perso, porte, dalle, mur, cercle, badge, rect (src/core/dessins.js)
// =====================================================================

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
      provisoire: { forme: 'badge', couleur: '#3cb44b', lettre: 'K', icone: 'football' } },   // médaille verte au ballon de football américain
    badge_julien: { fichier: null, largeur: 48, hauteur: 48, images: 1, vitesse: 1,
      provisoire: { forme: 'badge', couleur: '#4363d8', lettre: 'J' } },
    badge_greg:   { fichier: null, largeur: 48, hauteur: 48, images: 1, vitesse: 1,
      provisoire: { forme: 'badge', couleur: '#e6194b', lettre: 'G' } },
    badge_remi:   { fichier: null, largeur: 48, hauteur: 48, images: 1, vitesse: 1,
      provisoire: { forme: 'badge', couleur: '#f58231', lettre: 'R' } },
    badge_lionel: { fichier: null, largeur: 48, hauteur: 48, images: 1, vitesse: 1,
      provisoire: { forme: 'badge', couleur: '#911eb4', lettre: 'L', icone: 'frisbee' } },   // médaille violette au frisbee
    badge_modele: { fichier: null, largeur: 48, hauteur: 48, images: 1, vitesse: 1,
      provisoire: { forme: 'badge', couleur: '#888888', lettre: 'M' } },
  },

  // Sons : fichier null => petit "bip" provisoire (fréquence en Hz, durée en secondes)
  sons: {
    ui_valider: { fichier: null, provisoire: { frequence: 660, duree: 0.08 } },
    ui_badge:   { fichier: null, provisoire: { frequence: 990, duree: 0.25 } },
    ui_defaite: { fichier: null, provisoire: { frequence: 160, duree: 0.35 } },
    hub_porte:  { fichier: null, provisoire: { frequence: 440, duree: 0.12 } },
  },
};
