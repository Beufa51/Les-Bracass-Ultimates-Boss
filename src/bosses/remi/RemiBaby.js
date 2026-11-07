// =====================================================================
// RÉMI — JEU 2 : LE BABYFOOT (PROTOTYPE, dessiné au code, remplace le beer pong)
// Vue à la 1re personne : TON GARDIEN DE DOS au premier plan, la table, Rémi en face.
// BOUCLE : LIRE → ARRÊTER → RIPOSTER.
//  1) Rémi promène la balle avec son attaque puis tire. Il se PENCHE du côté où il va tirer (il feinte parfois :
//     il penche d'un côté puis change au dernier moment). Ton gardien suit ton doigt (gauche / droite).
//  2) Arrêt = la balle colle à ton gardien : tu as une seconde pour RIPOSTER (toucher bref ou glisser vers le haut ;
//     ESPACE au clavier) à travers ses barres qui bougent. Trop tard : Rémi récupère.
//  3) Règles de bar : GAMELLE (la balle rentre et ressort : but + un point retiré à l'autre) ; ROULETTE interdite :
//     si Rémi fait tourner sa barre (elle tourbillonne) et marque, touche RÉMI (ou Z) pour faire annuler le but.
//     Faux appel = tu bois. Chaque but encaissé = tu bois (l'écran tangue, ton gardien tremble).
// Premier à BABY.buts. Réglages : BABY dans reglages.js ; difficulté : baby* dans DIFFICULTES.
// =====================================================================
import { BossScene } from '../../core/BossScene.js';
import { creerTouches, vientDAppuyer } from '../../core/clavier.js';
import { texte } from '../../core/ui.js';
import { LARGEUR, HAUTEUR } from '../../core/reglages.js';
import { jouerSon } from '../../core/ressources.js';
import { jouerMusique } from '../../core/musique.js';
import { estTactile, etiquettesTactiles } from '../../core/tactile.js';
import { IDENTITE, BABY as B, REPLIQUES, POINTS } from './reglages.js';
import { remi } from './dessins.js';
import { bulle, annonce, jeuSuivant, ecranPerdu, difficulteOuChoix, hasard, choisir, laisserPasserTactile, bilanDe, noterJeu } from './commun.js';

// ---------- projection : caméra basse derrière ton but (ton bord y≈520, celui de Rémi y≈190) ----------
const CAM_Z = -0.55, CAM_H = 0.4, F = 663, HORIZON = 20, CX = LARGEUR / 2;
const L = B.longueur, W = B.largeur, R = B.balle;
function proj(x, y, z) {
  const p = F / (z - CAM_Z);
  return { x: CX + x * p, y: HORIZON + (CAM_H - y) * p, k: p };
}
// les 2 gros boutons (dessinés) et leurs zones de toucher, bien plus grandes (tout le bas de l'écran, sur les côtés)
const BOUTON_G = { x: 92, y: 446, r: 72 }, BOUTON_D = { x: LARGEUR - 92, y: 446, r: 72 };
const BOUTON_TIR = { x: LARGEUR / 2, y: 462, r: 46 };
const ZONE_BOUTONS = { y: 300, g: 250, d: LARGEUR - 250 };
const VIDES = { haut: null, bas: null, gauche: null, droite: null, espace: null, z: null, x: null };
// les barres : z (m depuis ton but), nombre de joueurs, écart, débattement, à qui
const BARRES = {
  toi: { z: 0.07, n: 1, ecart: 0, course: B.course, moi: true },
  att: { z: 0.52, n: 3, ecart: 0.2, course: 0.1 },   // (V19b : 0,30 → 0,52 : le tir part de plus loin, le temps de lire)
  def: { z: 0.78, n: 2, ecart: 0.25, course: 0.15 },
  gar: { z: 0.93, n: 1, ecart: 0, course: 0.17 },
};
// V19k BILLARD : x de la balle à la distance z, rebonds sur les bandes compris (on « replie » la droite entre les bandes)
const plier = (x) => { const m = W / 2 - R, p = 4 * m; const u = ((x + m) % p + p) % p; return u <= 2 * m ? u - m : 3 * m - u; };
const xSur = (x0, z0, a, z) => plier(x0 + Math.tan(a) * (z - z0));
// calque d'un objet à la distance z (plus près = devant) : les figurines et la balle se rangent entre elles
const profondeur = (z) => 5.1 + (L - z) * 0.5;
const hommes = (b, pos) => Array.from({ length: b.n }, (_, i) => pos + (i - (b.n - 1) / 2) * b.ecart);

export class RemiBaby extends BossScene {
  constructor() { super('RemiBaby', IDENTITE); }

