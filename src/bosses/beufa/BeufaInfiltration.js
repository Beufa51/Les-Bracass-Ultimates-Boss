// =====================================================================
// BEUFA : infiltration de nuit dans sa base militaire, vue du dessus (façon Metal Gear).
// La base : caisses, piliers, tours de garde aux PROJECTEURS qui balayent, et des gardes
// en ronde avec leur CÔNE DE VISION — bloqué par les caisses et les murs.
// Objectif : remonter jusqu'à LA PORTE DU QG, tout en haut, sans se faire toucher.
// Le cône d'un garde te voit : la jauge « ? » se remplit ; pleine = « ! » + POURSUITE.
// Touché = RENVOYÉ au départ, les gardes reprennent leurs rondes (jamais de mort).
// Z = sprint (rapide mais BRUYANT), X = lancer une PIERRE : les gardes iront voir ailleurs.
// Toute la logique avance dans update() (pas de minuteries Phaser) : les bots de test
// peuvent jouer en accéléré. (Squelette : la phase 2 — le QUIZ de Beufa — arrive ensuite.)
// =====================================================================
import { BossScene } from '../../core/BossScene.js';
import { creerTouches, vientDAppuyer } from '../../core/clavier.js';
import { texte } from '../../core/ui.js';
import { LARGEUR, HAUTEUR } from '../../core/reglages.js';
import { jouerSon } from '../../core/ressources.js';
import { estTactile, etiquettesTactiles } from '../../core/tactile.js';
import { formatTemps } from '../../core/sauvegarde.js';
import { IDENTITE, REGLAGES as R, CARTE } from './reglages.js';

const normAngle = (a) => { while (a > Math.PI) a -= Math.PI * 2; while (a < -Math.PI) a += Math.PI * 2; return a; };
const styleAlerte = { fontFamily: 'monospace', fontStyle: 'bold', fontSize: '26px', color: '#ffd84a', stroke: '#000000', strokeThickness: 5 };

export class BeufaInfiltration extends BossScene {
  constructor() { super('BeufaInfiltration', IDENTITE); }

