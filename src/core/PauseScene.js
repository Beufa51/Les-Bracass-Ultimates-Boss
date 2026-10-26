// Pause (touche Échap ou P, ou bouton II sur mobile) : reprendre, régler les volumes, quitter.
import { LARGEUR, HAUTEUR } from './reglages.js';
import { texte, voile } from './ui.js';
import { creerTouches, vientDAppuyer } from './clavier.js';
import { Sauvegarde } from './sauvegarde.js';
import { majVolumeMusique } from './musique.js';
import { etiquettesTactiles, etiquettesActuelles, estTactile } from './tactile.js';
import { taireAnnonceur } from './annonceur.js';

// scènes où la pause n'a pas de sens
const SANS_PAUSE = ['Chargement', 'MenuTest', 'Pause'];

export class PauseScene extends Phaser.Scene {
  constructor() { super('Pause'); }

  init(donnees) { this.enPause = donnees.enPause || []; this.etiquettesAvant = etiquettesActuelles(); }

  create() {
    taireAnnonceur();
    voile(this, 0.8);
    texte(this, LARGEUR / 2, 70, 'PAUSE', 48, '#ffd84a');
    this.choix = [
      { libelle: () => 'Reprendre', action: () => this.reprendre() },
      { libelle: () => `Musique : ${this.jauge('musique')}`, reglage: 'musique' },
      { libelle: () => `Bruitages : ${this.jauge('sons')}`, reglage: 'sons' },
      { libelle: () => `Voix : ${this.jauge('voix')}`, reglage: 'voix' },
      { libelle: () => 'Abandonner (retour au hub)', action: () => this.quitter() },
    ];
    this.lignes = this.choix.map((c, i) => texte(this, LARGEUR / 2, 170 + i * 55, '', 24, '#ffffff'));
    texte(this, LARGEUR / 2, HAUTEUR - 40,
      estTactile() ? '▲ ▼ : choisir   ◀ ▶ : volume   OK : valider' : 'Haut/Bas : choisir   Gauche/Droite : volume   Espace : valider   Échap : reprendre',
      15, '#aaaaaa');
    this.index = 0;
    this.touches = creerTouches(this);
    etiquettesTactiles({ z: null, x: null, espace: 'OK' });
    this.majAffichage();
  }

  jauge(type) {
    const v = Math.round(Sauvegarde.volume(type) * 10);
    return '■'.repeat(v) + '·'.repeat(10 - v) + `  ${v * 10} %`;
  }

  majAffichage() {
    this.lignes.forEach((l, i) => {
      const actif = i === this.index;
      l.setText((actif ? '> ' : '  ') + this.choix[i].libelle() + (actif ? ' <' : '  ')).setColor(actif ? '#7fff7f' : '#ffffff');
    });
  }

  update() {
    const t = this.touches, c = this.choix[this.index];
    if (vientDAppuyer(t.haut)) { this.index = (this.index + this.choix.length - 1) % this.choix.length; this.majAffichage(); }
    if (vientDAppuyer(t.bas)) { this.index = (this.index + 1) % this.choix.length; this.majAffichage(); }
    if (c.reglage && (vientDAppuyer(t.gauche) || vientDAppuyer(t.droite))) {
      const pas = t.gauche.isDown ? -0.1 : 0.1;
      Sauvegarde.reglerVolume(c.reglage, Sauvegarde.volume(c.reglage) + pas);
      if (c.reglage === 'musique') majVolumeMusique();
      this.majAffichage();
    }
    if (vientDAppuyer(t.espace) && c.action) c.action();
  }

  reprendre() {
    etiquettesTactiles(this.etiquettesAvant);
    this.enPause.forEach(k => this.scene.resume(k));
    this.scene.stop();
  }

  quitter() {
    this.enPause.forEach(k => this.scene.stop(k));
    this.scene.stop();
    this.scene.start('Hub');
  }
}

// Ouvre ou ferme la pause
export function basculerPause(jeu) {
  const sm = jeu.scene;
  if (sm.isActive('Pause')) { sm.getScene('Pause').reprendre(); return; }
  const actives = sm.getScenes(true).map(s => s.scene.key);
  if (!actives.length || actives.some(k => SANS_PAUSE.includes(k))) return;
  actives.forEach(k => sm.pause(k));
  sm.start('Pause', { enPause: actives });
  sm.bringToTop('Pause');
}
