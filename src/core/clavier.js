// Touches du jeu : flèches + Espace + Z + X (la touche F1 est gérée dans main.js).
// Nov. 2026 (Fabien) : sur PC, Z / X sont remplacés par ESPACE (si libre) ou ALT (ou ENTRÉE) ; Z / X restent actifs
// (les boutons du téléphone envoient Z / X).
export function creerTouches(scene) {
  const K = Phaser.Input.Keyboard.KeyCodes;
  return scene.input.keyboard.addKeys({
    haut: K.UP, bas: K.DOWN, gauche: K.LEFT, droite: K.RIGHT,
    espace: K.SPACE, z: K.Z, x: K.X, alt: K.ALT, entree: K.ENTER,
  });
}

// Vrai seulement à l'image où la touche vient d'être enfoncée
export function vientDAppuyer(touche) {
  return Phaser.Input.Keyboard.JustDown(touche);
}
