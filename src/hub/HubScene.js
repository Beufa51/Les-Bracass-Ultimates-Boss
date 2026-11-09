// =====================================================================
// HUB : écran de SÉLECTION DES BOSS, façon Mega Man (nov. 2026, remplace la salle aux 6 portes).
// Grille 3 x 2 : les 6 boss, rien d'autre. Bandeau du bas : badges (5 appuis = MENU DE TEST, utile sur téléphone).
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
import { basculerMenuTest } from '../core/MenuTestScene.js';

// place de chaque case (colonne 0 = gauche, 2 = droite ; ligne 0 à 2). La colonne 1 = la case du BOSS FINAL.
const PLACES = { beufa: [0, 0], kedric: [0, 1], julien: [0, 2], greg: [2, 0], remi: [2, 1], lionel: [2, 2] };
// avant les 6 badges : grille 3 x 2 d'origine (colonne, ligne)
const PLACES_GRILLE = { beufa: [0, 0], kedric: [1, 0], julien: [2, 0], greg: [0, 1], remi: [1, 1], lionel: [2, 1] };

export class HubScene extends Phaser.Scene {
  constructor() { super('Hub'); }

  init(donnees) { this.depuis = donnees && donnees.depuis; this.testTrappe = !!(donnees && donnees.testTrappe); }   // testTrappe : menu F1

  create() {
    this.entree = false;
    // avis jouabilité : au hub, on touche les cases (plus de croix inutile), et pas de bouton pause (il cachait le titre)
    etiquettesTactiles({ espace: null, z: null, x: null, haut: null, bas: null, gauche: null, droite: null });
    montrerBoutonPause(false);
    this.events.once('shutdown', () => montrerBoutonPause(true));
    jouerMusique(this, 'hub_musique');
    const nb = BOSS.filter(b => Sauvegarde.aLeBadge(b.id)).length;
    this.complet = nb >= BOSS.length || this.testTrappe;   // (menu F1 : on fait comme si les 6 étaient battus, le temps de la trappe)
    // disposition : grille 3 x 2 tant que le boss final est caché, puis 3 à gauche / BOSS FINAL / 3 à droite
    const G = this.complet ? R : R.grille;
    this.cL = G.caseL; this.cH = G.caseH; this.ecartC = G.ecart; this.grilleY = G.grilleY;

    // ---- fond : bleu vif + bandes claires qui défilent (façon Mega Man) ----
    this.add.rectangle(LARGEUR / 2, HAUTEUR / 2, LARGEUR, HAUTEUR, 0x2d6fe0);
    this.bandes = this.add.graphics();
    this.decalage = 0;
    const titreHub = texte(this, LARGEUR / 2, 30, 'CHOISIS TON ADVERSAIRE', 30, '#ffd84a', { fontStyle: 'bold', stroke: '#b3202c', strokeThickness: 6 });
    // MENU DE TEST au doigt (pas de bouton pause au hub) : APPUI LONG (1 s) sur le titre, ou 5 appuis rapides sur les badges
    let appuiLong = null;
    titreHub.setInteractive().on('pointerdown', () => { appuiLong = this.time.delayedCall(1000, () => { appuiLong = null; basculerMenuTest(this.game); }); });
    const annuler = () => { if (appuiLong) { appuiLong.remove(); appuiLong = null; } };
    titreHub.on('pointerup', annuler); titreHub.on('pointerout', annuler);
    // sur téléphone, les blocs de boutons (en bas à gauche / à droite) restent posés sur l'écran même vides : ils
    // « mangeaient » les touchers (les badges en bas à gauche). Au hub, ils laissent passer (comme chez Rémi).
    const blocs = [...document.querySelectorAll('.tactile')];
    for (const b of blocs) { b.style.pointerEvents = 'none'; for (const bt of b.querySelectorAll('button')) bt.style.pointerEvents = 'auto'; }
    this.events.once('shutdown', () => { for (const b of blocs) { b.style.pointerEvents = ''; for (const bt of b.querySelectorAll('button')) bt.style.pointerEvents = ''; } });

    // ---- les cases ----
    this.cases = [];
    for (const boss of BOSS) {
      const p = (this.complet ? PLACES : PLACES_GRILLE)[boss.id]; if (!p) continue;
      this.cases.push(this.caseBoss(boss, ...this.position(p)));
    }
    // le BOSS FINAL reste une SURPRISE : sa case n'apparaît qu'une fois les 6 battus (Fabien)
    if (this.complet) this.cases.push(this.caseFinale(nb));
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
    // les 6 badges : la 1re fois, ALERTE ! le mécha arrive tout seul (la fin vient après l'avoir battu)
    if (this.testTrappe) this.devoilerFinale();   // menu F1 : revoir la trappe (rien n'est enregistré)
    else if (this.complet && !Sauvegarde.aLeBadge('finale') && !Sauvegarde.fait('mecha_alerte')) {
      Sauvegarde.marquerFait('mecha_alerte');
      this.devoilerFinale();
    }
  }

