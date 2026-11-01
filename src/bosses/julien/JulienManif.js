// Boss Julien — NIVEAU 1 : LA MANIF (FPS façon Wolfenstein).
// Tu es un étudiant en pleine manif : traverse les rues jusqu'au portail du lycée.
// Les policiers lancent des lacrymos (nuage = tu perds de la vie, ta tête tousse), les CRS chargent au bouclier.
// Tu ripostes avec des ŒUFS : un policier touché assez de fois s'enfuit. Le bouclier arrête les œufs,
// sauf quand le CRS est essoufflé après sa charge (pas de côté pour l'esquiver, puis bombarde-le).
// La vue 3D est dessinée en basse résolution (480×270) puis agrandie ×2, façon années 90.
import { BossScene } from '../../core/BossScene.js';
import { creerTouches, vientDAppuyer } from '../../core/clavier.js';
import { texte, voile } from '../../core/ui.js';
import { LARGEUR, HAUTEUR } from '../../core/reglages.js';
import { jouerSon } from '../../core/ressources.js';
import { jouerMusique } from '../../core/musique.js';
import { estTactile, etiquettesTactiles } from '../../core/tactile.js';
import { IDENTITE, REGLAGES as RG } from './reglages.js';
import { PLAN_MANIF, OBJETS, SECRETS, ZONES, PARVIS, PAR } from './niveau_manif.js';
import { rendre, murEn, vueLibre } from './raycaster.js';
import { texturesMurs, texturesSprites, texturesMain, chargerImages, appliquerImages } from './textures.js';
import { toileVisage, niveauVisage } from './visage.js';

const L = 480, H = 270, VUE_H = 222;   // toile basse résolution ; la vue 3D au-dessus, la barre du bas en dessous
const FOV = 0.66;                      // largeur du champ de vision (≈ 66°)
let T = null;                          // dessins (faits une seule fois)

function degrade(h, haut, bas) {
  const c = document.createElement('canvas'); c.width = 4; c.height = h;
  const g = c.getContext('2d'); const d = g.createLinearGradient(0, 0, 0, h);
  d.addColorStop(0, haut); d.addColorStop(1, bas); g.fillStyle = d; g.fillRect(0, 0, 4, h);
  return c;
}

export class JulienManif extends BossScene {
  constructor() { super('JulienManif', IDENTITE); }

  preload() {
    chargerImages(this);   // vraies images (assets/sprites/julien/), avant la barre de chargement commune
    super.preload();
  }

