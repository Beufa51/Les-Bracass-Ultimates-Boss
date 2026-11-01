// Boss Julien — NIVEAU 2 : LA SALLE DE CLASSE (même moteur 3D que la manif, JulienManif.js dont elle hérite).
// Julien, le prof, fait les cent pas devant le tableau et te lance des LIVRES. Il lève le livre avant de lancer
// (préavis) : un pas de côté suffit. Les TABLES arrêtent les livres : ce sont tes abris.
// 3 phases (réglages : RG.julien) :
//  1 (> 50 % de vie) : un livre, ou un éventail de 3
//  2 (50-20 %)       : « INTERRO SURPRISE » : copies d'interro en vague, DICTIONNAIRE qui rebondit sur les murs
//  3 (< 20 %)        : il pète un câble : rafales de livres, plus rapide, il descend dans les allées vers toi
// Tu ripostes avec ce qui te reste de la manif : pancarte, œufs, tomates. Plus d'œufs ? Un camarade t'en fait passer.
import { JulienManif } from './JulienManif.js';
import { texte } from '../../core/ui.js';
import { LARGEUR } from '../../core/reglages.js';
import { jouerSon } from '../../core/ressources.js';
import { jouerMusique } from '../../core/musique.js';
import { estTactile } from '../../core/tactile.js';
import { vientDAppuyer } from '../../core/clavier.js';
import { REGLAGES as RG } from './reglages.js';
import { ARMES, choisirArme } from './armes.js';
import { murEn, vueLibre } from './raycaster.js';
import { PLAN_CLASSE, OBJETS_CLASSE, RAYONS_CLASSE, ESTRADE, CASES_SECOURS, REPLIQUES } from './niveau_classe.js';
import { construireDecorClasse, spritesClasse, HAUTEURS_CLASSE } from './decor_classe.js';

const L = 480, VUE_H = 222;   // comme JulienManif
const hasard = (liste) => liste[(Math.random() * liste.length) | 0];
const RANGEES = [1.6, 2.5, 3.4, 4.5, 5.5, 7.5, 9.5, 11.5];   // allées où Julien peut marcher en phase 3

export class JulienClasse extends JulienManif {
  constructor() { super('JulienClasse'); }

  // ------------------------------------------------------------------ points d'entrée (voir JulienManif)
  creerDecor() {
    const T = this.T;
    if (!T.classe) {
      Object.assign(T.spr, spritesClasse());
      Object.assign(T.hauteurs, HAUTEURS_CLASSE);
      T.classe = construireDecorClasse(this.ctx, L, VUE_H);
    }
    return T.classe;
  }
  planDepart() { return PLAN_CLASSE; }
  lancerMusique() { jouerMusique(this, 'julien_musique'); }

  create() {
    super.create();
    // barre du bas : la vie de Julien à la place des policiers, la phase à la place de la boussole
    this.lblFlics.setText('JULIEN');
    this.lblLycee.setText('PHASE');
    this.txtPhase = texte(this, 868, VUE_H * 2 + 58, '', 32, '#ffd84a');
    this.txtBoss = texte(this, LARGEUR / 2, 14, 'JULIEN, LE PROF', 16, '#ffd84a').setStroke('#000', 4).setDepth(5);
    this.txtMsg.setY(66);   // les répliques sous la barre de vie de Julien
    this.dessiner(0);
  }

  intro() {
    const tact = estTactile();
    this.afficherIntro('LA SALLE DE CLASSE', [
      'Julien, le prof, te lance des LIVRES !',
      'Il lève le livre avant de lancer : fais un PAS DE CÔTÉ.',
      'Les TABLES arrêtent les livres : planque-toi derrière.',
      'Le DICTIONNAIRE rebondit sur les murs ; les copies d\'interro arrivent en vague.',
      ...(tact ? [this.joy ? 'Joystick : avancer, reculer, pas de côté     ↺ ↻ : tourner' : '▲ ▼ avancer / reculer   ◀ ▶ pas de côté   ↺ ↻ tourner',
        'LANCER : tirer      ARME : changer d\'arme'] : this.lignesCommandes()),
      'Plus d\'œufs ? Un camarade t\'en fera passer sous la table.',
    ], () => this.demarrer());
  }