  // RÉVÉLATION du BOSS FINAL (1re fois seulement, Fabien) : une TRAPPE blindée cache la case du milieu. Alerte rouge,
  // la trappe se FISSURE (jet de vapeur), se bloque, puis s'ouvre LENTEMENT dans la fumée : on devine d'abord l'OMBRE du
  // mécha (lueur rouge derrière), la fumée se dissipe, il prend ses COULEURS, flash, puis le combat (≈ 17 s : ça n'arrive
  // qu'une fois, Fabien veut que ça dure).
  devoilerFinale() {
    this.entree = true;   // pas de choix au clavier / au doigt pendant la séquence
    const c = this.cases.find(k => k.finale), L = c.w + 14, H = c.h + 14, haut = c.y - H / 2;
    const volet = (y0, hauteur, bandeEnBas) => {
      const g = this.add.graphics();
      g.fillStyle(0x3a3f4a, 1).fillRect(-L / 2, 0, L, hauteur);
      g.lineStyle(4, 0x1c1f26, 1).strokeRect(-L / 2, 0, L, hauteur);
      for (let k = 0; k < 4; k++) g.lineStyle(2, 0x555c69, 1).lineBetween(-L / 2 + 10, 20 + k * (hauteur - 40) / 3, L / 2 - 10, 20 + k * (hauteur - 40) / 3);   // tôles
      for (const x of [-L / 2 + 12, L / 2 - 12]) for (let k = 0; k < 5; k++) g.fillStyle(0x8a909c, 1).fillCircle(x, 14 + k * (hauteur - 28) / 4, 4);   // rivets
      const yb = bandeEnBas ? hauteur - 26 : 0;   // bande DANGER jaune et noire contre la fente
      for (let x = -L / 2, k = 0; x < L / 2; x += 26, k++) g.fillStyle(k % 2 ? 0x111111 : 0xffc400, 1).fillRect(x, yb, Math.min(26, L / 2 - x), 26);
      const t = texte(this, 0, bandeEnBas ? hauteur / 2 - 14 : hauteur / 2 + 14, '⚠', 46, '#ffc400', { stroke: '#000000', strokeThickness: 5 });
      return this.add.container(c.x, y0, [g, t]).setDepth(8);
    };
    const v1 = volet(haut, H / 2, true), v2 = volet(haut + H / 2, H / 2, false);
    // les volets rentrent DANS le cadre de la case (masque) au lieu de passer par-dessus le titre et le bandeau
    const zone = this.make.graphics({ add: false }).fillStyle(0xffffff).fillRect(c.x - L / 2, haut, L, H);
    const masque = zone.createGeometryMask(); v1.setMask(masque); v2.setMask(masque);
    // sous la trappe : d'abord l'OMBRE du mécha, une lueur rouge qui pulse derrière ; ses couleurs viendront à la fin
    const ombreCle = 'select_mecha_ombre', avecImage = c.img && this.textures.exists(ombreCle);
    if (avecImage) c.img.setTexture(ombreCle);
    const couleur = avecImage ? this.add.image(c.img.x, c.img.y, 'select_mecha').setOrigin(0.5, 1).setScale(c.img.scale).setAlpha(0).setDepth(1) : null;
    const lueur = this.add.circle(c.x, c.y - 30, 120, 0xff2030, 0).setDepth(6.5);   // (au-dessus du brouillard : elle perce la fumée)
    if (c.etiquette) c.etiquette.setText('???').setColor('#c9a0ff');
    const rouge = this.add.rectangle(LARGEUR / 2, HAUTEUR / 2, LARGEUR, HAUTEUR, 0xff0000, 0).setDepth(9);
    const alerte = texte(this, LARGEUR / 2, c.y, 'ALERTE !', 54, '#ffffff', { fontStyle: 'bold italic', stroke: '#b3202c', strokeThickness: 10 }).setDepth(10).setAlpha(0);
    this.infos.setText('ALERTE : LES BRACASS\' FUSIONNENT !').setColor('#ff6b6b');
    // fumée : bouffées qui s'élargissent et montent lentement, posées sur la case (pas au-dessus des volets)
    const fumee = (x, y, force = 1, opacite = 0.85) => {
      const f = this.add.circle(x, y, (18 + Math.random() * 22) * force, Math.random() < 0.5 ? 0xcfd4dc : 0xa9b0bb, opacite).setDepth(7);
      this.tweens.add({ targets: f, scale: 2.4 + Math.random() * 1.6, alpha: 0, x: x + (Math.random() - 0.5) * 70, y: y - 30 - Math.random() * 60,
        duration: 2200 + Math.random() * 1600, ease: 'Sine.Out', onComplete: () => f.destroy() });
    };
    // 1. alerte rouge qui clignote (0,4 → 2,2 s)
    this.time.delayedCall(400, () => {
      this.tweens.add({ targets: rouge, fillAlpha: 0.28, yoyo: true, repeat: 3, duration: 220 });
      this.tweens.add({ targets: alerte, alpha: 1, yoyo: true, repeat: 3, duration: 220 });
      this.cameras.main.shake(1700, 0.006);
      for (let k = 0; k < 4; k++) this.time.delayedCall(k * 440, () => jouerSon(this, 'ui_valider'));
    });
    // brouillard épais posé sur la case (sous les volets) : il se remplit à la fissure, ne se dissipe qu'à la fin
    const brouillard = this.add.rectangle(c.x, c.y, L, H, 0xc4cad3, 0).setDepth(6);
    const jet = (y, n) => { for (let k = 0; k < n; k++) this.time.delayedCall(k * 15, () => fumee(c.x - L / 2 + Math.random() * L, y + (Math.random() - 0.5) * 18, 0.9)); };
    // 2. la trappe se FISSURE : elle s'entrouvre à peine dans un jet de vapeur, se bloque (2,4 s)
    this.time.delayedCall(2400, () => {
      jouerSon(this, 'hub_porte');
      this.tweens.add({ targets: v1, y: haut - 14, duration: 350, ease: 'Back.Out' });
      this.tweens.add({ targets: v2, y: haut + H / 2 + 14, duration: 350, ease: 'Back.Out' });
      jet(c.y, 30);
      this.tweens.add({ targets: brouillard, fillAlpha: 0.75, duration: 1500 });
    });
    // ... elle force, crache de la vapeur par à-coups et tremble (3,4 → 6 s)
    for (const [t, d] of [[3400, 26], [4300, 36], [5200, 26]]) this.time.delayedCall(t, () => {
      jouerSon(this, 'hub_porte'); this.cameras.main.shake(350, 0.005);
      this.tweens.add({ targets: v1, y: v1.y - d * 0.5, duration: 250, ease: 'Back.Out' });
      this.tweens.add({ targets: v2, y: v2.y + d * 0.5, duration: 250, ease: 'Back.Out' });
      jet(c.y, 22);
    });
    // 3. elle s'ouvre TRÈS LENTEMENT (6 → 13 s) dans un nuage de fumée : sous la fumée, l'ombre et la lueur rouge
    this.time.delayedCall(6000, () => {
      jouerSon(this, 'hub_porte');
      this.tweens.add({ targets: v1, y: haut - H / 2, duration: 7000, ease: 'Sine.InOut' });
      this.tweens.add({ targets: v2, y: haut + H, duration: 7000, ease: 'Sine.InOut' });
      this.tweens.add({ targets: lueur, fillAlpha: 0.4, yoyo: true, repeat: 6, duration: 700, ease: 'Sine.InOut' });
      this.tweens.add({ targets: brouillard, fillAlpha: 0.3, duration: 6500, ease: 'Sine.In' });   // l'ombre se devine petit à petit
      // fumée sans arrêt : dans toute la case, et par les deux bords qui s'ouvrent
      // (de plus en plus légère : au fil de l'ouverture, l'ombre se devine à travers)
      const debutOuverture = this.time.now;
      this.time.addEvent({ delay: 30, repeat: 230, callback: () => {
        const k = Math.min(1, (this.time.now - debutOuverture) / 7000), op = 0.8 - 0.55 * k;
        if (Math.random() < 1 - 0.5 * k) fumee(c.x + (Math.random() - 0.5) * L, c.y + (Math.random() - 0.5) * H * 0.85, 1, op);
        if (Math.random() < 0.6) fumee(c.x + (Math.random() - 0.5) * L, (Math.random() < 0.5 ? v1.y + H / 2 : v2.y) + (Math.random() - 0.5) * 20, 0.8, op + 0.1);
      } });
    });
    // 4. la fumée se dissipe : l'ombre prend ses COULEURS (12,5 → 15 s), « ??? » devient « BOSS FINAL »
    this.time.delayedCall(12500, () => {
      this.tweens.add({ targets: brouillard, fillAlpha: 0, duration: 2600, ease: 'Sine.InOut' });
      if (couleur) this.tweens.add({ targets: couleur, alpha: 1, delay: 600, duration: 2200, ease: 'Sine.In' });
      this.tweens.add({ targets: lueur, fillAlpha: 0, duration: 2400 });
    });
    this.time.delayedCall(13200, () => { v1.destroy(); v2.destroy(); zone.destroy(); rouge.destroy(); alerte.destroy(); });
    this.time.delayedCall(15300, () => {
      brouillard.destroy();
      this.cameras.main.flash(500, 255, 255, 255); jouerSon(this, 'ui_badge');
      if (couleur) { couleur.destroy(); c.img.setTexture('select_mecha'); }
      lueur.destroy();
      if (c.etiquette) c.etiquette.setText('BOSS FINAL').setColor('#ffd84a');
      this.choix = c; this.majChoix();
      if (c.img) this.tweens.add({ targets: c.img, scale: c.img.scale * 1.08, yoyo: true, duration: 180, repeat: 1 });
    });
    this.time.delayedCall(17000, () => { this.entree = false; this.entrerFinale(); });
  }