  create() {
    if (!T) {
      T = { murs: texturesMurs(), spr: texturesSprites(), main: texturesMain(),
        ciel: degrade(VUE_H / 2, '#7f8fa3', '#c9cdd0'), sol: degrade(VUE_H / 2, '#4a4a4e', '#2a2a2c') };
      appliquerImages(this, T);
    }
    etiquettesTactiles({ espace: 'OK', z: null, x: null });   // intro : seulement OK (les boutons du jeu arrivent au départ)
    this.cameras.main.setBackgroundColor('#000000');

    if (this.textures.exists('julien_vue')) this.textures.remove('julien_vue');
    this.toile = this.textures.createCanvas('julien_vue', L, H);
    this.toile.setFilter(Phaser.Textures.FilterMode.NEAREST);
    this.ctx = this.toile.getContext();
    this.ctx.imageSmoothingEnabled = false;
    this.add.image(0, 0, 'julien_vue').setOrigin(0).setScale(LARGEUR / L, HAUTEUR / H);

    this.plan = PLAN_MANIF;
    this.lireNiveau();

    // barre du bas : chiffres en haute résolution par-dessus la toile
    const yb = VUE_H * 2;
    texte(this, 92, yb + 20, 'VIE', 14, '#c9b48a');
    this.txtVie = texte(this, 92, yb + 58, '', 40, '#ff5a3c');
    texte(this, 300, yb + 20, 'ŒUFS', 14, '#c9b48a');
    this.txtOeufs = texte(this, 300, yb + 58, '', 40, '#fff2c8');
    texte(this, 660, yb + 20, 'POLICIERS REPOUSSÉS', 14, '#c9b48a');
    this.txtFlics = texte(this, 660, yb + 58, '', 32, '#9fd0ff');
    texte(this, 868, yb + 20, 'LYCÉE', 14, '#c9b48a');
    // tête du héros (vraie image, en haute résolution par-dessus la barre)
    this.tete = T.tetes ? this.add.image(LARGEUR / 2, yb + 50, 'julien_tetes', 0).setDisplaySize(82, 84) : null;
    this.txtMsg = texte(this, 16, 14, '', 18, '#ffffff').setOrigin(0, 0).setStroke('#000', 4);
    this.msgT = 0;

    this.touches = creerTouches(this);
    const K = Phaser.Input.Keyboard.KeyCodes;
    // commandes de Doom (1993), tout au clavier : Alt + ← → pas de côté (ou , et .), Ctrl tirer, Maj courir
    this.cotes = this.input.keyboard.addKeys({ alt: K.ALT, ctrl: K.CTRL, maj: K.SHIFT, virgule: K.COMMA, point: K.PERIOD,
      q: K.Q, d: K.D });
    this.tactile = estTactile();   // téléphone : croix = avancer / reculer / pas de côté, « Tourner » maintenu + ◀ ▶ = tourner
    this.enJeu = false;
    jouerMusique(this, 'julien_musique');   // « At Doom's Gate », en boucle
    this.dessiner(0);
    const tact = estTactile();
    this.afficherIntro('LA MANIF', [
      'Rejoins le portail du LYCÉE à travers la manif !',
      tact ? '▲ ▼ : avancer / reculer      ◀ ▶ : pas de côté' : '↑ ↓ : avancer / reculer      ← → : tourner',
      tact ? 'TOURNER (maintenu) + ◀ ▶ : tourner' : 'ALT + ← → (ou , et .) : pas de côté',
      tact ? 'ŒUF : lancer un œuf' : 'CTRL : lancer un œuf      MAJ : courir',
      'Les lacrymos piquent : sors vite du nuage.',
      'Le bouclier arrête les œufs, SAUF quand le CRS',
      'est essoufflé après sa charge : esquive de côté puis vise !',
    ], () => { etiquettesTactiles({ z: 'ŒUF', x: 'TOURNER', espace: null }); this.enJeu = true; });
  }

  // ------------------------------------------------------------------ niveau
  lireNiveau() {
    const j = RG.joueur;
    this.j = { x: 2.5, y: 2.5, a: -Math.PI / 2, vie: j.vie, oeufs: RG.oeufs.depart, recharge: 0, lanceT: 0, bob: 0,
      regard: 0, regardT: 1.2, expr: 'normal', exprT: 0, rouge: 0, gaz: 0 };
    this.ennemis = []; this.objets = []; this.oeufs = []; this.grenades = []; this.nuages = []; this.splats = [];
    this.sortie = null;
    this.secrets = new Map(); this.secretsTrouves = 0;
    let nm = 0;
    this.plan = this.plan.map((ligne, y) => [...ligne].map((c, x) => {
      const px = x + 0.5, py = y + 0.5;
      if (c === 'J') { this.j.x = px; this.j.y = py; return '.'; }
      if (c === 'S') return '.';
      if (SECRETS[c]) { this.secrets.set(`${x},${y}`, true); return SECRETS[c]; }
      const type = OBJETS[c];
      if (!type) return c;
      if (type === 'lanceur' || type === 'bouclier') {
        this.ennemis.push({ type, x: px, y: py, vie: RG[type].vie, etat: 'attente', t: 1 + Math.random(), anim: 0, bouge: false,
          vuX: px, vuY: py, alerte: false, cdx: 0, cdy: 0, actif: true,
          parvis: x >= PARVIS.x0 && x <= PARVIS.x1 && y >= PARVIS.y0 && y <= PARVIS.y1 });
      } else {
        const solide = type !== 'oeufs' && type !== 'sandwich';
        const rayon = { barriere: 0.45, statue: 0.75, camion: 1.05, colonne: 0.4 }[type] || 0.3;
        const o = { type, x: px, y: py, solide, rayon, actif: true, n: nm };
        if (type === 'manifestant') nm++;
        this.objets.push(o);
      }
      return '.';
    }).join(''));
    this.sortieCases = new Set();
    PLAN_MANIF.forEach((l, y) => [...l].forEach((c, x) => { if (c === 'S') this.sortieCases.add(`${x},${y}`); }));
    const cs = [...this.sortieCases].map(k => k.split(',').map(Number));
    this.sortie = { x: cs.reduce((a, c) => a + c[0], 0) / cs.length + 0.5, y: cs[0][1] + 0.5 };   // la boussole vise la cour
    this.total = this.ennemis.length;
    this.repousses = 0;
    this.totalObjets = this.objets.filter(o => !o.solide).length; this.ramasses = 0;
    this.zonesVues = new Set(); this.portailOuvert = false; this.temps = 0;
  }

