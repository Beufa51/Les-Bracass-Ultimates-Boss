// Petits outils d'affichage partagés (textes, panneaux).
import { LARGEUR, HAUTEUR, POLICE } from './reglages.js';

export function texte(scene, x, y, contenu, taille = 20, couleur = '#ffffff', options = {}) {
  return scene.add.text(x, y, contenu, {
    fontFamily: POLICE, fontSize: taille + 'px', color: couleur,
    align: 'center', stroke: '#000000', strokeThickness: Math.max(2, taille / 8),
    ...options,
  }).setOrigin(0.5);
}

// Voile sombre sur tout l'écran (pour les écrans d'intro, de fin, de menu)
export function voile(scene, opacite = 0.8) {
  return scene.add.rectangle(LARGEUR / 2, HAUTEUR / 2, LARGEUR, HAUTEUR, 0x000000, opacite);
}