  demarrer() {
    super.demarrer();
    this.julien.etat = 'marche'; this.julien.t = 1.2;
    this.message(REPLIQUES.debut, 4);
  }

  appliquerDifficulte() {
    const C = RG.classe, m = this.diff.munitions;
    this.j.mun.oeufs = Math.round(C.oeufs * m); this.j.mun.tomates = Math.round(C.tomates * m);
    this.total = 1;
  }

  perdu() { super.perdu('COLLÉ !', 'Deux heures de retenue avec Julien… Retente ta chance !'); }

  // ------------------------------------------------------------------ niveau
  lireNiveau() {
    this.j = this.nouveauJoueur();
    this.j.armes = new Set(['pancarte', 'oeufs', 'tomates']);
    this.ennemis = []; this.objets = []; this.tirs = []; this.fumees = []; this.grenades = []; this.nuages = []; this.splats = [];
    this.farines = []; this.rideaux = []; this.secrets = new Map(); this.secretsTrouves = 0; this.fourgonFait = true;
    this.livres = []; this.secoursT = RG.classe.secoursT; this.finDemandee = false;
    this.plan = this.plan.map((ligne, y) => [...ligne].map((c, x) => {
      const px = x + 0.5, py = y + 0.5;
      if (c === 'J') { this.j.x = px; this.j.y = py; return '.'; }
      if (c === 'U') {
        this.julien = { type: 'julien', x: px, y: py, vie: RG.julien.vie, etat: 'attente', t: 1, anim: 0, bouge: false,
          vuX: px, vuY: py + 5, alerte: true, actif: true, phase: 1, cible: null, taches: [], flash: 0, reste: 0 };
        this.ennemis.push(this.julien);
        return '.';
      }
      const type = OBJETS_CLASSE[c];
      if (!type) return c;
      this.objets.push({ type, x: px, y: py, solide: !!RAYONS_CLASSE[type], rayon: RAYONS_CLASSE[type] || 0.3, actif: true, n: 0 });
      return '.';
    }).join(''));
    this.sortie = null; this.sortieCases = new Set();
    this.total = 1; this.repousses = 0;
    this.totalObjets = this.objets.filter(o => !o.solide).length; this.ramasses = 0;
    this.zonesVues = new Set(); this.portailOuvert = true; this.temps = 0;
  }

  // ------------------------------------------------------------------ boucle
  update(temps, delta) {
    const dt = Math.min(delta / 1000, 0.05);
    if (this.enJeu && !this.termine) {
      if (vientDAppuyer(this.touchesCarte.tab) || vientDAppuyer(this.touchesCarte.m)) this.carte = !this.carte;
      ['a1', 'a2', 'a3', 'a4', 'a5'].forEach((t, i) => { if (vientDAppuyer(this.touchesArmes[t])) choisirArme(this, ARMES[i].id); });
      this.bougerJoueur(dt);
      this.iaJulien(this.julien, dt);
      this.projectiles(dt);   // tes tirs (armes.js) et les taches
      this.avancerLivres(dt);
      this.ramasser();
      this.secours(dt);
      this.temps += dt;
      this.j.changeT = Math.max(0, (this.j.changeT || 0) - dt);
    }
    this.majVisage(dt);
    this.dessiner(dt);
  }

  // un camarade te fait passer une boîte d'œufs quand tu n'en as presque plus (jamais bloqué, comme dans Doom)
  secours(dt) {
    const j = this.j;
    if (j.mun.oeufs >= RG.classe.secours || this.objets.some(o => o.actif && o.type === 'oeufs')) return;
    this.secoursT -= dt;
    if (this.secoursT > 0) return;
    const libres = CASES_SECOURS.filter(([x, y]) => Math.hypot(x + 0.5 - j.x, y + 0.5 - j.y) > 1.5);
    const [x, y] = hasard(libres.length ? libres : CASES_SECOURS);
    this.objets.push({ type: 'oeufs', x: x + 0.5, y: y + 0.5, solide: false, rayon: 0.3, actif: true, n: 0 });
    this.secoursT = RG.classe.secoursT;
    this.message('Un camarade te fait passer une boîte d\'œufs sous la table !', 3);
  }

  // ------------------------------------------------------------------ Julien
  phaseDe(e) { const p = e.vie / RG.julien.vie; return p > 0.5 ? 1 : p > 0.2 ? 2 : 3; }