  message(t, duree = 2.8) { this.txtMsg.setText(t); this.msgT = duree; }

  // collision : murs + objets solides (cercle). ignore : l'entité qui bouge (pour ne pas se bloquer elle-même)
  libre(x, y, r, ignore) {
    const p = this.plan;
    if (murEn(p, x - r, y - r) || murEn(p, x + r, y - r) || murEn(p, x - r, y + r) || murEn(p, x + r, y + r)) return false;
    for (const o of this.objets) if (o.actif && o.solide && o !== ignore && Math.hypot(o.x - x, o.y - y) < r + o.rayon) return false;
    return true;
  }
  deplacer(e, dx, dy, r, ignore) {
    let bloque = false;
    if (this.libre(e.x + dx, e.y, r, ignore)) e.x += dx; else bloque = true;
    if (this.libre(e.x, e.y + dy, r, ignore)) e.y += dy; else bloque = true;
    return bloque;
  }

  degats(n, sx, sy) {
    const j = this.j;
    if (j.vie <= 0) return;
    j.vie = Math.max(0, j.vie - n);
    if (sx !== undefined) {
      const dx = Math.cos(j.a), dy = Math.sin(j.a);
      const droite = (sx - j.x) * -dy + (sy - j.y) * dx;
      j.regard = droite > 0.2 ? 1 : droite < -0.2 ? -1 : 0;
      j.expr = 'aie'; j.exprT = 0.6; j.rouge = 0.55;
      jouerSon(this, 'julien_aie');
    }
    if (j.vie <= 0) {
      j.expr = 'ko'; j.exprT = 99;
      this.enJeu = false;
      this.time.delayedCall(1200, () => this.defaite('Gazé ! Les CRS t\'ont renvoyé chez toi. Le lycée attendra…'));
    }
  }

  // ------------------------------------------------------------------ boucle
  update(temps, delta) {
    const dt = Math.min(delta / 1000, 0.05);
    if (this.enJeu && !this.termine) {
      this.bougerJoueur(dt);
      this.ennemis.forEach(e => this.ia(e, dt));
      this.projectiles(dt);
      this.ramasser();
      this.temps += dt;
      const j = this.j;
      ZONES.forEach((z, i) => {   // message à la première entrée dans une zone
        if (!this.zonesVues.has(i) && j.x >= z.x0 && j.x < z.x1 + 1 && j.y >= z.y0 && j.y < z.y1 + 1) { this.zonesVues.add(i); this.message(this.portailOuvert && z.ouvert ? z.ouvert : z.texte, 4.5); }
      });
      if (!this.portailOuvert && this.ennemis.every(e => !e.parvis || !e.actif || e.etat === 'fuite')) this.ouvrirPortail();
      if (this.sortieCases.has(`${j.x | 0},${j.y | 0}`)) this.finNiveau();
    }
    this.majVisage(dt);
    this.dessiner(dt);
  }

