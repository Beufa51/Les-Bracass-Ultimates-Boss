// Manifeste du boss BEUFA : ses visuels et ses sons, rien de partagé avec les autres boss.
// STYLE NÉS façon Metal Gear : pixel: 2 => chaque pixel logique fait 2 px, les couleurs
// sont réduites comme sur console 8 bits, et chaque forme a du VOLUME (chapeau éclairé +
// face sombre + ombre portée). Les COULEURS sont choisies « sur la grille 28 » du moteur.
// fichier: null => dessin provisoire par code ; dès que Fabien ajoute de vrais PNG
// (sprites/beufa/…), on remplace fichier: null par le chemin et TOUT le reste tient déjà.
import { DALLE_NES, MUR_NES, MUR_NES_V, ROUTE_NES, CONTENEUR_NES, CAISSE_NES, SACS_NES, TABLE_NES, PROJECTEUR_NES, PORTE_NES, GARDE_NES, HEROS_NES, BEUFA_NES, PIERRE_NES } from './dessins.js';

export const MANIFESTE = {
  formes: { dalle_nes: DALLE_NES, mur_nes: MUR_NES, mur_nes_v: MUR_NES_V, route_nes: ROUTE_NES, conteneur_nes: CONTENEUR_NES, caisse_nes: CAISSE_NES, sacs_nes: SACS_NES, table_nes: TABLE_NES, projecteur_nes: PROJECTEUR_NES, porte_nes: PORTE_NES, garde_nes: GARDE_NES, heros_nes: HEROS_NES, beufa_nes: BEUFA_NES, pierre_nes: PIERRE_NES },
  images: {
    beufa_sol:    { fichier: null, largeur: 128, hauteur: 128, images: 1, vitesse: 1, provisoire: { forme: 'dalle_nes', couleur: '#1c1c38', pixel: 2 } },
    beufa_mur:    { fichier: null, largeur: 64, hauteur: 20, images: 1, vitesse: 1, provisoire: { forme: 'mur_nes', couleur: '#545470', pixel: 2 } },
    beufa_mur_v:  { fichier: null, largeur: 20, hauteur: 64, images: 1, vitesse: 1, provisoire: { forme: 'mur_nes_v', couleur: '#545470', pixel: 2 } },
    beufa_route:  { fichier: null, largeur: 128, hauteur: 128, images: 1, vitesse: 1, provisoire: { forme: 'route_nes', couleur: '#1c1c1c', pixel: 2 } },
    beufa_conteneur:       { fichier: null, largeur: 140, hauteur: 52, images: 1, vitesse: 1, provisoire: { forme: 'conteneur_nes', couleur: '#8c1c1c', pixel: 2 } },
    beufa_conteneur_olive: { fichier: null, largeur: 140, hauteur: 52, images: 1, vitesse: 1, provisoire: { forme: 'conteneur_nes', couleur: '#545438', pixel: 2 } },
    beufa_caisse: { fichier: null, largeur: 64, hauteur: 64, images: 1, vitesse: 1, provisoire: { forme: 'caisse_nes', couleur: '#8c541c', pixel: 2 } },
    beufa_sacs:   { fichier: null, largeur: 64, hauteur: 44, images: 1, vitesse: 1, provisoire: { forme: 'sacs_nes', couleur: '#8c7038', pixel: 2 } },
    beufa_table:   { fichier: null, largeur: 140, hauteur: 90, images: 1, vitesse: 1, provisoire: { forme: 'table_nes', couleur: '#a88c54', pixel: 2 } },
    beufa_projecteur: { fichier: null, largeur: 36, hauteur: 36, images: 1, vitesse: 1, provisoire: { forme: 'projecteur_nes', couleur: '#383854', pixel: 2 } },
    beufa_porte:  { fichier: null, largeur: 72, hauteur: 20, images: 1, vitesse: 1, provisoire: { forme: 'porte_nes', couleur: '#545454', ouverte: true, pixel: 2 } },
    beufa_porte_verrouillee: { fichier: null, largeur: 64, hauteur: 20, images: 1, vitesse: 1, provisoire: { forme: 'porte_nes', couleur: '#545454', ouverte: false, pixel: 2 } },
    beufa_garde:  { fichier: null, largeur: 48, hauteur: 48, images: 2, vitesse: 6, provisoire: { forme: 'garde_nes', couleur: '#385438', pixel: 2 } },
    beufa_heros:  { fichier: null, largeur: 48, hauteur: 48, images: 2, vitesse: 7, provisoire: { forme: 'heros_nes', couleur: '#383854', pixel: 2 } },
    beufa_boss:   { fichier: null, largeur: 64, hauteur: 64, images: 1, vitesse: 1, provisoire: { forme: 'beufa_nes', couleur: '#1c541c', pixel: 2 } },
    beufa_pierre: { fichier: null, largeur: 12, hauteur: 12, images: 1, vitesse: 1, provisoire: { forme: 'pierre_nes', couleur: '#8c8c8c', pixel: 2 } },
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