  nouvelleCible(e) {
    if (e.phase < 3) return { x: ESTRADE.x0 + Math.random() * (ESTRADE.x1 - ESTRADE.x0), y: ESTRADE.y0 + Math.random() * (ESTRADE.y1 - ESTRADE.y0) };
    // phase 3 : il descend dans les allées, en restant à 2 rangées de toi
    const but = Math.max(1.6, this.j.y - 2.5);
    const y = RANGEES.reduce((a, r) => Math.abs(r - but) < Math.abs(a - but) ? r : a, RANGEES[0]);
    return { x: 1.6 + Math.random() * 11.8, y };
  }

  iaJulien(e, dt) {
    const J = RG.julien, j = this.j, ph = e.phase - 1;
    const voit = j.vie > 0 && vueLibre(this.plan, e.x, e.y, j.x, j.y);
    if (voit) { e.vuX = j.x; e.vuY = j.y; }
    e.t -= dt; e.bouge = false; e.flash = Math.max(0, e.flash - dt);
    const marcher = (vx, vy, v) => {
      const n = Math.hypot(vx, vy); if (n < 0.01) return true;
      e.bouge = true; e.anim += dt;
      const x0 = e.x, y0 = e.y, bloque = this.deplacer(e, vx / n * v * dt, vy / n * v * dt, 0.3);
      e.vx = (e.x - x0) / dt; e.vy = (e.y - y0) / dt;   // pour l'aide à la visée (elle anticipe)
      return bloque;
    };
    e.vx = 0; e.vy = 0;
    switch (e.etat) {
      case 'attente': return;
      case 'fuite':   // vaincu : il s'assoit, sonné, puis l'écran de victoire
        if (e.t <= 0 && !this.finDemandee) { this.finDemandee = true; this.gagne(); }
        return;
      case 'pause': if (e.t <= 0) { e.etat = 'marche'; e.t = 0.5; e.cible = null; } return;
      case 'touche': if (e.t <= 0) { e.etat = e.apres; e.t = e.tApres; } return;
      case 'marche': {
        if (e.cible && Math.hypot(e.cible.x - e.x, e.cible.y - e.y) < 0.3) { e.cible = null; e.arret = J.arret[ph] * (0.6 + Math.random() * 0.8); }
        if (e.arret > 0) { e.arret -= dt; }   // il s'arrête un instant (c'est le moment de viser)
        if (!e.cible) e.cible = this.nouvelleCible(e);
        const recule = e.phase === 3 && Math.hypot(j.x - e.x, j.y - e.y) < 2;   // pas trop près quand même
        const bloque = e.arret > 0 && !recule ? false : recule ? marcher(e.x - j.x, e.y - j.y, J.vitesseRage) : marcher(e.cible.x - e.x, e.cible.y - e.y, e.phase === 3 ? J.vitesseRage : J.vitesse);
        if (bloque) e.cible = null;
        if (e.t <= 0 && voit) {
          e.etat = 'prepare'; e.t = J.preavis[ph]; e.motif = this.choisirMotif(e);
          if (Math.random() < 0.3) this.message(hasard(REPLIQUES.lancer), 2.2);
        }
        return;
      }
      case 'prepare':
        if (e.t <= 0) { this.lancerMotif(e, voit); e.etat = 'lance'; e.t = 0.35; }
        return;
      case 'lance':
        if (e.t > 0) return;
        if (e.reste > 0) { e.reste--; this.lancerLivre(e, 'livre', this.angleVers(e, voit)); e.t = J.rafale.intervalle; return; }
        e.etat = 'marche'; e.t = J.cadence[ph] * this.diff.cadence * (0.8 + Math.random() * 0.4);
    }
  }

  // aide à la visée : comme dans la manif, mais l'œuf part là où Julien SERA (il marche)
  viser(dx, dy) {
    const [vx, vy] = super.viser(dx, dy), e = this.julien, j = this.j;
    if (e.etat === 'fuite' || !(e.vx || e.vy)) return [vx, vy];
    const ox = e.x - j.x, oy = e.y - j.y, d = Math.hypot(ox, oy);
    if (Math.abs(vx * oy - vy * ox) / d > 0.02) return [vx, vy];   // l'aide n'a pas choisi Julien
    const t = d / RG.oeufs.vitesse, px = ox + e.vx * t, py = oy + e.vy * t, n = Math.hypot(px, py);
    return [px / n, py / n];
  }