  create() {
    this.etat = 'intro';   // intro | prep | tir | tient | riposte | pause | fin
    this.horloge = 0; this.ivresse = 0; this.remiBu = 0;
    this.butsToi = 0; this.butsRemi = 0; this.arrets = 0; this.gamelles = 0;
    this.pos = { toi: 0, att: 0, def: 0, gar: 0 };      // position de chaque barre (m)
    this.cible = 0;                                     // où ton doigt veut le gardien
    this.balle = null; this.tir = null; this.roulette = null; this.appelPossible = 0;
    this.pose = 'face'; this.poseFin = 0; this.penche = 0; this.dir = 0; this.tenu = 0; this.visee = 0;
    this.decor();
    this.gRemi = this.add.graphics().setDepth(3);
    this.g = this.add.graphics().setDepth(5);
    this.gAvant = this.add.graphics().setDepth(7);
    this.gBalle = this.add.graphics();
    // V19i FIGURINES (images) : une par joueur, rangées selon leur barre ; sinon elles restent dessinées au code
    this.figures = this.textures.exists('remi_baby_rouges') && this.textures.exists('remi_baby_toi');
    this.figs = {};
    if (this.figures) for (const nom of Object.keys(BARRES)) {
      const toi = nom === 'toi';
      this.figs[nom] = Array.from({ length: BARRES[nom].n }, () => this.add.sprite(0, 0, toi ? 'remi_baby_toi' : 'remi_baby_rouges', 0)
        .setDepth(profondeur(BARRES[nom].z) + (toi ? 0.02 : 0.01)).setAlpha(toi ? B.transparenceGardien : 1));
    }
    this.txtTir = texte(this, LARGEUR / 2, 462, 'TIR', 24, '#ffffff', { fontStyle: 'bold', stroke: '#000000', strokeThickness: 4 }).setDepth(901).setVisible(false);
    this.txtVise = texte(this, LARGEUR / 2, 524, '', 22, '#7fff7f', { fontStyle: 'bold', backgroundColor: '#000000aa', padding: { x: 10, y: 3 } }).setDepth(901).setVisible(false);
    this.hud = texte(this, LARGEUR / 2, 22, '', 26, '#ffffff', { fontStyle: 'bold', backgroundColor: '#000000aa', padding: { x: 12, y: 3 } }).setDepth(900);
    this.touches = creerTouches(this);
    laisserPasserTactile(this);
    jouerMusique(this, 'remi_musique_baby');   // Captain Tsubasa (donnée par le propriétaire)
    this.installerDoigt();
    etiquettesTactiles({ ...VIDES, espace: 'OK' });
    const t = estTactile();
    this.afficherIntro('RÉMI - Le babyfoot', [
      `Premier à ${B.buts} buts. Tu tiens le GARDIEN (vu de dos), Rémi attaque.`,
      `${t ? 'GROS BOUTONS ◀ ▶ en bas (maintiens)' : '◀ ▶'} : ton gardien glisse à gauche / à droite`,
      'Rémi se PENCHE du côté où il va tirer... sauf quand il feinte !',
      `Balle arrêtée : ◀ ▶ TOURNENT ta visée (rebonds sur les bandes comme au billard) ; ligne VERTE = TIR (${t ? 'toucher le milieu de l\'écran' : 'ESPACE'}) entre ses joueurs (en biais : garde ◀ ou ▶)`,
      'GAMELLE (rentre et ressort) = but + un point retiré à l\'autre',
      `ROULETTE interdite : si sa barre tourbillonne et marque, ${t ? 'touche RÉMI' : 'appuie sur Z'} = but annulé`,
      'Chaque but encaissé, tu bois : ça tangue...',
    ], () => difficulteOuChoix(this, (nom, diff) => { this.nomDiff = nom; this.diff = diff; this.demarrer(); }));
  }

  demarrer() {
    this.bilan = bilanDe(this); this.debutJeu = Date.now(); this.aideDoigt = this.horloge + 6;   // flèches qui clignotent au début
    etiquettesTactiles(VIDES);   // V19g : plus de boutons du téléphone (TIR tombait sur ▶) : tout est dessiné dans le jeu
    bulle(this, `Rémi : « ${REPLIQUES.babyIntro} »`, '#ffd84a', 2.4, 250);
    this.time.delayedCall(1200, () => this.engagement());
  }

  // ---------- décor fixe : le bar, la table vue depuis ton but ----------
  decor() {
    this.cameras.main.setBackgroundColor('#1a0f12');
    const g = this.add.graphics().setDepth(1);
    g.fillGradientStyle(0x2a1418, 0x2a1418, 0x120a0c, 0x120a0c, 1).fillRect(0, 0, LARGEUR, HAUTEUR);
    const fondBar = ['remi_bar_babyfoot', 'remi_bar_interieur'].find(c => this.textures.exists(c));
    if (fondBar) {
      const im = this.add.image(LARGEUR / 2, 0, fondBar).setOrigin(0.5, 0).setDepth(1.5);
      im.setScale(Math.max(LARGEUR / im.width, 300 / im.height));
    } else {
      const neon = texte(this, 150, 34, 'BABYFOOT', 26, '#4fe8ff', { fontStyle: 'bold', stroke: '#06404a', strokeThickness: 5 }).setDepth(2).setAngle(-6);
      this.tweens.add({ targets: neon, alpha: 0.6, yoyo: true, repeat: -1, duration: 700 });
    }
    const t = this.add.graphics().setDepth(4);
    const m = 0.06;   // bord en bois autour du terrain
    const c = (x, z) => proj(x, 0, z);
    t.fillStyle(0x5a3418, 1).fillPoints([c(-W / 2 - m, -0.08), c(W / 2 + m, -0.08), c(W / 2 + m, L + m), c(-W / 2 - m, L + m)], true);
    t.fillStyle(0x2f8a3a, 1).fillPoints([c(-W / 2, 0), c(W / 2, 0), c(W / 2, L), c(-W / 2, L)], true);
    t.lineStyle(2, 0xffffff, 0.7).strokePoints([c(-W / 2, 0), c(W / 2, 0), c(W / 2, L), c(-W / 2, L)], true);
    t.lineBetween(c(-W / 2, L / 2).x, c(0, L / 2).y, c(W / 2, L / 2).x, c(0, L / 2).y);
    const r0 = c(0, L / 2);
    t.strokeEllipse(r0.x, r0.y, 0.2 * r0.k, 0.2 * r0.k * 0.32);
    // les deux buts (trou noir dans le bord)
    { const a = c(-B.but / 2, 0), b = c(B.but / 2, 0); t.fillStyle(0x0a0a0a, 1).fillRect(a.x, a.y - 6, b.x - a.x, 16); }
    // V19k : le BUT DE RÉMI bien lisible : une cage (fond sombre, filet, poteaux et barre blancs) au bout de la table
    const H = 0.075, P = 0.05;   // hauteur et profondeur de la cage (m)
    const q = (x, y, z) => proj(x, y, z);
    const g0 = q(-B.but / 2, 0, L), g1 = q(B.but / 2, 0, L), h0 = q(-B.but / 2, H, L), h1 = q(B.but / 2, H, L);
    const f0 = q(-B.but / 2, 0, L + P), f1 = q(B.but / 2, 0, L + P), fh0 = q(-B.but / 2, H, L + P), fh1 = q(B.but / 2, H, L + P);
    t.fillStyle(0x0b0b10, 1).fillPoints([h0, h1, g1, g0], true);
    t.lineStyle(1, 0xffffff, 0.35);
    for (let i = 1; i < 8; i++) { const x = -B.but / 2 + B.but * i / 8; t.lineBetween(q(x, 0, L + P).x, q(x, 0, L + P).y, q(x, H, L + P).x, q(x, H, L + P).y); }
    for (let i = 1; i < 4; i++) { const y = H * i / 4; t.lineBetween(q(-B.but / 2, y, L + P).x, q(0, y, L + P).y, q(B.but / 2, y, L + P).x, q(0, y, L + P).y); }
    t.lineStyle(1, 0xffffff, 0.3).lineBetween(fh0.x, fh0.y, h0.x, h0.y).lineBetween(fh1.x, fh1.y, h1.x, h1.y).lineBetween(f0.x, f0.y, g0.x, g0.y).lineBetween(f1.x, f1.y, g1.x, g1.y);
    t.lineStyle(Math.max(3, 0.008 * g0.k), 0xffffff, 1).lineBetween(g0.x, g0.y, h0.x, h0.y).lineBetween(g1.x, g1.y, h1.x, h1.y).lineBetween(h0.x, h0.y, h1.x, h1.y);
    this.solTable = t;
  }