  create() {
    this.phase = 'intro';   // intro | cinema | jeu | attrape | fin
    this.touches = creerTouches(this);
    etiquettesTactiles({ haut: '▲', bas: '▼', gauche: '◀', droite: '▶', espace: 'OK', z: 'Sprint', x: 'Pierre' });   // Espace valide l'intro (bouton OK sur téléphone)
    this.cameras.main.setBackgroundColor('#0a0e15');
    this.programme = [];   // la file des « dans X secondes, fais ça » (décomptée dans update)

    // le sol de la base (nuit)
    this.add.tileSprite(0, 0, LARGEUR, HAUTEUR, 'beufa_sol', 0).setOrigin(0);   // frame 0 explicite, comme le hub

    // les obstacles : ils bloquent le passage ET la vue
    this.obstacles = [];
    for (const [x, y, l, h] of CARTE.murs) {
      // murs façon NÉS : la bande se pave avec sa texture (chapeau éclairé + face sombre = du VOLUME)
      if (l >= h) this.add.tileSprite(x, y, l, h, 'beufa_mur', 0).setOrigin(0.5).setDepth(21);
      else this.add.tileSprite(x, y, l, h, 'beufa_mur_v', 0).setOrigin(0.5).setDepth(21);
      this.obstacles.push({ x, y, l, h });
    }
    // les portes VERROUILLÉES des pièces à venir (prévues sur le plan) : dessinées, elles bloquent
    for (const [x, y, l, h] of (CARTE.portesVerrouillees || [])) {
      this.add.image(x, y, 'beufa_porte_verrouillee').setRotation(Math.PI / 2).setDepth(22);
      this.obstacles.push({ x, y, l, h });
    }
    for (const [x, y] of CARTE.caisses) this.ajouterObstacle('beufa_caisse', x, y, 56, 56);
    for (const [x, y] of CARTE.piliers) this.ajouterObstacle('beufa_pilier', x, y, 34, 34);
    this.tours = CARTE.tours.map(([x, y]) => {
      const obs = this.ajouterObstacle('beufa_tour', x, y, 72, 72);
      return { x, y, angle: Math.random() * Math.PI * 2, jauge: 0, obs,
        alerte: this.add.text(x, y - 46, '', styleAlerte).setOrigin(0.5).setDepth(940) };
    });

    // LA PORTE DU QG : tout en haut, au centre — la ligne d'arrivée
    this.porte = this.add.image(950, 220, 'beufa_porte').setRotation(Math.PI / 2).setDepth(10);   // LA PORTE DU QG : en haut à droite

    // le héros (il part de la poche du bas, entre les deux bas de ronde)
    this.joueur = { x: 480, y: 490, angle: -Math.PI / 2 };
    this.sprJoueur = this.add.sprite(this.joueur.x, this.joueur.y, 'beufa_heros', 0).setDepth(30);

    // les gardes
    this.gardes = CARTE.gardes.map((g) => this.creerGarde(g));

    // les cônes de vision (redessinés à chaque image : les rayons s'arrêtent sur les caisses)
    this.conesG = this.add.graphics().setDepth(15);

    // le RADAR façon MGS (en haut à droite) : toute la base, les gardes et leurs cônes.
    // Il se COUPE pendant une alerte — dans MGS aussi, le radar saute quand on te cherche.
    this.radarG = this.add.graphics().setDepth(901);
    this.radarEtat = texte(this, 858, 204, 'NORMAL', 13, '#7fff7f').setDepth(901);

    this.alertes = 0; this.pierres = R.joueur.pierres; this.temps = 0; this.pierre = null;

    // le HUD
    texte(this, 18, 20, 'BEUFA — LA BASE', 20, '#ffd84a', { fontStyle: 'bold' }).setOrigin(0, 0.5).setDepth(900);
    this.hudTemps = texte(this, LARGEUR - 18, 20, '', 18, '#dff6ff').setOrigin(1, 0.5).setDepth(900);
    this.hudPierres = texte(this, 18, 44, '', 16, '#ffd84a').setOrigin(0, 0.5).setDepth(900);
    this.hudAlertes = texte(this, LARGEUR - 18, 44, '', 16, '#ff9a9a').setOrigin(1, 0.5).setDepth(900);
    texte(this, LARGEUR / 2, HAUTEUR - 12, (estTactile() ? 'Sprint : bruyant !   Pierre : diversion   atteins la PORTE DU QG en haut à droite' : 'Z : sprint (bruyant)   X : pierre (diversion)   atteins la PORTE DU QG en haut à droite'), 13, '#8a94a4').setDepth(900);
    this.message = texte(this, LARGEUR / 2, 150, '', 40, '#ffffff', { fontStyle: 'bold', strokeThickness: 8 }).setOrigin(0.5).setDepth(950).setAlpha(0);

    this.afficherIntro('BEUFA - L\'INFILTRATION', [
      'La nuit est tombée sur la base de BEUFA. Sa porte du QG est VERROUILLÉE.',
      'Remonte jusqu\'à elle sans te faire TOUCHER — les caisses cachent ta silhouette.',
      '◀ ▶ ▲ ▼ : bouger (silencieux)',
      (estTactile() ? 'Sprint' : 'Z') + ' : sprinter — plus rapide, mais les gardes proches T\'ENTENDENT',
      (estTactile() ? 'Pierre' : 'X') + ' : lancer une pierre — les gardes iront voir AILLEURS',
      'Le cône d\'un garde te voit : la jauge « ? » monte — sors avant le « ! ».',
      'En haut à droite, le RADAR montre les rondes — il se coupe pendant les alertes.',
      'Touché = renvoyé au départ ; les gardes reprennent leurs rondes.',
    ], () => this.cinema());
  }

  // la petite cinématique : Beufa monte à SA porte et la verrouille sous tes yeux
  cinema() {
    this.phase = 'cinema';
    const beufa = this.add.sprite(480, 230, 'beufa_boss', 0).setDepth(40).setScale(1.5);
    this.tweens.add({ targets: beufa, x: 840, y: 222, duration: 2000, ease: 'Sine.InOut' });
    this.dans(0.5, () => {
      this.cineTexte = texte(this, LARGEUR / 2, HAUTEUR - 60, 'BEUFA : « Personne n\'entre dans MON QG. Je VEILLE ! »', 19, '#ffd84a', { backgroundColor: '#000000cc', padding: { x: 14, y: 8 } }).setDepth(960);
    });
    this.dans(2.1, () => {
      jouerSon(this, 'beufa_verrou');
      beufa.setVisible(false);
      this.porte.setTint(0x9fb4d8);
      if (this.cineTexte) this.cineTexte.destroy();
    });
    this.dans(2.8, () => {
      this.phase = 'jeu';
      this.messageCentre('INFILTRE-TOI JUSQU\'À SA PORTE !', '#ffd84a', 1.8);
    });
  }

