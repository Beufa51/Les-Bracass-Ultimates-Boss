// Manifeste du boss BEUFA : ses visuels et ses sons, rien de partagé avec les autres boss.
// Tout est PROVISOIRE (dessiné par le code) en attendant les vrais visuels de Fabien.
import { GARDE, HEROS, CAISSE, PILIER, TOUR, PORTE, BEUFA } from './dessins.js';

export const MANIFESTE = {
  formes: { garde: GARDE, heros: HEROS, caisse: CAISSE, pilier: PILIER, tour: TOUR, porte_qg: PORTE, beufa: BEUFA },
  images: {
    beufa_sol:    { fichier: null, largeur: 64, hauteur: 64, images: 1, vitesse: 1, provisoire: { forme: 'dalle', couleur: '#131a24' } },
    beufa_caisse: { fichier: null, largeur: 56, hauteur: 56, images: 1, vitesse: 1, provisoire: { forme: 'caisse', couleur: '#7a5a30' } },
    beufa_pilier: { fichier: null, largeur: 34, hauteur: 34, images: 1, vitesse: 1, provisoire: { forme: 'pilier', couleur: '#525c6a' } },
    beufa_tour:   { fichier: null, largeur: 72, hauteur: 72, images: 1, vitesse: 1, provisoire: { forme: 'tour', couleur: '#2c3644' } },
    beufa_porte:  { fichier: null, largeur: 140, hauteur: 44, images: 1, vitesse: 1, provisoire: { forme: 'porte_qg', couleur: '#3c4654' } },
    beufa_garde:  { fichier: null, largeur: 48, hauteur: 48, images: 2, vitesse: 6, provisoire: { forme: 'garde', couleur: '#3b4a3a' } },
    beufa_heros:  { fichier: null, largeur: 48, hauteur: 48, images: 2, vitesse: 7, provisoire: { forme: 'heros', couleur: '#c02b2b' } },
    beufa_boss:   { fichier: null, largeur: 64, hauteur: 64, images: 1, vitesse: 1, provisoire: { forme: 'beufa', couleur: '#2e5a2e' } },
    beufa_pierre: { fichier: null, largeur: 12, hauteur: 12, images: 1, vitesse: 1, provisoire: { forme: 'cercle', couleur: '#9aa3ad' } },
  },
  // Sons : fichier null => petit « bip » provisoire (fréquence en Hz, durée en s)
  sons: {
    beufa_soupcon: { fichier: null, provisoire: { frequence: 620, duree: 0.12 } },
    beufa_alerte:  { fichier: null, provisoire: { frequence: 880, duree: 0.3 } },
    beufa_attrape: { fichier: null, provisoire: { frequence: 150, duree: 0.4 } },
    beufa_pierre:  { fichier: null, provisoire: { frequence: 320, duree: 0.09 } },
    beufa_verrou:  { fichier: null, provisoire: { frequence: 210, duree: 0.25 } },
    beufa_reussi:  { fichier: null, provisoire: { frequence: 740, duree: 0.3 } },
  },
};