  // ---------- commandes ----------
  // V19d MANIABILITÉ (retour : le glissé « pavé tactile » n'allait pas, choix de Fabien) : DEUX GROS BOUTONS ◀ ▶ en bas,
  // sous les pouces : on MAINTIENT, le gardien glisse (il accélère un peu si on garde appuyé). Plusieurs doigts à la fois.
  // Le reste de l'écran : toucher bref = TIR droit (ou en biais du côté du bouton tenu), glisser vers le haut = tir en biais ;
  // toucher Rémi = « ROULETTE ! ».
  dansBouton(p) { return p.y > ZONE_BOUTONS.y && (p.x < ZONE_BOUTONS.g ? -1 : p.x > ZONE_BOUTONS.d ? 1 : 0); }

  installerDoigt() {
    this.input.addPointer(2);   // les deux pouces (+ un doigt pour tirer)
    this.input.on('pointerdown', (p) => {
      if (this.termine) return;
      if (this.dansBouton(p)) return;   // les boutons sont lus à chaque image (pasGardien)
      if (this.etat !== 'intro' && p.y < proj(0, 0, L).y - 20) { this.appelRoulette(); return; }   // toucher Rémi = « ROULETTE ! »
      this.doigt = { x: p.x, y: p.y, t: this.horloge, id: p.id };
    });
    this.input.on('pointermove', (p) => {
      const d = this.doigt;
      if (!p.isDown || !d || p.id !== d.id) return;
      if (this.etat === 'riposte' && d.y - p.y > 45) {   // glissé vers le haut : tir (un peu en biais selon le geste)
        const dx = p.x - d.x, dy = d.y - p.y;
        this.riposter(Phaser.Math.Clamp(dx / dy, -1, 1) * B.viseeMax); this.doigt = null;
      }
    });
    this.input.on('pointerup', (p) => {
      const d = this.doigt;
      if (!d || p.id !== d.id) return;
      this.doigt = null;
      if (this.etat !== 'riposte') return;
      if (this.horloge - d.t < 0.35 && Math.hypot(p.x - d.x, p.y - d.y) < 30) this.riposter(this.visee);   // toucher bref : tir dans la visée
    });
  }

  // direction tenue : boutons à l'écran (tous les doigts posés) ou flèches du clavier
  lireDirection() {
    let g = this.touches.gauche.isDown, d = this.touches.droite.isDown;
    for (const p of this.input.manager.pointers) {
      if (!p.isDown) continue;
      const c = this.dansBouton(p);
      if (c < 0) g = true; else if (c > 0) d = true;
    }
    this.tenuG = g; this.tenuD = d;
    return (d ? 1 : 0) - (g ? 1 : 0);
  }

  // ---------- Rémi : engagement, préparation (lecture), tir ----------
  engagement() {
    if (this.termine) return;
    const balleMatch = this.butsRemi === B.buts - 1;
    if (balleMatch || this.butsToi === B.buts - 1) annonce(this, 'BALLE DE MATCH', balleMatch ? '#ff6b6b' : '#7fff7f', 0.9);
    const D = this.diff;
    // côté visé (-1 à 1 dans le but) ; feinte : il penche d'abord de l'autre côté
    const vise = choisir([-1, 1]) * hasard(0.35, 0.95);
    // le joueur de l'attaque qui a la balle : celui du milieu ou celui du côté visé (sinon le tir sortirait)
    const qui = Math.random() < 0.5 ? 1 : (vise > 0 ? 2 : 0);
    const derriere = this.butsRemi < this.butsToi;
    const roul = Math.random() < D.babyRoulette * (derriere ? 2 : 1) && this.butsRemi < B.buts - 1;
    this.tir = {
      qui, vise, t: 0,
      d: hasard(B.prep[0], B.prep[1]) * D.babyLecture,
      feinte: balleMatch || Math.random() < D.babyFeinte,
      bande: Math.random() < D.babyBande,
      roulette: roul,
      promene: hasard(-1, 1),
    };
    this.etat = 'prep';
    this.balle = { x: 0, z: BARRES.att.z - 0.04, vx: 0, vz: 0, vue: 1 };
  }

  pasPrep(dt) {
    const T = this.tir; T.t += dt;
    const a = T.t / T.d;
    // il promène la balle : sa barre glisse doucement
    this.pos.att = Phaser.Math.Clamp(Math.sin(this.horloge * 2.2 + T.promene * 3) * BARRES.att.course, -BARRES.att.course, BARRES.att.course);
    const xs = hommes(BARRES.att, this.pos.att);
    this.balle.x = xs[T.qui]; this.balle.z = BARRES.att.z - 0.04;
    // LECTURE : il se penche vers le côté visé (feinte : l'autre côté jusqu'à 65 %, puis il change)
    const cote = Math.sign(T.vise);
    const faux = T.feinte && a < B.feinteBascule;
    this.penche = Phaser.Math.Linear(this.penche, (faux ? -cote : cote) * Math.min(1, a * 1.6), Math.min(1, dt * 8));
    if (a > 0.82) this.arme = (a - 0.82) / 0.18; else this.arme = 0;   // la barre s'arme (le joueur se lève)
    if (T.roulette && a > 0.7) this.roulette = { t: this.horloge };
    if (a >= 1) this.tirer();
  }

