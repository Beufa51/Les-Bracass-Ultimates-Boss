// Manifeste du boss BEUFA : ses visuels et ses sons, rien de partagé avec les autres boss.
// STYLE SNES 16 bits façon Metal Gear : pixel: 2 => chaque pixel logique fait 2 px,
// chaque forme a du VOLUME en RAMPS DE 3-4 TONS + TRANSITIONS EN TRAME (damier 2 px, la
// signature 16 bits) + ombre portée. Les COULEURS sont choisies « sur la grille 28 » du moteur.
// fichier: null => dessin provisoire par code ; dès que Fabien ajoute de vrais PNG
// (sprites/beufa/…), on remplace fichier: null par le chemin et TOUT le reste tient déjà.
// fond: 'blanc' => le PNG arrive sur un FOND BLANC (le générateur ne fait pas la
// transparence) : la scène retire CE blanc au chargement, sans toucher au dessin.
import { DALLE_NES, MUR_NES, MUR_NES_V, ROUTE_NES, CONTENEUR_NES, CAISSE_NES, SACS_NES, TABLE_NES, PROJECTEUR_NES, PORTE_NES, GARDE_NES, HEROS_NES, BEUFA_NES, PIERRE_NES, CAMION_NES, JEEP_NES, HELICO_NES, RESERVOIR_NES, MIRADOR_NES, TENTE_NES, RATELIER_NES, BARIL_NES } from './dessins.js';