  position([col, ligne]) {
    const pasX = this.complet ? (this.cL + R.centre.l) / 2 + this.ecartC : this.cL + this.ecartC;
    return [LARGEUR / 2 + (col - 1) * pasX, this.grilleY + ligne * (this.cH + this.ecartC)];
  }

  // cadre « métal » d'une case
  cadre(x, y, couleur = 0x3a5fcd, l = this.cL, h = this.cH) {
    const g = this.add.graphics();
    g.fillStyle(0x0b1638, 1).fillRect(x - l / 2, y - h / 2, l, h);
    g.lineStyle(4, couleur, 1).strokeRect(x - l / 2, y - h / 2, l, h);
    g.lineStyle(1, 0xa8c4ff, 0.5).strokeRect(x - l / 2 + 5, y - h / 2 + 5, l - 10, h - 10);
    return g;
  }

  // la grande case du MILIEU : le BOSS FINAL (le mécha des Bracass'), verrouillée tant que les 6 ne sont pas battus
  caseFinale(nb) {
    const { l, h } = R.centre, x = LARGEUR / 2, y = R.grilleY + this.cH + R.ecart;
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
    const etiquette = texte(this, x, y + h / 2 - 15, ouvert ? 'BOSS FINAL' : '???', 19, ouvert ? '#ffd84a' : '#c9a0ff', { fontStyle: 'bold' });
    if (!ouvert) texte(this, x, y + 70, `🔒 ${nb} / ${BOSS.length}`, 22, '#c9a0ff', { fontStyle: 'bold', stroke: '#000000', strokeThickness: 4 });
    const info = ouvert ? `BOSS FINAL : le mécha des Bracass' !\n${R.ficheFinale}`
      : `BOSS FINAL : ???\nBats les ${BOSS.length} Bracass' pour le débloquer (${nb} / ${BOSS.length})`;
    return { finale: true, x, y, w: l, h, img, etiquette, info, action: () => this.entrerFinale() };
  }