  tirer() {
    const T = this.tir, b = this.balle, D = this.diff;
    this.arme = 0; this.poseTemp('lance', 0.6);
    let v = D.babyVitesse * (T.roulette ? B.rouletteVitesse : 1) * (1 - this.remiBu * 0.04);
    // cible : dans le but, du côté visé (rarement à côté)
    let tx = T.vise * (B.but / 2) * 0.9;
    if (Math.random() < D.babyRate) tx = Math.sign(T.vise) * (B.but / 2 + hasard(0.03, 0.08));
    // la cible est l'endroit où la balle PASSE DEVANT TON GARDIEN (c'est ce que sa penche annonce)
    const x0 = b.x, z0 = b.z, zg = BARRES.toi.z;
    if (T.bande) {   // tir en bande : on vise le reflet de la cible derrière la bande opposée
      const s = -Math.sign(T.vise) || 1;
      tx = s * (W - 2 * R) - tx; v *= 1.1;
    }
    const dx = tx - x0, dz = zg - z0, n = Math.hypot(dx, dz);
    b.vx = dx / n * v; b.vz = dz / n * v;
    this.etat = 'tir';
    jouerSon(this, 'remi_tape', { volume: 0.6 });
  }

  // ---------- mouvement de la balle (bandes, barres, buts) ----------
  pasBalle(dt) {
    const b = this.balle; if (!b) return;
    const zAvant = b.z, xAvant = b.x;
    // x de la balle à l'instant exact où elle croise la ligne z (sinon une balle en biais « traverse » un joueur entre 2 images)
    const xA = (z) => xAvant + (b.x - xAvant) * (z - zAvant) / ((b.z - zAvant) || 1);
    b.x += b.vx * dt; b.z += b.vz * dt;
    if (b.x > W / 2 - R) { b.x = W - 2 * R - b.x; b.vx = -Math.abs(b.vx); jouerSon(this, 'remi_rebond', { volume: 0.4 }); }
    if (b.x < -W / 2 + R) { b.x = -W + 2 * R - b.x; b.vx = Math.abs(b.vx); jouerSon(this, 'remi_rebond', { volume: 0.4 }); }
    if (this.etat === 'tir') {
      // ta barre : la balle passe-t-elle sur ton gardien ?
      const zg = BARRES.toi.z;
      if (zAvant > zg && b.z <= zg) {
        if (Math.abs(xA(zg) - this.pos.toi) < B.priseToi) { this.arret(); return; }   // (V19h : ton gardien, plus large)
      }
      if (b.z <= 0) {
        if (Math.abs(b.x) < B.but / 2) this.butRemi(Math.abs(b.x) > B.but / 2 * B.gamelleBord && Math.random() < B.gamelle);
        else this.sortie('À côté !');
      }
    } else if (this.etat === 'riposte_vol') {
      // V19e : quand tu tires depuis ton gardien, Rémi LÈVE sa barre d'attaque (comme au vrai babyfoot) : seuls sa défense
      // et son gardien peuvent arrêter ta riposte
      for (const nom of ['def', 'gar']) {
        const br = BARRES[nom];
        if (zAvant < br.z && b.z >= br.z && hommes(br, this.pos[nom]).some(x => Math.abs(xA(br.z) - x) < B.prise * (nom === 'gar' ? B.priseGardienRemi : 0.85))) {
          this.contre(nom); return;
        }
      }
      if (b.z >= L) {
        if (Math.abs(b.x) < B.but / 2) this.butToi(Math.abs(b.x) > B.but / 2 * B.gamelleBord && Math.random() < B.gamelle);
        else this.sortie('Dehors !');
      }
    }
  }

  // ---------- issues ----------
  arret() {
    this.arrets++;
    jouerSon(this, 'remi_atterrit', { volume: 0.7 });
    this.cameras.main.shake(80, 0.004);
    this.roulette = null;
    annonce(this, 'ARRÊT !', '#7fff7f', 0.5);
    this.balle.vx = 0; this.balle.vz = 0;
    this.etat = 'riposte'; this.fenetre = this.diff.babyFenetre; this.memoire = this.balle.x; this.visee = 0;   // fenetre = temps du bonus ÉCLAIR
    if (Math.random() < 0.5) { this.poseTemp('rale', 1.2); bulle(this, `Rémi : « ${choisir(REPLIQUES.babyArret)} »`, '#ffd84a', 1.4, 300); }
  }

  riposter(biais) {
    if (this.etat !== 'riposte') return;
    const b = this.balle;
    // V19g TIR ÉCLAIR : tirer pendant le bonus (anneau jaune autour de TIR) = balle plus rapide, son gardien surpris
    const eclair = this.fenetre > 0;
    const v = B.riposteVitesse * (eclair ? B.eclairVitesse : 1);
    b.vz = v * Math.cos(biais); b.vx = v * Math.sin(biais);
    this.etat = 'riposte_vol'; this.eclairTir = eclair; this.frappeToi = this.horloge + 0.3;
    this.reflexe = this.diff.babyReflexe + this.remiBu * 0.04 + (eclair ? B.eclairReflexe : 0);   // son gardien réagit avec un temps de retard
    jouerSon(this, 'remi_tape', eclair ? { rate: 1.3 } : undefined);
    if (eclair) { annonce(this, 'TIR ÉCLAIR !', '#ffd84a', 0.5); this.cameras.main.shake(90, 0.003); }
  }

  contre(nom) {
    this.dernierContre = nom;
    jouerSon(this, 'remi_rebond');
    bulle(this, nom === 'gar' ? 'Rémi : « Arrêté ! »' : 'Contré !', '#ffd84a', 1.0, 300);
    this.balle.vz = -this.balle.vz * 0.3;
    this.suivant(0.7);
  }

  sortie(msg) { bulle(this, msg, '#ffffff', 1.0, 300); this.suivant(0.8); }

  butRemi(gamelle) {
    const T = this.tir;
    this.butsRemi++;
    if (gamelle) this.gamelleAnim(false);
    this.appelPossible = T.roulette ? this.horloge + B.appelDuree : 0;
    this.dernierBut = { gamelle, roulette: T.roulette };
    this.poseTemp('nargue', 1.6);
    this.ivresse++;
    jouerSon(this, 'remi_boit');
    this.cameras.main.flash(200, 230, 160, 40);
    annonce(this, gamelle ? 'GAMELLE !' : 'BUT DE RÉMI', '#ff6b6b', 0.8);
    if (!gamelle) bulle(this, `Rémi : « ${choisir(REPLIQUES.babyBut)} »`, '#ffd84a', 1.6, 300);
    this.verifierFin(1.6);
  }

