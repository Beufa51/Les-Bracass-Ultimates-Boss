// Menu de test caché (touche F1) : lance n'importe quel boss / phase,
// ou remet la sauvegarde à zéro.
import { LARGEUR, HAUTEUR } from './reglages.js';
import { texte, voile } from './ui.js';
import { creerTouches, vientDAppuyer } from './clavier.js';
import { Sauvegarde } from './sauvegarde.js';
import { BOSS, MODELE } from '../bosses/liste.js';

export class MenuTestScene extends Phaser.Scene {
  constructor() { super('MenuTest'); }

  init(donnees) {
    this.enPause = donnees.enPause || [];
    this.confirmation = false;
  }

  create() {
    this.choix = [];
    for (const boss of [...BOSS, MODELE]) {
      if (!boss.pret) {
        this.choix.push({ libelle: `${boss.nom} (Bientôt)`, action: () => this.lancer('Bientot', { bossId: boss.id }) });
      } else {
        for (const ph of boss.phases) {
          this.choix.push({ libelle: `${boss.nom} - ${ph.nom}`, action: () => this.lancer(ph.scene, { phase: ph.id }) });
        }
      }
    }
    this.choix.push({ libelle: 'Retour au hub', action: () => this.lancer('Hub', {}) });
    this.choix.push({ libelle: 'Remettre la sauvegarde à zéro', action: () => this.reset() });
    this.choix.push({ libelle: 'Fermer le menu (F1)', action: () => this.fermer() });

    voile(this, 0.9);
    texte(this, LARGEUR / 2, 34, 'MENU DE TEST', 30, '#ffd84a');
    texte(this, LARGEUR / 2, HAUTEUR - 22, 'Haut/Bas : choisir   Espace : valider   F1 : fermer', 16, '#aaaaaa');

    this.lignes = this.choix.map((c, i) =>
      texte(this, LARGEUR / 2, 0, c.libelle, 20, '#ffffff'));
    this.index = 0;
    this.touches = creerTouches(this);
    this.majAffichage();
  }

  majAffichage() {
    // le menu défile si la liste est trop longue pour l'écran
    const visibles = 18, hauteurLigne = 25;
    const debut = Phaser.Math.Clamp(this.index - Math.floor(visibles / 2), 0, Math.max(0, this.choix.length - visibles));
    this.lignes.forEach((l, i) => {
      const pos = i - debut;
      l.setVisible(pos >= 0 && pos < visibles);
      l.y = 80 + pos * hauteurLigne;
      const actif = i === this.index;
      let libelle = this.choix[i].libelle;
      if (actif && this.confirmation) libelle = 'Sûr ? Espace pour CONFIRMER';
      l.setText((actif ? '> ' : '  ') + libelle + (actif ? ' <' : '  '));
      l.setColor(actif ? '#7fff7f' : '#ffffff');
    });
  }

  update() {
    const t = this.touches;
    if (vientDAppuyer(t.haut)) { this.index = (this.index + this.choix.length - 1) % this.choix.length; this.confirmation = false; this.majAffichage(); }
    if (vientDAppuyer(t.bas)) { this.index = (this.index + 1) % this.choix.length; this.confirmation = false; this.majAffichage(); }
    if (vientDAppuyer(t.espace)) this.choix[this.index].action();
  }

  reset() {
    if (!this.confirmation) { this.confirmation = true; this.majAffichage(); return; }
    Sauvegarde.remettreAZero();
    this.lancer('Hub', {});
  }

  lancer(cle, donnees) {
    this.enPause.forEach(k => this.scene.stop(k));
    this.scene.start(cle, donnees);
  }

  fermer() {
    this.enPause.forEach(k => this.scene.resume(k));
    this.scene.stop();
  }
}

// Ouvre ou ferme le menu (appelé quand on appuie sur F1)
export function basculerMenuTest(jeu) {
  const sm = jeu.scene;
  if (sm.isActive('Chargement')) return;
  if (sm.isActive('MenuTest')) { sm.getScene('MenuTest').fermer(); return; }
  const actives = sm.getScenes(true).map(s => s.scene.key);
  actives.forEach(k => sm.pause(k));
  sm.start('MenuTest', { enPause: actives });
  sm.bringToTop('MenuTest');
}