  bougerJoueur(dt) {
    const j = this.j, k = this.touches, c = this.cotes, R = RG.joueur;
    // Clavier (Doom 93) : ← → tournent, Alt + ← → = pas de côté.
    // Téléphone (demande de Fabien) : ◀ ▶ = pas de côté, bouton « TOURNER » (touche X) maintenu + ◀ ▶ = tourner.
    const modeCote = this.tactile ? !k.x.isDown : (c.alt.isDown || k.x.isDown);
    const course = c.maj.isDown || k.espace.isDown ? R.course : 1;
    let tourne = 0, avance = 0, cote = 0;
    if (k.gauche.isDown) { if (modeCote) cote -= 1; else tourne -= 1; }
    if (k.droite.isDown) { if (modeCote) cote += 1; else tourne += 1; }
    if (c.virgule.isDown || c.q.isDown) cote -= 1;
    if (c.point.isDown || c.d.isDown) cote += 1;
    if (k.haut.isDown) avance += course;
    if (k.bas.isDown) avance -= course;
    cote = Math.sign(cote) * course;
    j.a += tourne * R.rotation * (course > 1 ? 1.4 : 1) * dt;
    const dx = Math.cos(j.a), dy = Math.sin(j.a);
    const mx = (dx * avance * R.vitesse + -dy * cote * R.vitesseCote) * dt;
    const my = (dy * avance * R.vitesse + dx * cote * R.vitesseCote) * dt;
    this.deplacer(j, mx, my, R.rayon);
    if (mx || my) j.bob += dt * 9;
    // mur secret : il s'ouvre quand on pousse dedans en avançant
    if (avance > 0) {
      const k = `${(j.x + dx * 0.5) | 0},${(j.y + dy * 0.5) | 0}`;
      if (this.secrets.get(k)) this.ouvrirSecret(k);
    }
    // les policiers ne se traversent pas
    for (const e of this.ennemis) if (e.actif && e.etat !== 'fuite') {
      const d = Math.hypot(j.x - e.x, j.y - e.y);
      if (d < 0.55 && d > 0.001) this.deplacer(j, (j.x - e.x) / d * (0.55 - d), (j.y - e.y) / d * (0.55 - d), R.rayon);
    }

    j.recharge -= dt; j.lanceT -= dt;
    if ((k.z.isDown || c.ctrl.isDown) && j.recharge <= 0) {
      if (j.oeufs > 0) {
        j.oeufs--; j.recharge = RG.oeufs.cadence; j.lanceT = 0.18;
        const [vx, vy] = this.viser(dx, dy);
        this.oeufs.push({ x: j.x + vx * 0.3, y: j.y + vy * 0.3, dx: vx, dy: vy, t: 0 });
        jouerSon(this, 'julien_lancer');
      } else if (vientDAppuyer(k.z) || vientDAppuyer(c.ctrl)) { this.message('Plus d\'œufs ! Cherche une boîte.'); j.recharge = 0.5; }
    }
  }

  // Aide à la visée : un œuf lancé presque vers un policier (écart < aide) part droit sur lui
  viser(dx, dy) {
    const j = this.j;
    let meilleur = this.tactile ? RG.oeufs.aideTactile : RG.oeufs.aide, vx = dx, vy = dy;
    for (const e of this.ennemis) if (e.actif && e.etat !== 'fuite') {
      const ox = e.x - j.x, oy = e.y - j.y, d = Math.hypot(ox, oy);
      if (d > 12 || d < 0.3) continue;
      const ecart = Math.abs(Math.atan2(dx * oy - dy * ox, dx * ox + dy * oy));
      if (ecart < meilleur && vueLibre(this.plan, j.x, j.y, e.x, e.y)) { meilleur = ecart; vx = ox / d; vy = oy / d; }
    }
    return [vx, vy];
  }

  // un policier qui te repère (ou entend un œuf s'écraser) prévient ses collègues proches
  alerter(x, y, rayon) {
    for (const e of this.ennemis) if (e.actif && !e.alerte && Math.hypot(e.x - x, e.y - y) < rayon) {
      e.alerte = true; e.vuX = this.j.x; e.vuY = this.j.y; e.t = 0.8 + Math.random() * 0.6;
    }
  }

  ouvrirSecret(k) {
    this.secrets.set(k, false);
    const [x, y] = k.split(',').map(Number);
    this.plan[y] = this.plan[y].slice(0, x) + '.' + this.plan[y].slice(x + 1);
    this.secretsTrouves++;
    jouerSon(this, 'julien_ramasse', { rate: 0.7 });
    this.message('PASSAGE SECRET !');
  }

  ouvrirPortail() {
    this.portailOuvert = true;
    this.plan = this.plan.map(l => l.replace(/7/g, '.'));
    jouerSon(this, 'julien_fuite', { rate: 0.6 });
    this.message('Le parvis est libre : le CPE ouvre le portail ! Entre vite !', 4);
  }

