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
import { rangRecord } from '../bosses/rangs.js';
import { rangLisible } from '../core/rangs.js';
import { jouerSon } from '../core/ressources.js';
import { jouerMusique } from '../core/musique.js';
import { BOSS } from '../bosses/liste.js';
import { REGLAGES_HUB as R } from './reglages.js';
import { estTactile, etiquettesTactiles, montrerBoutonPause } from '../core/tactile.js';
import { ouvrirReglagesDev } from '../core/ReglagesDevScene.js';

// place de chaque case (colonne 0 = gauche, 2 = droite ; ligne 0 à 2). La colonne 1 = la case du BOSS FINAL.
const PLACES = { beufa: [0, 0], kedric: [0, 1], julien: [0, 2], greg: [2, 0], remi: [2, 1], lionel: [2, 2] };

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
    this.cases.push(this.caseFinale(nb));
    this.bandeauBas(nb);

    // curseur : sur le boss d'où l'on revient, sinon sur le premier pas encore battu
    const retour = this.cases.find(c => c.boss && c.boss.id === this.depuis);
    const aBattre = this.cases.find(c => c.boss && c.boss.pret && !Sauvegarde.aLeBadge(c.boss.id));
    this.choix = retour || aBattre || this.cases[0];
    this.cadreChoix = this.add.graphics().setDepth(5);

    this.aide = texte(this, 590, R.bandeauY,
      estTactile() ? 'Touche un boss pour le voir, touche-le encore pour combattre' : '◀ ▲ ▼ ▶ choisir   ESPACE combattre', 14, '#c8d8ff');
    this.infos = texte(this, LARGEUR / 2, R.infosY, '', 17, '#ffffff', { stroke: '#0a1440', strokeThickness: 5, align: 'center', lineSpacing: 0 });
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
    return [LARGEUR / 2 + (col - 1) * ((R.caseL + R.centre.l) / 2 + R.ecart), R.grilleY + ligne * (R.caseH + R.ecart)];
  }

  // cadre « métal » d'une case
  cadre(x, y, couleur = 0x3a5fcd, l = R.caseL, h = R.caseH) {
    const g = this.add.graphics();
    g.fillStyle(0x0b1638, 1).fillRect(x - l / 2, y - h / 2, l, h);
    g.lineStyle(4, couleur, 1).strokeRect(x - l / 2, y - h / 2, l, h);
    g.lineStyle(1, 0xa8c4ff, 0.5).strokeRect(x - l / 2 + 5, y - h / 2 + 5, l - 10, h - 10);
    return g;
  }

  // la grande case du MILIEU : le BOSS FINAL (le mécha des Bracass'), verrouillée tant que les 6 ne sont pas battus
  caseFinale(nb) {
    const { l, h } = R.centre, x = LARGEUR / 2, y = R.grilleY + R.caseH + R.ecart;
    const ouvert = this.complet;
    this.cadre(x, y, ouvert ? 0xd4a52a : 0x7a3a9a, l, h);
    const cle = ouvert ? 'select_mecha' : 'select_mecha_ombre';
    let img = null;
    if (this.textures.exists(cle)) {
      img = this.add.image(x, y + h / 2 - 30, cle).setOrigin(0.5, 1);
      img.setScale(Math.min((l - 16) / img.width, (h - 40) / img.height));
    } else {   // (en attendant l'image du mécha : un grand « ? » ou un éclair)
      texte(this, x, y - 30, ouvert ? '⚡' : '?', ouvert ? 110 : 130, ouvert ? '#ffd84a' : '#5a3a7a', { fontStyle: 'bold' });
    }
    this.add.rectangle(x, y + h / 2 - 15, l - 8, 26, 0x000000, 0.85);
    texte(this, x, y + h / 2 - 15, ouvert ? 'BOSS FINAL' : '???', 19, ouvert ? '#ffd84a' : '#c9a0ff', { fontStyle: 'bold' });
    if (!ouvert) texte(this, x, y + 70, `🔒 ${nb} / ${BOSS.length}`, 22, '#c9a0ff', { fontStyle: 'bold', stroke: '#000000', strokeThickness: 4 });
    const info = ouvert ? `BOSS FINAL : le mécha des Bracass' !\n${R.ficheFinale}`
      : `BOSS FINAL : ???\nBats les ${BOSS.length} Bracass' pour le débloquer (${nb} / ${BOSS.length})`;
    return { finale: true, x, y, w: l, h, img, info, action: () => this.entrerFinale() };
  }

  // BOSS FINAL : verrouillé = petit refus ; ouvert = la finale (en attendant le mécha : la fin actuelle)
  entrerFinale() {
    if (!this.complet) { jouerSon(this, 'ui_valider'); this.cameras.main.shake(150, 0.006); return; }
    this.voirFin();
  }

  caseBoss(boss, x, y) {
    const battu = Sauvegarde.aLeBadge(boss.id);
    this.cadre(x, y, battu ? 0xd4a52a : 0x3a5fcd);
    const cle = battu ? 'select_' + boss.id : 'select_' + boss.id + '_ombre';
    const img = this.textures.exists(cle) ? this.add.image(x, y + R.caseH / 2 - 26, cle).setOrigin(0.5, 1) : null;   // (buste posé en bas)
    if (img) img.setScale(Math.min((R.caseL - 16) / img.width, (R.caseH - 34) / img.height));
    // bandeau du nom
    this.add.rectangle(x, y + R.caseH / 2 - 13, R.caseL - 8, 22, 0x000000, 0.85);
    texte(this, x, y + R.caseH / 2 - 13, boss.nom.toUpperCase(), 17, battu ? '#ffd84a' : '#ffffff', { fontStyle: 'bold' });
    if (battu) this.add.image(x + R.caseL / 2 - 22, y - R.caseH / 2 + 22, 'badge_' + boss.id).setScale(0.75);
    if (!boss.pret) texte(this, x, y - 10, 'BIENTÔT', 18, '#ffb347', { stroke: '#000000', strokeThickness: 4 });
    else if (!battu) texte(this, x + R.caseL / 2 - 18, y - R.caseH / 2 + 18, '?', 22, '#5aa8ff', { fontStyle: 'bold' });
    const rec = boss.pret && Sauvegarde.record(boss.id);
    // (analyse comparée) ta meilleure lettre de rang, en tampon dans le coin (comme les étoiles d'Angry Birds)
    const g = rec && rangRecord(boss.id, rec.rang);   // (le tampon garde la LETTRE ; le nom est dans la ligne d'infos)
    if (rec) {
      const tampon = texte(this, x - R.caseL / 2 + 26, y - R.caseH / 2 + 26, g.lettre, 30, g.lettre === 'S' ? '#ffd84a' : '#ffffff',
        { fontStyle: 'bold', stroke: '#b3202c', strokeThickness: 6 }).setAngle(-12);
      if (g.lettre === 'S') this.tweens.add({ targets: tampon, scale: 1.12, yoyo: true, repeat: -1, duration: 700 });
    }
    // (analyse comparée, façon Mario Party) une fiche d'une ligne : genre · durée · commandes
    const fiche = R.fiches[boss.id] ? `\n${R.fiches[boss.id]}` : '';   // (2e ligne : la phrase entière ne tenait pas)
    const info = !boss.pret ? `${boss.nom} : bientôt...` : battu
      ? `${boss.nom} : battu !${rec ? ` Record ${rangLisible(g.nom, g.lettre)} en ${formatTemps(rec.temps)}` : ''}${fiche}`
      : `${boss.nom}${fiche}`;
    return { boss, x, y, w: R.caseL, h: R.caseH, img, info, action: () => this.entrer(boss) };
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
  }

  majChoix() {
    const c = this.choix, g = this.cadreChoix;
    g.clear();
    g.lineStyle(9, 0xffd84a, 1).strokeRect(c.x - c.w / 2 - 5, c.y - c.h / 2 - 5, c.w + 10, c.h + 10);   // cadre jaune épais : bien visible sur le fond bleu
    this.infos.setText(c.info || '').setScale(1);
    if (this.infos.width > LARGEUR - 30) this.infos.setScale((LARGEUR - 30) / this.infos.width);   // jamais coupée sur les côtés
    this.cases.forEach(k => { if (k.img) { this.tweens.killTweensOf(k.img); k.img.setY(k.y + k.h / 2 - (k.finale ? 30 : 26)); } });
    if (c.img) this.tweens.add({ targets: c.img, y: c.img.y - 5, yoyo: true, repeat: -1, duration: 260 });
  }

  // la case la plus proche dans la direction demandée (gauche / droite passent par la case du milieu)
  bouger(dc, dl) {
    const a = this.choix;
    let meilleur = null, dMin = Infinity;
    for (const c of this.cases) {
      if (c === a) continue;
      const dx = c.x - a.x, dy = c.y - a.y;
      if ((dc && Math.sign(dx) !== dc) || (dl && (Math.sign(dy) !== dl || Math.abs(dx) > 5))) continue;
      const d = dc ? 10 * Math.abs(dx) + Math.abs(dy) : Math.abs(dy);   // (d'abord la colonne voisine, puis la ligne la plus proche)
      if (d < dMin) { dMin = d; meilleur = c; }
    }
    if (meilleur) { this.choix = meilleur; jouerSon(this, 'ui_valider'); this.majChoix(); }
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
    const c = this.cases.find(k => Math.abs(k.x - x) < (k.w + R.ecart) / 2 && Math.abs(k.y - y) < (k.h + R.ecart) / 2);
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