  ajouterObstacle(cle, x, y, l, h) {
    this.add.image(x, y, cle).setDepth(21);
    const o = { x, y, l, h };
    this.obstacles.push(o);
    return o;
  }

  creerGarde(g) {
    return {
      chemin: g.chemin, point: 1, x: g.chemin[0][0], y: g.chemin[0][1], angle: 0,
      etat: 'ronde', jauge: 0, vuX: 0, vuY: 0, perdu: 0, verif: 0, bouge: false, pauseT: 0,
      scan: g.scan || 0, scanBase: g.scanBase !== undefined ? g.scanBase : Math.PI / 2,
      sprite: this.add.sprite(g.chemin[0][0], g.chemin[0][1], 'beufa_garde', 0).setDepth(30),
      alerte: this.add.text(g.chemin[0][0], g.chemin[0][1] - 32, '', styleAlerte).setOrigin(0.5).setDepth(940),
    };
  }

  // ---------- la boucle : toute la logique avance ici, en secondes ----------
  update(temps, delta) {
    const dt = Math.min(0.05, delta / 1000);
    for (const a of this.programme) a.t -= dt;
    this.programme.filter(a => a.t <= 0).forEach(a => a.fn());
    this.programme = this.programme.filter(a => a.t > 0);
    if (this.phase !== 'jeu') return;
    this.temps += dt;
    this.pasJoueur(dt);
    this.pasPierre(dt);
    for (const g of this.gardes) this.pasGarde(g, dt);
    for (const t of this.tours) t.angle += R.tour.balayage * Math.PI / 180 * dt;
    this.detection(dt);
    this.afficher();
    this.majHud();
  }

  dans(sec, fn) { this.programme.push({ t: sec, fn }); }

  // ---------- le héros ----------
  pasJoueur(dt) {
    const t = this.touches;
    let dx = 0, dy = 0;
    if (t.gauche.isDown) dx -= 1;
    if (t.droite.isDown) dx += 1;
    if (t.haut.isDown) dy -= 1;
    if (t.bas.isDown) dy += 1;
    if (dx && dy) { dx *= Math.SQRT1_2; dy *= Math.SQRT1_2; }
    const sprint = t.z.isDown && (dx || dy);
    const v = (sprint ? R.joueur.sprint : R.joueur.vitesse) * dt;
    this.bouger(this.joueur, dx * v, dy * v, R.joueur.rayon);
    if (dx || dy) {
      this.joueur.angle = Math.atan2(dy, dx);
      this.sprJoueur.setFrame(Math.floor(this.temps * (sprint ? 11 : 7)) % 2);
      if (sprint) this.bruit();   // le sprint s'entend : les gardes proches se tournent vers toi
    } else this.sprJoueur.setFrame(0);
    if (vientDAppuyer(t.x) && this.pierres > 0) this.lancerPierre();
    // LA PORTE : atteinte ?
    if (this.joueur.x > 912 && this.joueur.y > 188 && this.joueur.y < 256) this.reussite();   // la PORTE DU QG
  }

  bouger(e, dx, dy, rayon) {
    e.x += dx; if (this.touche(e.x, e.y, rayon)) e.x -= dx;
    e.y += dy; if (this.touche(e.x, e.y, rayon)) e.y -= dy;
    e.x = Phaser.Math.Clamp(e.x, 22, LARGEUR - 22);
    e.y = Phaser.Math.Clamp(e.y, 22, HAUTEUR - 22);
  }

  touche(x, y, r) {
    for (const o of this.obstacles) {
      if (x > o.x - o.l / 2 - r && x < o.x + o.l / 2 + r && y > o.y - o.h / 2 - r && y < o.y + o.h / 2 + r) return true;
    }
    return false;
  }

