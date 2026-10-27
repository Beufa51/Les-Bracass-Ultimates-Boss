// Écran des RÉGLAGES DÉVELOPPEUR (caché) : choisir un boss, puis régler ses chiffres (voir reglagesDev.js).
// Accès : 5 appuis rapides sur « Badges » dans le hub (ou touche D dans le hub), ou le menu de test (F1).
// ▲ ▼ : choisir   ◀ ▶ : changer la valeur   Espace : remettre la valeur par défaut   X : retour
import { LARGEUR, HAUTEUR } from './reglages.js';
import { texte, voile } from './ui.js';
import { creerTouches, vientDAppuyer } from './clavier.js';
import { estTactile, etiquettesTactiles, etiquettesActuelles } from './tactile.js';
import { changerReglage, remettreReglage, remettreTout, estChange, valeurDefaut, texteValeur } from './reglagesDev.js';
import { BOSS, MODELE } from '../bosses/liste.js';

export class ReglagesDevScene extends Phaser.Scene {
  constructor() { super('ReglagesDev'); }

  init(donnees) { this.enPause = donnees.enPause || []; }

  create() {
    this.scene.bringToTop();
    this.etiquettesAvant = etiquettesActuelles();
    etiquettesTactiles({ haut: '▲', bas: '▼', gauche: '◀', droite: '▶', espace: 'OK', z: null, x: 'Retour' });
    voile(this, 0.93);
    this.titre = texte(this, LARGEUR / 2, 30, '', 26, '#ffd84a');
    this.aide = texte(this, LARGEUR / 2, HAUTEUR - 20, '', 15, '#aaaaaa');
    this.lignes = [];
    for (let i = 0; i < 16; i++) this.lignes.push(texte(this, LARGEUR / 2, 72 + i * 26, '', 18, '#ffffff'));
    this.touches = creerTouches(this);
    this.bosses = [...BOSS, MODELE].filter(b => b.reglagesDev && b.reglagesDev.length);
    this.boss = null; this.index = 0; this.confirmation = false;
    this.majAffichage();
  }

  // les lignes de l'écran : la liste des boss, ou les réglages du boss choisi
  choix() {
    if (!this.boss) return [...this.bosses.map(b => ({ boss: b })), { action: 'fermer', libelle: 'Fermer' }];
    return [...this.boss.reglagesDev.map(r => ({ r })), { action: 'tout', libelle: 'Tout remettre par défaut' }, { action: 'retour', libelle: 'Retour à la liste des boss' }];
  }

  majAffichage() {
    const c = this.choix();
    this.titre.setText(this.boss ? `RÉGLAGES DÉVELOPPEUR : ${this.boss.nom.toUpperCase()}` : 'RÉGLAGES DÉVELOPPEUR');
    const ok = estTactile() ? 'OK' : 'Espace';
    this.aide.setText(this.boss ? `▲ ▼ : choisir   ◀ ▶ : changer   ${ok} : valeur par défaut   ${estTactile() ? 'Retour' : 'X'} : retour   (gardé dans ce navigateur)`
      : `▲ ▼ : choisir   ${ok} : ouvrir   ${estTactile() ? 'Retour' : 'X'} : fermer`);
    const visibles = this.lignes.length;
    const debut = Phaser.Math.Clamp(this.index - Math.floor(visibles / 2), 0, Math.max(0, c.length - visibles));
    this.lignes.forEach((l, k) => {
      const i = debut + k, item = c[i];
      if (!item) { l.setVisible(false); return; }
      const actif = i === this.index;
      let t, couleur = '#ffffff';
      if (item.boss) t = item.boss.nom;
      else if (item.r) {
        const r = item.r, change = estChange(this.boss, r);
        t = `${r.groupe ? r.groupe + ' · ' : ''}${r.nom} : ${texteValeur(r.objet[r.champ])}` + (change ? `   (défaut ${texteValeur(valeurDefaut(this.boss, r))})` : '');
        if (change) couleur = '#ffd84a';
      } else t = actif && this.confirmation ? 'Sûr ? appuie encore pour CONFIRMER' : item.libelle;
      l.setVisible(true).setText((actif ? '> ' : '  ') + t + (actif ? ' <' : '  ')).setColor(actif ? '#7fff7f' : couleur);
    });
  }

  update() {
    const t = this.touches, c = this.choix(), item = c[this.index];
    const bouge = (n) => { this.index = (this.index + c.length + n) % c.length; this.confirmation = false; this.majAffichage(); };
    if (vientDAppuyer(t.haut)) bouge(-1);
    if (vientDAppuyer(t.bas)) bouge(1);
    if (item.r && vientDAppuyer(t.gauche)) { changerReglage(this.boss, item.r, -1); this.majAffichage(); }
    if (item.r && vientDAppuyer(t.droite)) { changerReglage(this.boss, item.r, 1); this.majAffichage(); }
    if (vientDAppuyer(t.x)) { if (this.boss) this.ouvrir(null); else this.fermer(); return; }
    if (!vientDAppuyer(t.espace)) return;
    if (item.boss) this.ouvrir(item.boss);
    else if (item.r) { remettreReglage(this.boss, item.r); this.majAffichage(); }
    else if (item.action === 'retour') this.ouvrir(null);
    else if (item.action === 'fermer') this.fermer();
    else if (item.action === 'tout') {
      if (!this.confirmation) { this.confirmation = true; this.majAffichage(); return; }
      remettreTout(this.boss); this.confirmation = false; this.majAffichage();
    }
  }

  ouvrir(boss) {
    const avant = this.boss;
    this.boss = boss; this.confirmation = false;
    this.index = boss ? 0 : Math.max(0, this.bosses.indexOf(avant));
    this.majAffichage();
  }

  fermer() {
    etiquettesTactiles(this.etiquettesAvant);
    this.enPause.forEach(k => this.scene.resume(k));
    this.scene.stop();
  }
}

// Ouvre l'écran par-dessus le jeu en cours (mis en pause)
export function ouvrirReglagesDev(jeu) {
  const sm = jeu.scene;
  if (sm.isActive('ReglagesDev')) return;
  const actives = sm.getScenes(true).map(s => s.scene.key).filter(k => k !== 'MenuTest');
  if (sm.isActive('MenuTest')) sm.stop('MenuTest');
  actives.forEach(k => sm.pause(k));
  sm.start('ReglagesDev', { enPause: actives });
  sm.bringToTop('ReglagesDev');
}
