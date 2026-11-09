// =====================================================================
// HUB : écran de SÉLECTION DES BOSS, façon Mega Man (nov. 2026, remplace la salle aux 6 portes).
// Grille 3 x 2 : les 6 boss, rien d'autre. Bandeau du bas : badges (5 appuis = réglages développeur) et LA FIN.
// Un boss pas encore battu n'apparaît qu'en OMBRE (même à l'entrée) : on découvre son design en le battant.
// Flèches = déplacer le curseur, Espace = combattre ; au doigt / à la souris : toucher une case = combattre direct (retour Fabien nov. 2026).
// Musique : hub_musique (assets/audio/hub/). Images : outils/hub/preparer_selection.py.
// =====================================================================
import { LARGEUR, HAUTEUR } from '../core/reglages.js';
import { texte } from '../core/ui.js';
import { creerTouches, vientDAppuyer } from '../core/clavier.js';
import { Sauvegarde, formatTemps, SCENES_REPRISE } from '../core/sauvegarde.js';
import { ouvrirProgression } from './progression.js';
import { jouerSon } from '../core/ressources.js';
import { jouerMusique } from '../core/musique.js';
import { BOSS } from '../bosses/liste.js';
import { REGLAGES_HUB as R } from './reglages.js';
import { estTactile, etiquettesTactiles, montrerBoutonPause } from '../core/tactile.js';
import { ouvrirReglagesDev } from '../core/ReglagesDevScene.js';

// place de chaque case dans la grille (colonne, ligne)
const PLACES = { beufa: [0, 0], kedric: [1, 0], julien: [2, 0], greg: [0, 1], remi: [1, 1], lionel: [2, 1] };

export class HubScene extends Phaser.Scene {
  constructor() { super('Hub'); }

  init(donnees) { this.depuis = donnees && donnees.depuis; }

  create() {
    this.entree = false;
    // avis jouabilité : au hub, on touche les cases (plus de croix inutile), et pas de bouton pause (il cachait le titre)
    etiquettesTactiles({ espace: null, z: null, x: null, haut: null, bas: null, gauche: null, droite: null });
    montrerBoutonPause(false);
    this.events.once('shutdown', () => montrerBoutonPause(true));
    jouerMusique(this, 'hub_musique');
    const nb = BOSS.filter(b => Sauvegarde.aLeBadge(b.id)).length;
    this.complet = nb >= BOSS.length;

    // ---- fond : bleu vif + bandes claires qui défilent (façon Mega Man) ----
    this.add.rectangle(LARGEUR / 2, HAUTEUR / 2, LARGEUR, HAUTEUR, 0x2d6fe0);
    this.bandes = this.add.graphics();
    this.decalage = 0;
    texte(this, LARGEUR / 2, 30, 'CHOISIS TON ADVERSAIRE', 30, '#ffd84a', { fontStyle: 'bold', stroke: '#b3202c', strokeThickness: 6 });

    // ---- les cases ----
    this.cases = [];
    for (const boss of BOSS) {
      const p = PLACES[boss.id]; if (!p) continue;
      this.cases.push(this.caseBoss(boss, ...this.position(p)));
    }
    this.bandeauBas(nb);

    // curseur : sur le boss d'où l'on revient, sinon sur le premier pas encore battu
    const retour = this.cases.find(c => c.boss && c.boss.id === this.depuis);
    const aBattre = this.cases.find(c => c.boss && c.boss.pret && !Sauvegarde.aLeBadge(c.boss.id));
    this.choix = retour || aBattre || this.cases[0];
    this.cadreChoix = this.add.graphics().setDepth(5);

    this.aide = texte(this, 590, R.bandeauY,
      estTactile() ? 'Touche un boss pour le voir, touche-le encore pour combattre' : '◀ ▲ ▼ ▶ choisir   ESPACE combattre', 14, '#c8d8ff');
    this.infos = texte(this, LARGEUR / 2, R.infosY, '', 18, '#ffffff', { stroke: '#0a1440', strokeThickness: 5 });
    this.touches = creerTouches(this);
    this.input.on('pointerdown', (p) => this.toucher(p.x, p.y));
    this.input.keyboard.on('keydown-D', () => ouvrirReglagesDev(this.game));
    this.input.keyboard.on('keydown-F', () => { if (this.complet) this.voirFin(); });
    // (audit méta) tableau de PROGRESSION + sauvegarde à recopier : bouton en haut à droite, ou T
    const prog = texte(this, LARGEUR - 84, 30, estTactile() ? '📋 PROGRÈS' : '📋 PROGRÈS (T)', 18, '#ffffff',
      { fontStyle: 'bold', backgroundColor: '#0a1440', padding: { x: 8, y: 6 } }).setInteractive().setDepth(6);
    prog.on('pointerdown', (p, x, y, ev) => { ev.stopPropagation(); this.progression(); });
    this.input.keyboard.on('keydown-T', () => this.progression());
    this.cameras.main.fadeIn(250);
    this.majChoix();
    if (this.complet && !Sauvegarde.fait('finale_vue')) { Sauvegarde.marquerFait('finale_vue'); this.time.delayedCall(700, () => this.voirFin()); }
  }