  ia(e, dt) {
    if (!e.actif) return;
    const j = this.j, R = RG[e.type];
    const ox = j.x - e.x, oy = j.y - e.y, d = Math.hypot(ox, oy);
    const voit = j.vie > 0 && d < R.vue && vueLibre(this.plan, e.x, e.y, j.x, j.y);
    if (voit) { e.vuX = j.x; e.vuY = j.y; if (!e.alerte) { e.alerte = true; e.t = 0.6 + Math.random() * 0.6; this.alerter(e.x, e.y, 6); } }
    e.t -= dt; e.bouge = false;
    const marcher = (vx, vy, vitesse) => {
      const n = Math.hypot(vx, vy); if (n < 0.01) return true;
      e.bouge = true; e.anim += dt;
      return this.deplacer(e, vx / n * vitesse * dt, vy / n * vitesse * dt, 0.28);
    };

    if (e.etat === 'fuite') {
      marcher(-ox, -oy, 2.6);
      if (e.t <= 0) e.actif = false;
      return;
    }
    if (e.etat === 'touche') { if (e.t <= 0) { e.etat = e.apres; e.t = e.tApres; } return; }

    if (e.type === 'lanceur') {
      if (e.etat === 'attente') { if (e.alerte) e.etat = 'chasse'; return; }
      if (e.etat === 'chasse') {
        if (voit) {
          if (d > R.distance + 0.6) marcher(ox, oy, R.vitesse);
          else if (d < R.distance - 1.2) marcher(-ox, -oy, R.vitesse);
          if (e.t <= 0) { e.etat = 'prepare'; e.t = R.preavis; }
        } else if (Math.hypot(e.vuX - e.x, e.vuY - e.y) > 0.3) marcher(e.vuX - e.x, e.vuY - e.y, R.vitesse);
        return;
      }
      if (e.etat === 'prepare' && e.t <= 0) {
        this.grenades.push({ x0: e.x, y0: e.y, x1: j.x, y1: j.y, t: 0, x: e.x, y: e.y, z: 0.6 });
        jouerSon(this, 'julien_tir');
        e.etat = 'lance'; e.t = 0.35;
        return;
      }
      if (e.etat === 'lance' && e.t <= 0) { e.etat = 'chasse'; e.t = R.cadence * (0.8 + Math.random() * 0.4); }
      return;
    }

    // CRS au bouclier
    if (e.etat === 'attente') { if (e.alerte) e.etat = 'approche'; return; }
    if (e.etat === 'approche') {
      if (voit) {
        if (d > 1) marcher(ox, oy, R.vitesse);
        if (d < R.porteeCharge && e.t <= 0) { e.etat = 'cri'; e.t = R.preavis; jouerSon(this, 'julien_cri'); this.message('« DISPERSEZ-VOUS ! »'); }
      } else if (Math.hypot(e.vuX - e.x, e.vuY - e.y) > 0.3) marcher(e.vuX - e.x, e.vuY - e.y, R.vitesse);
      return;
    }
    if (e.etat === 'cri' && e.t <= 0) {   // la direction est choisie à la FIN du cri : un pas de côté suffit à l'esquiver
      e.cdx = ox / d; e.cdy = oy / d; e.etat = 'charge'; e.t = R.dureeCharge;
      return;
    }
    if (e.etat === 'charge') {
      const bloque = marcher(e.cdx, e.cdy, R.vitesseCharge);
      if (d < 0.7) {
        this.degats(R.degats, e.x, e.y);
        this.deplacer(j, e.cdx * 0.9, e.cdy * 0.9, RG.joueur.rayon);
        e.etat = 'essouffle'; e.t = R.essouffle;
      } else if (bloque || e.t <= 0) { e.etat = 'essouffle'; e.t = R.essouffle; }
      return;
    }
    if (e.etat === 'essouffle' && e.t <= 0) { e.etat = 'approche'; e.t = 0.8; }
  }

  toucherEnnemi(e) {
    if (e.type === 'bouclier' && e.etat !== 'essouffle') { jouerSon(this, 'julien_plonk'); return; }
    e.vie--;
    jouerSon(this, 'julien_splat');
    if (e.vie <= 0) {
      e.etat = 'fuite'; e.t = 1.8; this.repousses++;
      jouerSon(this, 'julien_fuite');
      this.message(['Il s\'enfuit tout dégoulinant !', 'Omelette !', 'Un de moins !', 'Retour au commissariat !'][this.repousses % 4]);
      this.j.expr = 'content'; this.j.exprT = 0.9;
      return;
    }
    if (!e.alerte) { e.alerte = true; e.vuX = this.j.x; e.vuY = this.j.y; e.etat = e.type === 'lanceur' ? 'chasse' : 'approche'; }
    if (e.type === 'lanceur' && e.etat === 'prepare') return;   // le lancer part quand même
    e.apres = e.etat; e.tApres = e.t; e.etat = 'touche'; e.t = 0.22;
  }