  choisirMotif(e) {
    const r = Math.random();
    if (e.phase === 1) return r < 0.65 ? 'livre' : 'eventail';
    if (e.phase === 2) return r < 0.35 ? 'copies' : r < 0.7 ? 'dico' : 'eventail';
    return r < 0.35 ? 'rafale' : r < 0.6 ? 'dico' : r < 0.82 ? 'copies' : 'eventail';
  }

  angleVers(e, voit) {   // caché : il vise là où il t'a vu
    const [x, y] = voit ? [this.j.x, this.j.y] : [e.vuX, e.vuY];
    return Math.atan2(y - e.y, x - e.x);
  }

  lancerMotif(e, voit) {
    const J = RG.julien, a = this.angleVers(e, voit);
    if (e.motif === 'eventail') for (const k of [-1, 0, 1]) this.lancerLivre(e, 'livre', a + k * J.eventail);
    else if (e.motif === 'dico') this.lancerLivre(e, 'dico', a);
    else if (e.motif === 'copies') {
      const n = J.copies.nombre;
      for (let k = 0; k < n; k++) this.lancerLivre(e, 'copie', a + (k - (n - 1) / 2) * J.copies.ecart);
    } else { this.lancerLivre(e, 'livre', a); if (e.motif === 'rafale') e.reste = J.rafale.nombre - 1; }
    jouerSon(this, 'julien_lancer', { rate: e.motif === 'dico' ? 0.55 : 0.75 });
  }

  lancerLivre(e, genre, a) {
    const J = RG.julien, R = genre === 'copie' ? J.copies : J[genre];
    const dx = Math.cos(a), dy = Math.sin(a);
    this.livres.push({ genre, x: e.x + dx * 0.4, y: e.y + dy * 0.4, dx, dy, v: R.vitesse, degats: R.degats,
      rebonds: genre === 'dico' ? J.dico.rebonds : 0, t: 0, ph: Math.random() * 6 });
  }

  avancerLivres(dt) {
    const j = this.j;
    for (const b of this.livres) {
      b.t += dt;
      let vx = b.dx, vy = b.dy;
      if (b.genre === 'copie') { const w = Math.sin(b.t * 7 + b.ph) * 0.45; vx += -b.dy * w; vy += b.dx * w; }   // elles volettent
      const nx = b.x + vx * b.v * dt, ny = b.y + vy * b.v * dt;
      if (murEn(this.plan, nx, ny)) {
        if (b.rebonds > 0) {   // le dictionnaire rebondit
          const mx = murEn(this.plan, nx, b.y), my = murEn(this.plan, b.x, ny);
          if (mx || !my) b.dx = -b.dx;
          if (my || !mx) b.dy = -b.dy;
          b.rebonds--;
          if (Math.hypot(b.x - j.x, b.y - j.y) < 7) jouerSon(this, 'julien_plonk', { rate: 0.6 });
        } else b.fini = true;
        continue;
      }
      b.x = nx; b.y = ny;
      for (const o of this.objets) if (o.actif && o.solide && Math.hypot(o.x - b.x, o.y - b.y) < o.rayon) {   // une table : abri !
        b.fini = true;
        if (Math.hypot(b.x - j.x, b.y - j.y) < 5) jouerSon(this, 'julien_plonk', { rate: b.genre === 'copie' ? 1.6 : 0.9 });
        break;
      }
      if (b.fini) continue;
      if (j.vie > 0 && Math.hypot(b.x - j.x, b.y - j.y) < 0.38) {
        b.fini = true;
        this.degats(b.degats, b.x - b.dx, b.y - b.dy);
        if (b.genre === 'dico') this.cameras.main.shake(200, 0.01);
      }
      if (b.t > 6) b.fini = true;
    }
    this.livres = this.livres.filter(b => !b.fini);
  }