export const MANIFESTE = {
  formes: { dalle_nes: DALLE_NES, mur_nes: MUR_NES, mur_nes_v: MUR_NES_V, route_nes: ROUTE_NES, conteneur_nes: CONTENEUR_NES, caisse_nes: CAISSE_NES, sacs_nes: SACS_NES, table_nes: TABLE_NES, projecteur_nes: PROJECTEUR_NES, porte_nes: PORTE_NES, garde_nes: GARDE_NES, heros_nes: HEROS_NES, beufa_nes: BEUFA_NES, pierre_nes: PIERRE_NES, camion_nes: CAMION_NES, jeep_nes: JEEP_NES, helico_nes: HELICO_NES, reservoir_nes: RESERVOIR_NES, mirador_nes: MIRADOR_NES, tente_nes: TENTE_NES, ratelier_nes: RATELIER_NES, baril_nes: BARIL_NES },
  images: {
    beufa_sol:    { fichier: 'sprites/beufa/beufa_sol.jpg', fond: 'bord', largeur: 128, hauteur: 128, images: 1, vitesse: 1, provisoire: { forme: 'dalle_nes', couleur: '#1c1c38', pixel: 2 } },
    beufa_mur:    { fichier: 'sprites/beufa/beufa_mur.jpg', fond: 'bord', largeur: 64, hauteur: 20, images: 1, vitesse: 1, provisoire: { forme: 'mur_nes', couleur: '#545470', pixel: 2 } },
    beufa_mur_v:  { fichier: 'sprites/beufa/beufa_mur_v.jpg', fond: 'bord', largeur: 20, hauteur: 64, images: 1, vitesse: 1, provisoire: { forme: 'mur_nes_v', couleur: '#545470', pixel: 2 } },
    beufa_route:  { fichier: 'sprites/beufa/beufa_route.jpg', fond: 'bord', largeur: 128, hauteur: 128, images: 1, vitesse: 1, provisoire: { forme: 'route_nes', couleur: '#1c1c1c', pixel: 2 } },
    beufa_conteneur:       { fichier: 'sprites/beufa/beufa_conteneur.jpg', fond: 'blanc', largeur: 140, hauteur: 52, images: 1, vitesse: 1, provisoire: { forme: 'conteneur_nes', couleur: '#8c1c1c', pixel: 2 } },
    beufa_conteneur_olive: { fichier: null, fond: 'blanc', largeur: 140, hauteur: 52, images: 1, vitesse: 1, provisoire: { forme: 'conteneur_nes', couleur: '#545438', pixel: 2 } },
    beufa_caisse: { fichier: 'sprites/beufa/beufa_caisse.jpg', fond: 'blanc', largeur: 64, hauteur: 64, images: 1, vitesse: 1, provisoire: { forme: 'caisse_nes', couleur: '#8c541c', pixel: 2 } },
    // V28 — LE MATÉRIEL MILITAIRE (provisoire en pixel art ; dès que Fabien livre
    // les PNG dans sprites/beufa/, remplacer fichier: null par le chemin — dimensions identiques)
    beufa_camion:     { fichier: 'sprites/beufa/beufa_camion.jpg', fond: 'blanc', largeur: 176, hauteur: 72, images: 1, vitesse: 1, provisoire: { forme: 'camion_nes', couleur: '#385438', pixel: 2 } },
    beufa_jeep:       { fichier: 'sprites/beufa/beufa_jeep.jpg', fond: 'blanc', largeur: 88, hauteur: 60, images: 1, vitesse: 1, provisoire: { forme: 'jeep_nes', couleur: '#38543c', pixel: 2 } },
    beufa_helico:     { fichier: 'sprites/beufa/beufa_helico.jpg', fond: 'blanc', largeur: 184, hauteur: 100, images: 1, vitesse: 1, provisoire: { forme: 'helico_nes', couleur: '#1c3854', pixel: 2 } },
    beufa_reservoir:  { fichier: 'sprites/beufa/beufa_reservoir.jpg', fond: 'blanc', largeur: 96, hauteur: 96, images: 1, vitesse: 1, provisoire: { forme: 'reservoir_nes', couleur: '#385454', pixel: 2 } },
    beufa_mirador:    { fichier: 'sprites/beufa/beufa_mirador.jpg', fond: 'blanc', largeur: 80, hauteur: 80, images: 1, vitesse: 1, provisoire: { forme: 'mirador_nes', couleur: '#545038', pixel: 2 } },
    beufa_tente:      { fichier: 'sprites/beufa/beufa_tente.jpg', fond: 'blanc', largeur: 148, hauteur: 96, images: 1, vitesse: 1, provisoire: { forme: 'tente_nes', couleur: '#545438', pixel: 2 } },
    beufa_ratelier:   { fichier: 'sprites/beufa/beufa_ratelier.jpg', fond: 'blanc', largeur: 140, hauteur: 52, images: 1, vitesse: 1, provisoire: { forme: 'ratelier_nes', couleur: '#545038', pixel: 2 } },
    beufa_baril:      { fichier: null, fond: 'blanc', largeur: 48, hauteur: 48, images: 1, vitesse: 1, provisoire: { forme: 'baril_nes', couleur: '#385454', pixel: 2 } },
    beufa_sacs:   { fichier: 'sprites/beufa/beufa_sacs.jpg', fond: 'blanc', largeur: 64, hauteur: 44, images: 1, vitesse: 1, provisoire: { forme: 'sacs_nes', couleur: '#8c7038', pixel: 2 } },
    beufa_table:   { fichier: 'sprites/beufa/beufa_table.jpg', fond: 'blanc', largeur: 140, hauteur: 90, images: 1, vitesse: 1, provisoire: { forme: 'table_nes', couleur: '#a88c54', pixel: 2 } },
    beufa_projecteur: { fichier: 'sprites/beufa/beufa_projecteur.jpg', fond: 'blanc', largeur: 36, hauteur: 36, images: 1, vitesse: 1, provisoire: { forme: 'projecteur_nes', couleur: '#383854', pixel: 2 } },
    beufa_porte:  { fichier: 'sprites/beufa/beufa_porte.jpg', fond: 'blanc', largeur: 72, hauteur: 20, images: 1, vitesse: 1, provisoire: { forme: 'porte_nes', couleur: '#545454', ouverte: true, pixel: 2 } },
    beufa_porte_verrouillee: { fichier: 'sprites/beufa/beufa_porte_verrouillee.jpg', fond: 'blanc', largeur: 64, hauteur: 20, images: 1, vitesse: 1, provisoire: { forme: 'porte_nes', couleur: '#545454', ouverte: false, pixel: 2 } },
    beufa_garde:  { fichier: 'sprites/beufa/beufa_garde.jpg', fond: 'blanc', largeur: 48, hauteur: 48, images: 6, vitesse: 6, provisoire: { forme: 'garde_nes', couleur: '#385438', pixel: 2 } },
    beufa_heros:  { fichier: 'sprites/beufa/beufa_heros.jpg', fond: 'blanc', echelleCommune: true, trousBlancs: 8, seuilBlanc: 200, liseré: 3, largeur: 56, hauteur: 70, images: 8, vitesse: 7, provisoire: { forme: 'heros_nes', couleur: '#383854', pixel: 2 } },
    beufa_heros_profil: { fichier: 'sprites/beufa/beufa_heros_profil.jpg', fond: 'blanc', echelleCommune: true, trousBlancs: 8, seuilBlanc: 200, liseré: 3, largeur: 56, hauteur: 70, images: 8, vitesse: 7, provisoire: { forme: 'heros_nes', couleur: '#383854', pixel: 2 } },   // V38 : profil 3/4 (regarde à droite)
    beufa_heros_dos: { fichier: 'sprites/beufa/beufa_heros_dos.jpg', fond: 'blanc', echelleCommune: true, trousBlancs: 8, seuilBlanc: 200, liseré: 3, largeur: 56, hauteur: 70, images: 8, vitesse: 7, provisoire: { forme: 'heros_nes', couleur: '#383854', pixel: 2 } },   // V39 : de dos (quand il monte)
    beufa_boss:   { fichier: 'sprites/beufa/beufa_boss.jpg', fond: 'blanc', largeur: 64, hauteur: 64, images: 8, vitesse: 7, provisoire: { forme: 'beufa_nes', couleur: '#1c541c', pixel: 2 } },
    beufa_pierre: { fichier: 'sprites/beufa/beufa_pierre.jpg', fond: 'blanc', largeur: 12, hauteur: 12, images: 1, vitesse: 1, provisoire: { forme: 'pierre_nes', couleur: '#8c8c8c', pixel: 2 } },
  },
  // Sons : fichier null => petit « bip » 8 bits provisoire (fréquence en Hz, durée en s)
  sons: {
    // MUSIQUE DE FOND (jouée par src/core/musique.js, en boucle) : Metal Gear Solid « Intruder 2 »,
    // déposée par Fabien, réencodée en 96 kb/s (22 → 11 Mo) par outils/beufa_alleger.py.
    beufa_musique:  { fichier: 'audio/beufa/beufa_musique.mp3', musique: true, volume: 0.45 },
    beufa_soupcon: { fichier: null, provisoire: { frequence: 620, duree: 0.12 } },
    beufa_alerte:  { fichier: null, provisoire: { frequence: 880, duree: 0.3 } },
    beufa_attrape: { fichier: null, provisoire: { frequence: 150, duree: 0.4 } },
    beufa_pierre:  { fichier: null, provisoire: { frequence: 320, duree: 0.09 } },
    beufa_verrou:  { fichier: null, provisoire: { frequence: 210, duree: 0.25 } },
    beufa_reussi:  { fichier: null, provisoire: { frequence: 740, duree: 0.3 } },
  },
};