  position([col, ligne]) {
    return [LARGEUR / 2 + (col - 1) * (R.caseL + R.ecart), R.grilleY + ligne * (R.caseH + R.ecart)];
  }

  // cadre « métal » d'une case
  cadre(x, y, couleur = 0x3a5fcd) {
    const g = this.add.graphics();
    g.fillStyle(0x0b1638, 1).fillRect(x - R.caseL / 2, y - R.caseH / 2, R.caseL, R.caseH);
    g.lineStyle(4, couleur, 1).strokeRect(x - R.caseL / 2, y - R.caseH / 2, R.caseL, R.caseH);
    g.lineStyle(1, 0xa8c4ff, 0.5).strokeRect(x - R.caseL / 2 + 5, y - R.caseH / 2 + 5, R.caseL - 10, R.caseH - 10);
    return g;
  }

  caseBoss(boss, x, y) {
    const battu = Sauvegarde.aLeBadge(boss.id);
    this.cadre(x, y, battu ? 0xd4a52a : 0x3a5fcd);
    const cle = battu ? 'select_' + boss.id : 'select_' + boss.id + '_ombre';
    const img = this.textures.exists(cle) ? this.add.image(x, y + R.caseH / 2 - 26, cle).setOrigin(0.5, 1) : null;
    if (img) img.setScale(Math.min((R.caseL - 16) / img.width, (R.caseH - 34) / img.height));
    // bandeau du nom
    this.add.rectangle(x, y + R.caseH / 2 - 13, R.caseL - 8, 22, 0x000000, 0.85);
    texte(this, x, y + R.caseH / 2 - 13, boss.nom.toUpperCase(), 17, battu ? '#ffd84a' : '#ffffff', { fontStyle: 'bold' });
    if (battu) this.add.image(x + R.caseL / 2 - 22, y - R.caseH / 2 + 22, 'badge_' + boss.id).setScale(0.75);
    if (!boss.pret) texte(this, x, y - 10, 'BIENTÔT', 18, '#ffb347', { stroke: '#000000', strokeThickness: 4 });
    else if (!battu) texte(this, x + R.caseL / 2 - 18, y - R.caseH / 2 + 18, '?', 22, '#5aa8ff', { fontStyle: 'bold' });
    const rec = boss.pret && Sauvegarde.record(boss.id);
    // (analyse comparée) ta meilleure lettre de rang, en tampon dans le coin (comme les étoiles d'Angry Birds)
    if (rec) {
      const tampon = texte(this, x - R.caseL / 2 + 26, y - R.caseH / 2 + 26, rec.rang, 30, rec.rang === 'S' ? '#ffd84a' : '#ffffff',
        { fontStyle: 'bold', stroke: '#b3202c', strokeThickness: 6 }).setAngle(-12);
      if (rec.rang === 'S') this.tweens.add({ targets: tampon, scale: 1.12, yoyo: true, repeat: -1, duration: 700 });
    }
    // (analyse comparée, façon Mario Party) une fiche d'une ligne : genre · durée · commandes
    const fiche = R.fiches[boss.id] ? `   —   ${R.fiches[boss.id]}` : '';
    const info = !boss.pret ? `${boss.nom} : bientôt...` : battu
      ? `${boss.nom} : battu !${rec ? ` Record ${rec.rang} en ${formatTemps(rec.temps)}` : ''}${fiche}`
      : `${boss.nom}${fiche}`;
    return { boss, x, y, img, info, action: () => this.entrer(boss) };
  }