  projectiles(dt) {
    const j = this.j;
    // œufs
    for (const o of this.oeufs) {
      if (o.fini) continue;
      o.t += dt;
      const pas = RG.oeufs.vitesse * dt;
      o.x += o.dx * pas; o.y += o.dy * pas;
      if (murEn(this.plan, o.x, o.y) || o.t > 2) { o.fini = true; this.alerter(o.x, o.y, 2.5); this.splats.push({ x: o.x - o.dx * 0.12, y: o.y - o.dy * 0.12, t: 1.5 }); jouerSon(this, 'julien_splat', { rate: 1.3 }); continue; }
      for (const b of this.objets) if (b.actif && b.solide && Math.hypot(b.x - o.x, b.y - o.y) < b.rayon) {
        o.fini = true; this.splats.push({ x: o.x, y: o.y, t: 1.2 });
        if (b.type === 'manifestant') this.message('« Hé ! Pas sur nous ! »');
        break;
      }
      if (o.fini) continue;
      for (const e of this.ennemis) if (e.actif && e.etat !== 'fuite' && Math.hypot(e.x - o.x, e.y - o.y) < 0.35) {
        o.fini = true; this.toucherEnnemi(e); break;
      }
    }
    this.oeufs = this.oeufs.filter(o => !o.fini);
    // grenades lacrymogènes : vol en cloche, puis nuage
    for (const g of this.grenades) {
      g.t += dt / RG.lacrymo.vol;
      const t = Math.min(1, g.t);
      g.x = g.x0 + (g.x1 - g.x0) * t; g.y = g.y0 + (g.y1 - g.y0) * t;
      g.z = 0.6 * (1 - t) + 1.4 * t * (1 - t);
      if (t >= 1) { g.fini = true; this.nuages.push({ x: g.x, y: g.y, t: RG.lacrymo.duree }); jouerSon(this, 'julien_gaz'); }
    }
    this.grenades = this.grenades.filter(g => !g.fini);
    j.gaz = Math.max(0, j.gaz - dt * 1.5);
    for (const n of this.nuages) {
      n.t -= dt;
      if (j.vie > 0 && Math.hypot(n.x - j.x, n.y - j.y) < RG.lacrymo.rayon) {
        this.degats(RG.lacrymo.degats * dt);
        j.gaz = Math.min(1, j.gaz + dt * 3);
        if (j.expr !== 'aie') { j.expr = 'tousse'; j.exprT = 0.4; }
      }
    }
    this.nuages = this.nuages.filter(n => n.t > 0);
    for (const s of this.splats) s.t -= dt;
    this.splats = this.splats.filter(s => s.t > 0);
  }

  ramasser() {
    const j = this.j;
    for (const o of this.objets) {
      if (!o.actif || o.solide || Math.hypot(o.x - j.x, o.y - j.y) > 0.5) continue;
      if (o.type === 'oeufs') {
        if (j.oeufs >= RG.oeufs.maxi) continue;
        j.oeufs = Math.min(RG.oeufs.maxi, j.oeufs + RG.oeufs.boite);
        this.message(`Une boîte d'œufs ! (+${RG.oeufs.boite})`);
      } else if (o.type === 'sandwich') {
        if (j.vie >= RG.joueur.vie) continue;
        j.vie = Math.min(RG.joueur.vie, j.vie + RG.sandwich);
        this.message(`Un sandwich, ça requinque ! (+${RG.sandwich})`);
      } else continue;
      o.actif = false; this.ramasses++;
      jouerSon(this, 'julien_ramasse');
      j.expr = 'content'; j.exprT = 0.9;
    }
  }