  bruit() {
    for (const g of this.gardes) {
      if (g.etat === 'ronde' && Math.hypot(g.x - this.joueur.x, g.y - this.joueur.y) < R.joueur.bruit) {
        g.angle = Math.atan2(this.joueur.y - g.y, this.joueur.x - g.x);
        g.jauge = Math.max(g.jauge, 0.2);
      }
    }
  }

  // ---------- la pierre de diversion ----------
  lancerPierre() {
    this.pierres--;
    const a = this.joueur.angle;
    this.pierre = { x: this.joueur.x, y: this.joueur.y, dx: Math.cos(a), dy: Math.sin(a), reste: R.joueur.porteePierre,
      sprite: this.add.image(this.joueur.x, this.joueur.y, 'beufa_pierre').setDepth(35) };
    jouerSon(this, 'beufa_pierre');
  }

  pasPierre(dt) {
    if (!this.pierre) return;
    const p = this.pierre, pas = Math.min(340 * dt, p.reste);
    p.reste -= pas;
    const nx = p.x + p.dx * pas, ny = p.y + p.dy * pas;
    if (this.touche(nx, ny, 5) || p.reste <= 0) { this.pierreToucheSol(nx, ny); return; }
    p.x = nx; p.y = ny;
    p.sprite.setPosition(nx, ny);
  }

  pierreToucheSol(x, y) {
    this.pierre.sprite.destroy();
    this.pierre = null;
    const clac = texte(this, x, y, 'CLAC !', 20, '#dff6ff', { fontStyle: 'bold' }).setDepth(940);
    this.tweens.add({ targets: clac, alpha: 0, y: y - 20, duration: 700, onComplete: () => clac.destroy() });
    for (const g of this.gardes) {
      if ((g.etat === 'ronde' || g.etat === 'retour') && Math.hypot(g.x - x, g.y - y) < 300) {
        g.etat = 'verification'; g.verif = R.alerte.verification; g.vuX = x; g.vuY = y; g.jauge = 0;
      }
    }
  }

  // ---------- les gardes ----------
  pasGarde(g, dt) {
    g.bouge = false;
    if (g.etat === 'ronde') {
      if (g.scan) {   // le planté : il balaie sur place, jamais il ne bouge
        g.angle = g.scanBase + Math.sin(this.temps * 0.7) * g.scan * Math.PI / 180;
      } else if (g.pauseT > 0) {   // MGS : arrivé au bout de sa ronde, il S'ARRÊTE et regarde autour
        g.pauseT -= dt;
        g.angle += Math.sin(this.temps * 2.4) * dt * 1.9;
      } else {
        const cible = g.chemin[g.point];
        const dx = cible[0] - g.x, dy = cible[1] - g.y, d = Math.hypot(dx, dy);
        if (d < 4) { g.point = (g.point + 1) % g.chemin.length; g.pauseT = R.garde.pause; }
        else {
          const v = R.garde.vitesseRonde * dt / d;
          g.x += dx * v; g.y += dy * v;
          g.angle = Math.atan2(dy, dx);
          g.bouge = true;
        }
      }
    } else if (g.etat === 'poursuite') {
      if (this.vuPar(g)) { g.vuX = this.joueur.x; g.vuY = this.joueur.y; g.perdu = 0; }
      else {
        g.perdu += dt;
        if (g.perdu > R.alerte.poursuiteMax) { g.etat = 'verification'; g.verif = R.alerte.verification; return; }
      }
      const dx = g.vuX - g.x, dy = g.vuY - g.y, d = Math.hypot(dx, dy) || 1;
      g.angle = Math.atan2(dy, dx);
      this.bouger(g, dx / d * R.garde.vitessePoursuite * dt, dy / d * R.garde.vitessePoursuite * dt, R.garde.rayon);
      g.bouge = true;
      if (Math.hypot(this.joueur.x - g.x, this.joueur.y - g.y) < R.alerte.rattrape) this.attraper();
    } else if (g.etat === 'verification') {
      const dx = g.vuX - g.x, dy = g.vuY - g.y, d = Math.hypot(dx, dy);
      if (d > 6) {
        const v = R.garde.vitesseRonde * 1.4 * dt / d;
        this.bouger(g, dx * v, dy * v, R.garde.rayon);
        g.angle = Math.atan2(dy, dx);
        g.bouge = true;
      } else {
        g.verif -= dt;
        g.angle += dt * 2.4;   // il fouille des yeux à droite à gauche
        if (g.verif <= 0) g.etat = 'retour';
      }
    } else if (g.etat === 'retour') {
      const cible = g.chemin[g.point];
      const dx = cible[0] - g.x, dy = cible[1] - g.y, d = Math.hypot(dx, dy);
      if (d < 6) g.etat = 'ronde';
      else {
        const v = R.garde.vitesseRonde * 1.4 * dt / d;
        this.bouger(g, dx * v, dy * v, R.garde.rayon);
        g.angle = Math.atan2(dy, dx);
        g.bouge = true;
      }
    }
  }

