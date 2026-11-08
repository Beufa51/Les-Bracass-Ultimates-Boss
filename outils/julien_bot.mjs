// Bot d'audit du boss JULIEN : joue des parties complètes des 3 niveaux (la manif, le lycée, la classe) dans un vrai
// navigateur (Chromium sans écran), en accéléré (le dessin 3D est coupé, toute la logique du jeu tourne pour de vrai).
//
// Lancer :  node outils/julien_bot.mjs [niveaux] [difficultés] [profils] [appareils] [parties par case]
//   ex.    node outils/julien_bot.mjs                                  (tout, 1 partie par case : ≈ 30 s)
//          node outils/julien_bot.mjs manif,lycee,classe sage,delegue,bloqueur,anarchiste expert,moyen,debutant pc,tel 3   (216 parties, ≈ 1 min)
//          node outils/julien_bot.mjs classe bloqueur expert pc 5      (5 combats contre Julien, PC, expert)
//   niveaux    : manif,lycee,classe            difficultés : sage,delegue,bloqueur,anarchiste
//   profils    : expert,moyen,debutant         appareils   : pc,tel (tel = téléphone simulé : écran tactile,
//                                                            joystick + boutons ↺ ↻ LANCER, pas de course)
//
// Ce que fait le bot (comme un joueur) :
//  - il se repère sur le plan (chemin le plus court case par case), ramasse ce qui est près de son chemin, va se soigner
//    quand sa vie baisse, vise le policier le plus proche qu'il voit et tire ;
//  - il ESQUIVE : pas de côté pendant la charge du CRS / du surveillant, sort de la zone où la lacrymo va tomber,
//    sort des nuages ; en classe : pas de côté devant les livres, recule pendant « AU TABLEAU ! », se cache derrière une
//    table pendant le CONTRÔLE SURPRISE, fonce quand Julien est DE DOS, contourne le bureau renversé ; vue du dessus :
//    il suit le trou des murs de copies et tire vers le haut.
//  - PROFILS : EXPERT (réagit en 0,15 s, esquive tout, change d'arme au bon moment, pancarte contre le bouclier),
//    MOYEN (0,35 s, esquive 3 fois sur 4, garde l'arme qu'il a en main), DÉBUTANT (0,6 s, esquive 4 fois sur 10,
//    tire même sur le bouclier levé, ne se cache pas).
// Une partie = une vie (pas de « rejouer »). TRACE=1 devant la commande : affiche les 2 dernières secondes de chaque partie.
// Résultats commentés : propositions/julien_audit.md. Le hasard est fixé (graine) : deux lancements donnent les mêmes chiffres.
import { createServer } from 'http';
import { readFile } from 'fs/promises';
import { extname, join, normalize } from 'path';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const RACINE = process.cwd();
const arg = (i, def) => (process.argv[i] || def).split(',');
const NIVEAUX = arg(2, 'manif,lycee,classe');
const DIFFS = arg(3, 'sage,delegue,bloqueur,anarchiste');
const NOMS_P = arg(4, 'expert,moyen,debutant');
const APPAREILS = arg(5, 'pc,tel');
const PARTIES = Number(process.argv[6] || 1);

// petit serveur de fichiers (fermé à la fin)
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.png': 'image/png', '.jpg': 'image/jpeg', '.mp3': 'audio/mpeg', '.wav': 'audio/wav', '.json': 'application/json', '.css': 'text/css', '.webmanifest': 'application/json' };
const serveur = createServer(async (req, res) => {
  try {
    const chemin = normalize(join(RACINE, decodeURIComponent(req.url.split('?')[0])));
    if (!chemin.startsWith(RACINE)) throw new Error('hors du dépôt');
    const donnees = await readFile(chemin);
    res.writeHead(200, { 'Content-Type': TYPES[extname(chemin)] || 'application/octet-stream' }); res.end(donnees);
  } catch { res.writeHead(404); res.end(); }
}).listen(0);
const port = serveur.address().port;

const PROFILS = {
  expert: { reaction: 0.15, esquive: 1, precision: 0.05, ramasse: 7, soin: 65, abri: 1, malin: true, gaspille: false, dessusErreur: 0, dessusRetard: 0 },
  moyen: { reaction: 0.35, esquive: 0.75, precision: 0.13, ramasse: 4, soin: 45, abri: 0.5, malin: false, gaspille: false, dessusErreur: 10, dessusRetard: 0.2 },
  debutant: { reaction: 0.6, esquive: 0.4, precision: 0.2, ramasse: 2, soin: 30, abri: 0, malin: false, gaspille: true, dessusErreur: 22, dessusRetard: 0.45 },
};
const SCENES = { manif: 'JulienManif', lycee: 'JulienLycee', classe: 'JulienClasse' };
const LIMITES = { manif: 600, lycee: 400, classe: 400 };   // secondes de jeu au plus