  finNiveau() {
    this.enJeu = false; this.termine = true;
    jouerSon(this, 'julien_ramasse');
    etiquettesTactiles({ espace: 'OK', z: null, x: null, haut: null, bas: null, gauche: null, droite: null });
    this.txtMsg.setText(''); this.msgT = 0;
    voile(this, 0.85).setDepth(1000);
    const pc = (a, b) => b ? `${Math.round(100 * a / b)}%` : '—';
    const mmss = (t) => `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, '0')}`;
    texte(this, LARGEUR / 2, 70, 'LA MANIF : TERMINÉ', 40, '#ffd84a').setDepth(1001);
    const lignes = [
      ['POLICIERS', pc(this.repousses, this.total)], ['OBJETS', pc(this.ramasses, this.totalObjets)],
      ['SECRETS', pc(this.secretsTrouves, this.secrets.size)], ['TEMPS', mmss(this.temps)], ['PAR', mmss(PAR)],
    ];
    lignes.forEach(([nom, val], n) => {   // les lignes apparaissent une par une, comme dans Doom
      this.time.delayedCall(400 + n * 450, () => {
        texte(this, LARGEUR / 2 - 40, 150 + n * 52, nom, 30, '#ff5a3c').setOrigin(1, 0.5).setDepth(1001);
        texte(this, LARGEUR / 2 + 40, 150 + n * 52, val, 30, '#ffffff').setOrigin(0, 0.5).setDepth(1001);
        jouerSon(this, 'julien_lancer');
      });
    });
    this.time.delayedCall(400 + lignes.length * 450, () => {
      texte(this, LARGEUR / 2, 430, 'Mais Julien t\'attend en classe… (niveau 2 bientôt)', 22, '#9fd0ff').setDepth(1001);
      texte(this, LARGEUR / 2, HAUTEUR - 50, `${estTactile() ? 'OK' : 'ESPACE'} : retour au hub`, 20, '#aaaaaa').setDepth(1001);
      this.attendreRetour(300);
    });
  }

  // ------------------------------------------------------------------ tête du héros
  majVisage(dt) {
    const j = this.j;
    j.exprT -= dt;
    if (j.exprT <= 0 && j.vie > 0) j.expr = 'normal';
    j.regardT -= dt;
    if (j.regardT <= 0 && j.expr === 'normal') { j.regard = [-1, 0, 0, 1][(Math.random() * 4) | 0]; j.regardT = 0.6 + Math.random() * 1.4; }
    j.rouge = Math.max(0, j.rouge - dt * 1.5);
    if (this.msgT > 0) { this.msgT -= dt; if (this.msgT <= 0) this.txtMsg.setText(''); }
  }

  // ------------------------------------------------------------------ dessin
  imageEnnemi(e) {
    const s = T.spr, p = e.type + '_';
    if (e.etat === 'fuite') return s[p + 'fuite'];
    if (e.etat === 'touche') return s[p + 'touche'];
    if (e.type === 'lanceur') {
      if (e.etat === 'prepare') return s[p + 'bras'];
      if (e.etat === 'lance') return s[p + 'lance'];
    } else {
      if (e.etat === 'cri') return s[p + 'cri'];
      if (e.etat === 'charge') return s[p + 'charge'];
      if (e.etat === 'essouffle') return s[p + 'essouffle'];
    }
    return s[p + ((e.bouge && (e.anim * 4 | 0) % 2) ? 'marche1' : 'marche0')];
  }