  // bandeau du bas : les badges (5 appuis rapides = réglages développeur) et LA FIN quand les 6 badges sont là
  bandeauBas(nb) {
    const y = R.bandeauY;
    this.add.rectangle(LARGEUR / 2, y, LARGEUR, 40, 0x0a1440, 0.85);
    const zoneBadges = this.add.zone(170, y, 330, 40).setInteractive();
    texte(this, 50, y, `${nb}/${BOSS.length}`, 16, '#ffffff', { fontStyle: 'bold' });
    BOSS.forEach((boss, i) => this.add.image(100 + i * 42, y, Sauvegarde.aLeBadge(boss.id) ? 'badge_' + boss.id : 'badge_vide').setScale(0.7));
    let appuis = [];
    zoneBadges.on('pointerdown', () => {
      const t = this.time.now;
      appuis = [...appuis.filter(a => t - a < 2500), t];
      if (appuis.length >= 5) { appuis = []; ouvrirReglagesDev(this.game); }
    });
    if (this.complet) {
      const fin = texte(this, LARGEUR - 110, y, `★ LA FIN ★${estTactile() ? '' : ' (F)'}`, 17, '#ffd84a', { fontStyle: 'bold' })
        .setInteractive().on('pointerdown', () => this.voirFin());
      this.tweens.add({ targets: fin, scale: 1.08, yoyo: true, repeat: -1, duration: 600 });
    }
  }

  majChoix() {
    const c = this.choix, g = this.cadreChoix;
    g.clear();
    g.lineStyle(9, 0xffd84a, 1).strokeRect(c.x - R.caseL / 2 - 5, c.y - R.caseH / 2 - 5, R.caseL + 10, R.caseH + 10);   // cadre jaune épais : bien visible sur le fond bleu
    this.infos.setText(c.info || '');
    this.cases.forEach(k => { if (k.img) { this.tweens.killTweensOf(k.img); k.img.setY(k.y + R.caseH / 2 - 26); } });
    if (c.img) this.tweens.add({ targets: c.img, y: c.img.y - 5, yoyo: true, repeat: -1, duration: 260 });
  }

  bouger(dc, dl) {
    const [col, ligne] = [Math.round((this.choix.x - LARGEUR / 2) / (R.caseL + R.ecart)) + 1, Math.round((this.choix.y - R.grilleY) / (R.caseH + R.ecart))];
    const [x, y] = this.position([(col + dc + 3) % 3, (ligne + dl + 2) % 2]);
    const c = this.cases.find(k => Math.abs(k.x - x) < 2 && Math.abs(k.y - y) < 2);
    if (c) { this.choix = c; jouerSon(this, 'ui_valider'); this.majChoix(); }
  }

  valider(c = this.choix) {
    if (c.secret) c.secret();
    if (c.action) c.action();
  }

  update(temps, delta) {
    // bandes du fond qui défilent
    this.decalage = (this.decalage + delta * 0.03) % 40;
    const b = this.bandes; b.clear(); b.lineStyle(14, 0x4b8cf2, 1);
    for (let y = -40 + this.decalage; y < HAUTEUR + 40; y += 40) b.lineBetween(0, y, LARGEUR, y - 60);
    // cadre du choix qui clignote
    this.cadreChoix.setAlpha(Math.floor(temps / 180) % 2 ? 1 : 0.45);
    if (this.entree) return;
    const t = this.touches;
    if (vientDAppuyer(t.gauche)) this.bouger(-1, 0);
    else if (vientDAppuyer(t.droite)) this.bouger(1, 0);
    else if (vientDAppuyer(t.haut)) this.bouger(0, -1);
    else if (vientDAppuyer(t.bas)) this.bouger(0, 1);
    else if (vientDAppuyer(t.espace)) this.valider();
  }

  // nov. 2026 (Fabien) : 1er toucher = choisir la case (on la voit), 2e toucher sur la MÊME case = l'affronter
  toucher(x, y) {
    if (this.entree) return;
    const c = this.cases.find(k => Math.abs(k.x - x) < (R.caseL + R.ecart) / 2 && Math.abs(k.y - y) < (R.caseH + R.ecart) / 2);
    if (!c) return;
    if (c !== this.choix) { this.choix = c; jouerSon(this, 'ui_valider'); this.majChoix(); return; }
    this.valider(c);
  }

  progression() {
    if (this.entree) return;
    this.entree = true;
    ouvrirProgression(this, () => { this.entree = false; });
  }

  voirFin() { if (this.entree) return; this.entree = true; this.scene.start('Finale'); }