  // est-ce que CE garde te voit, là, maintenant ? (cône + distance + caisses qui coupent la vue)
  vuPar(g) {
    const dx = this.joueur.x - g.x, dy = this.joueur.y - g.y, d = Math.hypot(dx, dy);
    if (d > R.garde.portee) return false;
    if (Math.abs(normAngle(Math.atan2(dy, dx) - g.angle)) > R.garde.angle * Math.PI / 180) return false;
    return !this.vueBloquee(g.x, g.y, this.joueur.x, this.joueur.y, null);
  }

  // la ligne de vue coupe-t-elle un obstacle ? (exclu : l'obstacle D'UNE TOUR pour elle-même)
  vueBloquee(x1, y1, x2, y2, exclu) {
    return this.porteeVue(x1, y1, x2 - x1, y2 - y1, exclu) < 1;
  }

  // le premier obstacle touché par le segment (0 = au départ, 1 = à l'arrivée)
  porteeVue(x, y, dx, dy, exclu) {
    let t = 1;
    for (const o of this.obstacles) {
      if (o === exclu) continue;
      const u = this.rayonAABB(x, y, dx, dy, o);
      if (u !== null && u < t) t = u;
    }
    return t;
  }

  rayonAABB(x, y, dx, dy, o) {
    const minX = o.x - o.l / 2, maxX = o.x + o.l / 2, minY = o.y - o.h / 2, maxY = o.y + o.h / 2;
    let t0 = 0, t1 = 1, ta, tb;
    if (Math.abs(dx) < 1e-9) { if (x < minX || x > maxX) return null; }
    else {
      ta = (minX - x) / dx; tb = (maxX - x) / dx;
      if (ta > tb) { const e = ta; ta = tb; tb = e; }
      t0 = Math.max(t0, ta); t1 = Math.min(t1, tb);
      if (t0 > t1) return null;
    }
    if (Math.abs(dy) < 1e-9) { if (y < minY || y > maxY) return null; }
    else {
      ta = (minY - y) / dy; tb = (maxY - y) / dy;
      if (ta > tb) { const e = ta; ta = tb; tb = e; }
      t0 = Math.max(t0, ta); t1 = Math.min(t1, tb);
      if (t0 > t1) return null;
    }
    return t0;
  }

  // ---------- le repérage : « ? » qui monte, puis « ! » ----------
  detection(dt) {
    for (const g of this.gardes) {
      const vu = this.vuPar(g);
      if (g.etat === 'ronde') {
        if (vu) { g.jauge += dt / R.garde.reperage; if (g.jauge >= 1) this.declencherAlerte(g); }
        else g.jauge = Math.max(0, g.jauge - dt / 0.5);
        g.alerte.setText(g.jauge > 0.12 ? '?' : '').setColor(g.jauge > 0.5 ? '#ff9a5a' : '#ffd84a');
      } else if (g.etat === 'verification' || g.etat === 'retour') {
        if (vu) this.declencherAlerte(g);
        g.alerte.setText('');
      } else {
        g.alerte.setText('!').setColor('#ff5a5a');
      }
    }
    for (const t of this.tours) {
      const demi = R.tour.angle * Math.PI / 180;
      const dx = this.joueur.x - t.x, dy = this.joueur.y - t.y, d = Math.hypot(dx, dy);
      const dedans = d < R.tour.portee
        && Math.abs(normAngle(Math.atan2(dy, dx) - t.angle)) < demi
        && !this.vueBloquee(t.x, t.y, this.joueur.x, this.joueur.y, t.obs);
      if (dedans) {
        t.jauge += dt / R.tour.reperage;
        if (t.jauge >= 1) { t.jauge = 0; this.declencherAlerte(this.gardeLePlusProche(t.x, t.y)); }
      } else t.jauge = Math.max(0, t.jauge - dt / 0.5);
      t.alerte.setText(t.jauge > 0.12 ? '?' : '').setColor('#ffd84a');
    }
  }

