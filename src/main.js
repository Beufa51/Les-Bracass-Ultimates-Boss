// Point de départ du jeu : crée la fenêtre Phaser et la liste des scènes.
import { LARGEUR, HAUTEUR } from './core/reglages.js';
import { ChargementScene } from './core/ChargementScene.js';
import { BientotScene } from './core/BientotScene.js';
import { MenuTestScene, basculerMenuTest } from './core/MenuTestScene.js';
import { HubScene } from './hub/HubScene.js';
import { BOSS, MODELE } from './bosses/liste.js';
import { installerTactile, installerBoutonPause } from './core/tactile.js';
import { PauseScene, basculerPause } from './core/PauseScene.js';
import { verifierClips } from './core/clips.js';
import { installerMusiques } from './core/musique.js';
import { enregistrer } from './core/manifestes.js';
import { MANIFESTE as MANIFESTE_COMMUN } from '../assets/manifeste.js';

// Visuels et sons : ceux du moteur commun (hub, badges) + ceux de chaque boss (chacun dans son dossier)
enregistrer(MANIFESTE_COMMUN);
for (const b of [...BOSS, MODELE]) if (b.manifeste) enregistrer(b.manifeste, b.id);

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
  scene: [ChargementScene, HubScene, BientotScene, MenuTestScene, PauseScene, ...scenesDesBoss],
});

// Touche F1 : menu de test caché
window.addEventListener('keydown', (e) => {
  if (e.key === 'F1') {
    e.preventDefault();
    if (!e.repeat) basculerMenuTest(jeu);
  }
  // Échap ou P : pause
  if ((e.key === 'Escape' || e.key === 'p' || e.key === 'P') && !e.repeat) basculerPause(jeu);
});

// Boutons tactiles (seulement sur smartphone / tablette)
installerTactile();
installerBoutonPause(() => basculerPause(jeu));
verifierClips();
installerMusiques();

window.jeu = jeu;
