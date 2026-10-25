// Touches du jeu : flèches + Espace + Z + X (la touche F1 est gérée dans main.js).
export function creerTouches(scene) {
  const K = Phaser.Input.Keyboard.KeyCodes;
  return scene.input.keyboard.addKeys({
    haut: K.UP, bas: K.DOWN, gauche: K.LEFT, droite: K.RIGHT,
    espace: K.SPACE, z: K.Z, x: K.X,
  });
}

// Vrai seulement à l'image où la touche vient d'être enfoncée
export function vientDAppuyer(touche) {
  return Phaser.Input.Keyboard.JustDown(touche);
}
