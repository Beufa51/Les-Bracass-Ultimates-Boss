// Point de départ du jeu : crée la fenêtre Phaser et la liste des scènes.
import { LARGEUR, HAUTEUR } from './core/reglages.js';
import { ChargementScene } from './core/ChargementScene.js';
import { BientotScene } from './core/BientotScene.js';
import { MenuTestScene, basculerMenuTest } from './core/MenuTestScene.js';
import { HubScene } from './hub/HubScene.js';
import { BOSS, MODELE } from './bosses/liste.js';
import { installerTactile } from './core/tactile.js';

const scenesDesBoss = [...BOSS, MODELE].flatMap(b => b.scenes);

const jeu = new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'jeu',
  width: LARGEUR,
  height: HAUTEUR,
  backgroundColor: '#111111',
  // dessins lissés (mettre pixelArt: true seulement si TOUS les visuels deviennent du pixel art)
  pixelArt: false,
  antialias: true,
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
  scene: [ChargementScene, HubScene, BientotScene, MenuTestScene, ...scenesDesBoss],
});

// Touche F1 : menu de test caché
window.addEventListener('keydown', (e) => {
  if (e.key === 'F1') {
    e.preventDefault();
    if (!e.repeat) basculerMenuTest(jeu);
  }
});

// Boutons tactiles (seulement sur smartphone / tablette)
installerTactile();

window.jeu = jeu;
