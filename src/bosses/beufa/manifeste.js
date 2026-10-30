// Manifeste du boss BEUFA : ses visuels et ses sons, rien de partagé avec les autres boss.
// STYLE NÉS façon Metal Gear : pixel: 2 => chaque pixel logique fait 2 px, les couleurs sont
// réduites comme sur console 8 bits, et chaque forme a du VOLUME (chapeau éclairé + face sombre + contour noir).
import { DALLE_NES, MUR_NES, MUR_NES_V, CAISSE_NES, TOUR_NES, PORTE_NES, GARDE_NES, HEROS_NES, BEUFA_NES, PIERRE_NES } from './dessins.js';

export const MANIFESTE = {
  formes: { dalle_nes: DALLE_NES, mur_nes: MUR_NES, mur_nes_v: MUR_NES_V, caisse_nes: CAISSE_NES, tour_nes: TOUR_NES, porte_nes: PORTE_NES, garde_nes: GARDE_NES, heros_nes: HEROS_NES, beufa_nes: BEUFA_NES, pierre_nes: PIERRE_NES },
  images: {
    beufa_sol:    { fichier: null, largeur: 64, hauteur: 64, images: 1, vitesse: 1, provisoire: { forme: 'dalle_nes', couleur: '#131a24', pixel: 2 } },
    beufa_mur:    { fichier: null, largeur: 64, hauteur: 20, images: 1, vitesse: 1, provisoire: { forme: 'mur_nes', couleur: '#5a6474', pixel: 2 } },
    beufa_mur_v:  { fichier: null, largeur: 20, hauteur: 64, images: 1, vitesse: 1, provisoire: { forme: 'mur_nes_v', couleur: '#5a6474', pixel: 2 } },
    beufa_caisse: { fichier: null, largeur: 56, hauteur: 56, images: 1, vitesse: 1, provisoire: { forme: 'caisse_nes', couleur: '#7a5a30', pixel: 2 } },
    beufa_tour:   { fichier: null, largeur: 72, hauteur: 72, images: 1, vitesse: 1, provisoire: { forme: 'tour_nes', couleur: '#2c3644', pixel: 2 } },
    beufa_porte:  { fichier: null, largeur: 72, hauteur: 20, images: 1, vitesse: 1, provisoire: { forme: 'porte_nes', couleur: '#3c4654', ouverte: true, pixel: 2 } },
    beufa_porte_verrouillee: { fichier: null, largeur: 64, hauteur: 20, images: 1, vitesse: 1, provisoire: { forme: 'porte_nes', couleur: '#3c4654', ouverte: false, pixel: 2 } },
    beufa_garde:  { fichier: null, largeur: 48, hauteur: 48, images: 2, vitesse: 6, provisoire: { forme: 'garde_nes', couleur: '#3b4a3a', pixel: 2 } },
    beufa_heros:  { fichier: null, largeur: 48, hauteur: 48, images: 2, vitesse: 7, provisoire: { forme: 'heros_nes', couleur: '#2b3550', pixel: 2 } },
    beufa_boss:   { fichier: null, largeur: 64, hauteur: 64, images: 1, vitesse: 1, provisoire: { forme: 'beufa_nes', couleur: '#2e5a2e', pixel: 2 } },
    beufa_pierre: { fichier: null, largeur: 12, hauteur: 12, images: 1, vitesse: 1, provisoire: { forme: 'pierre_nes', couleur: '#9aa3ad', pixel: 2 } },
  },
  // Sons : fichier null => petit « bip » 8 bits provisoire (fréquence en Hz, durée en s)
  sons: {
    beufa_soupcon: { fichier: null, provisoire: { frequence: 620, duree: 0.12 } },
    beufa_alerte:  { fichier: null, provisoire: { frequence: 880, duree: 0.3 } },
    beufa_attrape: { fichier: null, provisoire: { frequence: 150, duree: 0.4 } },
    beufa_pierre:  { fichier: null, provisoire: { frequence: 320, duree: 0.09 } },
    beufa_verrou:  { fichier: null, provisoire: { frequence: 210, duree: 0.25 } },
    beufa_reussi:  { fichier: null, provisoire: { frequence: 740, duree: 0.3 } },
  },
};
