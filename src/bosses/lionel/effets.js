// Effets visuels "manga" de Lionel (copie propre à ce boss) :
// lignes de vitesse, onomatopées géantes, flash d'impact, encarts d'attaque spéciale.
import { LARGEUR, HAUTEUR, POLICE } from '../../core/reglages.js';

function auHasard(liste) { return liste[Math.floor(Math.random() * liste.length)]; }

// Lignes qui partent d'un point (effet "focus" des mangas)
export function lignesImpact(scene, x, y, couleur = 0xffffff, nb = 18, rayon = 160) {
  const g = scene.add.graphics().setDepth(50);
  g.lineStyle(3, couleur, 1);
  for (let i = 0; i < nb; i++) {
    const a = (i / nb) * Math.PI * 2 + Math.random() * 0.3;
    const r1 = 25 + Math.random() * 25, r2 = rayon * (0.6 + Math.random() * 0.5);
    g.lineBetween(x + Math.cos(a) * r1, y + Math.sin(a) * r1, x + Math.cos(a) * r2, y + Math.sin(a) * r2);
  }
  scene.tweens.add({ targets: g, alpha: 0, duration: 260, onComplete: () => g.destroy() });
}

// Grand mot qui claque à l'écran ("BAM !", "DOSH !")
export function onomatopee(scene, x, y, mots, taille = 44, couleur = '#ffffff') {
  const mot = Array.isArray(mots) ? auHasard(mots) : mots;
  const t = scene.add.text(x, y, mot, {
    fontFamily: POLICE, fontStyle: 'bold', fontSize: taille + 'px', color: couleur,
    stroke: '#000000', strokeThickness: Math.round(taille / 5),
  }).setOrigin(0.5).setDepth(60).setAngle(Phaser.Math.Between(-18, 18)).setScale(0.3);
  scene.tweens.add({ targets: t, scale: 1, duration: 90, ease: 'Back.Out' });
  scene.tweens.add({ targets: t, alpha: 0, y: y - 30, delay: 380, duration: 300, onComplete: () => t.destroy() });
}

// Flash blanc sur tout l'écran
export function flash(scene, opacite = 0.6, couleur = 0xffffff) {
  const r = scene.add.rectangle(LARGEUR / 2, HAUTEUR / 2, LARGEUR, HAUTEUR, couleur, opacite).setDepth(55);
  scene.tweens.add({ targets: r, alpha: 0, duration: 120, onComplete: () => r.destroy() });
}

// Bande "manga" au milieu de l'écran pour annoncer une attaque spéciale.
// Le combat est figé pendant 'duree' secondes (géré par la scène).
// image (facultatif) : clé d'une image affichée à gauche de la bande (ex. le visage de Greg)
export function encart(scene, titre, sousTitre, couleur = '#ffd84a', fond = 0x000000, image = null) {
  const elements = [];
  const haut = scene.add.rectangle(LARGEUR / 2, -40, LARGEUR, 80, 0x000000).setDepth(70);
  const bas = scene.add.rectangle(LARGEUR / 2, HAUTEUR + 40, LARGEUR, 80, 0x000000).setDepth(70);
  scene.tweens.add({ targets: haut, y: 40, duration: 120 });
  scene.tweens.add({ targets: bas, y: HAUTEUR - 40, duration: 120 });
  const bande = scene.add.rectangle(LARGEUR / 2, HAUTEUR / 2, LARGEUR, 170, fond, 0.92).setDepth(71).setScale(1, 0);
  scene.tweens.add({ targets: bande, scaleY: 1, duration: 140, ease: 'Back.Out' });
  // lignes de vitesse horizontales
  const g = scene.add.graphics().setDepth(72);
  g.lineStyle(2, 0xffffff, 0.5);
  for (let i = 0; i < 26; i++) {
    const y = HAUTEUR / 2 - 80 + Math.random() * 160, x = Math.random() * LARGEUR;
    g.lineBetween(x, y, x + 80 + Math.random() * 220, y);
  }
  const t1 = scene.add.text(LARGEUR + 300, HAUTEUR / 2 - 12, titre, {
    fontFamily: POLICE, fontStyle: 'bold italic', fontSize: '64px', color: couleur,
    stroke: '#000000', strokeThickness: 10,
  }).setOrigin(0.5).setDepth(73);
  scene.tweens.add({ targets: t1, x: LARGEUR / 2, duration: 220, ease: 'Cubic.Out' });
  const t2 = scene.add.text(LARGEUR / 2, HAUTEUR / 2 + 50, sousTitre || '', {
    fontFamily: POLICE, fontSize: '22px', color: '#ffffff', stroke: '#000000', strokeThickness: 4,
  }).setOrigin(0.5).setDepth(73);
  elements.push(haut, bas, bande, g, t1, t2);
  if (image) {
    const img = scene.add.image(-200, HAUTEUR / 2, image).setDepth(72).setDisplaySize(196, 170);
    scene.tweens.add({ targets: img, x: 110, duration: 200, ease: 'Cubic.Out' });
    elements.push(img);
  }
  return {
    fermer() {
      elements.forEach(e => scene.tweens.add({ targets: e, alpha: 0, duration: 150, onComplete: () => e.destroy() }));
    },
  };
}

// Bulle de dialogue au-dessus d'un boxeur
export function bulle(scene, x, y, message, duree = 1800) {
  const t = scene.add.text(x, y, message, {
    fontFamily: POLICE, fontSize: '18px', color: '#111111', backgroundColor: '#ffffff',
    padding: { x: 10, y: 6 }, wordWrap: { width: 320 }, align: 'center',
  }).setOrigin(0.5, 1).setDepth(65);
  scene.tweens.add({ targets: t, alpha: 0, delay: duree, duration: 300, onComplete: () => t.destroy() });
  return t;
}

// Gouttes de sueur / salive qui volent après un gros coup
export function gouttes(scene, x, y, sens = 1) {
  for (let i = 0; i < 6; i++) {
    const c = scene.add.circle(x, y, Phaser.Math.Between(2, 4), 0xdff6ff).setDepth(52);
    scene.tweens.add({
      targets: c,
      x: x + sens * Phaser.Math.Between(30, 90), y: y + Phaser.Math.Between(-50, 30),
      alpha: 0, duration: 400, onComplete: () => c.destroy(),
    });
  }
}