  butToi(gamelle) {
    this.butsToi++;
    this.remiBu++;
    if (gamelle) this.gamelleAnim(true);
    this.poseTemp('boit', 1.6);
    jouerSon(this, 'remi_pinte');
    annonce(this, gamelle ? 'GAMELLE !' : 'BUUUT !', '#7fff7f', 0.8);
    if (!gamelle) bulle(this, `Rémi : « ${choisir(REPLIQUES.babyEncaisse)} »`, '#ffd84a', 1.6, 300);
    this.verifierFin(1.4);
  }

  // GAMELLE : la balle rentre et ressort (but) + un point retiré à l'autre
  gamelleAnim(pourToi) {
    this.gamelles += pourToi ? 1 : 0;
    if (pourToi) this.butsRemi = Math.max(0, this.butsRemi - 1); else this.butsToi = Math.max(0, this.butsToi - 1);
    this.time.delayedCall(700, () => bulle(this, pourToi ? 'GAMELLE : un point retiré à Rémi !' : 'GAMELLE : il te retire un point !', pourToi ? '#7fff7f' : '#ff6b6b', 1.6, 130));
  }

  appelRoulette() {
    if (this.etat === 'intro' || this.etat === 'fin') return;
    if (this.horloge < this.appelPossible && this.dernierBut?.roulette) {
      this.appelPossible = 0;
      this.butsRemi = Math.max(0, this.butsRemi - 1);
      if (this.dernierBut.gamelle) this.butsToi++;
      this.ivresse = Math.max(0, this.ivresse - 1);
      annonce(this, 'ROULETTE ! BUT ANNULÉ', '#7fff7f', 1.0);
      this.poseTemp('rale', 1.6);
      bulle(this, `Rémi : « ${choisir(REPLIQUES.babyRouletteVue)} »`, '#ffd84a', 1.6, 300);
      return;
    }
    if (this.etat === 'prep' || this.etat === 'tir' || this.horloge < this.appelPossible) return;   // trop tôt : on ignore
    if (this.fauxAppelDepuis && this.horloge - this.fauxAppelDepuis < 1) return;
    this.fauxAppelDepuis = this.horloge;
    this.ivresse++;
    jouerSon(this, 'remi_hips');
    bulle(this, 'Faux appel ! Tu bois.', '#ff6b6b', 1.2, 300);
  }

  verifierFin(d) {
    this.etat = 'pause'; this.balle = null; this.roulette = null;
    this.time.delayedCall(d * 1000, () => {
      if (this.termine) return;
      if (this.butsToi >= B.buts) this.gagne();
      else if (this.butsRemi >= B.buts) {
        if (this.horloge < this.appelPossible) { this.time.delayedCall(300, () => this.verifierFin(0)); return; }
        ecranPerdu(this, 'PERDU', REPLIQUES.babyPerdu, this.nomDiff);
      } else this.engagement();
    });
  }

  suivant(d) {
    this.etat = 'pause';
    this.time.delayedCall(d * 1000, () => { this.balle = null; if (!this.termine) this.engagement(); });
  }

  gagne() {
    this.etat = 'fin';
    noterJeu(this, 'baby', (this.butsToi - this.butsRemi) * POINTS.babyEcart + this.arrets * POINTS.babyArret + this.gamelles * POINTS.babyGamelle);
    annonce(this, 'GAGNÉ !', '#7fff7f', 1.4);
    jouerSon(this, 'remi_arrivee');
    this.time.delayedCall(900, () => bulle(this, `Rémi : « ${REPLIQUES.babyGagne} »`, '#ffd84a', 2.8, 90));
    this.time.delayedCall(3800, () => jeuSuivant(this, 'baby', this.nomDiff));
  }

  // ---------- boucle ----------
  update(temps, delta) {
    const dt = Math.min(delta, 50) / 1000;
    this.horloge += dt;
    if (this.etat !== 'intro' && this.etat !== 'fin' && !this.termine) {
      this.pasGardien(dt);
      this.pasBarresRemi(dt);
      if (this.etat === 'prep') this.pasPrep(dt);
      if (this.etat === 'tir' || this.etat === 'riposte_vol') this.pasBalle(dt);
      if (this.etat === 'riposte') {
        this.balle.x = Phaser.Math.Clamp(this.pos.toi + 0.03, -B.but / 2 + 0.01, B.but / 2 - 0.01); this.balle.z = BARRES.toi.z + 0.05;   // un peu de côté : visible derrière ton gardien
        this.fenetre -= dt;   // V19g : pas de limite de temps pour viser ; seul le bonus ÉCLAIR s'éteint
        this.indice = this.diff.babyGuide ? this.chercherVert() : undefined;   // V19l : pas de guide en PRESSION / CUL SEC
        if (vientDAppuyer(this.touches.espace)) this.riposter(this.visee);
      }
      if (vientDAppuyer(this.touches.z)) this.appelRoulette();
    }
    this.dessiner();
  }

  pasGardien(dt) {
    // les boutons (ou les flèches) : le gardien glisse, un peu plus vite si on garde appuyé
    this.dir = this.lireDirection();
    this.tenu = this.dir ? (this.tenu || 0) + dt : 0;
    const v = B.vitesseBoutons * Math.min(1, B.depart + this.tenu / B.montee * (1 - B.depart));
    if (this.etat === 'riposte') {   // V19k : balle arrêtée : ◀ ▶ TOURNENT LA VISÉE (le gardien ne bouge plus)
      const va = B.vitesseVisee * Math.min(1, B.depart + this.tenu / B.montee * (1 - B.depart));
      this.visee = Phaser.Math.Clamp(this.visee + this.dir * va * dt, -B.viseeMax, B.viseeMax);
    } else this.cible = Phaser.Math.Clamp(this.cible + this.dir * v * dt, -B.course, B.course);
    if (!this.dir) this.cible = Phaser.Math.Clamp(this.cible, this.pos.toi - 0.01, this.pos.toi + 0.01);   // lâché : il s'arrête net
    // l'alcool : le gardien tremble et traîne un peu
    const tremble = this.ivresse * B.trembleBu * Math.sin(this.horloge * 7.3);
    const vmax = B.vitesseGardien * (1 - Math.min(0.4, this.ivresse * 0.05));
    // AIDE (difficultés faciles) : quand son tir arrive, ton gardien est attiré vers l'endroit où la balle va passer
    let cible = this.cible;
    const b = this.balle;
    if (this.etat === 'tir' && b && b.vz < 0 && this.diff.babyAide) {
      const xc = Phaser.Math.Clamp(b.x + b.vx * (b.z - BARRES.toi.z) / -b.vz, -B.course, B.course);
      cible += (xc - cible) * this.diff.babyAide;
    }
    const d = cible + tremble - this.pos.toi;
    this.pos.toi += Phaser.Math.Clamp(d, -vmax * dt, vmax * dt);
    this.pos.toi = Phaser.Math.Clamp(this.pos.toi, -B.course, B.course);
  }