  dessiner() {
    const g = this.ctx, j = this.j, s = T.spr;
    const dx = Math.cos(j.a), dy = Math.sin(j.a);
    const cam = { x: j.x, y: j.y, dx, dy, px: -dy * FOV, py: dx * FOV };
    const liste = [];
    for (const o of this.objets) if (o.actif) {
      const t = o.type === 'manifestant' ? s['manifestant_' + (o.n % T.nbManif)] : s[o.type];
      const haut = T.hauteurs[o.type];
      liste.push({ x: o.x, y: o.y, toile: t, haut, z: o.type === 'manifestant' ? Math.abs(Math.sin(this.time.now / 300 + o.n)) * 0.03 : 0 });
    }
    for (const e of this.ennemis) if (e.actif) liste.push({ x: e.x, y: e.y, toile: this.imageEnnemi(e), haut: T.hauteurs[e.type], z: 0 });
    for (const o of this.oeufs) liste.push({ x: o.x, y: o.y, toile: s.oeuf, haut: T.hauteurs.oeuf, z: 0.42 });
    for (const gr of this.grenades) liste.push({ x: gr.x, y: gr.y, toile: s.grenade, haut: T.hauteurs.grenade, z: gr.z });
    for (const sp of this.splats) liste.push({ x: sp.x, y: sp.y, toile: s.splat, haut: T.hauteurs.splat, z: 0.38 });
    for (const n of this.nuages) liste.push({ x: n.x, y: n.y, toile: s.nuage, haut: T.hauteurs.nuage + 0.1 * Math.sin(n.t * 3), z: 0 });

    rendre(g, L, VUE_H, this.plan, cam, T.murs, liste, T.ciel, T.sol);

    // main qui tient l'œuf
    const bx = Math.sin(j.bob) * 5, by = Math.abs(Math.cos(j.bob)) * 4;
    if (T.main.image) {   // vraies images (210×240) : le bras sort du bas de l'écran
      if (j.lanceT > 0) g.drawImage(T.main.lance, L / 2 + 30, VUE_H - 128, 112, 128);
      else if (j.oeufs > 0) g.drawImage(T.main.tient, L / 2 + 60 + bx, VUE_H - 110 + by, 105, 120);
    } else if (j.lanceT > 0) g.drawImage(T.main.lance, L / 2 + 50, VUE_H - 82, 90, 80);
    else if (j.oeufs > 0) g.drawImage(T.main.tient, L / 2 + 70 + bx, VUE_H - 70 + by, 90, 80);
    // petit viseur au centre
    g.fillStyle = 'rgba(0,0,0,0.6)'; g.fillRect(L / 2 - 4, VUE_H / 2 - 1, 9, 3); g.fillRect(L / 2 - 1, VUE_H / 2 - 4, 3, 9);
    g.fillStyle = 'rgba(255,255,255,0.85)'; g.fillRect(L / 2 - 3, VUE_H / 2, 7, 1); g.fillRect(L / 2, VUE_H / 2 - 3, 1, 7);
    // voile de gaz et flash rouge
    if (j.gaz > 0) { g.fillStyle = `rgba(190,205,160,${0.5 * j.gaz})`; g.fillRect(0, 0, L, VUE_H); }
    if (j.rouge > 0) { g.fillStyle = `rgba(200,0,0,${j.rouge * 0.6})`; g.fillRect(0, 0, L, VUE_H); }

    this.dessinerBarre(g, cam);
    this.toile.refresh();
    this.txtVie.setText(`${Math.ceil(j.vie)}%`);
    this.txtOeufs.setText(`${j.oeufs}`);
    this.txtFlics.setText(`${this.repousses} / ${this.total}`);
  }

  dessinerBarre(g, cam) {
    const y0 = VUE_H, j = this.j;
    g.fillStyle = '#4b4136'; g.fillRect(0, y0, L, H - y0);
    g.fillStyle = '#6a5c4c'; g.fillRect(0, y0, L, 2);
    g.fillStyle = '#2c251e'; g.fillRect(0, H - 2, L, 2);
    for (const x of [92, 236, 400]) { g.fillStyle = '#2c251e'; g.fillRect(x, y0 + 3, 2, H - y0 - 6); }
    // tête du héros au milieu, dans son cadre
    g.fillStyle = '#1a1612'; g.fillRect(L / 2 - 21, y0 + 3, 42, 44);
    const niveau = niveauVisage(j.vie, RG.joueur.vie);
    if (this.tete) {   // planche : 5 niveaux × (gauche, face, droite), puis aïe gauche, aïe droite, tousse, content, KO
      const f = { aie: j.regard > 0 ? 16 : 15, tousse: 17, content: 18, ko: 19 }[j.expr] ?? niveau * 3 + j.regard + 1;
      this.tete.setFrame(f);
    } else g.drawImage(toileVisage(niveau, j.regard, j.expr), L / 2 - 17, y0 + 5);
    // boussole vers le lycée
    if (this.sortie) {
      const ang = Math.atan2(this.sortie.y - j.y, this.sortie.x - j.x) - j.a;
      const cx = 434, cy = y0 + 32, r = 10;
      g.strokeStyle = '#c9b48a'; g.lineWidth = 1; g.beginPath(); g.arc(cx, cy, r + 3, 0, Math.PI * 2); g.stroke();
      const ax = Math.sin(ang), ay = -Math.cos(ang);   // vers le haut = droit devant
      g.fillStyle = '#ffd84a'; g.beginPath();
      g.moveTo(cx + ax * r, cy + ay * r);
      g.lineTo(cx - ay * 4 - ax * 5, cy + ax * 4 - ay * 5);
      g.lineTo(cx + ay * 4 - ax * 5, cy - ax * 4 - ay * 5);
      g.fill();
    }
  }
}