  // Julien touché (œuf, tomate, pancarte) ; les autres cas passent par la manif
  toucherEnnemi(e, degats = 1, opts = {}) {
    if (e.type !== 'julien') return super.toucherEnnemi(e, degats, opts);
    const { recul = null, silencieux = false, tache = null } = opts;
    if (e.etat === 'fuite') return;
    if (recul) this.deplacer(e, recul[0] * 0.5, recul[1] * 0.5, 0.3);
    if (e.etat === 'pause') { if (!silencieux) jouerSon(this, 'julien_plonk'); return; }   // changement de phase : intouchable
    e.vie = Math.max(0, e.vie - degats); e.flash = 0.15;
    if (tache && e.taches.length < 6) e.taches.push({ o: Math.random() * 1.6 - 0.8, h: 0.3 + Math.random() * 0.4, rouge: tache === 'tomate' });
    if (!silencieux) jouerSon(this, 'julien_splat');
    if (e.vie <= 0) {
      e.etat = 'fuite'; e.t = 2.4; this.repousses = 1; this.livres = [];
      jouerSon(this, 'julien_fuite'); this.cameras.main.shake(300, 0.01);
      this.message(REPLIQUES.vaincu, 3);
      this.j.expr = 'content'; this.j.exprT = 3;
      return;
    }
    const ph = this.phaseDe(e);
    if (ph > e.phase) {   // nouvelle phase : il s'arrête, crie, et repart plus fort
      e.phase = ph; e.etat = 'pause'; e.t = RG.julien.pause; e.reste = 0; e.cible = null;
      jouerSon(this, 'julien_cri', { rate: 1.15 }); this.cameras.main.shake(350, 0.009);
      this.message(ph === 2 ? REPLIQUES.phase2 : REPLIQUES.phase3, 3.5);
      return;
    }
    if (Math.random() < 0.18) this.message(hasard(REPLIQUES.touche), 1.6);
    if (e.etat === 'marche') { e.apres = 'marche'; e.tApres = e.t; e.etat = 'touche'; e.t = 0.18; }   // ne coupe pas un lancer
  }

  gagne() {
    if (this.joy) this.joy.activer(false);
    this.libererSouris();
    this.enJeu = false;
    const t = this.temps, mmss = `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, '0')}`;
    this.victoire(`Julien est vaincu ! Pas d'interro pour cette fois.\nTemps : ${mmss}   (${this.diff.nom})`);
  }

  // ------------------------------------------------------------------ dessin
  imageEnnemi(e) {
    if (e.type !== 'julien') return super.imageEnnemi(e);
    const s = this.T.spr;
    if (e.etat === 'fuite') return s.julien_vaincu;
    if (e.etat === 'touche' || e.flash > 0) return s.julien_touche;
    if (e.etat === 'prepare') return s.julien_bras;
    if (e.etat === 'lance') return s.julien_lance;
    if (e.etat === 'pause' || (e.phase === 3 && ((this.time.now / 200) | 0) % 5 === 0)) return s.julien_rage;
    return s[(e.bouge && (e.anim * 4 | 0) % 2) ? 'julien_marche1' : 'julien_marche0'];
  }

  spritesEnPlus(liste) {
    const s = this.T.spr, H = this.T.hauteurs;
    for (const b of this.livres) liste.push({ x: b.x, y: b.y, toile: s[b.genre], haut: H[b.genre], z: 0.42 + (b.genre === 'copie' ? Math.sin(b.t * 9 + b.ph) * 0.05 : 0) });
  }

  // barre de vie de Julien en haut de la vue (repères des phases à 50 % et 20 %)
  dessinerEnPlus(g) {
    const e = this.julien, l = 200, x = L / 2 - l / 2, y = 16, p = e.vie / RG.julien.vie;
    g.fillStyle = '#000'; g.fillRect(x - 2, y - 2, l + 4, 9);
    g.fillStyle = e.flash > 0 ? '#ffffff' : e.phase === 3 ? '#ff3a2a' : e.phase === 2 ? '#ff8a2a' : '#ffd84a';
    g.fillRect(x, y, l * p, 5);
    g.fillStyle = '#ffffff'; g.fillRect(x + l * 0.5, y - 2, 1, 9); g.fillRect(x + l * 0.2, y - 2, 1, 9);
  }

  dessiner(dt) {
    super.dessiner(dt);
    if (!this.txtPhase) return;   // (premier dessin, avant la fin de create)
    const e = this.julien;
    this.txtFlics.setText(`${Math.ceil(100 * e.vie / RG.julien.vie)}%`);
    this.txtPhase.setText(`${e.phase} / 3`);
  }
}