  gardeLePlusProche(x, y) {
    let meilleur = this.gardes[0], d = Infinity;
    for (const g of this.gardes) {
      const dd = Math.hypot(g.x - x, g.y - y);
      if (dd < d) { d = dd; meilleur = g; }
    }
    return meilleur;
  }

  declencherAlerte(g) {
    this.alertes++;
    jouerSon(this, 'beufa_alerte');
    this.cameras.main.shake(160, 0.005);
    g.etat = 'poursuite'; g.jauge = 1; g.perdu = 0; g.vuX = this.joueur.x; g.vuY = this.joueur.y;
    this.messageCentre('!', '#ff5a5a', 0.7);
    // l'alerte est COLLECTIVE : les gardes pas loin se joignent à la course
    for (const o of this.gardes) {
      if (o !== g && (o.etat === 'ronde' || o.etat === 'retour') && Math.hypot(o.x - g.x, o.y - g.y) < R.alerte.collective) {
        o.etat = 'poursuite'; o.jauge = 1; o.perdu = 0; o.vuX = this.joueur.x; o.vuY = this.joueur.y;
      }
    }
  }

  attraper() {
    if (this.phase !== 'jeu') return;
    this.phase = 'attrape';
    jouerSon(this, 'beufa_attrape');
    this.cameras.main.shake(280, 0.012);
    this.messageCentre('RENVOYÉ DU QG !', '#ff6b6b', 1.4);
    this.dans(1.7, () => this.remettreAuDepart());
  }

  remettreAuDepart() {
    this.joueur.x = 480; this.joueur.y = 490;
    this.pierres = R.joueur.pierres;
    for (const g of this.gardes) {
      g.etat = 'ronde'; g.jauge = 0; g.bouge = false; g.pauseT = 0;
      g.x = g.chemin[0][0]; g.y = g.chemin[0][1]; g.point = 1;
      g.alerte.setText('');
    }
    for (const t of this.tours) { t.jauge = 0; t.alerte.setText(''); }
    if (this.pierre) { this.pierre.sprite.destroy(); this.pierre = null; }
    this.phase = 'jeu';
  }

  reussite() {
    if (this.phase !== 'jeu') return;
    this.phase = 'fin';
    jouerSon(this, 'beufa_reussi');
    this.victoire('Pièces 1 et 2 infiltrées en ' + formatTemps(this.temps) + ' ! Alertes déclenchées : ' + this.alertes + '. Les pièces suivantes de la base arrivent, puis le QUIZ !');
  }

  // ---------- l'affichage ----------
  afficher() {
    this.sprJoueur.setPosition(this.joueur.x, this.joueur.y).setRotation(this.joueur.angle);
    const gg = this.conesG;
    gg.clear();
    for (const t of this.tours) {
      this.dessinerCone(gg, t.x, t.y, t.angle, R.tour, 0xfff3b0, t.obs);
      t.alerte.setPosition(t.x, t.y - 46);
    }
    for (const g of this.gardes) {
      g.sprite.setPosition(g.x, g.y).setRotation(g.angle).setFrame(g.bouge ? Math.floor(this.temps * 6) % 2 : 0);
      g.alerte.setPosition(g.x, g.y - 32);
      this.dessinerCone(gg, g.x, g.y, g.angle, R.garde, g.etat === 'poursuite' ? 0xff5a5a : 0xffe9a0, null);
    }
    this.dessinerRadar();
  }