// ======================================================= ce qui tourne DANS la page
async function jouer({ niveau, cle, P, graine, tel, limite }) {
  const alea = Math.random;   // (hasard fixé par la graine avant le départ de la scène : le jeu ET le bot)
  const A = await import('/src/bosses/julien/armes.js');
  const { vueLibre, murEn } = await import('/src/bosses/julien/raycaster.js');
  const { REGLAGES: RG } = await import('/src/bosses/julien/reglages.js');
  const { ZONES } = await import('/src/bosses/julien/niveau_manif.js');
  const { PORTE_SALLE_12 } = await import('/src/bosses/julien/niveau_lycee.js');
  const sc = window.jeu.scene.getScene(cle);
  sc.dessiner = () => {};   // pas de dessin : on va vite (la logique est intacte)
  const hyp = Math.hypot, norm = (a) => Math.atan2(Math.sin(a), Math.cos(a));
  const DT = 1 / 30;
  let now = sc.time.now, tSim = 0;

  // ---------------- les commandes : PC (clavier, toujours courir) ou téléphone (joystick + ↺ ↻ + LANCER)
  const E = { avance: 0, cote: 0, tourne: 0, tir: false, tirAvant: false };
  if (!tel) {
    const q = (v) => (v > 0.38 ? 1 : v < -0.38 ? -1 : 0);
    sc.cmd = {
      bas: (a) => ({ avancer: q(E.avance) > 0, reculer: q(E.avance) < 0, coteG: q(E.cote) < 0, coteD: q(E.cote) > 0,
        tourneG: E.tourne < 0, tourneD: E.tourne > 0, tirer: E.tir }[a] || false),
      vient: (a) => (a === 'tirer' ? E.tir && !E.tirAvant : false),
    };
    sc.clic = false;
  }
  const appliquer = () => {
    if (tel) {
      const k = sc.touches;
      for (const n of ['gauche', 'droite', 'haut', 'bas']) k[n].isDown = false;
      k.z.isDown = E.tourne < 0; k.espace.isDown = E.tourne > 0; k.x.isDown = E.tir; sc.okRelache = true;
      if (E.tir && !E.tirAvant) k.x._justDown = true;   // (comme un vrai appui : « vient d'appuyer »)
      const n = Math.max(1, hyp(E.avance, E.cote)), v = { x: E.cote / n, y: E.avance / n };
      if (sc.joy) sc.joy.valeur = () => v;
    }
  };
  const tick = () => {
    appliquer();
    now += DT * 1000; tSim += DT;
    sc.time.preUpdate(now, DT * 1000); sc.time.update(now, DT * 1000);   // horloge de la scène (délais : rideaux, farine…)
    sc.update(now, DT * 1000);
    E.tirAvant = E.tir;
  };

  // ---------------- perception : chaque danger est vu après « reaction » s, et esquivé avec la chance « esquive »
  const vus = new WeakMap();
  const percu = (o, rattrape = 0) => {   // rattrape : un danger raté finit quand même par être vu (ex. on sort du nuage en toussant)
    let p = vus.get(o); if (!p) { p = { t0: tSim, ok: alea() < P.esquive }; vus.set(o, p); }
    return tSim - p.t0 >= P.reaction + (p.ok ? 0 : rattrape || 1e9);
  };
  const percuEtat = (e, etat) => {   // un état d'un personnage (charge, aimant…) : nouveau tirage à chaque fois
    if (e._botEtat !== etat) { e._botEtat = etat; e._botT0 = tSim; e._botOk = alea() < P.esquive; }
    return e._botOk && tSim - e._botT0 >= P.reaction;
  };

  // ---------------- chemin le plus court (cases, 8 directions sans couper les coins)
  let G = null, gT = -1;
  function grille() {
    if (G && tSim - gT < 0.3) return G;
    const p = sc.plan, H = p.length, W = p[0].length, b = new Uint8Array(W * H);
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (murEn(p, x + 0.5, y + 0.5)) b[y * W + x] = 1;
    for (const o of sc.objets) if (o.actif && o.solide) {
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
        const cx = (o.x | 0) + dx, cy = (o.y | 0) + dy;
        if (cx >= 0 && cy >= 0 && cx < W && cy < H && hyp(cx + 0.5 - o.x, cy + 0.5 - o.y) < o.rayon + 0.27) b[cy * W + cx] = 1;
      }
    }
    G = { b, W, H }; gT = tSim; return G;
  }
  function chemin(but, passe = () => false) {   // but(x, y) → vrai ; passe(x, y) : case bloquée qu'on accepte (la cible)
    const { b, W, H } = grille(), J = sc.j, d0 = (J.y | 0) * W + (J.x | 0);
    const prec = new Int32Array(W * H).fill(-1); prec[d0] = d0;
    const file = [d0];
    for (let i = 0; i < file.length; i++) {
      const c = file[i], x = c % W, y = (c / W) | 0;
      if (but(x, y)) { const ch = []; for (let k = c; k !== d0; k = prec[k]) ch.push([k % W, (k / W) | 0]); return ch.length ? ch.reverse() : [[x, y]]; }   // (déjà dans la case : on va au centre, là où est l'objet)
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]]) {
        const nx = x + dx, ny = y + dy, n = ny * W + nx;
        if (nx < 0 || ny < 0 || nx >= W || ny >= H || prec[n] >= 0) continue;
        if (b[n] && !passe(nx, ny)) continue;
        if (dx && dy && (b[y * W + nx] || b[ny * W + x])) continue;
        prec[n] = c; file.push(n);
      }
    }
    return null;
  }
  const ligneLibre = (x0, y0, x1, y1) => {   // le joueur peut-il aller tout droit de là à là ?
    const n = Math.ceil(hyp(x1 - x0, y1 - y0) / 0.2);
    for (let i = 1; i <= n; i++) if (!sc.libre(x0 + (x1 - x0) * i / n, y0 + (y1 - y0) * i / n, 0.27)) return false;
    return true;
  };
  function versChemin(ch) {   // direction vers le point le plus loin du chemin qu'on peut atteindre tout droit
    const J = sc.j;
    if (!ch) return null;
    if (!ch.length) return null;
    const obj = ch.length === 1 && sc.objets.find((o) => o.actif && !o.solide && (o.x | 0) === ch[0][0] && (o.y | 0) === ch[0][1]);
    if (obj) { const dx = obj.x - J.x, dy = obj.y - J.y, d = hyp(dx, dy) || 1; return [dx / d, dy / d]; }   // dernière case : droit sur l'objet
    let cible = ch[0];
    for (let i = Math.min(ch.length - 1, 4); i > 0; i--) if (ligneLibre(J.x, J.y, ch[i][0] + 0.5, ch[i][1] + 0.5)) { cible = ch[i]; break; }
    const dx = cible[0] + 0.5 - J.x, dy = cible[1] + 0.5 - J.y, d = hyp(dx, dy) || 1;
    return [dx / d, dy / d];
  }

  // ---------------- statistiques
  const st = { temps: 0, fini: false, mort: false, recu: 0, src: {}, ramasse: {}, tirs: {}, calme: 0, calmeMax: 0, ou: '', coince: 0 };
  const ajoute = (o, k, v = 1) => { o[k] = (o[k] || 0) + v; };
  const degats0 = sc.degats;
  sc.degats = function (n, sx, sy) {
    const J = this.j, v0 = J.vie + J.armure;
    degats0.call(this, n, sx, sy);
    const perte = v0 - (J.vie + J.armure);
    if (perte <= 0) return;
    const pile = (new Error().stack.split('\n')[2] || '');
    const f = (pile.match(/\.(\w+) \(/) || [])[1] || '?';
    const NOMS = { avancerLivres: { 14: 'livre', 22: 'dico', 7: 'copies', 4: 'craie' }, iaJulien: { 15: 'au tableau' }, executer: { 18: 'règle' },
      majDessus: { 10: 'mur de copies (dessus)' }, ia: { 10: 'charge CRS', 8: 'surveillant attrape', 15: 'charge surveillant' } };
    const nom = (NOMS[f] && NOMS[f][Math.round(n)]) || (f === 'projectiles' ? (n < 2 ? 'lacrymo' : 'purée') : f);
    ajoute(st.src, nom, perte); st.recu += perte;
  };
  const C = { fige: 0, attaques: {}, dos: 0, degatsDos: 0, degatsAutres: 0, phases: [], dessus: 0, note20: 0, touchesDessus: 0, confisque: 0 };
  if (niveau === 'classe') {
    const tu0 = sc.toucherEnnemi;
    sc.toucherEnnemi = function (e, d, o) {
      const v0 = e.vie, dos = e.etat === 'dos';
      tu0.call(this, e, d, o);
      if (e.type === 'julien') { if (dos) C.degatsDos += v0 - e.vie; else C.degatsAutres += v0 - e.vie; }
    };
  }

  // ---------------- décisions dans le FPS (manif + lycée)
  let chT = -1, ch = null, butCourant = '', coinceT = 0, coinceX = 0, coinceY = 0, deblocage = 0, debDir = [0, 0], danse = 1, danseT = 0;
  const remarque = new WeakMap();   // un ennemi qui apparaît n'est « vu » qu'après un temps de réaction (×2)
  const ennemiVisible = (e) => {
    const d = hyp(e.x - sc.j.x, e.y - sc.j.y);   // devant lui, ou tout près (il l'entend)
    const ok = e.actif && e.etat !== 'fuite' && d < 11 && vueLibre(sc.plan, sc.j.x, sc.j.y, e.x, e.y) && (d < 2.5 || sc.visible(e));
    if (!ok) { remarque.delete(e); return false; }
    if (!remarque.has(e)) remarque.set(e, tSim);
    return tSim - remarque.get(e) >= P.reaction * 2;
  };
  function butNavigation() {
    const J = sc.j, objets = sc.objets.filter((o) => o.actif);
    const pres = (o) => hyp(o.x - J.x, o.y - J.y);
    const caseDe = (o) => (x, y) => x === (o.x | 0) && y === (o.y | 0);
    const aCote = (o) => (x, y) => hyp(x + 0.5 - o.x, y + 0.5 - o.y) < 1.05;
    const plein = (o) => (A.RECHARGES[o.type] && J.armes.has(o.type) && J.mun[o.type] >= A.RECHARGES[o.type]().maxi)
      || (o.type === 'kway' && J.armure >= RG.bonus.kwayMaxi) || ((o.type === 'sandwich' || o.type === 'canette') && J.vie >= RG.joueur.vie);
    // 1. se soigner
    if (J.vie < P.soin) {
      const soins = objets.filter((o) => o.type === 'sandwich' || o.type === 'canette').map((o) => ({ o, but: caseDe(o) }))
        .concat(sc.objets.filter((o) => o.type === 'manifestant' && !o.soigne).map((o) => ({ o, but: aCote(o) })))
        .filter((x) => pres(x.o) < 14).sort((a, b) => pres(a.o) - pres(b.o));
      for (const x of soins.slice(0, 3)) { const c = chemin(x.but); if (c && c.length < 16) return ['soin', c]; }
    }
    // 2. munitions (manif)
    if (niveau === 'manif' && J.mun.oeufs + J.mun.tomates < 8) {
      const m = objets.filter((o) => (o.type === 'oeufs' || o.type === 'tomates') && !plein(o)).sort((a, b) => pres(a) - pres(b))[0];
      if (m) { const c = chemin(caseDe(m)); if (c) return ['munitions', c]; }
    }
    // 3. ce qui traîne près du chemin
    const utiles = objets.filter((o) => !o.solide && pres(o) < P.ramasse && o.type !== 'carnet' && !o.fayot && !plein(o));
    for (const o of utiles.sort((a, b) => pres(a) - pres(b))) { const c = chemin(caseDe(o)); if (c && c.length <= P.ramasse) return ['objet ' + o.type, c]; }
    // 4. le but du niveau
    if (niveau === 'lycee') {
      const k = objets.find((o) => o.type === 'carnet');
      if (k) return ['carnet', chemin(caseDe(k))];
      const px = PORTE_SALLE_12.x, py = PORTE_SALLE_12.y + 1;
      return ['porte', chemin((x, y) => x === px && y === py)];
    }
    const sortie = chemin((x, y) => sc.sortieCases.has(`${x},${y}`), (x, y) => sc.portailOuvert && sc.plan[y][x] === '7');
    if (sortie) return ['sortie', sortie];
    // portail fermé : chasser les policiers du parvis (ou attendre le fourgon au milieu du parvis)
    const restants = sc.ennemis.filter((e) => e.actif && e.etat !== 'fuite' && (e.parvis || hyp(e.x - J.x, e.y - J.y) < 12)).sort((a, b) => pres(a) - pres(b));
    for (const e of restants) { const c = chemin(caseDe(e)); if (c) return ['chasse', c]; }
    return ['attente', chemin((x, y) => x === 16 && y === 6)];
  }

  function decisionFPS() {
    const J = sc.j;
    let mx = 0, my = 0, danger = false;
    // dangers
    for (const g of sc.grenades) {
      const dd = hyp(g.x1 - J.x, g.y1 - J.y), r = g.puree ? RG.cantiniere.rayon : RG.lacrymo.rayon;
      if (dd < r + 0.7 && percu(g)) { const k = dd || 0.01; mx += (J.x - g.x1) / k * 2; my += (J.y - g.y1) / k * 2; danger = true; }
    }
    if (J.echarpe <= 0) for (const n of sc.nuages) {
      const dd = hyp(n.x - J.x, n.y - J.y);
      if (dd < RG.lacrymo.rayon + 0.35 && percu(n, 1.5)) { const k = dd || 0.01; mx += (J.x - n.x) / k * 2; my += (J.y - n.y) / k * 2; danger = true; }
    }
    for (const f of sc.flaques || []) { const dd = hyp(f.x - J.x, f.y - J.y); if (dd < 1.1 && percu(f)) { mx += (J.x - f.x) / (dd || 0.01); my += (J.y - f.y) / (dd || 0.01); } }
    for (const e of sc.ennemis) {
      if (!e.actif || e.etat === 'fuite') continue;
      const px = J.x - e.x, py = J.y - e.y, d = hyp(px, py);
      if (e.etat === 'charge' && percuEtat(e, 'charge')) {
        const nx = -e.cdy, ny = e.cdx, le = px * e.cdx + py * e.cdy, perp = px * nx + py * ny;
        if (le > -0.3 && Math.abs(perp) < 1.0) { let sg = perp >= 0 ? 1 : -1; if (!sc.libre(J.x + nx * sg * 0.6, J.y + ny * sg * 0.6, 0.25)) sg = -sg; mx += nx * sg * 3; my += ny * sg * 3; danger = true; }
      }
      if (e.type === 'surveillant' && (e.etat === 'approche' || e.etat === 'cri') && d < 1.6 && percuEtat(e, 'pres' + e.etat)) { mx += px / d * 1.5; my += py / d * 1.5; danger = true; }
    }
    // cible : le plus proche qu'on voit
    const cibles = sc.ennemis.filter(ennemiVisible).sort((a, b) => hyp(a.x - J.x, a.y - J.y) - hyp(b.x - J.x, b.y - J.y));
    const c = cibles[0];
    let viseA = null, tir = false;
    if (c) {
      const d = hyp(c.x - J.x, c.y - J.y), baisse = sc.bouclierBaisse(c);
      viseA = Math.atan2(c.y - J.y, c.x - J.x);
      // arme (EXPERT) : pancarte contre un bouclier levé tout près, sinon tomates, sinon œufs
      if (P.malin && niveau === 'manif') {
        const voulue = c.type === 'bouclier' && !baisse && d < 1.3 ? 'pancarte' : J.mun.tomates > 0 && J.armes.has('tomates') ? 'tomates' : J.mun.oeufs > 0 ? 'oeufs' : 'pancarte';
        if (J.arme !== voulue && !(J.changeT > 0)) A.choisirArme(sc, voulue);
      }
      const err = Math.abs(norm(viseA - J.a));
      const utile = c.type !== 'bouclier' || baisse || P.gaspille || J.arme === 'pancarte';
      tir = err < P.precision && utile && !(sc.confisque);
      if (!danger) {   // se placer
        if (c.type === 'bouclier' && !baisse && J.arme !== 'pancarte') {   // bouclier levé : on attend sa charge, à bonne distance
          if (d < 3) { mx -= (c.x - J.x) / d; my -= (c.y - J.y) / d; } else if (d > 5 || !c.alerte) { mx += (c.x - J.x) / d; my += (c.y - J.y) / d; }
        }
        else if (c.type === 'surveillant' && d < 2.2) { mx -= (c.x - J.x) / d; my -= (c.y - J.y) / d; }
        else if (c.type === 'bouclier' && baisse && d > 2.5) { mx += (c.x - J.x) / d; my += (c.y - J.y) / d; }
        else if (J.arme === 'pancarte' && d > 1.0) { mx += (c.x - J.x) / d; my += (c.y - J.y) / d; }
        else if (d > 7) { mx += (c.x - J.x) / d; my += (c.y - J.y) / d; }
        else if (P.esquive > 0.5) {   // petit pas chassé (cible mouvante)
          if ((danseT -= DT) <= 0) { danse = -danse; danseT = 0.8 + alea(); }
          mx += -(c.y - J.y) / d * danse * 0.6; my += (c.x - J.x) / d * danse * 0.6;
        }
      }
    }
    // navigation
    if (!c && !danger) {
      if (tSim - chT > 0.3 || !ch) { const r = butNavigation(); butCourant = r[0]; ch = r[1]; chT = tSim; }
      const v = versChemin(ch);
      if (v) { mx += v[0]; my += v[1]; if (viseA === null) viseA = Math.atan2(v[1], v[0]); }
      else if (butCourant === 'attente' || !ch) { if (viseA === null) viseA = J.a + 0.5; }   // il tourne sur lui-même pour chercher
    }
    // coincé ? (il ne bouge plus alors qu'il veut avancer) → un pas au hasard
    if (deblocage > 0) { deblocage -= DT; mx = debDir[0]; my = debDir[1]; }
    else if ((mx || my) && (coinceT += DT) > 1.5) {
      if (hyp(J.x - coinceX, J.y - coinceY) < 0.3) { const a = alea() * Math.PI * 2; debDir = [Math.cos(a), Math.sin(a)]; deblocage = 0.5; st.coince++; ch = null; }
      coinceT = 0; coinceX = J.x; coinceY = J.y;
    }
    return { mx, my, viseA, tir };
  }

  // ---------------- décisions en classe (Julien)
  let place = null, placeT = -1, abriTirage = null;
  const tirLibre = (x0, y0, x1, y1) => {   // la boulette passe-t-elle (tables, bureau) ?
    if (!vueLibre(sc.plan, x0, y0, x1, y1)) return false;
    const vx = x1 - x0, vy = y1 - y0, l2 = vx * vx + vy * vy;
    for (const o of sc.objets) if (o.actif && o.solide) {
      const t = Math.max(0, Math.min(1, ((o.x - x0) * vx + (o.y - y0) * vy) / l2));
      if (hyp(x0 + vx * t - o.x, y0 + vy * t - o.y) < o.rayon + 0.06) return false;
    }
    return true;
  };
  function chercherPlace(mode) {
    const J = sc.j, U = sc.julien;
    let mieux = null, score = 1e9;
    for (let y = 3.75; y <= 9.5; y += 0.5) for (let x = 1.5; x <= 13.5; x += 0.5) {
      if (!sc.libre(x, y, 0.33)) continue;
      const d = hyp(U.x - x, U.y - y);
      let sc0;
      if (mode === 'abri') {   // une table entre lui et moi, tout près de moi
        const tab = sc.objets.find((o) => o.actif && o.solide && o.type !== 'bureau_renverse' && hyp(o.x - x, o.y - y) < 1.3 && !tirLibre(x, y, U.x, U.y) && hyp(o.x - U.x, o.y - U.y) < d);
        if (!tab) continue;
        sc0 = hyp(x - J.x, y - J.y);
      } else {
        const ideal = mode === 'dos' ? 3.3 : 5;
        if (d < 3.05 || !tirLibre(x, y, U.x, U.y)) continue;
        sc0 = Math.abs(d - ideal) + hyp(x - J.x, y - J.y) * 0.5;
      }
      if (sc0 < score) { score = sc0; mieux = [x, y]; }
    }
    return mieux;
  }
  let dessusCible = null, dessusMurVu = null;
  function decisionDessus() {
    const M = sc.dessus;
    const murs = M.murs.filter((w) => w.y < M.py + 6 && w.y > 40 + P.dessusRetard * RG.julien.dessus.vitesseMur).sort((a, b) => b.y - a.y);
    if (murs.length) {
      const w = murs[0];
      if (dessusMurVu !== w) { dessusMurVu = w; dessusCible = w.trou + (alea() - 0.5) * 2 * P.dessusErreur; }
    } else { dessusMurVu = null; dessusCible = M.murs.length ? dessusCible ?? M.px : M.prof; }
    const ecart = (dessusCible ?? M.px) - M.px;
    E.cote = tel ? Math.max(-1, Math.min(1, ecart / 25)) : Math.abs(ecart) < 4 ? 0 : Math.sign(ecart);
    E.avance = 0; E.tourne = 0; E.tir = true;
  }
  function decisionClasse() {
    const J = sc.j, U = sc.julien;
    if (sc.dessus) { decisionDessus(); return null; }
    let mx = 0, my = 0, danger = false;
    const d = hyp(U.x - J.x, U.y - J.y) || 0.01;
    for (const b of sc.livres) {   // livres, craies, copies, dico : pas de côté si ça passe sur moi
      const px = b.x - J.x, py = b.y - J.y, vx = b.dx * b.v, vy = b.dy * b.v, v2 = vx * vx + vy * vy;
      const tc = -(px * vx + py * vy) / v2;
      if (tc < 0 || tc > 1.1) continue;
      const qx = px + vx * tc, qy = py + vy * tc, miss = hyp(qx, qy);
      if (miss > 0.6 || !percu(b)) continue;
      let nx = -b.dy, ny = b.dx; if (nx * qx + ny * qy > 0) { nx = -nx; ny = -ny; }
      if (!sc.libre(J.x + nx * 0.6, J.y + ny * 0.6, 0.25)) { nx = -nx; ny = -ny; }
      mx += nx * 2; my += ny * 2; danger = true;
    }
    if (U.etat === 'aimant' && percuEtat(U, 'aimant')) { mx -= (U.x - J.x) / d * 3; my -= (U.y - J.y) / d * 3; danger = true; }
    if ((U.etat === 'marche' || U.etat === 'prepare') && d < 3.1 && P.esquive > 0.5) { mx -= (U.x - J.x) / d * 1.2; my -= (U.y - J.y) / d * 1.2; }   // règle / confisqué
    const deluge = U.motif === 'deluge' && (U.etat === 'prepare' || U.etat === 'lance');
    if (deluge && abriTirage === null) abriTirage = alea() < P.abri;
    if (!deluge) abriTirage = null;
    const mode = deluge && abriTirage ? 'abri' : U.etat === 'dos' ? 'dos' : 'normal';
    if (P.esquive > 0.3 && (tSim - placeT > 0.3 || !place || place.mode !== mode)) { const p = chercherPlace(mode); place = p ? { x: p[0], y: p[1], mode } : null; placeT = tSim; }
    if (!danger && place) {
      const dx = place.x - J.x, dy = place.y - J.y, dd = hyp(dx, dy);
      if (dd > 0.25) { mx += dx / dd; my += dy / dd; }
      else if (mode === 'normal' && P.esquive > 0.5) {   // pas chassé
        if ((danseT -= DT) <= 0) { danse = -danse; danseT = 0.6 + alea() * 0.8; }
        mx += -(U.y - J.y) / d * danse * 0.7; my += (U.x - J.x) / d * danse * 0.7;
      }
    } else if (!danger && !place) {   // débutant : il reste à distance moyenne
      if (d > 7) { mx += (U.x - J.x) / d; my += (U.y - J.y) / d; } else if (d < 3) { mx -= (U.x - J.x) / d; my -= (U.y - J.y) / d; }
    }
    const viseA = Math.atan2(U.y - J.y, U.x - J.x), err = Math.abs(norm(viseA - J.a));
    const tir = err < P.precision && !sc.confisque && U.etat !== 'fuite' && (P.gaspille || tirLibre(J.x, J.y, U.x, U.y));
    return { mx, my, viseA, tir };
  }

  // ---------------- la partie
  const n = Math.round(limite / DT);
  let calmeEnCours = 0, etatU = null, phaseU = 1, dessusAvant = null, confAvant = null;
  for (let i = 0; i < n; i++) {
    const J = sc.j;
    if (J.vie <= 0) { st.mort = true; break; }
    if (niveau === 'manif' && sc.termine) { st.fini = true; break; }
    if (niveau === 'lycee' && sc.fini) { st.fini = true; break; }
    if (niveau === 'classe' && sc.julien.etat === 'fuite') { st.fini = true; break; }
    const dec = niveau === 'classe' ? decisionClasse() : decisionFPS();
    if (window.__trace && i > n - 60 && i % 6 === 0) console.log(`t=${tSim.toFixed(1)} pos=${J.x.toFixed(2)},${J.y.toFixed(2)} a=${J.a.toFixed(2)} but=${butCourant} ch=${JSON.stringify(ch && ch.slice(0, 3))} dec=${JSON.stringify(dec)} enJeu=${sc.enJeu} E=${JSON.stringify(E)}`);
    if (dec) {
      const { mx, my, viseA, tir } = dec, dx = Math.cos(J.a), dy = Math.sin(J.a);
      const l = hyp(mx, my) || 1;
      E.avance = (mx * dx + my * dy) / l; E.cote = (mx * -dy + my * dx) / l;
      if (!mx && !my) { E.avance = 0; E.cote = 0; }
      const da = viseA === null ? 0 : norm(viseA - J.a), pas = (tel ? RG.joueur.tactile.rotation : RG.joueur.rotation) * DT;
      E.tourne = Math.abs(da) < pas * 0.6 ? 0 : Math.sign(da);
      E.tir = tir;
      const a = A.armeDe(J.arme);   // arme vide : un joueur relâche puis rappuie (le jeu ne change d'arme qu'à un NOUVEL appui)
      if (tir && a.mun && J.mun[a.mun] <= 0 && E.tirAvant) E.tir = false;
    }
    // avant / après l'image : ce qui a été ramassé, les tirs
    const actifs = sc.objets.filter((o) => o.actif && !o.solide && !o.fayot), soignes = sc.objets.filter((o) => o.type === 'manifestant' && !o.soigne);
    const armeAvant = J.arme, rechAvant = J.recharge;
    tick();
    for (const o of actifs) if (!o.actif) ajoute(st.ramasse, o.lache ? 'casse-croûte' : o.type);
    for (const o of soignes) if (o.soigne) ajoute(st.ramasse, 'manifestant (soin)');
    if (J.recharge > rechAvant + 0.01) ajoute(st.tirs, armeAvant);
    // calme (aucun ennemi alerté à moins de 12 cases) : mesure de l'ennui
    if (niveau !== 'classe') {
      const calme = !sc.ennemis.some((e) => e.actif && e.etat !== 'fuite' && e.alerte && hyp(e.x - J.x, e.y - J.y) < 12);
      if (calme) { st.calme += DT; calmeEnCours += DT; st.calmeMax = Math.max(st.calmeMax, calmeEnCours); } else calmeEnCours = 0;
    } else {
      const U = sc.julien;
      if (U.etat !== etatU) { if (U.etat === 'prepare') ajoute(C.attaques, U.motif); if (U.etat === 'dos') C.dos++; etatU = U.etat; }
      if (U.etat === 'touche') C.fige += DT;
      if (U.phase !== phaseU) { C.phases.push(+sc.temps.toFixed(1)); phaseU = U.phase; }
      if (sc.dessus && !dessusAvant) C.dessus++;
      if (!sc.dessus && dessusAvant) { C.touchesDessus += dessusAvant.touches; C.mursDessus = (C.mursDessus || 0) + dessusAvant.murN; if (dessusAvant.touches === 0 && dessusAvant.fin != null) C.note20++; }
      dessusAvant = sc.dessus;
      if (sc.confisque && !confAvant) C.confisque++;
      confAvant = sc.confisque;
    }
  }
  const J = sc.j;
  st.temps = +sc.temps.toFixed(1); st.vieFin = Math.ceil(J.vie); st.recu = Math.round(st.recu);
  for (const k in st.src) st.src[k] = Math.round(st.src[k]);
  st.calme = Math.round(st.calme); st.calmeMax = Math.round(st.calmeMax);
  if (niveau === 'manif') {
    st.repousses = `${sc.repousses}/${sc.total}`;
    const z = ZONES.findIndex((q) => J.x >= q.x0 && J.x < q.x1 + 1 && J.y >= q.y0 && J.y < q.y1 + 1);
    st.ou = ['boulevard', 'ruelle', 'passage', 'place', 'rue du lycée', 'parvis'][z] || `case ${J.x | 0},${J.y | 0}`;
  } else if (niveau === 'lycee') { st.repousses = `${sc.repousses}/${sc.total}`; st.ou = sc.carnet ? 'après le carnet' : 'avant le carnet'; }
  else { st.classe = C; st.ou = `phase ${sc.julien.phase}`; st.vieJulien = Math.round(100 * sc.julien.vie / sc.vieMax); }
  st.but = butCourant; st.pos = `${J.x.toFixed(2)},${J.y.toFixed(2)} a=${J.a.toFixed(2)} armure=${J.armure|0} ch=${JSON.stringify(ch && ch.slice(0, 3))} mun=${JSON.stringify(J.mun)} pres=${JSON.stringify(sc.objets.filter((o) => o.actif && hyp(o.x - J.x, o.y - J.y) < 1.5).map((o) => [o.type, o.x, o.y, o.solide])).slice(0, 200)} enn=${JSON.stringify(sc.ennemis.filter((e) => e.actif && hyp(e.x - J.x, e.y - J.y) < 3).map((e) => [e.type, e.etat, +e.x.toFixed(1), +e.y.toFixed(1)]))}`;
  return st;
}