  pasBarresRemi(dt) {
    const b = this.balle, D = this.diff;
    const vers = (nom, but, v) => { this.pos[nom] += Phaser.Math.Clamp(but - this.pos[nom], -v * dt, v * dt); this.pos[nom] = Phaser.Math.Clamp(this.pos[nom], -BARRES[nom].course, BARRES[nom].course); };
    // pendant que tu tiens la balle, ses barres d'attaque et de défense visent l'endroit où ta balle ÉTAIT (Rémi réagit
    // en retard) : une feinte rapide ouvre un trou. Une fois ta balle partie, elles sont figées (trop rapide pour lui).
    const tiens = this.etat === 'riposte' && b, vole = this.etat === 'riposte_vol' && b;
    // V19l : sa défense lit TA VISÉE (là où ton tir passera sur sa ligne), avec un temps de retard : feinte-la ou joue les bandes
    if (tiens) this.memoire += (xSur(b.x, b.z, this.visee, BARRES.def.z) - this.memoire) * Math.min(1, dt * B.retardRemi);
    for (const nom of ['def', 'gar', ...(this.etat === 'prep' ? [] : ['att'])]) {
      const br = BARRES[nom];
      let but = Math.sin(this.horloge * (nom === 'def' ? 1.3 : 1.7)) * br.course * (nom === 'gar' ? 0.25 : 0.6);   // son gardien attend plutôt au centre
      const devant = (x) => hommes(br, 0).map(h => x - h).reduce((a, c) => Math.abs(c) < Math.abs(a) ? c : a);
      if (nom === 'gar') {
        // son GARDIEN ne bouge qu'une fois ta balle partie, avec un temps de retard
        if (tiens) but = Math.sin(this.horloge * B.balancier) * br.course * 0.6;   // V19j : il se balance devant son but : des trous s'ouvrent
        else if (!vole) but = Math.sin(this.horloge * 1.7) * br.course * 0.25;
        if (vole) { this.reflexe -= dt; if (this.reflexe > 0) continue; but = devant(b.x); }
      } else {
        if (vole) continue;
        if (tiens) but = devant(this.memoire);
      }
      vers(nom, but, nom === 'gar' ? D.babyGardienRemi : tiens ? D.babyDefense : B.vitesseBarresRemi);
    }
  }

  poseTemp(p, d = 1.4) { this.pose = p; this.poseFin = this.horloge + d; }