  // BOSS FINAL : verrouillé = petit refus ; ouvert = le combat contre le MÉCHA (src/bosses/finale/)
  entrerFinale() {
    if (!this.complet) { jouerSon(this, 'ui_valider'); this.cameras.main.shake(150, 0.006); return; }
    if (this.entree) return;
    this.entree = true;
    jouerSon(this, 'hub_porte');
    this.cameras.main.shake(500, 0.008);
    this.cameras.main.fadeOut(500);
    this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('FinaleMecha', { phase: 'mecha' }));
  }

  caseBoss(boss, x, y) {
    const battu = Sauvegarde.aLeBadge(boss.id);
    this.cadre(x, y, battu ? 0xd4a52a : 0x3a5fcd);
    const cle = battu ? 'select_' + boss.id : 'select_' + boss.id + '_ombre';
    const img = this.textures.exists(cle) ? this.add.image(x, y + this.cH / 2 - 26, cle).setOrigin(0.5, 1) : null;   // (buste posé en bas)
    if (img) img.setScale(Math.min((this.cL - 16) / img.width, (this.cH - 34) / img.height));
    // bandeau du nom
    this.add.rectangle(x, y + this.cH / 2 - 13, this.cL - 8, 22, 0x000000, 0.85);
    texte(this, x, y + this.cH / 2 - 13, boss.nom.toUpperCase(), 17, battu ? '#ffd84a' : '#ffffff', { fontStyle: 'bold' });
    if (battu) this.add.image(x + this.cL / 2 - 22, y - this.cH / 2 + 22, 'badge_' + boss.id).setScale(0.75);
    if (!boss.pret) texte(this, x, y - 10, 'BIENTÔT', 18, '#ffb347', { stroke: '#000000', strokeThickness: 4 });
    else if (!battu) texte(this, x + this.cL / 2 - 18, y - this.cH / 2 + 18, '?', 22, '#5aa8ff', { fontStyle: 'bold' });
    const rec = boss.pret && Sauvegarde.record(boss.id);
    // (analyse comparée) ta meilleure lettre de rang, en tampon dans le coin (comme les étoiles d'Angry Birds)
    const g = rec && rangRecord(boss.id, rec.rang);   // (le tampon garde la LETTRE ; le nom est dans la ligne d'infos)
    if (rec) {
      const tampon = texte(this, x - this.cL / 2 + 26, y - this.cH / 2 + 26, g.lettre, 30, g.lettre === 'S' ? '#ffd84a' : '#ffffff',
        { fontStyle: 'bold', stroke: '#b3202c', strokeThickness: 6 }).setAngle(-12);
      if (g.lettre === 'S') this.tweens.add({ targets: tampon, scale: 1.12, yoyo: true, repeat: -1, duration: 700 });
    }
    // (analyse comparée, façon Mario Party) une fiche d'une ligne : genre · durée · commandes
    const fiche = R.fiches[boss.id] ? `\n${R.fiches[boss.id]}` : '';   // (2e ligne : la phrase entière ne tenait pas)
    const info = !boss.pret ? `${boss.nom} : bientôt...` : battu
      ? `${boss.nom} : battu !${rec ? ` Record ${rangLisible(g.nom, g.lettre)} en ${formatTemps(rec.temps)}` : ''}${fiche}`
      : `${boss.nom}${fiche}`;
    return { boss, x, y, w: this.cL, h: this.cH, img, info, action: () => this.entrer(boss) };
  }

  // bandeau du bas : les badges (5 appuis rapides = menu de test : boss, phases, trappe, réglages développeur)
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
      // téléphone : pas de bouton pause au hub → 5 appuis = le MENU DE TEST (il contient aussi les réglages développeur)
      if (appuis.length >= 5) { appuis = []; basculerMenuTest(this.game); }
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
    const c = this.cases.find(k => Math.abs(k.x - x) < (k.w + this.ecartC) / 2 && Math.abs(k.y - y) < (k.h + this.ecartC) / 2);
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