// ======================================================= le pilote
const navigateur = await chromium.launch();
const resultats = [];
const t0 = Date.now();
for (const app of APPAREILS) {
  const tel = app === 'tel';
  const contexte = await navigateur.newContext(tel ? { viewport: { width: 844, height: 390 }, hasTouch: true, isMobile: true } : { viewport: { width: 960, height: 540 } });
  const page = await contexte.newPage();
  const erreurs = [];
  page.on('pageerror', (e) => erreurs.push(e.message));
  if (process.env.TRACE) { page.on('console', (m) => console.log('   ', m.text())); await page.addInitScript(() => { window.__trace = true; }); }
  await page.goto(`http://localhost:${port}/index.html`); await page.waitForTimeout(2500);
  for (const niveau of NIVEAUX) for (const diff of DIFFS) for (const nomP of NOMS_P) for (let k = 0; k < PARTIES; k++) {
    const cle = SCENES[niveau], nbErr = erreurs.length;
    const graine = 1000 + k * 7919 + NOMS_P.indexOf(nomP) * 31 + DIFFS.indexOf(diff) * 101;
    await page.evaluate(async ({ cle, diff, graine }) => {
      let s = graine; Math.random = () => ((s = (s * 16807) % 2147483647) / 2147483647);
      const { Sauvegarde } = await import('/src/core/sauvegarde.js');
      Sauvegarde.reglerDifficulte('julien', diff);
      const j = window.jeu; j.loop.wake();
      j.scene.getScenes(true).forEach((s) => j.scene.stop(s.scene.key));
      j.scene.start(cle, { rejouer: true });
    }, { cle, diff, graine });
    await page.waitForFunction((cle) => { const s = window.jeu.scene.getScene(cle); return s && s.enJeu && s.j && !s.termine; }, cle, { timeout: 30000 });
    await page.evaluate(() => window.jeu.loop.sleep());
    const r = await page.evaluate(jouer, { niveau, cle, P: PROFILS[nomP], graine, tel, limite: LIMITES[niveau] });
    Object.assign(r, { niveau, diff, profil: nomP, app, erreursJS: erreurs.slice(nbErr) });
    resultats.push(r);
    const src = Object.entries(r.src).sort((a, b) => b[1] - a[1]).map(([n, v]) => `${n} ${v}`).join(', ');
    const fin = r.fini ? '✓ GAGNÉ ' : r.mort ? `✗ MORT (${r.ou}) ` : `… TEMPS ÉCOULÉ (${r.ou}, but : ${r.but}, ${r.pos}) `;
    let extra = '';
    if (r.classe) { const c = r.classe; extra = ` | Julien ${r.vieJulien}% phases à ${c.phases.join('/') || '-'} s, de dos ×${c.dos} (${Math.round(c.degatsDos)} dégâts de dos / ${Math.round(c.degatsAutres)} autres), vue du dessus ×${c.dessus} (20/20 ×${c.note20}, touché par ${c.touchesDessus} murs sur ${c.mursDessus || 0}), confisqué ×${c.confisque}, attaques ${JSON.stringify(c.attaques)}, figé (touché) ${c.fige.toFixed(1)}s`; }
    else extra = ` | repoussés ${r.repousses}, calme ${r.calme}s (max ${r.calmeMax}s), coincé ×${r.coince}, ramassé ${JSON.stringify(r.ramasse)}, tirs ${JSON.stringify(r.tirs)}`;
    console.log(`${app} ${niveau.padEnd(6)} ${diff.padEnd(10)} ${nomP.padEnd(8)} ${fin}${r.temps}s, vie ${r.vieFin}, reçu ${r.recu} [${src}]${extra}${r.erreursJS.length ? ' ERREURS JS : ' + r.erreursJS.join(' / ') : ''}`);
  }
  await contexte.close();
}
await navigateur.close(); serveur.close();

// ---------------- tableaux de synthèse
console.log(`\n=== SYNTHÈSE (${((Date.now() - t0) / 1000).toFixed(0)} s) : victoires / parties, temps moyen des victoires, dégâts reçus moyens ===`);
for (const niveau of NIVEAUX) {
  console.log(`\n${niveau.toUpperCase()}`.padEnd(18) + NOMS_P.map((p) => p.padEnd(26)).join(''));
  for (const app of APPAREILS) for (const diff of DIFFS) {
    const cases = NOMS_P.map((p) => {
      const rs = resultats.filter((r) => r.niveau === niveau && r.diff === diff && r.profil === p && r.app === app);
      const g = rs.filter((r) => r.fini), m = (l, f) => (l.length ? Math.round(l.reduce((a, r) => a + f(r), 0) / l.length) : '-');
      return `${g.length}/${rs.length}  ${m(g, (r) => r.temps)}s  -${m(rs, (r) => r.recu)}`.padEnd(26);
    });
    console.log(`${app} ${diff}`.padEnd(17) + cases.join(''));
  }
}
const err = resultats.flatMap((r) => r.erreursJS);
console.log(`\nErreurs JavaScript : ${err.length ? [...new Set(err)].join(' / ') : 'aucune'}`);
