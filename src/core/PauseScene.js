// Pause (touche Échap ou P, ou bouton II sur mobile) : reprendre, régler les volumes, quitter,
// ou ouvrir le MENU DE TEST (comme F1 : seul moyen d'y aller sur téléphone).
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
      ...(this.sceneCommandes() ? [{ libelle: () => 'Commandes du clavier', action: () => this.commandes() }] : []),
      { libelle: () => 'Abandonner (retour au hub)', action: () => this.quitter() },
      { libelle: () => 'Menu de test (aller à un combat)', action: () => this.menuTest() },
    ];
    const pas = this.choix.length > 6 ? 48 : 55;
    this.lignes = this.choix.map((c, i) => texte(this, LARGEUR / 2, 160 + i * pas, '', 24, '#ffffff'));
    // au doigt : toucher une ligne la choisit, la toucher encore la valide
    this.lignes.forEach((l, i) => l.setInteractive({ useHandCursor: true }).on('pointerdown', () => {
      const c = this.choix[i];
      if (this.index !== i) { this.index = i; this.majAffichage(); if (!c.action) return; }
      if (c.action) c.action();
    }));
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

  // jeu en pause qui sait afficher son écran de commandes (Julien, sur PC) : méthode ouvrirCommandes(retour)
  sceneCommandes() {
    if (estTactile()) return null;
    return this.enPause.map(k => this.scene.get(k)).find(s => s && typeof s.ouvrirCommandes === 'function'
      && (!s.commandesDisponibles || s.commandesDisponibles())) || null;
  }

  // ferme la pause, montre l'écran de commandes du jeu, puis rouvre la pause en sortant
  commandes() {
    const s = this.sceneCommandes(), jeu = this.game;
    this.reprendre();
    s.ouvrirCommandes(() => basculerPause(jeu));
  }

  reprendre() {
    etiquettesTactiles(this.etiquettesAvant);
    this.enPause.forEach(k => this.scene.resume(k));
    this.scene.stop();
  }

  // ferme la pause et ouvre le menu de test à sa place (le jeu reste en pause derrière)
  menuTest() {
    this.scene.stop();
    this.scene.start('MenuTest', { enPause: this.enPause, etiquettes: this.etiquettesAvant });
    this.scene.bringToTop('MenuTest');
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