  // façon Mega Man : la case s'illumine, le boss apparaît en grand dans une bande, puis on part chez lui
  entrer(boss) {
    this.entree = true;
    jouerSon(this, 'hub_porte');
    const bande = this.add.rectangle(LARGEUR / 2, HAUTEUR / 2, LARGEUR, 190, 0x0b1638, 0.97).setDepth(20).setScale(1, 0);
    this.tweens.add({ targets: bande, scaleY: 1, duration: 220, ease: 'Cubic.Out' });
    const battu = Sauvegarde.aLeBadge(boss.id);   // pas encore battu : on ne voit toujours que son OMBRE
    const cle = ['select_' + boss.id + (battu ? '' : '_ombre')].find(k => this.textures.exists(k)) || null;
    if (cle) {
      const img = this.add.image(-120, HAUTEUR / 2 + 95, cle).setOrigin(0.5, 1).setDepth(21).setScale(0.95);
      this.tweens.add({ targets: img, x: 300, duration: 300, delay: 150, ease: 'Back.Out' });
    }
    if (!battu) texte(this, 640, HAUTEUR / 2 + 50, '???', 22, '#5aa8ff').setDepth(21);
    const nom = texte(this, 640, HAUTEUR / 2, '', 52, '#ffd84a', { fontStyle: 'bold italic', stroke: '#b3202c', strokeThickness: 8 }).setDepth(21);
    const lettres = boss.nom.toUpperCase();
    for (let i = 1; i <= lettres.length; i++) this.time.delayedCall(250 + i * 70, () => { nom.setText(lettres.slice(0, i)); jouerSon(this, 'ui_valider'); });
    this.time.delayedCall(250 + lettres.length * 70 + 700, () => {
      const partir = (scene, donnees) => {
        this.cameras.main.fadeOut(250);
        this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start(scene, donnees));
      };
      if (!boss.pret) return partir('Bientot', { bossId: boss.id });
      const debut = () => { Sauvegarde.oublierReprise(boss.id); partir(boss.phases[0].scene, { phase: boss.phases[0].id }); };
      const r = Sauvegarde.reprise(boss.id), etape = r && SCENES_REPRISE[r.scene];
      if (!etape) return debut();
      this.choixReprise(etape, r, () => partir(r.scene, r.donnees), debut);
    });
  }

  // (audit méta) boss en plusieurs jeux laissé en cours : REPRENDRE à l'étape atteinte, ou repartir du DÉBUT
  choixReprise(etape, r, reprendre, debut) {
    const ph = r.donnees && r.donnees.reprise && r.donnees.reprise.phase;
    const y = HAUTEUR / 2 + 140;
    this.add.rectangle(LARGEUR / 2, y, LARGEUR, 110, 0x0a1440, 0.95).setDepth(22);
    texte(this, LARGEUR / 2, y - 32, `Tu t'étais arrêté ${etape.nom}${ph ? ` (phase ${ph})` : ''}`, 20, '#ffffff').setDepth(23);
    const options = [
      { x: LARGEUR / 2 - 170, txt: '▶ REPRENDRE', f: reprendre },
      { x: LARGEUR / 2 + 170, txt: '⟲ DEPUIS LE DÉBUT', f: debut },
    ];
    let i = 0, fait = false;
    const boutons = options.map((o, k) => texte(this, o.x, y + 14, o.txt, 24, '#ffd84a',
      { fontStyle: 'bold', backgroundColor: '#1d3a8a', padding: { x: 14, y: 8 } }).setDepth(23).setInteractive());
    const maj = () => boutons.forEach((b, k) => b.setAlpha(k === i ? 1 : 0.5).setScale(k === i ? 1.08 : 1));
    const choisir = (k) => {
      if (fait) return; fait = true;
      this.input.keyboard.off('keydown', touche);
      jouerSon(this, 'ui_valider'); options[k].f();
    };
    const touche = (ev) => {
      if (ev.key === 'ArrowLeft' || ev.key === 'ArrowRight') { i = 1 - i; maj(); jouerSon(this, 'ui_valider'); }
      else if (ev.key === ' ' || ev.key === 'Enter') choisir(i);
    };
    boutons.forEach((b, k) => b.on('pointerdown', () => choisir(k)));
    this.input.keyboard.on('keydown', touche);
    this.events.once('shutdown', () => this.input.keyboard.off('keydown', touche));
    maj();
  }
}