  // ---------- dessin ----------
  dessiner() {
    const cam = this.cameras.main;
    cam.setRotation(this.ivresse ? Math.sin(this.horloge * 0.9) * 0.006 * this.ivresse : 0);
    this.hud.setText(`TOI  ${this.butsToi}  -  ${this.butsRemi}  RÉMI`);
    // Rémi derrière la table, penché du côté où il va tirer
    if (this.pose !== 'face' && this.horloge > this.poseFin) this.pose = 'face';
    if (this.etat !== 'prep') this.penche *= 0.92;
    const yBord = proj(0, 0, L + 0.06).y;
    const bal = Math.sin(this.horloge * 1.5) * (2 + this.remiBu * 2);
    const px = CX + bal + this.penche * 75, rot = this.penche * 0.32 + bal * 0.004;   // il se penche franchement : c'est ÇA qu'on lit
    if (this.textures.exists('remi_baby')) {
      // la planche du babyfoot : cases alignées sur la casquette, le bas est caché par la table
      if (!this.imgRemi || !this.imgRemi.scene) this.imgRemi = this.add.sprite(CX, 0, 'remi_baby', 0).setOrigin(0.5, 0).setDepth(3).setScale(0.42);
      let f = { nargue: 4, boit: 5, rale: 6 }[this.pose];
      if (f === undefined) f = this.roulette ? 3 : this.penche < -0.3 ? 1 : this.penche > 0.3 ? 2 : 0;
      this.imgRemi.setFrame(f).setPosition(CX + bal + this.penche * 35, yBord - 130).setRotation(bal * 0.003);
    } else {
      this.gRemi.clear().setPosition(px, yBord + 6).setRotation(rot);
      remi(this.gRemi, this.pose === 'lance' ? 'lance' : 'face', this.horloge);
    }
    const g = this.g.clear(), ga = this.gAvant.clear();
    // de loin à près : barres de Rémi, balle, puis ton gardien devant (dans gAvant)
    const ordre = [['gar', 0xe53935], ['def', 0xe53935], ['att', 0xe53935]];
    const bz = this.balle ? this.balle.z : -1;
    // V19i : la balle a son propre calque, rangé selon sa distance (devant / derrière chaque barre et ses figurines)
    this.gBalle.clear().setDepth(profondeur(bz));
    this.dessinerBalle(this.gBalle);
    for (const [nom, coul] of ordre) {
      this.barre(g, BARRES[nom], this.pos[nom], coul, nom === 'att' ? (this.etat.startsWith('riposte') ? 1 : this.arme) : 0, nom === 'att' && this.roulette, false, nom);
    }
    this.barre(this.figures ? g : ga, BARRES.toi, this.pos.toi, 0x2f6fd6, 0, false, true, 'toi');
    // les 2 gros boutons ◀ ▶ (ils s'allument quand on appuie ; ils clignotent les premières secondes)
    if (this.etat !== 'intro') {
      const clign = this.horloge < (this.aideDoigt ?? 0) && Math.floor(this.horloge * 4) % 2 === 0;
      for (const [bt, tenu, s] of [[BOUTON_G, this.tenuG, -1], [BOUTON_D, this.tenuD, 1]]) {
        ga.fillStyle(0x000000, tenu ? 0.5 : 0.28).fillCircle(bt.x, bt.y, bt.r);
        ga.fillStyle(0x2f6fd6, tenu ? 0.55 : clign ? 0.35 : 0.12).fillCircle(bt.x, bt.y, bt.r - 6);
        ga.lineStyle(4, 0x9fc4ff, tenu ? 1 : 0.7).strokeCircle(bt.x, bt.y, bt.r);
        // GUIDE : la flèche à presser pour trouver la ligne VERTE clignote en jaune
        if (this.etat === 'riposte' && this.indice === s && !tenu) ga.fillStyle(0xffd84a, 0.35 + 0.35 * Math.sin(this.horloge * 12)).fillCircle(bt.x, bt.y, bt.r - 6);
        ga.fillStyle(0xffffff, tenu ? 1 : 0.85).fillTriangle(bt.x + s * 30, bt.y, bt.x - s * 18, bt.y - 30, bt.x - s * 18, bt.y + 30);
      }
    }
    // V19e LIGNE DE VISÉE pendant la riposte : VERTE si ta balle passe sa défense, ROUGE à partir du joueur qui bloque
    if (this.etat === 'riposte' && this.balle) {
      const lib = this.cheminLibre(), coul = (z) => lib.cote || z >= lib.bloque ? 0xff5a5a : lib.enFace ? 0xffd84a : 0x7fff7f;
      // le trajet (avec ses rebonds sur les bandes) : des points qui défilent vers le but
      const pas = 0.04, dec = (this.horloge * 0.25) % pas;
      for (let z = this.balle.z + 0.05 + dec; z < L; z += pas) {
        const q = proj(xSur(this.balle.x, this.balle.z, lib.biais, z), R, z);
        g.fillStyle(coul(z), 0.95).fillCircle(q.x, q.y, Math.max(2.5, 0.009 * q.k));
      }
      // le point d'arrivée sur la ligne de but : un rond (vert = BUT)
      const fin = proj(lib.xBut, R, L), cf = coul(L - 0.001);
      g.lineStyle(4, cf, 1).strokeEllipse(fin.x, fin.y, 0.06 * fin.k, 0.03 * fin.k);
      if (lib.libre && !lib.enFace) { const q = proj(0, 0, L); g.fillStyle(0x7fff7f, 0.18 + 0.12 * Math.sin(this.horloge * 10)).fillRect(proj(-B.but / 2, 0, L).x - 6, q.y - 0.09 * q.k, B.but * q.k + 12, 0.1 * q.k); }
      const vert = lib.libre && !lib.enFace;
      const pourquoi = lib.cote ? 'À CÔTÉ' : !lib.libre ? 'BLOQUÉ' : 'SON GARDIEN EST EN FACE';
      const [m, c] = vert ? ['LIBRE : TOUCHE TIR !', '#7fff7f']
        : this.indice === -1 ? [`${pourquoi} : ◀ TOURNE LA VISÉE`, '#ffd84a'] : this.indice === 1 ? [`${pourquoi} : TOURNE LA VISÉE ▶`, '#ffd84a']
        : this.indice === undefined ? [`${pourquoi} : tourne ta visée ◀ ▶`, '#ff7a7a']
        : [`${pourquoi} : attends qu'un trou s'ouvre`, '#ff7a7a'];
      this.txtVise.setText(m).setColor(c).setVisible(true);
    } else this.txtVise.setVisible(false);
    // le bouton TIR (au milieu, loin des flèches) ; l'anneau jaune qui se vide = le bonus ÉCLAIR
    const tir = this.etat === 'riposte';
    this.txtTir.setVisible(tir);
    if (tir) {
      const f = Math.max(0, this.fenetre / this.diff.babyFenetre), bt = BOUTON_TIR;
      ga.fillStyle(0x000000, 0.45).fillCircle(bt.x, bt.y, bt.r);
      ga.fillStyle(f > 0 ? 0xffd84a : 0x7fff7f, f > 0 ? 0.35 : 0.25).fillCircle(bt.x, bt.y, bt.r - 6);
      ga.lineStyle(4, 0xffffff, 0.8).strokeCircle(bt.x, bt.y, bt.r);
      if (f > 0) ga.lineStyle(9, 0xffd84a, 1).beginPath().arc(bt.x, bt.y, bt.r + 7, -Math.PI / 2, -Math.PI / 2 + f * Math.PI * 2).strokePath();
      this.txtTir.setText(f > 0 ? '⚡TIR' : 'TIR');
    }
    if (this.horloge < this.appelPossible) {
      const a = 0.5 + 0.5 * Math.sin(this.horloge * 14);
      ga.lineStyle(4, 0xffd84a, a).strokeCircle(px, yBord - 60, 70);
    }
  }

  // ta riposte passerait-elle sa défense ? (biais = celui du bouton tenu) ; bloque = z du joueur qui l'arrête
  // ta riposte (balle en xb, angle a) passerait-elle ? Trajet avec rebonds. bloque = z du joueur qui l'arrête
  cheminLibre(xb = this.balle.x, a = this.visee) {
    const z0 = this.balle.z, br = BARRES.def, en = (z) => xSur(xb, z0, a, z);
    const bloque = hommes(br, this.pos.def).some(h => Math.abs(en(br.z) - h) < B.prise * 0.85 + 0.01) ? br.z : L + 1;   // (+1 cm de marge : sa défense bouge encore un peu)
    // son gardien : il n'arrête que ce qu'il peut atteindre (sa prise + ce qu'il parcourt entre son réflexe et l'arrivée)
    const eclair = this.fenetre > 0;
    const t = (BARRES.gar.z - z0) / (B.riposteVitesse * (eclair ? B.eclairVitesse : 1) * Math.cos(a));
    const portee = B.prise * B.priseGardienRemi + this.diff.babyGardienRemi * Math.max(0, t + 0.12 - this.diff.babyReflexe - this.remiBu * 0.04 - (eclair ? B.eclairReflexe : 0));
    const enFace = Math.abs(en(BARRES.gar.z) - this.pos.gar) < portee;
    const xBut = en(L), cote = Math.abs(xBut) > B.but / 2 - R;
    return { biais: a, bloque: cote ? Math.min(bloque, L - 0.02) : bloque, libre: bloque > L && !cote, enFace, cote, xBut };
  }