  // le radar façon MGS : la base entière dans un cercle — murs, gardes, cônes, héros.
  // NORMAL (vert) / RECHERCHE (orange) / ALERTE (rouge, radar coupé avec des parasites).
  dessinerRadar() {
    const g = this.radarG, cx = 858, cy = 128, rr = 64;
    const alerte = this.gardes.some(x => x.etat === 'poursuite');
    const recherche = this.gardes.some(x => x.etat === 'verification' || x.etat === 'retour');
    g.clear();
    g.fillStyle(0x001a06, 0.88); g.fillCircle(cx, cy, rr);
    g.lineStyle(2, alerte ? 0xff5a5a : recherche ? 0xffb347 : 0x35d035, 1); g.strokeCircle(cx, cy, rr);
    this.radarEtat.setText(alerte ? 'ALERTE !' : recherche ? 'RECHERCHE' : 'NORMAL')
      .setColor(alerte ? '#ff5a5a' : recherche ? '#ffb347' : '#7fff7f');
    if (alerte) {   // radar coupé : des parasites défilent, comme dans MGS
      g.lineStyle(1, 0xff5a5a, 0.5);
      for (let k = 0; k < 8; k++) {
        const d1 = cy - 44 + k * 11 + (this.temps * 61 % 11);
        const d2 = cy - 44 + k * 11 + (this.temps * 37 % 11);
        g.lineBetween(cx - rr + 6, d1, cx + rr - 6, d2);
      }
      return;
    }
    const s = 110 / LARGEUR;   // toute la base (960x540) tient dans le cercle
    const P = (x, y) => ({ x: cx + (x - 480) * s, y: cy + (y - 270) * s });
    g.lineStyle(1, 0x35d035, 0.85);
    for (const o of this.obstacles) { const p = P(o.x - o.l / 2, o.y - o.h / 2); g.strokeRect(p.x, p.y, Math.max(1, o.l * s), Math.max(1, o.h * s)); }
    for (const t of this.tours) { const p = P(t.x, t.y); g.fillStyle(0xffe9a0, 1); g.fillCircle(p.x, p.y, 2.5); }
    for (const gd of this.gardes) {
      const p = P(gd.x, gd.y);
      g.fillStyle(gd.etat === 'poursuite' ? 0xff5a5a : gd.etat === 'ronde' ? 0xffd84a : 0xffb347, 1);
      g.slice(p.x, p.y, R.garde.portee * s, gd.angle - R.garde.angle * Math.PI / 180, gd.angle + R.garde.angle * Math.PI / 180, false);
      g.fillPath();
      g.fillCircle(p.x, p.y, 2.4);
    }
    const pj = P(this.joueur.x, this.joueur.y);
    g.fillStyle(0xffffff, 1); g.fillCircle(pj.x, pj.y, 3);
    g.lineStyle(1.5, 0xffffff, 1); g.lineBetween(pj.x, pj.y, pj.x + Math.cos(this.joueur.angle) * 8, pj.y + Math.sin(this.joueur.angle) * 8);
  }

  // le cône de vision : 13 rayons qui s'arrêtent sur les caisses, les murs et les tours
  dessinerCone(g, x, y, angle, reglages, couleur, exclu) {
    const demi = reglages.angle * Math.PI / 180, nb = 13;
    const points = [{ x, y }];
    for (let k = 0; k < nb; k++) {
      const a = angle - demi + (demi * 2 * k) / (nb - 1);
      const dist = this.porteeVue(x, y, Math.cos(a) * reglages.portee, Math.sin(a) * reglages.portee, exclu) * reglages.portee;
      points.push({ x: x + Math.cos(a) * dist, y: y + Math.sin(a) * dist });
    }
    g.fillStyle(couleur, 0.13);
    g.fillPoints(points, true);
    g.lineStyle(1.5, couleur, 0.45);
    g.strokePoints(points, true);
  }

  majHud() {
    this.hudTemps.setText(formatTemps(this.temps));
    this.hudAlertes.setText(this.alertes ? 'Alertes : ' + this.alertes : '');
    this.hudPierres.setText('Pierres : ' + '●'.repeat(this.pierres) + '○'.repeat(Math.max(0, R.joueur.pierres - this.pierres)));
  }

  messageCentre(txt, couleur, duree) {
    this.message.setText(txt).setColor(couleur).setAlpha(1).setScale(1.25);
    this.tweens.add({ targets: this.message, scale: 1, duration: 150 });
    this.tweens.add({ targets: this.message, alpha: 0, delay: duree * 1000, duration: 350 });
  }
}