  // GUIDE : de quel côté TOURNER la visée pour trouver un tir VERT ? -1 / 1, 0 = tu y es, null = rien pour l'instant
  chercherVert() {
    const ok = (l) => l.libre && !l.enFace;
    if (ok(this.cheminLibre())) return 0;
    let meilleur = null;
    for (let a = -B.viseeMax; a <= B.viseeMax + 1e-9; a += 0.01) {
      if (ok(this.cheminLibre(this.balle.x, a)) && (meilleur === null || Math.abs(a - this.visee) < Math.abs(meilleur - this.visee))) meilleur = a;
    }
    return meilleur === null ? null : Math.abs(meilleur - this.visee) < 0.006 ? 0 : Math.sign(meilleur - this.visee);
  }

  // une barre : la tige d'un bord à l'autre et ses joueurs (vus de dos pour toi, de face pour Rémi)
  barre(g, br, pos, coul, arme, roulette, deDos = false, nom = null) {
    const hT = 0.1;   // hauteur de la tige au-dessus du terrain
    const a = proj(-W / 2 - 0.08, hT, br.z), b = proj(W / 2 + 0.08, hT, br.z);
    g.lineStyle(Math.max(2, 0.012 * a.k), 0xcfd3d8, 1).lineBetween(a.x, a.y, b.x, b.y);
    if (deDos) {   // la poignée sur le côté
      g.fillStyle(0x222222, 1).fillRect(b.x - 6, b.y - 8, 40, 16);
    }
    // V19h : TON gardien est plus large et TRANSPARENT (on voit la balle et ses joueurs à travers, comme le boxeur de Greg) ;
    // ceux de Rémi ont un contour blanc et une ombre au sol (on voit où ils sont sur le terrain)
    const al = deDos ? B.transparenceGardien : 1;
    hommes(br, pos).forEach((x, i) => {
      const pied = proj(x, 0.005, br.z), tete = proj(x, hT + 0.035, br.z), k = pied.k;
      if (this.figures && nom) {   // l'image de la figurine (socle posé sur le terrain)
        const s = this.figs[nom][i];
        if (!deDos) g.fillStyle(0x000000, 0.4).fillEllipse(pied.x, pied.y, 0.07 * k, 0.02 * k);
        const tireur = nom !== 'att' || !this.tir || this.etat !== 'prep' || i === this.tir.qui;   // seul celui qui a la balle arme
        const f = deDos ? (this.horloge < (this.frappeToi ?? 0) ? 1 : 0) : roulette ? 3 : arme >= 0.99 ? 2 : arme > 0 && tireur ? 1 : 0;
        const h = B.hauteurFigurine * k * (deDos ? B.tailleGardien : 1) / s.height;
        s.setFrame(f).setScale(h);
        // barre LEVÉE (V19j) : les joueurs pivotent sur la tige, pieds vers Rémi : vus d'ici ils sont écrasés sous la tige
        if (f === 2 && !deDos) s.setFrame(0).setScale(h, h * B.leveEcrase).setOrigin(0.5, 0.18).setAlpha(0.7).setPosition(pied.x, proj(x, hT, br.z).y);
        else { s.setOrigin(0.5, 1).setPosition(pied.x, pied.y); if (!deDos) s.setAlpha(1); }
        return;
      }
      const largeur = (deDos ? B.largeurGardien : 0.035) * k;
      if (!deDos) g.fillStyle(0x000000, 0.4).fillEllipse(pied.x, pied.y, largeur * 2.2, largeur * 0.6);
      if (roulette) {   // la barre tourbillonne : le joueur tourne à toute vitesse
        const s = Math.sin(this.horloge * 40);
        g.fillStyle(coul, 0.9).fillRect(pied.x - largeur / 2, tete.y + (pied.y - tete.y) * (0.5 - 0.5 * Math.abs(s)), largeur, Math.max(3, (pied.y - tete.y) * Math.abs(s)));
        g.lineStyle(2, 0xffffff, 0.6).strokeEllipse(pied.x, (pied.y + tete.y) / 2, largeur * 2.4, (pied.y - tete.y) * 1.1);
        return;
      }
      // armé : le joueur se lève vers l'arrière (les pieds remontent)
      const yPied = pied.y - arme * (pied.y - tete.y) * 0.55;
      const corpsY = tete.y + 0.02 * k, corpsH = yPied - tete.y - 0.02 * k;
      g.fillStyle(coul, al).fillRoundedRect(pied.x - largeur / 2, corpsY, largeur, corpsH, 3);
      g.lineStyle(deDos ? 3 : 2, 0xffffff, deDos ? 0.9 : 0.85).strokeRoundedRect(pied.x - largeur / 2, corpsY, largeur, corpsH, 3);
      g.fillStyle(0x111111, al).fillRect(pied.x - largeur / 2, yPied - 0.012 * k, largeur, 0.012 * k);
      g.fillStyle(deDos ? 0x3a2a1a : 0xf0c8a0, al).fillCircle(tete.x, tete.y + 0.012 * k, 0.017 * k);
      if (deDos) g.fillStyle(0xffffff, al).fillRect(pied.x - largeur * 0.1, tete.y + 0.045 * k, largeur * 0.2, 0.03 * k);   // numéro dans le dos
    });
  }

  dessinerBalle(g) {
    const b = this.balle; if (!b) return;
    const p = proj(b.x, R, b.z), o = proj(b.x, 0, b.z);
    g.fillStyle(0x000000, 0.35).fillEllipse(o.x, o.y, R * 2.4 * o.k, R * 0.8 * o.k);
    g.fillStyle(0xf4f4f0, 1).fillCircle(p.x, p.y, R * p.k);
    // vision double quand tu as bu
    if (this.ivresse > 0) g.fillStyle(0xf4f4f0, 0.3).fillCircle(p.x + Math.sin(this.horloge * 1.3) * (3 + this.ivresse * 3), p.y, R * p.k);
  }
}
